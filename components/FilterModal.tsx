import React from 'react';
import { VisualFilter, visualFilters } from '../types';

interface FilterModalProps {
    originalImage: string | undefined;
    onClose: () => void;
    onSelectFilter: (filter: VisualFilter) => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
    originalImage,
    onClose,
    onSelectFilter,
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
                        <h2 className="text-xl font-bold">Aplicar Filtro Visual</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-grow content-start">
                        {visualFilters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => onSelectFilter(filter)}
                                className="p-3 rounded-lg text-sm font-semibold transition-colors bg-[#2a2a2a] text-gray-300 hover:bg-purple-600 hover:text-white"
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
