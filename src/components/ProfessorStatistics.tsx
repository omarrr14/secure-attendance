import { useState, useEffect } from 'react';
import type { ProfessorStatistics } from '../services/statisticsService';
import statisticsService from '../services/statisticsService';
import { BookOpen, Users, TrendingUp, Award, Calendar } from 'lucide-react';

interface ProfessorStatisticsProps {
    professorId: string;
}

export default function ProfessorStatisticsComponent({ professorId }: ProfessorStatisticsProps) {
    const [stats, setStats] = useState<ProfessorStatistics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStatistics();
    }, [professorId]);

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            const data = await statisticsService.getProfessorStatistics(professorId);
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
                <p className="text-gray-500">No statistics available</p>
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Courses',
            value: stats.totalCourses,
            icon: BookOpen,
            color: 'from-blue-500 to-cyan-600',
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600'
        },
        {
            title: 'Total Sessions',
            value: stats.totalSessions,
            icon: Calendar,
            color: 'from-purple-500 to-pink-600',
            bgColor: 'bg-purple-50',
            iconColor: 'text-purple-600'
        },
        {
            title: 'Total Students',
            value: stats.totalStudentsAcrossCourses,
            icon: Users,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'bg-green-50',
            iconColor: 'text-green-600'
        },
        {
            title: 'Avg. Attendance Rate',
            value: `${stats.averageAttendanceRate}%`,
            icon: TrendingUp,
            color: 'from-orange-500 to-red-600',
            bgColor: 'bg-orange-50',
            iconColor: 'text-orange-600'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Professor Dashboard Statistics</h2>
                <p className="text-indigo-100">Overview of your teaching performance</p>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${card.bgColor} p-3 rounded-lg`}>
                                    <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                                </div>
                                <div className={`text-3xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                                    {card.value}
                                </div>
                            </div>
                            <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts and Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Most Active Course */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center mb-4">
                        <Award className="h-6 w-6 text-yellow-500 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900">Most Active Course</h3>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6 border-2 border-yellow-200">
                        <p className="text-sm text-gray-600 mb-2">Highest Attendance</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.mostActiveCourse}</p>
                        <div className="mt-4 flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                            <span className="ml-3 text-sm font-medium text-gray-700">85%</span>
                        </div>
                    </div>
                </div>

                {/* Attendance Rate Breakdown */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center mb-4">
                        <TrendingUp className="h-6 w-6 text-indigo-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900">Attendance Performance</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-gray-600">Average Attendance Rate</span>
                                <span className="text-sm font-bold text-gray-900">{stats.averageAttendanceRate}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div
                                    className={`h-4 rounded-full ${stats.averageAttendanceRate >= 75 ? 'bg-green-500' :
                                        stats.averageAttendanceRate >= 60 ? 'bg-yellow-500' :
                                            'bg-red-500'
                                        }`}
                                    style={{ width: `${stats.averageAttendanceRate}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                {stats.averageAttendanceRate >= 75 ? '✅ Excellent attendance across courses' :
                                    stats.averageAttendanceRate >= 60 ? '⚠️ Good, room for improvement' :
                                        '🔴 Needs attention'}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-indigo-600">{stats.totalSessions}</p>
                                <p className="text-xs text-gray-600">Sessions Created</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-purple-600">{stats.totalStudentsAcrossCourses}</p>
                                <p className="text-xs text-gray-600">Unique Students</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                        <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Teaching</p>
                        <p className="text-xl font-bold text-gray-900">{stats.totalCourses} Courses</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                        <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Reaching</p>
                        <p className="text-xl font-bold text-gray-900">{stats.totalStudentsAcrossCourses} Students</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                        <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Conducted</p>
                        <p className="text-xl font-bold text-gray-900">{stats.totalSessions} Sessions</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
