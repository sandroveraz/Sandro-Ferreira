
import React from 'react';

interface RightPanelProps {
    isLoading: boolean;
    generatedImage: string | null;
    error: string | null;
    editCurrentImage: () => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ isLoading, generatedImage, error, editCurrentImage }) => {

    const downloadImage = () => {
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
        <div className="right-panel w-full md:w-2/3 lg:w-3/4 flex-grow bg-gray-900 p-6 flex items-center justify-center relative">
            {error && (
                <div className="absolute top-4 left-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg text-center">
                    {error}
                </div>
            )}
            
            {!isLoading && !generatedImage && (
                <div id="resultPlaceholder" className="result-placeholder text-center text-gray-500">
                    <div className="result-placeholder-icon text-8xl mb-4">🎨</div>
                    <div className="text-2xl font-semibold">Sua obra de arte aparecerá aqui</div>
                </div>
            )}

            {isLoading && (
                <div id="loadingContainer" className="loading-container text-center">
                    <div className="loading-spinner w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <div className="loading-text text-xl mt-4 font-semibold">Gerando sua imagem...</div>
                </div>
            )}

            {generatedImage && (
                <div id="imageContainer" className="image-container relative w-full h-full max-w-2xl max-h-[80vh] group">
                    <img id="generatedImage" src={generatedImage} alt="Generated Art" className="generated-image w-full h-full object-contain rounded-lg shadow-2xl" />
                    <div className="image-actions absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="action-btn bg-gray-800 bg-opacity-70 p-2 rounded-full hover:bg-opacity-100" title="Editar" onClick={editCurrentImage}>✏️</button>
                        <button className="action-btn bg-gray-800 bg-opacity-70 p-2 rounded-full hover:bg-opacity-100" title="Download" onClick={downloadImage}>💾</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RightPanel;
