
import { GoogleGenAI, Type } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    answer: {
      type: Type.STRING,
      description: 'The simple, short answer for a 5-year-old.'
    },
    imagePrompt: {
      type: Type.STRING,
      description: 'The simple, descriptive prompt for image generation.'
    }
  },
  required: ['answer', 'imagePrompt'],
};

const SYSTEM_INSTRUCTION = `You are 'The Why Bot', a friendly and patient robot explaining things to a 5-year-old child. All your answers must be simple, positive, engaging, and very short (1-2 sentences). Use easy words a preschooler can understand. After your explanation, create a simple, descriptive prompt for an image generation model to create a colorful, simple, flat 2D cartoon illustration that visually explains your answer. Do not describe the style, just the subject. For example, 'A happy sun smiling in the blue sky.' or 'A red car driving on a road.'. Your entire response must be a single JSON object with two keys: "answer" and "imagePrompt".`;

export const fetchAnswerAndImage = async (question: string, history: {role: string; text: string}[]) => {
  try {
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
        }
    });
    
    const jsonText = textResponse.text.trim();
    if (!jsonText) {
        throw new Error("Received an empty response from the text model.");
    }

    const parsedResponse = JSON.parse(jsonText);
    const { answer, imagePrompt } = parsedResponse;

    if (!answer || !imagePrompt) {
      throw new Error("Invalid JSON structure in response.");
    }
    
    // 2. Generate the image from Imagen
    const imageGenerationPrompt = `A simple, colorful, flat 2D cartoon illustration for a 5-year-old child: ${imagePrompt}`;
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
