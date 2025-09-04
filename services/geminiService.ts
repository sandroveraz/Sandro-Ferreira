
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import { CreateFunction, EditFunction, ImageData, AspectRatio } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fileToBase64 = (file: File): Promise<ImageData> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve({ base64, mimeType: file.type });
        };
        reader.onerror = error => reject(error);
    });
};

const applyPromptEnhancement = (prompt: string, func: CreateFunction): string => {
    switch (func) {
        case 'sticker':
            return `${prompt}, simple, clean, vector art, die-cut sticker, white background, high contrast`;
        case 'text':
            return `A modern, minimalist logo with the text "${prompt}". Vector art, clean lines, suitable for a brand.`;
        case 'comic':
            return `${prompt}, in a dynamic comic book art style, vibrant colors, bold outlines, action-packed scene.`;
        case 'free':
        default:
            return prompt;
    }
};

export const generateImage = async (prompt: string, func: CreateFunction, aspectRatio: AspectRatio): Promise<string> => {
    const enhancedPrompt = applyPromptEnhancement(prompt, func);
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: enhancedPrompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: aspectRatio,
        },
    });
    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64ImageBytes}`;
};

export const editOrComposeImage = async (
    prompt: string,
    func: EditFunction,
    image1: ImageData,
    image2?: ImageData
): Promise<string> => {

    const parts = [];

    parts.push({
      inlineData: { data: image1.base64, mimeType: image1.mimeType },
    });
    
    if (image2 && func === 'compose') {
        parts.push({
          inlineData: { data: image2.base64, mimeType: image2.mimeType },
        });
    }

    let finalPrompt = prompt;
    if (func === 'compose' && image2) {
        finalPrompt = `Combine these two images into one cohesive picture. The theme is: ${prompt}`;
    }

    parts.push({ text: finalPrompt });

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
    }

    throw new Error("API did not return an image.");
};