import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    glass?: boolean;
    noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
    children, 
    className = '', 
    hover = false,
    glass = false,
    noPadding = false
}) => {
    return (
        <div 
            className={`
                rounded-xl transition-all duration-300
                ${glass 
                    ? 'bg-white/80 backdrop-blur-md border border-white/20 shadow-xl' 
                    : 'bg-white shadow-md border border-gray-100'
                }
                ${hover ? 'hover:shadow-2xl hover:-translate-y-1' : ''}
                ${noPadding ? '' : 'p-6'}
                ${className}
            `}
        >
            {children}
        </div>
    );
};
