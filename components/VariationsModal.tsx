import React from 'react';
import { Spinner } from './Spinner';

interface VariationsModalProps {
    originalImage: string | undefined;
    variations: string[];
    isLoading: boolean;
    error: string | null;
    onClose: () => void;
    onSelect: (variationUrl: string) => void;
}

export const VariationsModal: React.FC<VariationsModalProps> = ({
    originalImage,
    variations,
    isLoading,
    error,
    onClose,
    onSelect,
}) => {
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div 
                className="bg-[#1a1a1a] rounded-lg w-full max-w-5xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden shadow-2xl" 
                onClick={e => e.stopPropagation()}
            >
                {/* Original Image Panel */}
                <div className="w-full md:w-1/3 bg-black/20 p-4 flex flex-col items-center justify-center border-b-2 md:border-b-0 md:border-r-2 border-gray-700">
                    <h2 className="text-lg font-bold text-gray-300 mb-4">Original</h2>
                    {originalImage ? (
                        <img src={originalImage} alt="Original" className="rounded-lg object-contain max-w-full max-h-[25vh] md:max-h-full" />
                    ) : (
                        <div className="text-gray-500">Imagem não encontrada.</div>
                    )}
                </div>

                {/* Variations Panel */}
                <div className="w-full md:w-2/3 p-6 flex flex-col items-center justify-center flex-grow">
                    <div className="flex justify-between items-center w-full mb-4">
                        <h2 className="text-xl font-bold">Gerar Variações</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                    </div>

                    {isLoading && variations.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full">
                            <Spinner />
                            <p className="mt-4 text-gray-400">Gerando variações, por favor aguarde...</p>
                        </div>
                    )}

                    {!isLoading && error && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-red-400">
                            <p className="font-bold">Falha ao gerar variações</p>
                            <p className="text-sm mt-2">{error}</p>
                        </div>
                    )}

                    {!isLoading && !error && variations.length > 0 && (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 w-full flex-grow overflow-y-auto pr-2">
                            {variations.map((variationUrl, index) => (
                                <div 
                                    key={index}
                                    className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer"
                                    onClick={() => onSelect(variationUrl)}
                                >
                                    <img 
                                        src={variationUrl} 
                                        alt={`Variation ${index + 1}`} 
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-white font-bold text-lg">Selecionar</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                     {!isLoading && !error && variations.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <p>Nenhuma variação foi gerada.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
