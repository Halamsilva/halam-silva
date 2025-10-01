import React, { useState, useMemo } from 'react';
import { GalleryImage } from '../types';
import { GalleryDetailModal } from './GalleryDetailModal';

interface GalleryProps {
    images: GalleryImage[];
    onBack: () => void;
    onDelete: (id: string) => void;
    onUpdateTags: (id: string, tags: string[]) => void;
    onLoadImage: (image: GalleryImage) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ images, onBack, onDelete, onUpdateTags, onLoadImage }) => {
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTags, setActiveTags] = useState<string[]>([]);
    const [dateFilter, setDateFilter] = useState('any'); // 'any', 'today', 'week', 'month'
    const [modeFilter, setModeFilter] = useState('any');

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        images.forEach(image => image.tags.forEach(tag => tags.add(tag)));
        return Array.from(tags).sort();
    }, [images]);

    const allModes = useMemo(() => {
        const modes = new Set<string>();
        images.forEach(image => {
            if (image.creationMode) {
                modes.add(image.creationMode);
            }
        });
        return Array.from(modes).sort();
    }, [images]);

    const filteredImages = useMemo(() => {
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        const sevenDays = 7 * twentyFourHours;
        const thirtyDays = 30 * twentyFourHours;

        return images
            .filter(image => { // Search Term filter
                if (!searchTerm) return true;
                const lowercasedTerm = searchTerm.toLowerCase();
                return image.prompt.toLowerCase().includes(lowercasedTerm) ||
                       image.tags.some(tag => tag.toLowerCase().includes(lowercasedTerm));
            })
            .filter(image => { // Mode filter
                if (modeFilter === 'any') return true;
                return image.creationMode === modeFilter;
            })
            .filter(image => { // Date filter
                if (dateFilter === 'any') return true;
                const imageDate = image.createdAt;
                if (dateFilter === 'today') return now - imageDate < twentyFourHours;
                if (dateFilter === 'week') return now - imageDate < sevenDays;
                if (dateFilter === 'month') return now - imageDate < thirtyDays;
                return true;
            })
            .filter(image => { // Tags filter
                if (activeTags.length === 0) return true;
                return activeTags.every(activeTag => image.tags.includes(activeTag));
            });
    }, [images, searchTerm, modeFilter, dateFilter, activeTags]);

    const handleTagClick = (tag: string) => {
        setActiveTags(prev => 
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const clearFilters = () => {
        setSearchTerm('');
        setActiveTags([]);
        setDateFilter('any');
        setModeFilter('any');
    };

    const hasActiveFilters = searchTerm || activeTags.length > 0 || dateFilter !== 'any' || modeFilter !== 'any';
    const baseSelectClasses = "bg-[#2a2a2a] border border-gray-600 rounded-lg py-2 px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:outline-none w-full";

    return (
        <div className="min-h-screen bg-[#121212] text-white font-sans">
            <header className="bg-[#1a1a1a] p-4 flex justify-between items-center sticky top-0 z-10 shadow-md">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-gray-300 hover:text-white p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600 transition-colors" title="Voltar para o estúdio">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-2xl font-bold">🖼️ Minha Galeria</h1>
                </div>
            </header>

            <main className="p-6">
                <div className="bg-[#1a1a1a] p-4 rounded-lg mb-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative md:col-span-1">
                            <input
                                type="text"
                                placeholder="Buscar por prompt ou tag..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`${baseSelectClasses} pl-10`}
                            />
                            <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <select value={modeFilter} onChange={e => setModeFilter(e.target.value)} className={baseSelectClasses}>
                            <option value="any">Todos os Modos</option>
                            {allModes.map(mode => <option key={mode} value={mode}>{mode}</option>)}
                        </select>
                         <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} className={baseSelectClasses}>
                            <option value="any">Qualquer Data</option>
                            <option value="today">Hoje</option>
                            <option value="week">Últimos 7 dias</option>
                            <option value="month">Últimos 30 dias</option>
                        </select>
                    </div>
                    {allTags.length > 0 && (
                        <div className="border-t border-gray-700 pt-4">
                            <div className="flex flex-wrap gap-2">
                                {allTags.map(tag => (
                                    <button 
                                      key={tag} 
                                      onClick={() => handleTagClick(tag)} 
                                      className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
                                        activeTags.includes(tag) 
                                        ? 'bg-purple-600 text-white' 
                                        : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                                      }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                     {hasActiveFilters && (
                        <div className="flex justify-end pt-2">
                            <button onClick={clearFilters} className="text-purple-400 hover:text-purple-300 text-sm font-semibold">
                                Limpar Filtros
                            </button>
                        </div>
                    )}
                </div>


                {filteredImages.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {filteredImages.map(image => (
                            <div key={image.id} className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer" onClick={() => setSelectedImage(image)}>
                                <img src={image.url} alt={image.prompt} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                    <p className="text-xs text-white truncate">{image.prompt}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        <p className="text-4xl mb-4">🖼️</p>
                        <h2 className="text-xl font-semibold">Nenhuma imagem encontrada</h2>
                        <p className="mt-2">{hasActiveFilters ? "Tente ajustar ou limpar os filtros para ver mais imagens." : "Comece a criar imagens no estúdio e elas aparecerão aqui!"}</p>
                    </div>
                )}
            </main>

            {selectedImage && (
                <GalleryDetailModal
                    image={selectedImage}
                    onClose={() => setSelectedImage(null)}
                    onDelete={onDelete}
                    onUpdateTags={onUpdateTags}
                    onLoadImage={onLoadImage}
                />
            )}
        </div>
    );
};