import React from 'react';
import { Badge, UserBadge } from '@/types';
import { CheckCircle, Star, ShieldCheck, Award } from 'lucide-react';

interface BadgeDisplayProps {
    badges: UserBadge[];
    size?: 'sm' | 'md' | 'lg';
}

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ badges, size = 'md' }) => {
    if (!badges || badges.length === 0) return null;

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'verified':
                return <ShieldCheck className={getSizeClass(size)} />;
            case 'star':
                return <Star className={getSizeClass(size)} />;
            case 'check_circle':
                return <CheckCircle className={getSizeClass(size)} />;
            default:
                return <Award className={getSizeClass(size)} />;
        }
    };

    const getSizeClass = (s: 'sm' | 'md' | 'lg') => {
        switch (s) {
            case 'sm': return 'w-4 h-4';
            case 'md': return 'w-6 h-6';
            case 'lg': return 'w-8 h-8';
            default: return 'w-6 h-6';
        }
    };

    return (
        <div className="flex flex-wrap gap-2">
            {badges.map((userBadge) => {
                const badge = userBadge.badge;
                if (!badge) return null;

                return (
                    <div
                        key={userBadge.id}
                        className="relative group cursor-help text-primary"
                        title={badge.description}
                    >
                        {getIcon(badge.icon_url)}
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            {badge.name}: {badge.description}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default BadgeDisplay;
