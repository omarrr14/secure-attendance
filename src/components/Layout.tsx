import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
    title?: string;
    showLogout?: boolean;
    maxWidth?: string;
}

export const Layout: React.FC<LayoutProps> = ({ 
    children, 
    title, 
    showLogout = true,
    maxWidth = "max-w-7xl"
}) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-slate-100">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-indigo-100/50 shadow-sm">
                <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8`}>
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                             <div className="h-8 w-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                <span className="text-white font-bold text-lg">S</span>
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                                {title || 'Secure Attendance'}
                            </span>
                        </div>
                        {showLogout && (
                            <button 
                                onClick={handleLogout}
                                className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn`}>
                {children}
            </main>
        </div>
    );
};
