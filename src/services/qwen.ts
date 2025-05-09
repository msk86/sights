import axios from 'axios';
import { encodeImageToBase64 } from './imageAnalysis';

// Get appropriate prompt text for Chinese
const getLocalizedPrompt = (): string => {
  return "请详细描述这张图片，描述应适合视障人士理解。重点描述主要内容、位置、颜色和任何重要的环境信息。请保持描述清晰简洁，200字以内，不要使用Bullet Points。";
};

// Analyze image using Qwen-VL-Chat API
export const analyzeImage = async (imageUri: string): Promise<string> => {
  try {
    const base64Image = await encodeImageToBase64(imageUri);
    const prompt = getLocalizedPrompt();

    const response = await axios.post(
      'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      {
        model: 'qwen-vl-plus',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
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
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_QWEN_API_KEY}`
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error analyzing image with Qwen:', error);
    throw error;
  }
}; 