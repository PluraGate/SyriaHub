import React from 'react';
import { Award } from 'lucide-react';

interface ReputationScoreProps {
    score: number;
    size?: 'sm' | 'md' | 'lg';
}

const ReputationScore: React.FC<ReputationScoreProps> = ({ score, size = 'md' }) => {
    const getSizeClass = (s: 'sm' | 'md' | 'lg') => {
        switch (s) {
            case 'sm': return 'text-sm';
            case 'md': return 'text-base';
            case 'lg': return 'text-lg';
            default: return 'text-base';
        }
    };

    const getIconSize = (s: 'sm' | 'md' | 'lg') => {
        switch (s) {
            case 'sm': return 'w-4 h-4';
            case 'md': return 'w-5 h-5';
            case 'lg': return 'w-6 h-6';
            default: return 'w-5 h-5';
        }
    };

    return (
        <div className={`flex items-center gap-1 font-semibold text-amber-600 ${getSizeClass(size)}`} title="Reputation Score">
            <Award className={getIconSize(size)} />
            <span>{score}</span>
        </div>
    );
};

export default ReputationScore;
