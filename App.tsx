
import React, { useState, useCallback } from 'react';
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
        <div className="container mx-auto font-sans min-h-screen flex flex-col md:flex-row bg-gray-900 text-gray-200">
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
                />
            )}
        </div>
    );
};

export default App;