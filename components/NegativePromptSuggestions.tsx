import React, { useState, useMemo } from 'react';

const allSuggestions = [
    "texto, assinatura, marca d'água",
    "mãos deformadas, dedos extras",
    "feio, desfigurado, mórbido",
    "baixa qualidade, borrado, granulado",
    "desenho, cartoon, 3d",
    "moldura, borda",
    "anatomia ruim, membros extras",
    "cores saturadas demais",
    "cabeça cortada, fora de quadro",
];

const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

interface NegativePromptSuggestionsProps {
    onSelectNegativePrompt: (prompt: string) => void;
}

export const NegativePromptSuggestions: React.FC<NegativePromptSuggestionsProps> = ({ onSelectNegativePrompt }) => {
    const [shuffledPrompts, setShuffledPrompts] = useState(() => shuffleArray(allSuggestions));

    const displayedPrompts = useMemo(() => shuffledPrompts.slice(0, 4), [shuffledPrompts]);

    const handleShuffle = () => {
        setShuffledPrompts(shuffleArray(allSuggestions));
    };

    return (
        <div className="mt-3 text-sm">
            <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-xs font-semibold">Exemplos:</span>
                <button
                    onClick={handleShuffle}
                    className="text-purple-400 hover:text-purple-300 text-xs font-semibold p-1 rounded-md hover:bg-gray-700/50 transition-colors flex items-center gap-1"
                    title="Novas sugestões"
                >
                    🎲 Novas
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {displayedPrompts.map((prompt, index) => (
                    <button
                        key={index}
                        onClick={() => onSelectNegativePrompt(prompt)}
                        className="text-left px-2 py-1 bg-[#2a2a2a] rounded-md hover:bg-gray-700 transition-colors text-gray-300 text-xs"
                    >
                        + {prompt}
                    </button>
                ))}
            </div>
        </div>
    );
};