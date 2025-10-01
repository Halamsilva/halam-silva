
import React, { useRef, useCallback } from 'react';

interface UploadAreaProps {
    id: string;
    onUpload: (file: File) => void;
    previewSrc: string | null;
    title?: string;
    dual?: boolean;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ id, onUpload, previewSrc, title, dual = false }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            onUpload(event.target.files[0]);
        }
    };
    
    const onAreaClick = () => {
        inputRef.current?.click();
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onUpload(e.dataTransfer.files[0]);
        }
    };

    const baseClasses = "relative border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-center text-gray-400 cursor-pointer hover:border-purple-500 hover:bg-gray-800/50 transition-colors";
    const singleClasses = "upload-area aspect-video flex-col p-4";
    const dualClasses = "upload-area-dual p-3 flex-col";

    return (
        <div
            className={`${baseClasses} ${dual ? dualClasses : singleClasses}`}
            onClick={onAreaClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <input
                type="file"
                id={id}
                accept="image/*"
                className="hidden"
                ref={inputRef}
                onChange={handleFileChange}
            />
            {previewSrc ? (
                <img src={previewSrc} alt="Preview" className="image-preview absolute inset-0 w-full h-full object-cover rounded-lg" />
            ) : (
                <div className="flex flex-col items-center">
                    <div className="text-2xl">📁</div>
                    <div className={dual ? 'text-sm font-semibold' : ''}>{title || "Clique ou arraste uma imagem"}</div>
                    <div className="upload-text text-xs text-gray-500">{dual ? 'Clique para selecionar' : "PNG, JPG, WebP (máx. 10MB)"}</div>
                </div>
            )}
        </div>
    );
};
