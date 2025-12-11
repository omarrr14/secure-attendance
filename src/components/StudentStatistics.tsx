import { useState, useEffect } from 'react';
import type { StudentStatistics } from '../services/statisticsService';
import statisticsService from '../services/statisticsService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, Award, Target, Flame } from 'lucide-react';

interface StudentStatisticsProps {
    studentId: string;
}



export default function StudentStatisticsComponent({ studentId }: StudentStatisticsProps) {
    const [stats, setStats] = useState<StudentStatistics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStatistics();
    }, [studentId]);

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            const data = await statisticsService.getStudentStatistics(studentId);
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch statistics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500"> No statistics available</p>
            </div>
        );
    }

    const attendanceData = [
        { name: 'Attended', value: stats.totalSessionsAttended },
        { name: 'Missed', value: stats.totalSessionsAvailable - stats.totalSessionsAttended }
    ];

    const statCards = [
        {
            title: 'Overall Attendance',
            value: `${stats.overallAttendancePercentage}%`,
            icon: TrendingUp,
            color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
            iconBg: 'bg-indigo-100',
            iconColor: 'text-indigo-600'
        },
        {
            title: 'Courses Enrolled',
            value: stats.totalCoursesEnrolled,
            icon: Target,
            color: 'bg-gradient-to-br from-purple-500 to-purple-600',
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600'
        },
        {
            title: 'Sessions Attended',
            value: `${stats.totalSessionsAttended}/${stats.totalSessionsAvailable}`,
            icon: Award,
            color: 'bg-gradient-to-br from-pink-500 to-pink-600',
            iconBg: 'bg-pink-100',
            iconColor: 'text-pink-600'
        },
        {
            title: 'Current Streak',
            value: `${stats.currentStreak} days`,
            icon: Flame,
            color: 'bg-gradient-to-br from-orange-500 to-orange-600',
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-200">
                        <div className={`${card.color} p-6 text-white`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-white/80">{card.title}</p>
                                    <p className="text-3xl font-bold mt-2">{card.value}</p>
                                </div>
                                <div className={`${card.iconBg} p-3 rounded-full`}>
                                    <card.icon className={`h-8 w-8 ${card.iconColor}`} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance Pie Chart */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={attendanceData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}

                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {attendanceData.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#ef4444'} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Best Course Card */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
                    <div className="space-y-4">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                            <div className="flex items-center mb-2">
                                <Award className="h-6 w-6 text-green-600 mr-2" />
                                <span className="text-sm font-medium text-gray-700">Best Course</span>
                            </div>
                            <p className="text-xl font-bold text-gray-900">{stats.bestCourse}</p>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                            <div className="flex items-center mb-2">
                                <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
                                <span className="text-sm font-medium text-gray-700">Attendance Rate</span>
                            </div>
                            <div className="flex items-center">
                                <div className="flex-1">
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                                            style={{ width: `${stats.overallAttendancePercentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <span className="ml-4 text-2xl font-bold text-gray-900">
                                    {stats.overallAttendancePercentage}%
                                </span>
                            </div>
                        </div>

                        {stats.currentStreak > 0 && (
                            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Flame className="h-6 w-6 text-orange-600 mr-2" />
                                        <span className="text-sm font-medium text-gray-700">Attendance Streak</span>
                                    </div>
                                    <span className="text-2xl font-bold text-orange-600">{stats.currentStreak} 🔥</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-2">Keep it up! You're on a roll!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Insights */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-3">📊 Your Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <p className="opacity-90">You've attended</p>
                        <p className="text-2xl font-bold">{stats.totalSessionsAttended}</p>
                        <p className="opacity-90">out of {stats.totalSessionsAvailable} sessions</p>
                    </div>
                    <div>
                        <p className="opacity-90">Enrolled in</p>
                        <p className="text-2xl font-bold">{stats.totalCoursesEnrolled}</p>
                        <p className="opacity-90">courses this semester</p>
                    </div>
                    <div>
                        <p className="opacity-90">Performance Status</p>
                        <p className="text-2xl font-bold">
                            {stats.overallAttendancePercentage >= 75 ? '✨ Excellent' :
                                stats.overallAttendancePercentage >= 60 ? '👍 Good' :
                                    '⚠️ Needs Improvement'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
