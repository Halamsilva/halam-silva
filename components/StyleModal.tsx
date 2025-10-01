import React from 'react';
import { ArtisticStyle, artisticStyles } from '../types';

interface StyleModalProps {
    originalImage: string | undefined;
    onClose: () => void;
    onSelectStyle: (style: ArtisticStyle) => void;
    isLoading: boolean;
}

export const StyleModal: React.FC<StyleModalProps> = ({
    originalImage,
    onClose,
    onSelectStyle,
    isLoading,
}) => {
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-[#1a1a1a] rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="w-full md:w-1/2 bg-black/20 p-4 flex flex-col items-center justify-center border-b-2 md:border-b-0 md:border-r-2 border-gray-700">
                    <h2 className="text-lg font-bold text-gray-300 mb-4">Original</h2>
                    {originalImage ? (
                        <img src={originalImage} alt="Original" className="rounded-lg object-contain max-w-full max-h-[40vh] md:max-h-full" />
                    ) : (
                        <div className="text-gray-500">Imagem não encontrada.</div>
                    )}
                </div>

                <div className="w-full md:w-1/2 p-6 flex flex-col">
                    <div className="flex justify-between items-center w-full mb-6">
                        <h2 className="text-xl font-bold">Aplicar Filtro de Estilo</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-grow content-start">
                        {artisticStyles.filter(style => style !== 'Nenhum').map((style) => (
                            <button
                                key={style}
                                onClick={() => onSelectStyle(style)}
                                disabled={isLoading}
                                className="p-3 rounded-lg text-sm font-semibold transition-colors bg-[#2a2a2a] text-gray-300 hover:bg-purple-600 hover:text-white disabled:opacity-50 disabled:cursor-wait"
                            >
                                {style}
                            </button>
                        ))}
                    </div>
                     {isLoading && (
                        <p className="mt-4 text-center text-gray-400">Aplicando estilo, por favor aguarde...</p>
                    )}
                </div>
            </div>
        </div>
    );
};