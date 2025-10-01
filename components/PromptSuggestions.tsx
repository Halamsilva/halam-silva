import React, { useState, useMemo } from 'react';

const allSuggestions = [
    "Um leão majestoso com uma coroa de estrelas, fotorrealista, iluminação cinematográfica",
    "Uma floresta encantada à noite, com cogumelos brilhantes e criaturas místicas, arte de fantasia",
    "Uma cidade retro-futurista com carros voadores e letreiros de néon, estilo cyberpunk",
    "Uma pintura em aquarela de um café tranquilo em um dia chuvoso em Paris",
    "Um panda vermelho fofo usando um pequeno chapéu de mago, ilustração digital",
    "Uma paisagem surreal onde as nuvens são feitas de algodão doce e os rios correm com chocolate",
    "Um logotipo vetorial detalhado de um lobo uivando para a lua, design minimalista",
    "Uma coruja mecânica inspirada no steampunk com olhos de âmbar brilhantes",
    "Uma renderização 3D de um cheeseburger de aparência deliciosa, fotografia de comida, alto detalhe",
    "Um astronauta flutuando pacificamente no espaço, olhando para a Terra, com a Via Láctea ao fundo, hiper-realista",
    "Uma ilustração estilo chibi de um abacate sorridente",
    "Uma visão isométrica de um estúdio de artista aconchegante e bagunçado",
    "Um vitral representando uma supernova cósmica",
    "Um pôr do sol estilo synthwave sobre um oceano digital",
];

const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};


interface PromptSuggestionsProps {
    onSelectPrompt: (prompt: string) => void;
}

export const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ onSelectPrompt }) => {
    const [shuffledPrompts, setShuffledPrompts] = useState(() => shuffleArray(allSuggestions));

    const displayedPrompts = useMemo(() => shuffledPrompts.slice(0, 3), [shuffledPrompts]);

    const handleShuffle = () => {
        setShuffledPrompts(shuffleArray(allSuggestions));
    };

    return (
        <div className="mt-2 text-sm">
            <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 font-semibold">💡 Sugestões:</span>
                <button
                    onClick={handleShuffle}
                    className="text-purple-400 hover:text-purple-300 text-xs font-semibold p-1 rounded-md hover:bg-gray-700/50 transition-colors flex items-center gap-1"
                    title="Novas sugestões"
                >
                    🎲 Novas
                </button>
            </div>
            <div className="flex flex-col gap-2">
                {displayedPrompts.map((prompt, index) => (
                    <button
                        key={index}
                        onClick={() => onSelectPrompt(prompt)}
                        className="text-left p-2 bg-[#2a2a2a] rounded-md hover:bg-gray-700 transition-colors text-gray-300 text-xs"
                    >
                        {prompt}
                    </button>
                ))}
            </div>
        </div>
    );
};