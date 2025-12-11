import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { jwtDecode } from 'jwt-decode';
import { Lock, Mail } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

interface TokenPayload {
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string;
    role?: string;
    sub?: string;
}

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', { email, password });
            const { token } = response.data;

            localStorage.setItem('token', token);

            const decoded = jwtDecode<TokenPayload>(token);
            // Handle both standard role claim and Microsoft specific claim
            const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role;

            if (role === 'Student') {
                navigate('/student/dashboard');
            } else if (role === 'Doctor') {
                navigate('/professor/dashboard');
            } else if (role === 'Admin') {
                navigate('/admin/dashboard');
            } else {
                setError('Unknown role');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative p-4"
             style={{ 
                backgroundImage: 'url("https://images.unsplash.com/photo-1497294815431-9365093b7331?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80")',
             }}>
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

            <Card glass className="w-full max-w-md relative z-10 p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
                        <span className="text-white font-bold text-3xl">S</span>
                    </div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-900 mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-gray-600">Sign in to Secure Attendance</p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 text-sm flex items-center shadow-sm animate-fadeIn">
                        <span className="mr-2">⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <Input
                        label="Email Address"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@university.edu"
                        icon={<Mail className="h-5 w-5" />}
                    />

                    <Input
                        label="Password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        icon={<Lock className="h-5 w-5" />}
                    />

                    <Button
                        type="submit"
                        isLoading={loading}
                        className="w-full"
                        variant="primary"
                        size="lg"
                    >
                        Sign In
                    </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-600">
                        Are you a student?{' '}
                        <button onClick={() => navigate('/student/login')} className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline transition-all">
                            Use FIDO Login
                        </button>
                    </p>
                </div>
            </Card>
        </div>
    );
}
