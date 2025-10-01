
import React from 'react';
import { HistoryItem } from '../types';

interface MobileModalProps {
    item: HistoryItem;
    onEdit: () => void;
    onNewImage: () => void;
}

export const MobileModal: React.FC<MobileModalProps> = ({ item, onEdit, onNewImage }) => {

    const downloadFromModal = () => {
        const link = document.createElement('a');
        link.href = item.url;
        link.download = item.type === 'video' ? 'ai_video_studio.mp4' : 'ai_image_studio.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const isVideo = item.type === 'video';

    return (
        <div id="mobileModal" className="mobile-modal fixed inset-0 bg-black/80 flex items-center justify-center z-50 md:hidden">
            <div className="modal-content bg-[#1a1a1a] rounded-lg p-4 w-11/12 max-w-md flex flex-col items-center">
                 {isVideo ? (
                    <video src={item.url} controls autoPlay loop className="modal-video w-full h-auto object-contain rounded-lg mb-4" />
                ) : (
                    <img id="modalImage" src={item.url} alt="Generated" className="modal-image w-full h-auto object-contain rounded-lg mb-4" />
                )}
                <div className="modal-actions grid grid-cols-3 gap-2 w-full">
                    <button 
                        className="modal-btn edit bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
                        onClick={onEdit}
                        disabled={isVideo}
                    >
                        ✏️ <span className="hidden sm:inline">Editar</span>
                    </button>
                    <button className="modal-btn download bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-md flex items-center justify-center gap-2" onClick={downloadFromModal}>
                        💾 <span className="hidden sm:inline">Salvar</span>
                    </button>
                    <button className="modal-btn new bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-3 rounded-md flex items-center justify-center gap-2" onClick={onNewImage}>
                        ✨ <span className="hidden sm:inline">Nova</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
