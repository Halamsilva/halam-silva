
import React from 'react';

interface FunctionCardProps {
    icon: string;
    name: string;
    active: boolean;
    onClick: () => void;
}

export const FunctionCard: React.FC<FunctionCardProps> = ({ icon, name, active, onClick }) => {
    return (
        <button
            className={`function-card flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                active ? 'bg-purple-600/20 border-purple-500' : 'bg-[#2a2a2a] border-transparent hover:bg-gray-700'
            }`}
            onClick={onClick}
        >
            <div className="text-2xl">{icon}</div>
            <div className="mt-1 text-sm font-semibold">{name}</div>
        </button>
    );
};
