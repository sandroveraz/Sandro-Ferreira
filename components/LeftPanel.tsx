
import React, { useRef } from 'react';
import { Mode, CreateFunction, EditFunction, ImageData, AspectRatio } from '../types';

interface LeftPanelProps {
    prompt: string;
    setPrompt: (prompt: string) => void;
    mode: Mode;
    setMode: (mode: Mode) => void;
    activeCreateFunc: CreateFunction;
    setActiveCreateFunc: (func: CreateFunction) => void;
    activeEditFunc: EditFunction;
    setActiveEditFunc: (func: EditFunction) => void;
    aspectRatio: AspectRatio;
    setAspectRatio: (ratio: AspectRatio) => void;
    showTwoImages: boolean;
    setShowTwoImages: (show: boolean) => void;
    image1: ImageData | null;
    image2: ImageData | null;
    handleImageUpload: (input: HTMLInputElement, imageNumber: 1 | 2) => void;
    generateImage: () => void;
    isLoading: boolean;
}

const FunctionCard: React.FC<{
    icon: string;
    name: string;
    active: boolean;
    onClick: () => void;
}> = ({ icon, name, active, onClick }) => (
    <div
        className={`function-card p-3 rounded-lg text-center cursor-pointer transition-all duration-200 ${
            active ? 'bg-indigo-600 shadow-lg' : 'bg-gray-700 hover:bg-gray-600'
        }`}
        onClick={onClick}
    >
        <div className="text-2xl mb-1">{icon}</div>
        <div className="text-sm font-medium">{name}</div>
    </div>
);

const UploadArea: React.FC<{
    id: string;
    text: string;
    onUpload: (input: HTMLInputElement) => void;
    previewSrc: string | null;
}> = ({ id, text, onUpload, previewSrc }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    return (
        <div 
            className="upload-area-dual relative text-center border-2 border-dashed border-gray-600 rounded-lg p-4 cursor-pointer hover:border-indigo-500 transition-colors"
            onClick={() => inputRef.current?.click()}
        >
            {previewSrc ? (
                 <img id={`${id}Preview`} src={previewSrc} alt="Preview" className="image-preview absolute inset-0 w-full h-full object-cover rounded-lg" />
            ) : (
                <>
                    <div className="text-3xl text-gray-500">📁</div>
                    <div className="font-semibold mt-2">{text}</div>
                    <div className="upload-text text-xs text-gray-400">Clique para selecionar</div>
                </>
            )}
            <input 
                type="file" 
                id={id} 
                ref={inputRef} 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => onUpload(e.target)} 
            />
        </div>
    );
};

const LeftPanel: React.FC<LeftPanelProps> = ({
    prompt, setPrompt, mode, setMode, activeCreateFunc, setActiveCreateFunc,
    activeEditFunc, setActiveEditFunc, aspectRatio, setAspectRatio, showTwoImages, setShowTwoImages,
    image1, image2, handleImageUpload, generateImage, isLoading
}) => {
    
    const singleUploadRef = useRef<HTMLInputElement>(null);

    const createFunctions = [
        { key: 'free', icon: '✨', name: 'Prompt' },
        { key: 'sticker', icon: '🏷️', name: 'Adesivos' },
        { key: 'text', icon: '📝', name: 'Logo' },
        { key: 'comic', icon: '💭', name: 'HQ' },
    ];

    const editFunctions = [
        { key: 'add-remove', icon: '➕', name: 'Adicionar' },
        { key: 'retouch', icon: '🎯', name: 'Retoque' },
        { key: 'style', icon: '🎨', name: 'Estilo' },
        { key: 'compose', icon: '🖼️', name: 'Unir', requiresTwo: true },
    ];

    const handleEditFuncClick = (func: EditFunction, requiresTwo?: boolean) => {
        setActiveEditFunc(func);
        if (requiresTwo) {
            setShowTwoImages(true);
        } else {
            setShowTwoImages(false);
        }
    };
    
    return (
        <div className="left-panel w-full md:w-1/3 lg:w-1/4 bg-gray-800 p-6 flex flex-col space-y-6 overflow-y-auto h-screen">
            <header>
                <h1 className="panel-title text-3xl font-bold text-white">🎨 AI Image Studio</h1>
                <p className="panel-subtitle text-md text-gray-400">Gerador profissional de imagens</p>
            </header>
            
            <div className="prompt-section">
                <div className="section-title font-semibold mb-2">💭 Descreva sua ideia</div>
                <textarea
                    id="prompt"
                    className="prompt-input w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow duration-200 h-28 resize-none"
                    placeholder="Descreva a imagem que você deseja criar..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
            </div>
            
            <div className="mode-toggle flex bg-gray-700 rounded-lg p-1">
                <button 
                    className={`mode-btn w-1/2 p-2 rounded-md transition-colors text-sm font-medium ${mode === 'create' ? 'bg-indigo-600' : 'hover:bg-gray-600'}`} 
                    data-mode="create" 
                    onClick={() => setMode('create')}
                >
                    Criar
                </button>
                <button 
                    className={`mode-btn w-1/2 p-2 rounded-md transition-colors text-sm font-medium ${mode === 'edit' ? 'bg-indigo-600' : 'hover:bg-gray-600'}`} 
                    data-mode="edit"
                    onClick={() => setMode('edit')}
                >
                    Editar
                </button>
            </div>

            {mode === 'create' && (
                <div id="createFunctions" className="functions-section space-y-4">
                    <div className="functions-grid grid grid-cols-2 gap-3">
                        {createFunctions.map(f => (
                            <FunctionCard
                                key={f.key}
                                icon={f.icon}
                                name={f.name}
                                active={activeCreateFunc === f.key}
                                onClick={() => setActiveCreateFunc(f.key as CreateFunction)}
                            />
                        ))}
                    </div>
                     <div>
                        <label htmlFor="aspectRatio" className="section-title font-semibold mb-2 block">📐 Proporção</label>
                        <select
                            id="aspectRatio"
                            value={aspectRatio}
                            onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            aria-label="Selecionar proporção da imagem"
                        >
                            <option value="1:1">Quadrado (1:1)</option>
                            <option value="16:9">Paisagem (16:9)</option>
                            <option value="9:16">Retrato (9:16)</option>
                        </select>
                    </div>
                </div>
            )}
            
            {mode === 'edit' && !showTwoImages && (
                 <div id="editFunctions" className="functions-section">
                    <div className="functions-grid grid grid-cols-2 gap-3">
                        {editFunctions.map(f => (
                            <FunctionCard
                                key={f.key}
                                icon={f.icon}
                                name={f.name}
                                active={activeEditFunc === f.key}
                                onClick={() => handleEditFuncClick(f.key as EditFunction, f.requiresTwo)}
                            />
                        ))}
                    </div>
                 </div>
            )}

            {mode === 'edit' && showTwoImages && (
                 <div id="twoImagesSection" className="functions-section flex flex-col space-y-4">
                    <div className="font-semibold text-center">📸 Duas Imagens Necessárias</div>
                     <UploadArea id="imageUpload1" text="Primeira Imagem" onUpload={(input) => handleImageUpload(input, 1)} previewSrc={image1 ? `data:${image1.mimeType};base64,${image1.base64}` : null} />
                     <UploadArea id="imageUpload2" text="Segunda Imagem" onUpload={(input) => handleImageUpload(input, 2)} previewSrc={image2 ? `data:${image2.mimeType};base64,${image2.base64}` : null} />
                    <button className="back-btn text-sm text-indigo-400 hover:text-indigo-300" onClick={() => setShowTwoImages(false)}>← Voltar para Edição</button>
                 </div>
            )}
            
            {mode === 'edit' && !showTwoImages && (
                 <div className="dynamic-content">
                     <div 
                         id="uploadArea" 
                         className="upload-area relative text-center border-2 border-dashed border-gray-600 rounded-lg p-6 cursor-pointer hover:border-indigo-500 transition-colors"
                         onClick={() => singleUploadRef.current?.click()}
                     >
                        {image1 ? (
                             <img id="imagePreview" src={`data:${image1.mimeType};base64,${image1.base64}`} alt="Preview" className="image-preview absolute inset-0 w-full h-full object-cover rounded-lg" />
                        ) : (
                            <>
                                <div className="text-4xl text-gray-500">📁</div>
                                <div className="font-semibold mt-2">Clique ou arraste uma imagem</div>
                                <div className="upload-text text-xs text-gray-400">PNG, JPG, WebP (máx. 10MB)</div>
                            </>
                        )}
                        <input type="file" id="imageUpload" ref={singleUploadRef} accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target, 1)} />
                     </div>
                 </div>
            )}
            
            <div className="mt-auto pt-4">
                <button 
                    id="generateBtn" 
                    className="generate-btn w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={generateImage}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <span className="btn-text">🚀 Gerar Imagem</span>
                    )}
                </button>
            </div>
        </div>
    );
};

export default LeftPanel;