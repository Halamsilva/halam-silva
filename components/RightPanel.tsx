import React, { useState, useRef, useEffect } from 'react';
import { CropTool } from './CropTool';
import { HistoryItem } from '../types';

interface HistoryTimelineProps {
    history: HistoryItem[];
    currentIndex: number;
    onItemClick: (index: number) => void;
}

const getActionIcon = (action: string): string => {
    if (action.startsWith('Estilo ')) return '🎨';
    if (action.startsWith('Filtro ')) return '🪄';
    switch(action) {
        case 'Criar': return '✨';
        case 'Cortar': return '✂️';
        case 'Variação': return '🧬';
        case 'Vídeo': return '🎬';
        // Create
        case 'Adesivo': return '🏷️';
        case 'Logo': return '📝';
        case 'HQ': return '💭';
        case 'Realista': return '📸';
        // Edit
        case 'Adicionar': return '➕';
        case 'Retocar': return '🎯';
        case 'Estilizar': return '🎨';
        case 'Unir': return '🖼️';
        case 'Melhorar': return '💎';
        default: return '🖼️';
    }
};

const HistoryTimeline: React.FC<HistoryTimelineProps> = ({ history, currentIndex, onItemClick }) => {
    const timelineRef = useRef<HTMLDivElement>(null);
    const currentItemRef = useRef<HTMLButtonElement>(null);
    
    useEffect(() => {
        if (currentItemRef.current) {
            currentItemRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }, [currentIndex]);

    if (history.length <= 1) {
        return null;
    }

    return (
        <div 
            ref={timelineRef}
            className="history-timeline absolute bottom-16 left-4 right-4 z-20"
            aria-label="Histórico de Edição"
        >
            <div className="bg-gray-900/70 backdrop-blur-sm rounded-lg p-2 flex items-center gap-3 overflow-x-auto">
                {history.map((item, index) => (
                    <button
                        key={index}
                        ref={index === currentIndex ? currentItemRef : null}
                        onClick={() => onItemClick(index)}
                        className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 ${
                            currentIndex === index ? 'border-purple-500 scale-105' : 'border-transparent hover:border-gray-500'
                        }`}
                        aria-label={`Passo ${index + 1}: ${item.action}. Clique para reverter.`}
                        aria-current={currentIndex === index ? 'step' : undefined}
                    >
                        {item.type === 'image' ? (
                            <img src={item.url} alt={item.action} className="w-full h-full object-cover" />
                        ) : (
                             <video src={item.url} className="w-full h-full object-cover" muted loop autoPlay />
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center py-0.5 px-1 truncate flex items-center justify-center gap-1">
                            <span>{getActionIcon(item.action)}</span>
                            <span className="font-semibold">{item.action}</span>
                        </div>
                    </button>
                ))}
            </div>
            <style>{`
                .history-timeline > div::-webkit-scrollbar { height: 8px; }
                .history-timeline > div::-webkit-scrollbar-track { background: transparent; }
                .history-timeline > div::-webkit-scrollbar-thumb { background-color: rgba(107, 114, 128, 0.5); border-radius: 4px; }
                .history-timeline > div::-webkit-scrollbar-thumb:hover { background-color: rgba(75, 85, 99, 0.7); }
            `}</style>
        </div>
    );
};


interface RightPanelProps {
    isLoading: boolean;
    error: string | null;
    currentItem: HistoryItem | null;
    onEdit: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onUpscale: () => void;
    onApplyStyle: () => void;
    onApplyFilter: () => void;
    canUndo: boolean;
    canRedo: boolean;
    isCropping: boolean;
    setIsCropping: (isCropping: boolean) => void;
    onCrop: (croppedImageUrl: string) => void;
    onGenerateVariations: () => void;
    history: HistoryItem[];
    historyIndex: number;
    onHistoryClick: (index: number) => void;
    loadingMessage: string;
}

export const RightPanel: React.FC<RightPanelProps> = ({ 
    isLoading, error, currentItem, onEdit, onUndo, onRedo, canUndo, canRedo, onUpscale,
    isCropping, setIsCropping, onCrop, onGenerateVariations, onApplyStyle, onApplyFilter,
    history, historyIndex, onHistoryClick, loadingMessage
}) => {
    
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const lastMousePosition = useRef({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // Reset zoom when image changes
    useEffect(() => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    }, [currentItem?.url]);
    
    const downloadMedia = () => {
        if (!currentItem) return;
        const link = document.createElement('a');
        link.href = currentItem.url;
        link.download = currentItem.type === 'video' ? 'ai_video_studio.mp4' : 'ai_image_studio.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (scale <= 1 || e.button !== 0 || currentItem?.type === 'video') return;
        e.preventDefault();
        setIsDragging(true);
        lastMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging || scale <= 1) return;
        e.preventDefault();
        const dx = e.clientX - lastMousePosition.current.x;
        const dy = e.clientY - lastMousePosition.current.y;
        lastMousePosition.current = { x: e.clientX, y: e.clientY };
        setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    };

    const handleMouseUpOrLeave = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isDragging) {
            e.preventDefault();
            setIsDragging(false);
        }
    };
    
    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        if (currentItem?.type === 'video') return;
        e.preventDefault();
        if (!containerRef.current) return;

        const zoomFactor = 1.1;
        const oldScale = scale;
        const newScale = e.deltaY < 0 ? oldScale * zoomFactor : oldScale / zoomFactor;
        const clampedScale = Math.max(1, Math.min(newScale, 5));

        if (clampedScale.toFixed(2) === oldScale.toFixed(2)) return;

        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const worldX = (mouseX - position.x) / oldScale;
        const worldY = (mouseY - position.y) / oldScale;

        const newPosX = mouseX - worldX * clampedScale;
        const newPosY = mouseY - worldY * clampedScale;
        
        if (clampedScale < 1.01) {
             handleResetZoom();
        } else {
             setScale(clampedScale);
             setPosition({ x: newPosX, y: newPosY });
        }
    };
    
    const adjustScale = (newScale: number) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect || currentItem?.type === 'video') return;

        const clampedScale = Math.max(1, Math.min(newScale, 5));

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const worldX = (centerX - position.x) / scale;
        const worldY = (centerY - position.y) / scale;

        const newPosX = centerX - worldX * clampedScale;
        const newPosY = centerY - worldY * clampedScale;
        
        if (clampedScale < 1.01) {
            handleResetZoom();
        } else {
            setScale(clampedScale);
            setPosition({ x: newPosX, y: newPosY });
        }
    }

    const handleZoomIn = () => adjustScale(scale * 1.4);
    const handleZoomOut = () => adjustScale(scale / 1.4);
    const handleResetZoom = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    const actionButtonClasses = "action-btn bg-gray-800/80 hover:bg-gray-700 text-white rounded-full p-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-800/80";
    const zoomButtonClasses = "p-2 rounded-full transition-colors enabled:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed";
    const isVideo = currentItem?.type === 'video';

    return (
        <div className="right-panel flex-grow bg-[#121212] p-6 items-center justify-center hidden md:flex">
            {isLoading && !isCropping && !currentItem && (
                 <div id="loadingContainer" className="loading-container text-center">
                    <div className="loading-spinner w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-500 mx-auto"></div>
                    <div className="loading-text mt-4 text-gray-300">{loadingMessage}</div>
                 </div>
            )}
            {!isLoading && !currentItem && !error && (
                <div id="resultPlaceholder" className="result-placeholder text-center text-gray-500">
                    <div className="result-placeholder-icon text-6xl">🎨</div>
                    <div className="mt-4">Sua obra de arte aparecerá aqui</div>
                </div>
            )}
            {!isLoading && error && (
                <div className="text-center text-red-400 p-4 bg-red-900/20 rounded-lg">
                    <h3 className="font-bold">Error</h3>
                    <p>{error}</p>
                </div>
            )}
            {!isLoading && currentItem && (
                isCropping ? (
                    <CropTool
                        imageUrl={currentItem.url}
                        onCrop={onCrop}
                        onCancel={() => setIsCropping(false)}
                    />
                ) : (
                <div id="imageContainer" className="relative w-full h-full flex flex-col items-center justify-center">
                    <div
                        ref={containerRef}
                        className="w-full h-full flex items-center justify-center overflow-hidden"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUpOrLeave}
                        onMouseLeave={handleMouseUpOrLeave}
                        onWheel={handleWheel}
                        style={{ cursor: scale > 1 && !isVideo ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
                    >
                        <div style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`, transition: 'transform 0.1s ease-out' }}>
                           {currentItem.type === 'image' ? (
                                <img 
                                    id="generatedImage" 
                                    src={currentItem.url} 
                                    alt="Generated art" 
                                    className="generated-image max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl shadow-black/50"
                                    onDragStart={(e) => e.preventDefault()}
                                />
                            ) : (
                                <video
                                    id="generatedVideo"
                                    src={currentItem.url}
                                    controls
                                    autoPlay
                                    loop
                                    className="generated-video max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl shadow-black/50"
                                />
                            )}
                        </div>
                    </div>

                    {currentItem.text && <p className={`absolute text-center mt-2 p-2 bg-black/50 backdrop-blur-sm rounded-md text-sm text-gray-200 max-w-lg z-10 transition-all ${history.length > 1 ? 'bottom-40' : 'bottom-20'}`}>{currentItem.text}</p>}
                    
                    <div className="image-actions absolute top-4 right-4 flex gap-2 z-10">
                        <button className={actionButtonClasses} title="Desfazer" onClick={onUndo} disabled={!canUndo || isLoading}>
                            ↩️
                        </button>
                        <button className={actionButtonClasses} title="Refazer" onClick={onRedo} disabled={!canRedo || isLoading}>
                            ↪️
                        </button>
                         <button className={actionButtonClasses} title="Aplicar Estilo" onClick={onApplyStyle} disabled={isLoading || isVideo}>
                            🎨
                        </button>
                        <button className={actionButtonClasses} title="Aplicar Filtro" onClick={onApplyFilter} disabled={isLoading || isVideo}>
                            🪄
                        </button>
                         <button className={actionButtonClasses} title="Gerar Variações" onClick={onGenerateVariations} disabled={isLoading || isVideo}>
                            🧬
                        </button>
                         <button className={actionButtonClasses} title="Melhorar Qualidade (Upscale)" onClick={onUpscale} disabled={isLoading || isVideo}>
                            💎
                        </button>
                        <button className={actionButtonClasses} title="Cortar" onClick={() => setIsCropping(true)} disabled={isLoading || isVideo}>
                            ✂️
                        </button>
                        <button className={actionButtonClasses} title="Editar" onClick={onEdit} disabled={isLoading || isVideo}>
                            ✏️
                        </button>
                        <button className={actionButtonClasses} title="Download" onClick={downloadMedia} disabled={isLoading}>
                            💾
                        </button>
                    </div>
                    
                    <HistoryTimeline
                        history={history}
                        currentIndex={historyIndex}
                        onItemClick={onHistoryClick}
                    />
                    
                    {!isVideo && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-gray-900/70 backdrop-blur-sm rounded-full p-1 text-white z-10">
                            <button onClick={handleZoomOut} disabled={scale <= 1} className={zoomButtonClasses} title="Zoom Out">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>
                            </button>
                            <span className="text-sm font-mono w-16 text-center tabular-nums">{Math.round(scale * 100)}%</span>
                            <button onClick={handleZoomIn} disabled={scale >= 5} className={zoomButtonClasses} title="Zoom In">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                            </button>
                            <div className="w-px h-5 bg-gray-600 mx-1"></div>
                            <button onClick={handleResetZoom} disabled={scale <= 1} className={zoomButtonClasses} title="Reset Zoom">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" /></svg>
                            </button>
                        </div>
                    )}
                </div>
                )
            )}
        </div>
    );
};
