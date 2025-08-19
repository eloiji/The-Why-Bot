
import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    answer: {
      type: Type.STRING,
      description: 'The simple, short, realistic answer for a child.'
    },
    imagePrompt: {
      type: Type.STRING,
      description: 'The simple, descriptive prompt for image generation. It must not contain any words or text.'
    }
  },
  required: ['answer', 'imagePrompt'],
};

const SYSTEM_INSTRUCTION = `You are 'The Why Bot', a friendly and patient robot explaining things to a preschool-aged child. Your top priority is child safety. If a question is unsafe or inappropriate (e.g., violence, scary topics, adult themes), provide a gentle refusal. For an inappropriate question, your JSON 'answer' must be a friendly redirection like "That's a question for the grown-ups! Let's talk about something fun instead." and the 'imagePrompt' must be something cheerful and generic, like "a happy smiling sun in a blue sky". For safe questions, provide answers that are simple, realistic, engaging, and very short (1-2 sentences). Then, create a simple, descriptive 'imagePrompt' for a colorful, simple, flat 2D cartoon illustration that visually explains your answer. The image prompt MUST NOT include any words, letters, or text. Your entire response must be a single JSON object with two keys: "answer" and "imagePrompt".`;

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

export const fetchAnswerAndImage = async (question: string, history: {role: string; text: string}[]) => {
  try {
    let answer: string;
    let imagePrompt: string;

    // 1. Get the text answer and image prompt from Gemini
    const fullPrompt = `
      Here is the conversation so far:
      ${history.map(m => `${m.role}: ${m.text}`).join('\n')}
      
      The child is now asking: "${question}"
      
      Provide your JSON response.
    `;

    const textResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          safetySettings: safetySettings,
        }
    });
    
    // Check for API-level safety blocks on the prompt or response
    const candidate = textResponse.candidates?.[0];
    if (textResponse.promptFeedback?.blockReason || (candidate && candidate.finishReason === 'SAFETY')) {
      console.warn(`Request or response blocked due to safety settings. Reason: ${textResponse.promptFeedback?.blockReason || candidate?.finishReason}`);
      answer = "That's a question for the grown-ups! Let's talk about something fun instead.";
      imagePrompt = "a happy smiling sun in a blue sky";
    } else {
        const jsonText = textResponse.text.trim();
        if (!jsonText) {
            throw new Error("Received an empty response from the text model.");
        }

        const parsedResponse = JSON.parse(jsonText);
        answer = parsedResponse.answer;
        imagePrompt = parsedResponse.imagePrompt;

        if (!answer || !imagePrompt) {
          throw new Error("Invalid JSON structure in response.");
        }
    }
    
    // 2. Generate the image from Imagen
    const imageGenerationPrompt = `A simple, colorful, flat 2D cartoon illustration for a child: ${imagePrompt}`;
    const imageResponse = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: imageGenerationPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '1:1',
        },
    });

    if (!imageResponse.generatedImages || imageResponse.generatedImages.length === 0) {
      throw new Error("Image generation failed.");
    }

    const base64ImageBytes: string = imageResponse.generatedImages[0].image.imageBytes;
    const imageUrl = `data:image/png;base64,${base64ImageBytes}`;

    return { answer, imageUrl };

  } catch (error) {
    console.error("Error in Gemini service:", error);
    throw new Error("Failed to get a response from the bot.");
  }
};
