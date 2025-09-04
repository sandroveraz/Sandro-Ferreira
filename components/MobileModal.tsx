
import React from 'react';

interface MobileModalProps {
    generatedImage: string;
    editFromModal: () => void;
    newImageFromModal: () => void;
    closeModal: () => void;
}

const MobileModal: React.FC<MobileModalProps> = ({ generatedImage, editFromModal, newImageFromModal }) => {
    
    const downloadFromModal = () => {
        if (generatedImage) {
            const link = document.createElement('a');
            link.href = generatedImage;
            link.download = `ai-image-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div id="mobileModal" className="mobile-modal fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-4 md:hidden">
            <div className="modal-content w-full max-w-sm flex flex-col items-center">
                <img id="modalImage" src={generatedImage} alt="Generated Art" className="modal-image rounded-lg shadow-2xl w-full object-contain" />
                <div className="modal-actions w-full flex justify-around mt-6">
                    <button className="modal-btn edit flex flex-col items-center text-gray-300 hover:text-white" onClick={editFromModal}>
                        <span className="text-2xl">✏️</span>
                        <span className="text-xs mt-1">Editar</span>
                    </button>
                    <button className="modal-btn download flex flex-col items-center text-gray-300 hover:text-white" onClick={downloadFromModal}>
                        <span className="text-2xl">💾</span>
                        <span className="text-xs mt-1">Salvar</span>
                    </button>
                    <button className="modal-btn new flex flex-col items-center text-gray-300 hover:text-white" onClick={newImageFromModal}>
                        <span className="text-2xl">✨</span>
                        <span className="text-xs mt-1">Nova Imagem</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MobileModal;
