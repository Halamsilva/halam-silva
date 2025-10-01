import React from 'react';

interface GeneratedImagesModalProps {
    images: string[];
    onClose: () => void;
    onSelect: (imageBase64: string) => void;
}

export const GeneratedImagesModal: React.FC<GeneratedImagesModalProps> = ({
    images,
    onClose,
    onSelect,
}) => {
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div 
                className="bg-[#1a1a1a] rounded-lg w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl" 
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 flex flex-col items-center justify-center flex-grow">
                    <div className="flex justify-between items-center w-full mb-4">
                        <h2 className="text-xl font-bold">Escolha uma Imagem</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                    </div>

                    {images.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full flex-grow overflow-y-auto pr-2">
                            {images.map((imageBase64, index) => (
                                <div 
                                    key={index}
                                    className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer"
                                    onClick={() => onSelect(imageBase64)}
                                >
                                    <img 
                                        src={`data:image/png;base64,${imageBase64}`}
                                        alt={`Imagem Gerada ${index + 1}`} 
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-white font-bold text-lg">Selecionar</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                             <p>Nenhuma imagem para exibir.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
