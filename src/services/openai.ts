import axios from 'axios';
import { encodeImageToBase64 } from './imageAnalysis';

// Get appropriate prompt text based on current language
const getLocalizedPrompt = (): string => {
  const prompts = {
    en: "Please describe this image in detail for a blind person. Focus on the main subjects, their positions, colors, and any important context. Keep the description clear and concise, 200 words or less, avoid bullet points.",
    zh: "请详细描述这张图片，描述应适合视障人士理解。重点描述主要内容、位置、颜色和任何重要的环境信息。请保持描述清晰简洁。",
  };
  
  return prompts.en; // OpenAI service only handles English
};

// Get language instruction for the AI
const getLanguageInstruction = (): string => {
  return "Please respond in English.";
};

// Analyze image using OpenAI's Vision API
export const analyzeImage = async (imageUri: string): Promise<string> => {
  try {
    const base64Image = await encodeImageToBase64(imageUri);
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