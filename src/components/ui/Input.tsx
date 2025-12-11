import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ 
    label, 
    error, 
    icon, 
    className = '', 
    id,
    ...props 
}) => {
    return (
        <div className="w-full">
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        {icon}
                    </div>
                )}
                <input
                    id={id}
                    className={`
                        block w-full rounded-lg border-gray-300 bg-gray-50/50 
                        focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white
                        transition-colors duration-200
                        ${icon ? 'pl-10' : 'pl-4'}
                        ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
                        ${className}
                        py-2.5 sm:text-sm shadow-sm
                    `}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-600 ml-1">{error}</p>
            )}
        </div>
    );
};
