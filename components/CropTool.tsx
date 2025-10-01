import React, { useState, useRef, useEffect, useCallback } from 'react';

interface Crop {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface CropToolProps {
    imageUrl: string;
    onCrop: (croppedImageUrl: string) => void;
    onCancel: () => void;
}

const MIN_CROP_SIZE = 50;

export const CropTool: React.FC<CropToolProps> = ({ imageUrl, onCrop, onCancel }) => {
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [crop, setCrop] = useState<Crop>({ x: 0, y: 0, width: 0, height: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [resizeHandle, setResizeHandle] = useState<string | null>(null);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [startCrop, setStartCrop] = useState<Crop>({ x: 0, y: 0, width: 0, height: 0 });

    useEffect(() => {
        const image = imageRef.current;
        if (image) {
            const setInitialCrop = () => {
                const { width, height } = image.getBoundingClientRect();
                const initialWidth = width * 0.8;
                const initialHeight = height * 0.8;
                setCrop({
                    x: (width - initialWidth) / 2,
                    y: (height - initialHeight) / 2,
                    width: initialWidth,
                    height: initialHeight,
                });
            };

            if (image.complete) {
                setInitialCrop();
            } else {
                image.onload = setInitialCrop;
            }
        }
    }, [imageUrl]);

    const getCursorPosition = (e: React.MouseEvent | MouseEvent): {x: number, y: number} => {
        const container = containerRef.current;
        if (!container) return { x: 0, y: 0 };
        const rect = container.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    const handleMouseDown = (e: React.MouseEvent, handle?: string) => {
        e.preventDefault();
        e.stopPropagation();
        const pos = getCursorPosition(e);
        setStartPos(pos);
        setStartCrop(crop);

        if (handle) {
            setResizeHandle(handle);
        } else {
            setIsDragging(true);
        }
    };

    const handleMouseMove = useCallback((e: React.MouseEvent | MouseEvent) => {
        const pos = getCursorPosition(e);
        const dx = pos.x - startPos.x;
        const dy = pos.y - startPos.y;
        const imageEl = imageRef.current;
        const containerEl = containerRef.current;

        if (!imageEl || !containerEl) return;
        
        const imageBounds = imageEl.getBoundingClientRect();
        const containerBounds = containerEl.getBoundingClientRect();

        let newCrop = { ...startCrop };

        if (isDragging) {
            newCrop.x = startCrop.x + dx;
            newCrop.y = startCrop.y + dy;
        } else if (resizeHandle) {
            if (resizeHandle.includes('e')) newCrop.width = Math.max(MIN_CROP_SIZE, startCrop.width + dx);
            if (resizeHandle.includes('w')) {
                const newWidth = Math.max(MIN_CROP_SIZE, startCrop.width - dx);
                newCrop.x = startCrop.x + startCrop.width - newWidth;
                newCrop.width = newWidth;
            }
            if (resizeHandle.includes('s')) newCrop.height = Math.max(MIN_CROP_SIZE, startCrop.height + dy);
            if (resizeHandle.includes('n')) {
                const newHeight = Math.max(MIN_CROP_SIZE, startCrop.height - dy);
                newCrop.y = startCrop.y + startCrop.height - newHeight;
                newCrop.height = newHeight;
            }
        }
        
        const imageOffsetX = (containerBounds.width - imageBounds.width) / 2;
        const imageOffsetY = (containerBounds.height - imageBounds.height) / 2;

        newCrop.x = Math.max(imageOffsetX, newCrop.x);
        newCrop.y = Math.max(imageOffsetY, newCrop.y);
        
        if (newCrop.x + newCrop.width > imageOffsetX + imageBounds.width) {
            newCrop.width = imageOffsetX + imageBounds.width - newCrop.x;
        }
        if (newCrop.y + newCrop.height > imageOffsetY + imageBounds.height) {
            newCrop.height = imageOffsetY + imageBounds.height - newCrop.y;
        }

        setCrop(newCrop);
    }, [startPos, startCrop, isDragging, resizeHandle]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        setResizeHandle(null);
    }, []);

    useEffect(() => {
        const moveHandler = (e: MouseEvent) => handleMouseMove(e);
        const upHandler = () => handleMouseUp();

        if (isDragging || resizeHandle) {
            window.addEventListener('mousemove', moveHandler);
            window.addEventListener('mouseup', upHandler);
            window.addEventListener('mouseleave', upHandler);
        }

        return () => {
            window.removeEventListener('mousemove', moveHandler);
            window.removeEventListener('mouseup', upHandler);
            window.removeEventListener('mouseleave', upHandler);
        };
    }, [isDragging, resizeHandle, handleMouseMove, handleMouseUp]);


    const handleApplyCrop = async () => {
        const image = imageRef.current;
        if (!image) return;

        const originalImage = new Image();
        originalImage.crossOrigin = "anonymous";
        originalImage.src = imageUrl;
        await new Promise((resolve, reject) => { 
            originalImage.onload = resolve;
            originalImage.onerror = reject;
        });

        const { naturalWidth, naturalHeight } = originalImage;
        const { width: displayWidth, height: displayHeight } = image.getBoundingClientRect();
        
        const containerBounds = containerRef.current?.getBoundingClientRect();
        if (!containerBounds) return;

        const scaleX = naturalWidth / displayWidth;
        const scaleY = naturalHeight / displayHeight;
        
        const imageOffsetLeft = (containerBounds.width - displayWidth) / 2;
        const imageOffsetTop = (containerBounds.height - displayHeight) / 2;

        const canvas = document.createElement('canvas');
        const sx = (crop.x - imageOffsetLeft) * scaleX;
        const sy = (crop.y - imageOffsetTop) * scaleY;
        const sWidth = crop.width * scaleX;
        const sHeight = crop.height * scaleY;
        
        canvas.width = sWidth;
        canvas.height = sHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(originalImage, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);
        
        onCrop(canvas.toDataURL('image/png'));
    };
    
    const handles = ['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'];

    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <div ref={containerRef} className="relative select-none w-full h-[calc(100%-60px)] flex items-center justify-center touch-none">
                <img
                    ref={imageRef}
                    src={imageUrl}
                    alt="Crop source"
                    className="max-w-full max-h-full object-contain pointer-events-none"
                />
                <div className="absolute inset-0">
                    <div
                        className="absolute inset-0 bg-black/70"
                        style={{
                            clipPath: `path('M0 0 H${containerRef.current?.clientWidth || 0} V${containerRef.current?.clientHeight || 0} H0 Z M${crop.x} ${crop.y} V${crop.y + crop.height} H${crop.x + crop.width} V${crop.y} Z')`,
                        }}
                    ></div>
                    <div
                        className="absolute border-2 border-dashed border-white cursor-move"
                        style={{
                            left: crop.x,
                            top: crop.y,
                            width: crop.width,
                            height: crop.height,
                        }}
                        onMouseDown={(e) => handleMouseDown(e)}
                    >
                        {handles.map(handle => (
                            <div
                                key={handle}
                                className={`absolute bg-white w-3 h-3 rounded-full -m-[6px] handle-${handle}`}
                                onMouseDown={(e) => handleMouseDown(e, handle)}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-4 flex gap-4">
                <button onClick={onCancel} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">Cancelar</button>
                <button onClick={handleApplyCrop} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">Aplicar Corte</button>
            </div>
            <style>{`
                .handle-n { top: 0; left: 50%; transform: translateX(-50%); cursor: n-resize; }
                .handle-s { bottom: 0; left: 50%; transform: translateX(-50%); cursor: s-resize; }
                .handle-e { top: 50%; right: 0; transform: translateY(-50%); cursor: e-resize; }
                .handle-w { top: 50%; left: 0; transform: translateY(-50%); cursor: w-resize; }
                .handle-nw { top: 0; left: 0; cursor: nw-resize; }
                .handle-ne { top: 0; right: 0; cursor: ne-resize; }
                .handle-sw { bottom: 0; left: 0; cursor: sw-resize; }
                .handle-se { bottom: 0; right: 0; cursor: se-resize; }
            `}</style>
        </div>
    );
};
