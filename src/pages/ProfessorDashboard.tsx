import { useEffect, useState } from 'react';
import api from '../lib/axios';
import { jwtDecode } from 'jwt-decode';
import { Play, StopCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

interface Course {
    courseID: string;
    courseName: string;
    description: string;
}

interface Session {
    sessionID: string;
    courseID: string;
    qrToken?: string;
    isActive: boolean;
}

interface AttendanceRecord {
    studentID: string;
    studentName: string;
    checkInTime: string;
    validationMethod: string;
}

export default function ProfessorDashboard() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [activeSession, setActiveSession] = useState<Session | null>(null);
    const [qrToken, setQrToken] = useState<string>('');
    const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        fetchCourses();
        fetchActiveSession();
    }, []);

    // Poll for QR Token updates if session is active
    useEffect(() => {
        let interval: any;
        if (activeSession && activeSession.isActive) {
            fetchQrToken(activeSession.sessionID);
            fetchAttendance(activeSession.sessionID);
            interval = setInterval(() => {
                fetchQrToken(activeSession.sessionID);
                fetchAttendance(activeSession.sessionID);
            }, 3000); // 3 seconds refresh
        }
        return () => clearInterval(interval);
    }, [activeSession]);

    const fetchCourses = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const decoded: any = jwtDecode(token);
            const userId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || decoded.nameid || decoded.sub;

            const response = await api.get(`/courses/instructor/${userId}`);
            setCourses(response.data);
        } catch (error) {
            console.error("Failed to fetch courses", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchActiveSession = async () => {
        try {
            const response = await api.get('/sessions/active');
            if (response.status === 200 && response.data) {
                setActiveSession({ ...response.data, isActive: true });
            }
        } catch (error) {
            console.log("No active session found");
        }
    };

    const startSession = async (courseId: string) => {
        try {
            const response = await api.post(`/sessions/start/${courseId}`);
            setActiveSession({ ...response.data, isActive: true });
        } catch (error) {
            console.error("Failed to start session", error);
            alert("Failed to start session");
        }
    };

    const endSession = async () => {
        if (!activeSession) return;
        try {
            await api.post(`/sessions/${activeSession.sessionID}/end`);
            setActiveSession(null);
            setQrToken('');
            setAttendanceList([]);
        } catch (error) {
            console.error("Failed to end session", error);
        }
    };

    const fetchQrToken = async (sessionId: string) => {
        try {
            const response = await api.get(`/sessions/${sessionId}/qr`);
            setQrToken(response.data.qrToken);
        } catch (error) {
            console.error("Failed to fetch QR", error);
        }
    };

    const fetchAttendance = async (sessionId: string) => {
        try {
            const response = await api.get(`/sessions/${sessionId}/attendance`);
            setAttendanceList(response.data);
        } catch (error) {
            console.error("Failed to fetch attendance", error);
        }
    };

    return (
        <Layout title="Professor Dashboard">

            {loading ? (
                 <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                 </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Courses */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {courses.map((course) => (
                                <Card key={course.courseID} hover className="border-t-4 border-t-indigo-500 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{course.courseName}</h3>
                                        <p className="text-sm text-gray-400 font-mono mb-2">{course.courseID}</p>
                                        <p className="text-gray-600 mb-4">{course.description}</p>
                                    </div>
                                    <div className="pt-4 border-t border-gray-100">
                                        <Button
                                            onClick={() => startSession(course.courseID)}
                                            disabled={!!activeSession}
                                            variant="primary"
                                            className="w-full"
                                            icon={<Play className="h-4 w-4" />}
                                        >
                                            Start Session
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                        
                         {courses.length === 0 && (
                            <Card className="text-center py-12 text-gray-500">
                                No courses assigned.
                            </Card>
                        )}
                        
                        {/* Attendance Table */}
                        {activeSession && (
                            <Card className="animate-fadeIn">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">Live Attendance</h2>
                                    <Badge variant="success" className="text-sm px-3 py-1">
                                        {attendanceList.length} Checked In
                                    </Badge>
                                </div>

                                <div className="overflow-x-auto rounded-lg border border-gray-200">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {attendanceList.map((record, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.studentName}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.studentID}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(record.checkInTime).toLocaleTimeString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <Badge variant="info">{record.validationMethod}</Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                            {attendanceList.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                                        Waiting for students to scan...
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Right Column: Active Session Panel */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            {activeSession ? (
                                <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-2xl overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <QRCodeSVG value="background-deco" size={150} />
                                    </div>
                                    
                                    <div className="relative z-10 flex flex-col items-center text-center">
                                        <div className="animate-pulse mb-6">
                                            <div className="h-3 w-3 bg-red-500 rounded-full inline-block mr-2"></div>
                                            <span className="font-mono text-sm tracking-wider uppercase text-red-400">Live Session Active</span>
                                        </div>

                                        <div className="bg-white p-4 rounded-xl shadow-lg mb-6 transform transition-transform hover:scale-105 duration-300">
                                            {qrToken ? (
                                                <QRCodeSVG value={qrToken} size={200} />
                                            ) : (
                                                <div className="h-[200px] w-[200px] flex items-center justify-center text-gray-400">
                                                    Loading QR...
                                                </div>
                                            )}
                                        </div>

                                        <h2 className="text-2xl font-bold mb-2">Scan to Attend</h2>
                                        <p className="text-gray-400 text-sm mb-8">
                                            QR code refreshes every 3 seconds for security.
                                        </p>

                                        <Button 
                                            variant="danger" 
                                            onClick={endSession} 
                                            className="w-full"
                                            icon={<StopCircle className="h-5 w-5" />}
                                        >
                                            End Session
                                        </Button>
                                    </div>
                                </Card>
                            ) : (
                                <Card className="border-dashed border-2 border-gray-300 bg-gray-50 text-center py-12">
                                    <p className="text-gray-500">Select a course to start a session</p>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
