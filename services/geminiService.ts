import { GoogleGenAI, GenerateContentResponse, Modality, Operation } from "@google/genai";
import { UploadedImage, AspectRatio } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateImageApi = async (prompt: string, aspectRatio: AspectRatio, numberOfImages: number) => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: numberOfImages,
          outputMimeType: 'image/png',
          aspectRatio: aspectRatio,
        },
    });
    return response;
};

export const editImageApi = async (prompt: string, images: UploadedImage[]): Promise<GenerateContentResponse> => {
    const imageParts = images.map(img => ({
        inlineData: {
            data: img.base64,
            mimeType: img.mimeType
        }
    }));

    const textPart = { text: prompt };

    const parts = [...imageParts, textPart];

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
          parts: parts,
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    return response;
};

export const generateVideosApi = async (prompt: string, image?: UploadedImage): Promise<Operation> => {
    let operation;
    if (image) {
        operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            image: {
                imageBytes: image.base64,
                mimeType: image.mimeType,
            },
            config: {
                numberOfVideos: 1
            }
        });
    } else {
        operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            config: {
                numberOfVideos: 1
            }
        });
    }
    return operation;
};

export const getVideosOperationApi = async (operation: Operation) => {
    const result = await ai.operations.getVideosOperation({ operation: operation });
    return result;
};