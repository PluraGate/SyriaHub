import React from 'react';
import {
    Stethoscope,
    Coins,
    GraduationCap,
    Building2,
    Users,
    Scale,
    Cpu,
    Leaf,
    Globe,
    Shield,
    Activity,
    BookOpen
} from 'lucide-react';

interface SectorGridProps {
    sectors: string[];
    onSelect: (sector: string) => void;
    selectedSector: string | null;
}

const SectorGrid: React.FC<SectorGridProps> = ({ sectors, onSelect, selectedSector }) => {

    const getIcon = (sector: string) => {
        switch (sector) {
            case 'Medicine': return <Stethoscope className="w-6 h-6" />;
            case 'Economics': return <Coins className="w-6 h-6" />;
            case 'Education': return <GraduationCap className="w-6 h-6" />;
            case 'Engineering': return <Building2 className="w-6 h-6" />;
            case 'Sociology': return <Users className="w-6 h-6" />;
            case 'Law': return <Scale className="w-6 h-6" />;
            case 'Computer Science': return <Cpu className="w-6 h-6" />;
            case 'Environmental Science': return <Leaf className="w-6 h-6" />;
            case 'Political Science': return <Globe className="w-6 h-6" />;
            case 'Security Studies': return <Shield className="w-6 h-6" />;
            case 'Psychology': return <Activity className="w-6 h-6" />;
            case 'History': return <BookOpen className="w-6 h-6" />;
            default: return <BookOpen className="w-6 h-6" />;
        }
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
            {sectors.map((sector) => (
                <button
                    key={sector}
                    onClick={() => onSelect(sector)}
                    className={`
            flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200
            ${selectedSector === sector
                            ? 'bg-primary text-white border-primary shadow-lg scale-105'
                            : 'bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border text-text-light dark:text-dark-text-muted hover:border-primary/50 hover:text-primary dark:hover:text-primary-light hover:shadow-md'
                        }
          `}
                >
                    <div className={`mb-2 ${selectedSector === sector ? 'text-white' : 'text-primary dark:text-primary-light'}`}>
                        {getIcon(sector)}
                    </div>
                    <span className="text-sm font-medium text-center">{sector}</span>
                </button>
            ))}
        </div>
    );
};

export default SectorGrid;
