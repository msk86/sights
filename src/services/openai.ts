import axios from 'axios';
import { getCurrentLocale, isChineseLocale } from '../i18n';

// Base64 encode an image for API submission
const encodeImageToBase64 = async (uri: string): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        // Remove the data:image/jpeg;base64, prefix
        resolve(base64data.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error encoding image:', error);
    throw error;
  }
};

// Get appropriate prompt text based on current language
const getLocalizedPrompt = (): string => {
  // Define prompts for different languages
  const prompts = {
    en: "Please describe this image in detail for a blind person. Focus on the main subjects, their positions, colors, and any important context. Keep the description clear and concise.",
    zh: "请详细描述这张图片，描述应适合视障人士理解。重点描述主要内容、位置、颜色和任何重要的环境信息。请保持描述清晰简洁。",
  };
  
  // Use Chinese prompt for Chinese languages
  if (isChineseLocale()) {
    return prompts.zh;
  }
  
  // Default to English
  return prompts.en;
};

// Get language instruction for the AI
const getLanguageInstruction = (): string => {
  const currentLocale = getCurrentLocale();
  
  // If Chinese, explicitly request response in Chinese
  if (currentLocale.startsWith('zh')) {
    return "Please respond in Chinese (Simplified).";
  }
  
  // For other non-English languages, we could add specific instructions here
  // if (currentLocale === 'fr') return "Please respond in French.";
  
  // Default to English
  return "Please respond in English.";
};

// Analyze image using OpenAI's Vision API
export const analyzeImage = async (imageUri: string): Promise<string> => {
  try {
    const base64Image = await encodeImageToBase64(imageUri);
    
    // Get localized prompt
    const prompt = getLocalizedPrompt();
    
    // Get language instruction
    const languageInstruction = getLanguageInstruction();
    
    // Combine prompt with language instruction
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
        max_tokens: 300
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