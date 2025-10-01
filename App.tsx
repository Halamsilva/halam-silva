import React, { useState, useCallback, useEffect } from 'react';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { MobileModal } from './components/MobileModal';
import { Gallery } from './components/Gallery';
import { VariationsModal } from './components/VariationsModal';
import { StyleModal } from './components/StyleModal';
import { FilterModal } from './components/FilterModal';
import { GeneratedImagesModal } from './components/GeneratedImagesModal';
import { Mode, CreateFunction, EditFunction, UploadedImage, ArtisticStyle, artisticStyles, AspectRatio, GalleryImage, HistoryItem, VisualFilter } from './types';
import { generateImageApi, editImageApi, generateVideosApi, getVideosOperationApi } from './services/geminiService';
import { Operation } from '@google/genai';


const videoLoadingMessages = [
    "Iniciando a geração do vídeo...",
    "O modelo está aquecendo os motores...",
    "Renderizando os primeiros quadros...",
    "Adicionando efeitos especiais...",
    "Compilando a obra-prima...",
    "Quase pronto, os robôs estão dando os toques finais..."
];


const getFinalCreatePrompt = (prompt: string, func: CreateFunction, hasImage: boolean): string => {
    const imageContext = hasImage ? " based on the style and subject of the provided image" : "";

    switch(func) {
        case 'sticker':
            return `a die-cut sticker of ${prompt}${imageContext}, vibrant colors, white background, sticker style, sharp details`;
        case 'text':
            if (hasImage) {
                 return `a clean, modern typographic logo for "${prompt}", incorporating elements or the style from the provided image, vector art, minimalist, on a plain background`;
            }
            return `a clean, modern typographic logo for "${prompt}", vector art, minimalist, on a plain background`;
        case 'comic':
            return `a comic book panel illustration of ${prompt}${imageContext}, dynamic action, bold lines, vibrant colors, pop art style, halftone dots`;
        case 'photorealistic':
            return `award-winning hyperrealistic photograph of ${prompt}${imageContext}, captured with a DSLR camera, lens 85mm f/1.8, cinematic lighting, tack-sharp focus, incredibly high detail, skin pores visible, photorealistic, insane realism, as if it were a real photo`;
        case 'free':
        default:
             if (hasImage) {
                return `Generate a new image inspired by the following prompt and reference image: "${prompt}"`;
             }
             return prompt;
    }
}

const App: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [negativePrompt, setNegativePrompt] = useState<string>('');
    const [mode, setMode] = useState<Mode>('create');
    const [createFunction, setCreateFunction] = useState<CreateFunction>('free');
    const [editFunction, setEditFunction] = useState<EditFunction>('add-remove');
    const [selectedStyle, setSelectedStyle] = useState<ArtisticStyle>(artisticStyles[0]);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [numberOfImages, setNumberOfImages] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    const [uploadedImage1, setUploadedImage1] = useState<UploadedImage | null>(null);
    const [uploadedImage2, setUploadedImage2] = useState<UploadedImage | null>(null);

    const [currentItem, setCurrentItem] = useState<HistoryItem | null>(null);
    
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number>(-1);

    const [showTwoImagesSection, setShowTwoImagesSection] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const [view, setView] = useState<'studio' | 'gallery'>('studio');
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);

    const [isCropping, setIsCropping] = useState<boolean>(false);
    
    const [imageVariations, setImageVariations] = useState<string[]>([]);
    const [isVariationsModalOpen, setIsVariationsModalOpen] = useState<boolean>(false);
    const [isStyleModalOpen, setIsStyleModalOpen] = useState<boolean>(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
    const [isGeneratedImagesModalOpen, setIsGeneratedImagesModalOpen] = useState<boolean>(false);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    
    const [isComposeRealistic, setIsComposeRealistic] = useState<boolean>(false);
    const [videoOperation, setVideoOperation] = useState<Operation | null>(null);
    const [loadingMessage, setLoadingMessage] = useState<string>('Gerando...');

    const getActionName = useCallback((): string => {
        if (mode === 'video') {
            if (selectedStyle && selectedStyle !== 'Nenhum') {
                return `Vídeo (${selectedStyle})`;
            }
            return 'Vídeo';
        }
        if (mode === 'create') {
            switch (createFunction) {
                case 'sticker': return 'Adesivo';
                case 'text': return 'Logo';
                case 'comic': return 'HQ';
                case 'photorealistic': return 'Realismo Extremo';
                default: return 'Criar';
            }
        }
        // edit mode
        switch (editFunction) {
            case 'add-remove': return 'Adicionar';
            case 'retouch': return 'Retocar';
            case 'style': return 'Estilizar';
            case 'compose':
                if (isComposeRealistic) return 'Unir (Realista)';
                return 'Unir';
            case 'upscale': return 'Melhorar';
            default: return 'Editar';
        }
    }, [mode, createFunction, editFunction, selectedStyle, isComposeRealistic]);

    useEffect(() => {
        if (!videoOperation || videoOperation.done) return;

        const poll = async () => {
            try {
                const updatedOperation = await getVideosOperationApi(videoOperation);
                
                if (updatedOperation.done) {
                    setVideoOperation(updatedOperation);
                    const downloadLink = updatedOperation.response?.generatedVideos?.[0]?.video?.uri;
                    if (!downloadLink) {
                        throw new Error("A geração do vídeo falhou ou não retornou um link.");
                    }

                    setLoadingMessage("Baixando o vídeo gerado...");
                    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                    if (!response.ok) {
                        throw new Error(`Falha ao baixar o vídeo: ${response.statusText}`);
                    }
                    const videoBlob = await response.blob();
                    const videoUrl = URL.createObjectURL(videoBlob);
                    
                    const newItem: HistoryItem = {
                        url: videoUrl,
                        text: prompt,
                        action: getActionName(),
                        type: 'video',
                    };
                    
                    setCurrentItem(newItem);
                    setHistory([newItem]);
                    setHistoryIndex(0);
                    setIsLoading(false);
                    setVideoOperation(null);
                    setIsModalOpen(true);
                } else {
                    setVideoOperation(updatedOperation);
                     setLoadingMessage(prev => {
                        const currentIndex = videoLoadingMessages.indexOf(prev);
                        const nextIndex = (currentIndex + 1) % videoLoadingMessages.length;
                        return videoLoadingMessages[nextIndex];
                    });
                    setTimeout(poll, 10000);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Ocorreu um erro ao verificar o status do vídeo.');
                setIsLoading(false);
                setVideoOperation(null);
            }
        };

        const timeoutId = setTimeout(poll, 10000);
        return () => clearTimeout(timeoutId);

    }, [videoOperation, prompt, getActionName]);


    useEffect(() => {
        try {
            const storedImages = localStorage.getItem('ai-image-studio-gallery');
            if (storedImages) {
                setGalleryImages(JSON.parse(storedImages));
            }
        } catch (e) {
            console.error("Failed to load gallery images from localStorage", e);
        }
    }, []);

    const updateGallery = (newGallery: GalleryImage[]) => {
        setGalleryImages(newGallery);
        localStorage.setItem('ai-image-studio-gallery', JSON.stringify(newGallery));
    };

    const addImageToGallery = useCallback((image: { url: string; prompt: string; action: string; }) => {
        const newImage: GalleryImage = {
            id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            url: image.url,
            prompt: image.prompt,
            createdAt: Date.now(),
            tags: [],
            creationMode: image.action,
        };
        updateGallery([newImage, ...galleryImages]);
    }, [galleryImages]);

    const deleteGalleryImage = (id: string) => {
        updateGallery(galleryImages.filter(img => img.id !== id));
    };

    const updateGalleryImageTags = (id: string, tags: string[]) => {
        const newGallery = galleryImages.map(img => img.id === id ? { ...img, tags } : img);
        updateGallery(newGallery);
    };

    const loadGalleryImageToEditor = async (image: GalleryImage) => {
        try {
            const response = await fetch(image.url);
            const blob = await response.blob();
            const file = new File([blob], "gallery_image.png", { type: blob.type });

            const reader = new FileReader();
            reader.onload = () => {
                const base64 = (reader.result as string).split(',')[1];
                setUploadedImage1({ file, base64, mimeType: blob.type });
                setPrompt(image.prompt);
                setMode('edit');
                setEditFunction('add-remove');
                setShowTwoImagesSection(false);
                setCurrentItem(null);
                setError(null);
                setHistory([]);
                setHistoryIndex(-1);
                setView('studio');
            };
            reader.readAsDataURL(blob);
        } catch (err) {
            setError("Falha ao carregar a imagem para o editor.");
            setView('gallery'); // Stay in gallery if loading fails
        }
    };
    
    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    const handleUndo = useCallback(() => {
        if (canUndo) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setCurrentItem(history[newIndex]);
        }
    }, [history, historyIndex, canUndo]);

    const handleRedo = useCallback(() => {
        if (canRedo) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setCurrentItem(history[newIndex]);
        }
    }, [history, historyIndex, canRedo]);
    
    const handleHistoryClick = useCallback((index: number) => {
        if (index >= 0 && index < history.length) {
            setHistoryIndex(index);
            setCurrentItem(history[index]);
        }
    }, [history]);

    const handleAddNegativePromptSuggestion = useCallback((suggestion: string) => {
        setNegativePrompt(prev => {
            const trimmedPrev = prev.trim();
            if (!trimmedPrev) return suggestion;
            // Avoid adding duplicates
            const parts = trimmedPrev.split(',').map(p => p.trim());
            if (parts.includes(suggestion)) return prev;
            return `${trimmedPrev}, ${suggestion}`;
        });
    }, []);


    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        const currentPrompt = prompt;
        const currentNegativePrompt = negativePrompt;

        const applyNegativePrompt = (p: string): string => {
            if (currentNegativePrompt.trim()) {
                return `${p}. Avoid the following: ${currentNegativePrompt.trim()}.`;
            }
            return p;
        };

        try {
            if (mode === 'video') {
                setLoadingMessage(videoLoadingMessages[0]);
                let finalPrompt = currentPrompt;
                if (selectedStyle && selectedStyle !== 'Nenhum') {
                    finalPrompt = `${currentPrompt}, in the style of ${selectedStyle}`;
                }
                const promptWithNegative = applyNegativePrompt(finalPrompt);
                const responseOperation = await generateVideosApi(promptWithNegative, uploadedImage1 ?? undefined);
                setVideoOperation(responseOperation);
                return; // Exit, polling effect will handle the rest
            }

            let responseData: { base64: string; text: string | null } | null = null;

            if (mode === 'create') {
                 if (uploadedImage1) {
                    const finalPrompt = getFinalCreatePrompt(currentPrompt, createFunction, true);
                    const promptWithNegative = applyNegativePrompt(finalPrompt);
                    const response = await editImageApi(promptWithNegative, [uploadedImage1]);
                    const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
                    const textPart = response.candidates?.[0]?.content?.parts.find(p => p.text);

                    if (imagePart?.inlineData) {
                        responseData = {
                            base64: imagePart.inlineData.data,
                            text: textPart?.text || null
                        };
                    } else {
                        throw new Error('A imagem não pôde ser gerada. ' + (textPart?.text || ''));
                    }

                } else {
                    const finalPrompt = getFinalCreatePrompt(currentPrompt, createFunction, false);
                    const promptWithNegative = applyNegativePrompt(finalPrompt);
                    const response = await generateImageApi(promptWithNegative, aspectRatio, numberOfImages);
                    
                    if (!response.generatedImages || response.generatedImages.length === 0) {
                        throw new Error('A imagem não pôde ser gerada.');
                    }

                    if (numberOfImages > 1) {
                        const imagesBase64 = response.generatedImages.map(img => img.image.imageBytes);
                        setGeneratedImages(imagesBase64);
                        setIsGeneratedImagesModalOpen(true);
                        setIsLoading(false);
                    } else {
                        responseData = { 
                            base64: response.generatedImages[0].image.imageBytes, 
                            text: null 
                        };
                    }
                }
            } else { // edit mode
                if (!uploadedImage1) {
                    throw new Error('Por favor, carregue uma imagem para editar.');
                }
                if (editFunction === 'compose' && !uploadedImage2) {
                    throw new Error('Por favor, carregue uma segunda imagem para unir.');
                }
                
                const images = [uploadedImage1];
                if(editFunction === 'compose' && uploadedImage2) {
                    images.push(uploadedImage2);
                }

                let apiPrompt = currentPrompt;
                let promptWithNegative: string;

                if (editFunction === 'upscale') {
                    apiPrompt = "Upscale this image to a higher resolution. Enhance details, sharpness, and overall quality without altering the artistic style or subject matter.";
                    promptWithNegative = apiPrompt;
                } else {
                    if (editFunction === 'style') {
                        apiPrompt = `Apply a ${selectedStyle} style to the image. ${currentPrompt}`.trim();
                    } else if (editFunction === 'compose') {
                        let composePrompt = `Combine the two provided images. The user's instruction is: "${currentPrompt}". Follow the instruction to merge the visual elements from both images into a cohesive new image.`;
                        if (isComposeRealistic) {
                            composePrompt += " The final image should be ultra-realistic, photorealistic, 8k, sharp focus, with high detail and cinematic lighting.";
                        }
                        apiPrompt = composePrompt.trim();
                    }
                    promptWithNegative = applyNegativePrompt(apiPrompt);
                }

                const response = await editImageApi(promptWithNegative, images);
                const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
                const textPart = response.candidates?.[0]?.content?.parts.find(p => p.text);

                if (imagePart?.inlineData) {
                    responseData = {
                        base64: imagePart.inlineData.data,
                        text: textPart?.text || null
                    };
                } else {
                    throw new Error('A imagem não pôde ser editada. ' + (textPart?.text || ''));
                }
            }
            
            if (responseData) {
                const newImageUrl = `data:image/png;base64,${responseData.base64}`;
                const newImage: HistoryItem = {
                    url: newImageUrl,
                    text: responseData.text,
                    action: getActionName(),
                    type: 'image',
                };

                setCurrentItem(newImage);
                setIsModalOpen(true);
                
                const galleryPromptForSave = editFunction === 'upscale' ? (prompt.trim() ? `${prompt} (Melhorado)` : 'Imagem Melhorada') : currentPrompt;
                addImageToGallery({ url: newImageUrl, prompt: galleryPromptForSave, action: getActionName() });

                if (mode === 'create') {
                    setHistory([newImage]);
                    setHistoryIndex(0);
                } else {
                    const newHistory = history.slice(0, historyIndex + 1);
                    newHistory.push(newImage);
                    setHistory(newHistory);
                    setHistoryIndex(newHistory.length - 1);
                }
                 setIsLoading(false);
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
            setIsLoading(false);
        }
    }, [mode, createFunction, editFunction, prompt, negativePrompt, uploadedImage1, uploadedImage2, selectedStyle, aspectRatio, history, historyIndex, addImageToGallery, getActionName, isComposeRealistic, numberOfImages]);

    const handleSelectGeneratedImage = useCallback((selectedImageBase64: string) => {
        const newImageUrl = `data:image/png;base64,${selectedImageBase64}`;
        
        const newImage: HistoryItem = {
            url: newImageUrl,
            text: null, // No text from this path
            action: getActionName(),
            type: 'image',
        };

        setCurrentItem(newImage);
        setIsModalOpen(true); // Open the mobile modal if on mobile
        
        addImageToGallery({ url: newImageUrl, prompt: prompt, action: getActionName() });

        setHistory([newImage]);
        setHistoryIndex(0);

        setIsGeneratedImagesModalOpen(false);
        setGeneratedImages([]);
    }, [prompt, getActionName, addImageToGallery]);

    const handleUpscale = useCallback(async () => {
        if (!currentItem || currentItem.type !== 'image') return;
    
        setIsLoading(true);
        setError(null);
    
        try {
            const match = currentItem.url.match(/^data:(image\/[a-z]+);base64,(.*)$/);
            if (!match || match.length < 3) {
                throw new Error("Formato de imagem inválido para melhorar a qualidade.");
            }
            const mimeType = match[1];
            const base64 = match[2];
    
            const imageForApi: UploadedImage = {
                file: new File([""], "upscale_source.png", { type: mimeType }),
                base64,
                mimeType,
            };
            
            const upscalePrompt = "Upscale this image to a higher resolution. Enhance details, sharpness, and overall quality without altering the artistic style or subject matter.";
    
            const response = await editImageApi(upscalePrompt, [imageForApi]);
            const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
            const textPart = response.candidates?.[0]?.content?.parts.find(p => p.text);
    
            if (imagePart?.inlineData) {
                const responseData = {
                    base64: imagePart.inlineData.data,
                    text: textPart?.text || null
                };
                
                const newImageUrl = `data:image/png;base64,${responseData.base64}`;
                const newImage: HistoryItem = {
                    url: newImageUrl,
                    text: responseData.text,
                    action: 'Melhorar',
                    type: 'image',
                };
    
                setCurrentItem(newImage);
                
                const galleryPrompt = prompt ? `${prompt} (Qualidade Melhorada)` : "Imagem com Qualidade Melhorada";
                addImageToGallery({ url: newImageUrl, prompt: galleryPrompt, action: 'Melhorar' });
    
                const newHistory = history.slice(0, historyIndex + 1);
                newHistory.push(newImage);
                setHistory(newHistory);
                setHistoryIndex(newHistory.length - 1);
    
            } else {
                throw new Error('A imagem não pôde ser melhorada. ' + (textPart?.text || ''));
            }
    
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido ao melhorar a imagem.');
        } finally {
            setIsLoading(false);
        }
    }, [currentItem, history, historyIndex, prompt, addImageToGallery]);

    const handleCrop = useCallback((croppedImageUrl: string) => {
        if (!currentItem || currentItem.type !== 'image') return;
    
        setError(null);
        
        const newImage: HistoryItem = {
            url: croppedImageUrl,
            text: currentItem.text,
            action: 'Cortar',
            type: 'image',
        };
    
        setCurrentItem(newImage);
        
        const galleryPrompt = prompt ? `${prompt} (Cortada)` : "Imagem Cortada";
        addImageToGallery({ url: croppedImageUrl, prompt: galleryPrompt, action: 'Cortar' });
    
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newImage);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    
        setIsCropping(false);
    
    }, [currentItem, history, historyIndex, prompt, addImageToGallery]);
    
    const handleGenerateVariations = useCallback(async () => {
        if (!currentItem || currentItem.type !== 'image') return;

        setIsLoading(true);
        setError(null);
        setImageVariations([]);
        setIsVariationsModalOpen(true);

        try {
            const match = currentItem.url.match(/^data:(image\/[a-z]+);base64,(.*)$/);
            if (!match || match.length < 3) {
                throw new Error("Formato de imagem inválido para gerar variações.");
            }
            const mimeType = match[1];
            const base64 = match[2];

            const imageForApi: UploadedImage = {
                file: new File([""], "variation_source.png", { type: mimeType }),
                base64,
                mimeType,
            };
            
            const variationPrompt = "Gere uma variação sutil desta imagem. Mantenha o mesmo tema, estilo e composição geral, mas introduza pequenas diferenças criativas.";
            
            const variationPromises = Array(3).fill(null).map(() => 
                editImageApi(variationPrompt, [imageForApi])
            );

            const responses = await Promise.all(variationPromises);

            const newVariations = responses.map(response => {
                const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
                if (imagePart?.inlineData) {
                    return `data:image/png;base64,${imagePart.inlineData.data}`;
                }
                throw new Error('Não foi possível gerar uma variação.');
            });

            setImageVariations(newVariations);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido ao gerar variações.');
        } finally {
            setIsLoading(false);
        }
    }, [currentItem]);

    const handleApplyStyle = useCallback(async (style: ArtisticStyle) => {
        if (!currentItem || currentItem.type !== 'image') return;

        setIsLoading(true);
        setError(null);

        try {
            const match = currentItem.url.match(/^data:(image\/[a-z]+);base64,(.*)$/);
            if (!match || match.length < 3) {
                throw new Error("Formato de imagem inválido para aplicar estilo.");
            }
            const mimeType = match[1];
            const base64 = match[2];

            const imageForApi: UploadedImage = {
                file: new File([""], "style_source.png", { type: mimeType }),
                base64,
                mimeType,
            };
            
            const stylePrompt = `Apply a ${style} style to this image. Maintain the original subject and composition.`;

            const response = await editImageApi(stylePrompt, [imageForApi]);
            const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
            const textPart = response.candidates?.[0]?.content?.parts.find(p => p.text);

            if (imagePart?.inlineData) {
                const responseData = {
                    base64: imagePart.inlineData.data,
                    text: textPart?.text || null
                };
                
                const newImageUrl = `data:image/png;base64,${responseData.base64}`;
                const actionName = `Estilo ${style}`;
                const newImage: HistoryItem = {
                    url: newImageUrl,
                    text: responseData.text,
                    action: actionName,
                    type: 'image',
                };

                setCurrentItem(newImage);
                
                const galleryPrompt = prompt ? `${prompt} (${actionName})` : `Imagem com ${actionName}`;
                addImageToGallery({ url: newImageUrl, prompt: galleryPrompt, action: actionName });

                const newHistory = history.slice(0, historyIndex + 1);
                newHistory.push(newImage);
                setHistory(newHistory);
                setHistoryIndex(newHistory.length - 1);

            } else {
                throw new Error('O estilo não pôde ser aplicado. ' + (textPart?.text || ''));
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido ao aplicar o estilo.');
        } finally {
            setIsLoading(false);
            setIsStyleModalOpen(false);
        }
    }, [currentItem, history, historyIndex, prompt, addImageToGallery]);

    const handleApplyVisualFilter = useCallback(async (filter: VisualFilter) => {
        if (!currentItem || currentItem.type !== 'image') return;

        setError(null);

        try {
            const image = new Image();
            image.crossOrigin = 'anonymous';
            image.src = currentItem.url;
            await new Promise<void>((resolve, reject) => {
                image.onload = () => resolve();
                image.onerror = reject;
            });

            const canvas = document.createElement('canvas');
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Não foi possível obter o contexto do canvas.');
            }

            switch (filter) {
                case 'Grayscale':
                    ctx.filter = 'grayscale(100%)';
                    break;
                case 'Sepia':
                    ctx.filter = 'sepia(100%)';
                    break;
                case 'Invert':
                    ctx.filter = 'invert(100%)';
                    break;
            }

            ctx.drawImage(image, 0, 0);

            const newImageUrl = canvas.toDataURL('image/png');
            
            const actionName = `Filtro ${filter}`;
            const newImage: HistoryItem = {
                url: newImageUrl,
                text: currentItem.text,
                action: actionName,
                type: 'image',
            };

            setCurrentItem(newImage);
            
            const galleryPrompt = prompt ? `${prompt} (${actionName})` : `Imagem com ${actionName}`;
            addImageToGallery({ url: newImageUrl, prompt: galleryPrompt, action: actionName });

            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(newImage);
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
            
            setIsFilterModalOpen(false);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido ao aplicar o filtro.');
            setIsFilterModalOpen(false);
        }
    }, [currentItem, history, historyIndex, prompt, addImageToGallery]);


    const handleSelectVariation = useCallback((variationUrl: string) => {
        const newImage: HistoryItem = {
            url: variationUrl,
            text: currentItem?.text || null,
            action: 'Variação',
            type: 'image',
        };

        setCurrentItem(newImage);
        
        const galleryPrompt = prompt ? `${prompt} (Variação)` : "Variação de Imagem";
        addImageToGallery({ url: variationUrl, prompt: galleryPrompt, action: 'Variação' });

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newImage);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);

        setIsVariationsModalOpen(false);
        setImageVariations([]);
    }, [currentItem, history, historyIndex, addImageToGallery, prompt]);

    const handleEditCurrentImage = useCallback(() => {
        if (!currentItem || currentItem.type !== 'image') return;

        fetch(currentItem.url)
            .then(res => res.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64 = (reader.result as string).split(',')[1];
                    const file = new File([blob], "edited_image.png", { type: blob.type });
                    setUploadedImage1({ file, base64, mimeType: blob.type });
                    setMode('edit');
                    setEditFunction('add-remove');
                    setShowTwoImagesSection(false);
                    setPrompt('');
                };
                reader.readAsDataURL(blob);
            });
    }, [currentItem]);

    const resetStateForNewImage = useCallback(() => {
        setPrompt('');
        setNegativePrompt('');
        setCurrentItem(null);
        setUploadedImage1(null);
        setUploadedImage2(null);
        setError(null);
        setIsModalOpen(false);
        setHistory([]);
        setHistoryIndex(-1);
        if (mode === 'edit') {
            setShowTwoImagesSection(editFunction === 'compose');
        }
    }, [mode, editFunction]);

    if (view === 'gallery') {
        return (
            <Gallery
                images={galleryImages}
                onBack={() => setView('studio')}
                onDelete={deleteGalleryImage}
                onUpdateTags={updateGalleryImageTags}
                onLoadImage={loadGalleryImageToEditor}
            />
        );
    }

    return (
        <div className="container min-h-screen font-sans flex flex-col md:flex-row bg-[#121212]">
            <LeftPanel
                prompt={prompt}
                setPrompt={setPrompt}
                negativePrompt={negativePrompt}
                setNegativePrompt={setNegativePrompt}
                mode={mode}
                setMode={setMode}
                createFunction={createFunction}
                setCreateFunction={setCreateFunction}
                editFunction={editFunction}
                setEditFunction={setEditFunction}
                selectedStyle={selectedStyle}
                setSelectedStyle={setSelectedStyle}
                aspectRatio={aspectRatio}
                setAspectRatio={setAspectRatio}
                numberOfImages={numberOfImages}
                setNumberOfImages={setNumberOfImages}
                isLoading={isLoading}
                handleGenerate={handleGenerate}
                uploadedImage1={uploadedImage1}
                setUploadedImage1={setUploadedImage1}
                uploadedImage2={uploadedImage2}
                setUploadedImage2={setUploadedImage2}
                showTwoImagesSection={showTwoImagesSection}
                setShowTwoImagesSection={setShowTwoImagesSection}
                setView={setView}
                isComposeRealistic={isComposeRealistic}
                setIsComposeRealistic={setIsComposeRealistic}
                onAddNegativePromptSuggestion={handleAddNegativePromptSuggestion}
            />
            <RightPanel
                isLoading={isLoading}
                error={error}
                currentItem={currentItem}
                onEdit={handleEditCurrentImage}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={canUndo}
                canRedo={canRedo}
                onUpscale={handleUpscale}
                onApplyStyle={() => setIsStyleModalOpen(true)}
                onApplyFilter={() => setIsFilterModalOpen(true)}
                isCropping={isCropping}
                setIsCropping={setIsCropping}
                onCrop={handleCrop}
                onGenerateVariations={handleGenerateVariations}
                history={history}
                historyIndex={historyIndex}
                onHistoryClick={handleHistoryClick}
                loadingMessage={loadingMessage}
            />
            {isModalOpen && currentItem && (
                 <MobileModal
                    item={currentItem}
                    onEdit={() => {
                        handleEditCurrentImage();
                        setIsModalOpen(false);
                    }}
                    onNewImage={resetStateForNewImage}
                />
            )}
            {isVariationsModalOpen && (
                <VariationsModal
                    originalImage={currentItem?.url}
                    variations={imageVariations}
                    isLoading={isLoading}
                    error={error}
                    onClose={() => {
                        setIsVariationsModalOpen(false);
                        setError(null);
                    }}
                    onSelect={handleSelectVariation}
                />
            )}
            {isStyleModalOpen && (
                <StyleModal
                    originalImage={currentItem?.url}
                    onClose={() => setIsStyleModalOpen(false)}
                    onSelectStyle={handleApplyStyle}
                    isLoading={isLoading}
                />
            )}
            {isFilterModalOpen && (
                <FilterModal
                    originalImage={currentItem?.url}
                    onClose={() => setIsFilterModalOpen(false)}
                    onSelectFilter={handleApplyVisualFilter}
                />
            )}
            {isGeneratedImagesModalOpen && (
                <GeneratedImagesModal
                    images={generatedImages}
                    onClose={() => {
                        setIsGeneratedImagesModalOpen(false);
                        setGeneratedImages([]);
                    }}
                    onSelect={handleSelectGeneratedImage}
                />
            )}
        </div>
    );
};

export default App;