# Visit the app in AI Studio

Visit the app in AI Studio:
https://ai.studio/apps/drive/1czLFp1RElCBgnb4JpxlOzYDJTCUcg60p

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Process

1. I used Gemini Brainstorm Gem to think of AI app ideas.
2. I chose one from the five ideas it suggested.
3. I asked it to create a prompt based on that idea.
4. It gave me a very specific prompt. I copied it and edited it according to my initial requirements - a chat bot to answer the endless "whys" of a preschooler.
5. I opened the build app feature in Google AI Studio and entered my prompt.
6. After generating the code, I started to evaluate it by testing some questions and answaers, and checking the image it generates.
7. I used iteration to get the behavior I wanted from the app.
8. I also edited the code for gemini service, to change the prompts being passed to the Gemini API.
9. Next, I used prompt chaining to add features like accepting voice input and adding audio output for the bot's reply. 
10. More importantly, I added a safety features since this app is for kids.

