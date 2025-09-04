
import React, { useState, useCallback, useEffect } from 'react';
import { Mode, CreateFunction, EditFunction, ImageData, AspectRatio } from './types';
import { fileToBase64, generateImage as apiGenerateImage, editOrComposeImage } from './services/geminiService';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import MobileModal from './components/MobileModal';

const App: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [mode, setMode] = useState<Mode>('create');
    const [activeCreateFunc, setActiveCreateFunc] = useState<CreateFunction>('free');
    const [activeEditFunc, setActiveEditFunc] = useState<EditFunction>('add-remove');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    
    const [image1, setImage1] = useState<ImageData | null>(null);
    const [image2, setImage2] = useState<ImageData | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [showTwoImages, setShowTwoImages] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isViewOnly, setIsViewOnly] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<string>('');

    useEffect(() => {
        const hash = window.location.hash;
        if (hash.startsWith('#image=')) {
            try {
                const encodedData = hash.substring('#image='.length);
                const imageDataUrl = decodeURIComponent(encodedData);
                if (imageDataUrl.startsWith('data:image/')) {
                    setGeneratedImage(imageDataUrl);
                    setIsViewOnly(true);
                } else {
                    window.location.hash = ''; // Clear invalid hash
                }
            } catch (e) {
                console.error("Failed to decode image data from URL hash", e);
                setError("Não foi possível carregar a imagem compartilhada.");
                window.location.hash = ''; // Clear invalid hash
            }
        }
    }, []);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => {
            setToastMessage('');
        }, 3000);
    };

    const handleShare = useCallback(() => {
        if (generatedImage) {
            const encodedData = encodeURIComponent(generatedImage);
            const shareUrl = `${window.location.origin}${window.location.pathname}#image=${encodedData}`;
            navigator.clipboard.writeText(shareUrl).then(() => {
                showToast('Link copiado para a área de transferência!');
            }).catch(err => {
                console.error('Failed to copy link: ', err);
                showToast('Falha ao copiar o link.');
            });
        }
    }, [generatedImage]);

    const handleImageUpload = useCallback(async (
        input: HTMLInputElement,
        imageNumber: 1 | 2
    ) => {
        if (input.files && input.files[0]) {
            try {
                const imageData = await fileToBase64(input.files[0]);
                if (imageNumber === 1) setImage1(imageData);
                if (imageNumber === 2) setImage2(imageData);
            } catch (err) {
                setError('Failed to process image.');
                console.error(err);
            }
        }
    }, []);

    const resetStateForNewImage = () => {
        setGeneratedImage(null);
        setIsModalOpen(false);
        setError(null);
    };

    const editCurrentImage = () => {
        if (generatedImage) {
            // Convert data URL back to ImageData-like object
            const mimeType = generatedImage.substring(generatedImage.indexOf(":") + 1, generatedImage.indexOf(";"));
            const base64 = generatedImage.substring(generatedImage.indexOf(",") + 1);
            
            setImage1({ base64, mimeType });
            setMode('edit');
            setActiveEditFunc('add-remove');
            setShowTwoImages(false);
            setGeneratedImage(null);
            setIsModalOpen(false);
        }
    };

    const generateImage = async () => {
        if (!prompt.trim()) {
            setError("Please enter a description.");
            return;
        }
        setIsLoading(true);
        setGeneratedImage(null);
        setError(null);
        
        try {
            let result: string;
            if (mode === 'create') {
                result = await apiGenerateImage(prompt, activeCreateFunc, aspectRatio);
            } else {
                if (activeEditFunc === 'compose') {
                    if (!image1 || !image2) {
                       throw new Error("Please upload two images to combine.");
                    }
                    result = await editOrComposeImage(prompt, activeEditFunc, image1, image2);
                } else {
                    if (!image1) {
                        throw new Error("Please upload an image to edit.");
                    }
                    result = await editOrComposeImage(prompt, activeEditFunc, image1);
                }
            }
            setGeneratedImage(result);
            if (window.innerWidth < 768) {
                setIsModalOpen(true);
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto font-sans min-h-screen flex flex-col md:flex-row bg-gray-900 text-gray-200 relative">
            {toastMessage && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white py-2 px-5 rounded-full shadow-lg z-[100] transition-transform duration-300 transform animate-bounce">
                    {toastMessage}
                </div>
            )}
            {isViewOnly ? (
                <div className="w-full h-screen flex items-center justify-center bg-gray-900 p-4">
                     {error && (
                        <div className="absolute top-4 left-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg text-center">
                            {error}
                        </div>
                    )}
                    {generatedImage ? (
                        <img src={generatedImage} alt="Shared AI Art" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                    ) : (
                         <div className="text-center text-gray-500">
                             <div className="text-6xl animate-pulse">🖼️</div>
                             <div className="text-xl mt-4">Carregando imagem compartilhada...</div>
                         </div>
                    )}
                </div>
            ) : (
                <>
                    <LeftPanel
                        prompt={prompt}
                        setPrompt={setPrompt}
                        mode={mode}
                        setMode={setMode}
                        activeCreateFunc={activeCreateFunc}
                        setActiveCreateFunc={setActiveCreateFunc}
                        activeEditFunc={activeEditFunc}
                        setActiveEditFunc={setActiveEditFunc}
                        aspectRatio={aspectRatio}
                        setAspectRatio={setAspectRatio}
                        showTwoImages={showTwoImages}
                        setShowTwoImages={setShowTwoImages}
                        image1={image1}
                        image2={image2}
                        handleImageUpload={handleImageUpload}
                        generateImage={generateImage}
                        isLoading={isLoading}
                    />
                    <RightPanel
                        isLoading={isLoading}
                        generatedImage={generatedImage}
                        error={error}
                        editCurrentImage={editCurrentImage}
                        handleShare={handleShare}
                    />
                    {isModalOpen && generatedImage && (
                        <MobileModal
                            generatedImage={generatedImage}
                            editFromModal={editCurrentImage}
                            newImageFromModal={() => {
                              resetStateForNewImage();
                              setPrompt('');
                              setImage1(null);
                              setImage2(null);
                            }}
                            closeModal={() => setIsModalOpen(false)}
                            handleShare={handleShare}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default App;
