import { isChineseLocale } from '../i18n';
import { analyzeImage as analyzeWithOpenAI } from './openai';
import { analyzeImage as analyzeWithQwen } from './qwen';

// Base64 encode an image for API submission
export const encodeImageToBase64 = async (uri: string): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
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

export const analyzeImage = async (imageUri: string): Promise<string> => {
  const base64Image = await encodeImageToBase64(imageUri);
  if (isChineseLocale()) {
    return analyzeWithQwen(base64Image);
  } else {
    return analyzeWithOpenAI(base64Image);
  }
}; 