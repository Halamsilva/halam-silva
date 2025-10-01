import React, { useState } from 'react';
import { GalleryImage } from '../types';

interface GalleryDetailModalProps {
    image: GalleryImage;
    onClose: () => void;
    onDelete: (id: string) => void;
    onUpdateTags: (id: string, tags: string[]) => void;
    onLoadImage: (image: GalleryImage) => void;
}

export const GalleryDetailModal: React.FC<GalleryDetailModalProps> = ({ image, onClose, onDelete, onUpdateTags, onLoadImage }) => {
    const [newTag, setNewTag] = useState('');

    const handleAddTag = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTag && !image.tags.includes(newTag.trim())) {
            onUpdateTags(image.id, [...image.tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        onUpdateTags(image.id, image.tags.filter(tag => tag !== tagToRemove));
    };

    const handleDelete = () => {
        if (window.confirm('Tem certeza que deseja apagar esta imagem? Esta ação não pode ser desfeita.')) {
            onDelete(image.id);
            onClose();
        }
    };
    
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = image.url;
        link.download = `ai-image-${image.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-[#1a1a1a] rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="w-full md:w-2/3 bg-black flex items-center justify-center p-4">
                    <img src={image.url} alt={image.prompt} className="max-w-full max-h-[85vh] object-contain" />
                </div>
                <div className="w-full md:w-1/3 p-6 flex flex-col overflow-y-auto">
                    <div className="flex-grow">
                         <div className="flex justify-between items-start">
                             <h2 className="text-xl font-bold mb-4">Detalhes da Imagem</h2>
                             <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                        </div>
                        
                        <div className="mb-4">
                            <h3 className="font-semibold text-gray-300 text-sm">Prompt</h3>
                            <p className="text-gray-400 bg-[#2a2a2a] p-2 rounded-md mt-1 text-sm">{image.prompt}</p>
                        </div>
                         <div className="mb-4">
                            <h3 className="font-semibold text-gray-300 text-sm">Criado em</h3>
                            <p className="text-gray-400 mt-1 text-sm">{new Date(image.createdAt).toLocaleString()}</p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-300 text-sm mb-2">Tags</h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {image.tags.map(tag => (
                                    <span key={tag} className="bg-purple-600/50 text-purple-200 text-xs font-semibold px-2 py-1 rounded-full flex items-center">
                                        {tag}
                                        <button onClick={() => handleRemoveTag(tag)} className="ml-2 text-purple-200 hover:text-white">&times;</button>
                                    </span>
                                ))}
                            </div>
                            <form onSubmit={handleAddTag} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    placeholder="Adicionar tag..."
                                    className="flex-grow bg-[#2a2a2a] border border-gray-600 rounded-md p-2 text-sm text-white placeholder-gray-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                                />
                                <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-md text-sm">Add</button>
                            </form>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-700 grid grid-cols-2 gap-2">
                        <button onClick={() => onLoadImage(image)} className="action-btn bg-blue-600 hover:bg-blue-700">✏️ Editar</button>
                        <button onClick={handleDownload} className="action-btn bg-green-600 hover:bg-green-700">💾 Salvar</button>
                        <button onClick={handleDelete} className="action-btn col-span-2 bg-red-600 hover:bg-red-700">🗑️ Apagar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
