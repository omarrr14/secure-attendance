import { useState, useEffect } from 'react';
import QrScanner from 'react-qr-scanner';
import api from '../lib/axios';
import { Camera, CheckCircle, XCircle, RefreshCw, BarChart3, Calendar, ScanLine } from 'lucide-react';

import { jwtDecode } from 'jwt-decode';
import AttendanceHistory from '../components/AttendanceHistory';
import StudentStatisticsComponent from '../components/StudentStatistics';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

type TabType = 'scan' | 'history' | 'statistics';

export default function StudentDashboard() {
    const [activeTab, setActiveTab] = useState<TabType>('scan');
    const [scanning, setScanning] = useState(false);
    const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [studentId, setStudentId] = useState<string>('');


    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                const userId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || decoded.nameid || decoded.sub;
                setStudentId(userId);
            } catch (error) {
                console.error('Failed to decode token:', error);
            }
        }
    }, []);

    const handleScan = async (data: any) => {
        if (data && data.text) {
            setScanning(false);
            submitAttendance(data.text);
        }
    };

    const handleError = (err: any) => {
        console.error(err);
        const errorMessage = err?.message || "Could not access camera";
        setMessage({ text: errorMessage, type: 'error' });
        setScanning(false);
    };

    const submitAttendance = async (tokenString: string) => {
        try {
            // Token format: base64Payload.base64Signature
            const parts = tokenString.split('.');
            if (parts.length !== 2) {
                setMessage({ text: "Invalid QR Code format", type: 'error' });
                return;
            }

            await api.post('/attendance/submit', {
                qrTokenPayload: parts[0],
                qrTokenSignature: parts[1]
            });

            setMessage({ text: "Attendance Recorded Successfully!", type: 'success' });
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data || "Failed to record attendance";
            setMessage({ text: typeof msg === 'string' ? msg : JSON.stringify(msg), type: 'error' });
        }
    };

    const tabs = [
        { id: 'scan' as TabType, name: 'Scan QR', icon: ScanLine },
        { id: 'history' as TabType, name: 'My Attendance', icon: Calendar },
        { id: 'statistics' as TabType, name: 'Statistics', icon: BarChart3 }
    ];

    return (
        <Layout title="Student Portal">
            {/* Tab Navigation */}
            <div className="flex justify-center mb-8">
                <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 inline-flex">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex items-center px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                                ${activeTab === tab.id
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                }
                            `}
                        >
                            <tab.icon className={`h-4 w-4 mr-2 ${activeTab === tab.id ? 'text-white' : ''}`} />
                            {tab.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Content - centered */}
            <div className="max-w-2xl mx-auto">
                {activeTab === 'scan' && (
                    <Card hover className="overflow-hidden border-t-4 border-t-indigo-500">
                        <div className="text-center mb-8">
                            <div className="mx-auto h-20 w-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-lg">
                                <ScanLine className="h-10 w-10 text-indigo-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Mark Attendance</h2>
                            <p className="mt-2 text-gray-500">Scan the QR code displayed by your professor</p>
                        </div>

                        {message && (
                            <div className={`mb-6 p-4 rounded-xl flex items-center justify-center animate-fadeIn ${message.type === 'success'
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                {message.type === 'success' ? <CheckCircle className="mr-2 h-5 w-5" /> : <XCircle className="mr-2 h-5 w-5" />}
                                <span className="font-medium">{message.text}</span>
                            </div>
                        )}

                        {!scanning && !message && (
                            <div className="space-y-4">
                                <Button
                                    onClick={() => { setMessage(null); setScanning(true); }}
                                    className="w-full py-4 text-lg shadow-xl shadow-indigo-200"
                                    icon={<Camera className="mr-2 h-6 w-6" />}
                                >
                                    Open Camera
                                </Button>
                            </div>
                        )}

                        {scanning && (
                            <div className="relative overflow-hidden rounded-2xl bg-black shadow-2xl">
                                <QrScanner
                                    delay={300}
                                    onError={handleError}
                                    onScan={handleScan}
                                    style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                                    constraints={{
                                        audio: false,
                                        video: { facingMode: facingMode }
                                    }}
                                />
                                
                                {/* Overlay styling for scanner */}
                                <div className="absolute inset-0 border-[40px] border-black/50 pointer-events-none">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50 animate-pulse"></div>
                                </div>
                                
                                <button
                                    onClick={() => setScanning(false)}
                                    className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/40 transition-colors"
                                    title="Close Camera"
                                >
                                    <XCircle className="h-8 w-8" />
                                </button>

                                <button
                                    onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
                                    className="absolute bottom-6 right-6 bg-indigo-600/80 backdrop-blur-md p-3 rounded-full text-white hover:bg-indigo-600 shadow-lg"
                                    title="Switch Camera"
                                >
                                    <RefreshCw className="h-6 w-6" />
                                </button>

                                <p className="absolute bottom-6 left-0 right-0 text-center text-white/80 text-sm pointer-events-none font-medium">
                                    {facingMode === 'environment' ? 'Rear Camera' : 'Front Camera'}
                                </p>
                            </div>
                        )}

                        {message && (
                            <div className="mt-8 text-center">
                                <Button
                                    variant="ghost"
                                    onClick={() => { setMessage(null); setScanning(false); }}
                                >
                                    Scan Another Code
                                </Button>
                            </div>
                        )}
                    </Card>
                )}

                {activeTab === 'history' && studentId && (
                     <Card>
                        <AttendanceHistory studentId={studentId} />
                     </Card>
                )}

                {activeTab === 'statistics' && studentId && (
                    <Card>
                        <StudentStatisticsComponent studentId={studentId} />
                    </Card>
                )}
            </div>
        </Layout>
    );
}
