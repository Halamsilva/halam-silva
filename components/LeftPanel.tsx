import React, { useState } from 'react';
import { CreateFunction, EditFunction, Mode, UploadedImage, ArtisticStyle, artisticStyles, AspectRatio, aspectRatios } from '../types';
import { FunctionCard } from './FunctionCard';
import { UploadArea } from './UploadArea';
import { Spinner } from './Spinner';
import { PromptSuggestions } from './PromptSuggestions';
import { NegativePromptSuggestions } from './NegativePromptSuggestions';

interface LeftPanelProps {
    prompt: string;
    setPrompt: (value: string) => void;
    negativePrompt: string;
    setNegativePrompt: (value: string) => void;
    mode: Mode;
    setMode: (mode: Mode) => void;
    createFunction: CreateFunction;
    setCreateFunction: (func: CreateFunction) => void;
    editFunction: EditFunction;
    setEditFunction: (func: EditFunction) => void;
    selectedStyle: ArtisticStyle;
    setSelectedStyle: (style: ArtisticStyle) => void;
    aspectRatio: AspectRatio;
    setAspectRatio: (ratio: AspectRatio) => void;
    numberOfImages: number;
    setNumberOfImages: (n: number) => void;
    isLoading: boolean;
    handleGenerate: () => void;
    uploadedImage1: UploadedImage | null;
    setUploadedImage1: (img: UploadedImage | null) => void;
    uploadedImage2: UploadedImage | null;
    setUploadedImage2: (img: UploadedImage | null) => void;
    showTwoImagesSection: boolean;
    setShowTwoImagesSection: (show: boolean) => void;
    setView: (view: 'studio' | 'gallery') => void;
    isComposeRealistic: boolean;
    setIsComposeRealistic: (value: boolean) => void;
    onAddNegativePromptSuggestion: (suggestion: string) => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
    prompt, setPrompt, negativePrompt, setNegativePrompt, mode, setMode, createFunction, setCreateFunction,
    editFunction, setEditFunction, selectedStyle, setSelectedStyle,
    aspectRatio, setAspectRatio, numberOfImages, setNumberOfImages,
    isLoading, handleGenerate,
    uploadedImage1, setUploadedImage1, uploadedImage2, setUploadedImage2,
    showTwoImagesSection, setShowTwoImagesSection,
    setView,
    isComposeRealistic, setIsComposeRealistic,
    onAddNegativePromptSuggestion,
}) => {
    
    const [showNegativePrompt, setShowNegativePrompt] = useState(false);

    const handleImageUpload = (file: File, setter: (img: UploadedImage) => void) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).replace(/^data:.+;base64,/, '');
            setter({ file, base64: base64String, mimeType: file.type });
        };
        reader.readAsDataURL(file);
    };
    
    const handleModeToggle = (newMode: Mode) => {
        setMode(newMode);
        setShowTwoImagesSection(newMode === 'edit' && editFunction === 'compose');
        setUploadedImage1(null);
        setUploadedImage2(null);
        setSelectedStyle('Nenhum');
    };

    const handleEditFunctionClick = (func: EditFunction) => {
        setEditFunction(func);
        setShowTwoImagesSection(func === 'compose');
    };
    
    const requiresSingleUpload = mode === 'edit' && !showTwoImagesSection;
    const isUpscaleMode = mode === 'edit' && editFunction === 'upscale';

    let isGenerateDisabled = isLoading;
    if (mode === 'create' || mode === 'video') {
        if (!prompt) isGenerateDisabled = true;
    } else if (mode === 'edit') {
        if (!uploadedImage1) isGenerateDisabled = true;
        if (editFunction === 'compose' && !uploadedImage2) isGenerateDisabled = true;
        if (editFunction !== 'upscale' && !prompt) isGenerateDisabled = true;
    }


    return (
        <div className="left-panel w-full md:w-1/3 lg:w-1/4 bg-[#1a1a1a] p-6 flex flex-col h-screen overflow-y-auto">
            <header className="flex justify-between items-center">
                 <div>
                    <h1 className="panel-title text-2xl font-bold">🎨 AI Image Studio</h1>
                    <p className="panel-subtitle text-gray-400 mt-1">Gerador profissional de imagens</p>
                </div>
                 <button onClick={() => setView('gallery')} className="text-gray-300 hover:text-white p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600 transition-colors" title="Abrir Galeria">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </button>
            </header>

            <div className="prompt-section mt-6 flex-grow flex flex-col">
                {!isUpscaleMode ? (
                    <>
                        <div className="section-title font-semibold text-gray-300 mb-2">💭 Descreva sua ideia</div>
                        <textarea
                            id="prompt"
                            className="prompt-input bg-[#2a2a2a] border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none h-28"
                            placeholder={mode === 'video' ? "Descreva o vídeo que você deseja criar..." : "Descreva a imagem que você deseja criar..."}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                        <div className="flex justify-end items-center mt-1">
                            <button
                                onClick={() => setShowNegativePrompt(prev => !prev)}
                                className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 transition-colors"
                                aria-expanded={showNegativePrompt}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d={showNegativePrompt ? "M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" : "M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"} />
                                </svg>
                                {showNegativePrompt ? 'Remover Prompt Negativo' : 'Adicionar Prompt Negativo'}
                            </button>
                        </div>

                        {showNegativePrompt && (
                             <div className="mt-2">
                                <label htmlFor="negativePrompt" className="block text-sm font-semibold text-gray-300 mb-2">🚫 Evitar na imagem</label>
                                <textarea
                                    id="negativePrompt"
                                    className="prompt-input bg-[#2a2a2a] border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none h-20"
                                    placeholder="Ex: texto, mãos deformadas, marca d'água..."
                                    value={negativePrompt}
                                    onChange={(e) => setNegativePrompt(e.target.value)}
                                />
                                <NegativePromptSuggestions onSelectNegativePrompt={onAddNegativePromptSuggestion} />
                            </div>
                        )}
                         
                         <div className="mt-4">
                            {(mode === 'create' || mode === 'video') && <PromptSuggestions onSelectPrompt={setPrompt} />}
                         </div>
                    </>
                ) : (
                    <div className="bg-[#2a2a2a] border border-gray-600 rounded-lg p-3 text-gray-400 text-center flex flex-col justify-center h-28">
                        <p className="font-semibold text-lg">✨ Melhorar Qualidade</p>
                        <p className="text-sm mt-2">Esta função irá aumentar a resolução e detalhes da imagem. Nenhum prompt é necessário.</p>
                    </div>
                )}


                <div className="mode-toggle mt-6 grid grid-cols-3 gap-2 bg-[#2a2a2a] p-1 rounded-lg">
                    <button
                        className={`mode-btn p-2 rounded-md transition-colors text-sm font-semibold ${mode === 'create' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                        data-mode="create"
                        onClick={() => handleModeToggle('create')}
                    >
                        Criar
                    </button>
                    <button
                        className={`mode-btn p-2 rounded-md transition-colors text-sm font-semibold ${mode === 'edit' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                        data-mode="edit"
                        onClick={() => handleModeToggle('edit')}
                    >
                        Editar
                    </button>
                    <button
                        className={`mode-btn p-2 rounded-md transition-colors text-sm font-semibold ${mode === 'video' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                        data-mode="video"
                        onClick={() => handleModeToggle('video')}
                    >
                        Vídeo
                    </button>
                </div>
                
                {mode === 'create' && (
                    <>
                        <div id="createFunctions" className="functions-section mt-4">
                            <div className="functions-grid grid grid-cols-2 gap-3">
                                <FunctionCard icon="✨" name="Prompt" active={createFunction === 'free'} onClick={() => setCreateFunction('free')} />
                                <FunctionCard icon="🏷️" name="Adesivos" active={createFunction === 'sticker'} onClick={() => setCreateFunction('sticker')} />
                                <FunctionCard icon="📝" name="Logo" active={createFunction === 'text'} onClick={() => setCreateFunction('text')} />
                                <FunctionCard icon="💭" name="HQ" active={createFunction === 'comic'} onClick={() => setCreateFunction('comic')} />
                                <FunctionCard icon="📸" name="Realismo Extremo" active={createFunction === 'photorealistic'} onClick={() => setCreateFunction('photorealistic')} />
                            </div>
                        </div>
                        {!uploadedImage1 && (
                            <>
                                <div className="mt-4">
                                    <div className="section-title font-semibold text-gray-300 mb-2">📐 Proporção</div>
                                    <div className="grid grid-cols-5 gap-2">
                                        {aspectRatios.map(ratio => (
                                            <button
                                                key={ratio}
                                                onClick={() => setAspectRatio(ratio)}
                                                className={`p-2 rounded-md text-xs font-semibold transition-colors ${
                                                    aspectRatio === ratio ? 'bg-purple-600 text-white' : 'bg-[#2a2a2a] text-gray-300 hover:bg-gray-700'
                                                }`}
                                            >
                                                {ratio}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="section-title font-semibold text-gray-300 mb-2">🔢 Quantidade</div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[1, 2, 3, 4].map(n => (
                                            <button
                                                key={n}
                                                onClick={() => setNumberOfImages(n)}
                                                className={`p-2 rounded-md text-sm font-semibold transition-colors ${
                                                    numberOfImages === n ? 'bg-purple-600 text-white' : 'bg-[#2a2a2a] text-gray-300 hover:bg-gray-700'
                                                }`}
                                            >
                                                {n}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                         <div className="dynamic-content mt-4">
                            <div className="section-title font-semibold text-gray-300 mb-2">🖼️ Imagem de Referência (Opcional)</div>
                            <UploadArea
                                id="createImageUpload"
                                previewSrc={uploadedImage1?.file ? URL.createObjectURL(uploadedImage1.file) : null}
                                onUpload={(file) => handleImageUpload(file, setUploadedImage1)}
                            />
                        </div>
                    </>
                )}

                 {mode === 'video' && (
                    <>
                        <div className="mt-4">
                            <div className="section-title font-semibold text-gray-300 mb-2">🎨 Estilo (Opcional)</div>
                            <div className="grid grid-cols-3 gap-2">
                                {artisticStyles.map(style => (
                                    <button
                                        key={style}
                                        onClick={() => setSelectedStyle(style)}
                                        className={`p-2 rounded-md text-xs font-semibold transition-colors ${
                                            selectedStyle === style ? 'bg-purple-600 text-white' : 'bg-[#2a2a2a] text-gray-300 hover:bg-gray-700'
                                        }`}
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>
                        </div>
                         <div className="dynamic-content mt-4">
                            <div className="section-title font-semibold text-gray-300 mb-2">🖼️ Imagem de Referência (Opcional)</div>
                            <UploadArea
                                id="videoImageUpload"
                                previewSrc={uploadedImage1?.file ? URL.createObjectURL(uploadedImage1.file) : null}
                                onUpload={(file) => handleImageUpload(file, setUploadedImage1)}
                            />
                        </div>
                    </>
                )}

                {mode === 'edit' && !showTwoImagesSection && (
                    <>
                        <div id="editFunctions" className="functions-section mt-4">
                             <div className="functions-grid grid grid-cols-2 gap-3">
                                <FunctionCard icon="➕" name="Adicionar" active={editFunction === 'add-remove'} onClick={() => handleEditFunctionClick('add-remove')} />
                                <FunctionCard icon="🎯" name="Retoque" active={editFunction === 'retouch'} onClick={() => handleEditFunctionClick('retouch')} />
                                <FunctionCard icon="🎨" name="Estilo" active={editFunction === 'style'} onClick={() => handleEditFunctionClick('style')} />
                                <FunctionCard icon="💎" name="Melhorar" active={editFunction === 'upscale'} onClick={() => handleEditFunctionClick('upscale')} />
                                <FunctionCard icon="🖼️" name="Unir" active={editFunction === 'compose'} onClick={() => handleEditFunctionClick('compose')} />
                             </div>
                        </div>
                        {editFunction === 'style' && (
                            <div className="mt-4">
                                <div className="section-title font-semibold text-gray-300 mb-2">🎨 Escolha um Estilo</div>
                                <div className="grid grid-cols-3 gap-2">
                                    {artisticStyles.filter(style => style !== 'Nenhum').map(style => (
                                        <button
                                            key={style}
                                            onClick={() => setSelectedStyle(style)}
                                            className={`p-2 rounded-md text-xs font-semibold transition-colors ${
                                                selectedStyle === style ? 'bg-purple-600 text-white' : 'bg-[#2a2a2a] text-gray-300 hover:bg-gray-700'
                                            }`}
                                        >
                                            {style}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
                
                {mode === 'edit' && showTwoImagesSection && (
                    <div id="twoImagesSection" className="functions-section mt-4">
                        <div className="text-center font-semibold mb-2">📸 Duas Imagens Necessárias</div>
                         <div className="space-y-3">
                             <UploadArea id="imageUpload1" previewSrc={uploadedImage1?.file ? URL.createObjectURL(uploadedImage1.file) : null} onUpload={(file) => handleImageUpload(file, setUploadedImage1)} title="Primeira Imagem" dual={true}/>
                             <UploadArea id="imageUpload2" previewSrc={uploadedImage2?.file ? URL.createObjectURL(uploadedImage2.file) : null} onUpload={(file) => handleImageUpload(file, setUploadedImage2)} title="Segunda Imagem" dual={true}/>
                         </div>
                         <div className="mt-4 flex items-center justify-center">
                            <input
                                type="checkbox"
                                id="composeRealistic"
                                checked={isComposeRealistic}
                                onChange={(e) => setIsComposeRealistic(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-800"
                            />
                            <label htmlFor="composeRealistic" className="ml-2 block text-sm font-medium text-gray-300">
                                Resultado Ultra Realista ✨
                            </label>
                        </div>
                         <button className="back-btn w-full mt-3 text-sm text-purple-400 hover:text-purple-300" onClick={() => setShowTwoImagesSection(false)}>
                            ← Voltar para Edição
                         </button>
                    </div>
                )}

                 <div className="dynamic-content mt-4">
                    {requiresSingleUpload && (
                        <UploadArea id="imageUpload" previewSrc={uploadedImage1?.file ? URL.createObjectURL(uploadedImage1.file) : null} onUpload={(file) => handleImageUpload(file, setUploadedImage1)} />
                    )}
                 </div>

            </div>

            <button
                id="generateBtn"
                className="generate-btn w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg mt-6 flex items-center justify-center hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                onClick={handleGenerate}
                disabled={isGenerateDisabled}
            >
                {isLoading ? <Spinner /> : <span className="btn-text">{mode === 'video' ? '🚀 Gerar Vídeo' : '🚀 Gerar Imagem'}</span>}
            </button>
        </div>
    );
};