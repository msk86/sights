import axios from 'axios';
import { getCurrentLocale } from '../i18n';

// Get appropriate prompt text based on current language
const getLocalizedPrompt = (): string => {
  return "Please describe this image in detail for a blind person. Focus on the main subjects, their positions, colors, and any important text or context. Keep the description clear and concise, must be less than 200 words, avoid bullet points.";
};

// Get language instruction for the AI
const getLanguageInstruction = (): string => {
  return `Please respond in: ${getCurrentLocale()}.`;
};

// Analyze image using OpenAI's Vision API
export const analyzeImage = async (base64Image: string): Promise<string> => {
  try {
    const prompt = getLocalizedPrompt();
    const languageInstruction = getLanguageInstruction();
    const fullPrompt = `${prompt} ${languageInstruction}`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4.1-nano',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: fullPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_completion_tokens: 4000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
}; 