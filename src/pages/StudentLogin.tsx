import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fidoService } from '../services/fidoService';
import { Fingerprint, Smartphone, ArrowRight, User as UserIcon, ShieldCheck } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function StudentLogin() {
    const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    // Registration State
    const [userId, setUserId] = useState('');
    const [deviceName, setDeviceName] = useState('My Device');

    // Login State
    const [loginUserId, setLoginUserId] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            await fidoService.register(userId, deviceName);
            setSuccessMessage('Device registered successfully! You can now login.');
            setLoginUserId(userId); // Auto-fill login
            setActiveTab('login');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await fidoService.login(loginUserId);
            localStorage.setItem('token', response.token);
            navigate('/student/dashboard');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || err.message || 'Login failed. Ensure you use the registered device.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative p-4"
             style={{ 
                backgroundImage: 'url("https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80")',
             }}>
            <div className="absolute inset-0 bg-indigo-900/60 backdrop-blur-sm"></div>

            <Card glass className="max-w-md w-full relative z-10 shadow-2xl overflow-hidden p-0">
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-center">
                    <div className="mx-auto h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-md">
                        <Fingerprint className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Student Biometrics</h2>
                    <p className="text-blue-100 mt-1">Secure FIDO2 Authentication</p>
                </div>

                <div className="p-6">
                    {/* Tabs */}
                    <div className="flex bg-gray-100 p-1 rounded-lg mb-8">
                        <button
                            onClick={() => setActiveTab('register')}
                            className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${
                                activeTab === 'register' 
                                ? 'bg-white text-indigo-600 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Smartphone className="w-4 h-4 mr-2" /> Register Device
                        </button>
                        <button
                            onClick={() => setActiveTab('login')}
                            className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${
                                activeTab === 'login' 
                                ? 'bg-white text-indigo-600 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <ArrowRight className="w-4 h-4 mr-2" /> Login
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded text-sm flex items-center animate-fadeIn">
                             <span className="mr-2">❌</span> {error}
                        </div>
                    )}
                    
                    {successMessage && (
                        <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded text-sm flex items-center animate-fadeIn">
                            <span className="mr-2">✅</span> {successMessage}
                        </div>
                    )}

                    {activeTab === 'register' ? (
                        <form onSubmit={handleRegister} className="space-y-5 animate-slideIn">
                            <div className="bg-blue-50 p-4 rounded-lg flex items-start border border-blue-100">
                                <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                                <p className="text-sm text-blue-700">
                                    Register this device to access your dashboard securely without a password.
                                </p>
                            </div>

                            <Input 
                                label="Student ID"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                placeholder="e.g. STU123"
                                icon={<UserIcon className="h-5 w-5" />}
                                required
                            />

                            <Input 
                                label="Device Name"
                                value={deviceName}
                                onChange={(e) => setDeviceName(e.target.value)}
                                required
                                icon={<Smartphone className="h-5 w-5" />}
                            />

                            <Button 
                                type="submit" 
                                isLoading={loading}
                                className="w-full"
                                variant="primary"
                            >
                                Register Device
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-5 animate-slideIn">
                             <div className="bg-green-50 p-4 rounded-lg flex items-start border border-green-100">
                                <Fingerprint className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                                <p className="text-sm text-green-700">
                                    Use your registered biometric authenticator (Fingerprint, Face ID, etc.) to login.
                                </p>
                            </div>

                            <Input 
                                label="Student ID"
                                value={loginUserId}
                                onChange={(e) => setLoginUserId(e.target.value)}
                                placeholder="e.g. STU123"
                                icon={<UserIcon className="h-5 w-5" />}
                                required
                            />

                            <Button 
                                type="submit" 
                                isLoading={loading}
                                className="w-full"
                                variant="primary"
                            >
                                Login with Biometrics
                            </Button>
                        </form>
                    )}
                </div>

                <div className="bg-gray-50 px-6 py-4 text-center border-t border-gray-100">
                    <button onClick={() => navigate('/login')} className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
                        &larr; Back to Role Selection
                    </button>
                </div>
            </Card>
        </div>
    );
}
