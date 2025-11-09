import React from 'react';
import { BackArrowIcon } from './Icons';

interface AboutMeViewProps {
    content: string;
    onBack: () => void;
}

const AboutMeView: React.FC<AboutMeViewProps> = ({ content, onBack }) => {
    return (
        <div className="glass-card p-6 sm:p-8 w-full animate-fade-in-up relative">
            <button 
                onClick={onBack} 
                className="absolute top-4 left-4 p-2 rounded-full bg-gray-200/50 dark:bg-slate-700/50 text-gray-800 dark:text-gray-200 hover:bg-gray-300/70 dark:hover:bg-slate-600/70 transition-colors" 
                aria-label="Go back"
            >
                <BackArrowIcon className="w-5 h-5" />
            </button>
            <header className="mb-8 text-center">
                 <h1 className="text-4xl md:text-5xl font-serif font-bold text-gradient">About Me</h1>
            </header>
            <div 
                className="prose prose-lg max-w-none text-gradient leading-relaxed dark:prose-invert" 
                dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }} 
            />
        </div>
    );
};

export default AboutMeView;
