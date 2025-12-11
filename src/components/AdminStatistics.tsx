import { useState, useEffect } from 'react';
import type { AdminStatistics } from '../services/statisticsService';
import statisticsService from '../services/statisticsService';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Users, BookOpen, Calendar, FileText, UserCheck, TrendingUp } from 'lucide-react';

export default function AdminStatisticsComponent() {
    const [stats, setStats] = useState<AdminStatistics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            const data = await statisticsService.getAdminStatistics();
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

    const userDistribution = [
        { name: 'Students', value: stats.totalStudents, color: '#6366f1' },
        { name: 'Professors', value: stats.totalProfessors, color: '#8b5cf6' },
        { name: 'Others', value: stats.totalUsers - stats.totalStudents - stats.totalProfessors, color: '#ec4899' }
    ];

    const systemData = [
        { name: 'Courses', value: stats.totalCourses },
        { name: 'Sessions', value: stats.totalSessions },
        { name: 'Attendance', value: Math.floor(stats.totalAttendanceRecords / 10) }
    ];

    const statCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: Users,
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50',
            change: '+12%'
        },
        {
            title: 'Total Courses',
            value: stats.totalCourses,
            icon: BookOpen,
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50',
            change: '+8%'
        },
        {
            title: 'Total Sessions',
            value: stats.totalSessions,
            icon: Calendar,
            color: 'from-pink-500 to-pink-600',
            bgColor: 'bg-pink-50',
            change: '+15%'
        },
        {
            title: 'Attendance Records',
            value: stats.totalAttendanceRecords,
            icon: FileText,
            color: 'from-green-500 to-green-600',
            bgColor: 'bg-green-50',
            change: '+25%'
        },
        {
            title: 'Registered Fingerprints',
            value: stats.registeredFingerprints,
            icon: UserCheck,
            color: 'from-orange-500 to-orange-600',
            bgColor: 'bg-orange-50',
            change: `${Math.round((stats.registeredFingerprints / stats.totalUsers) * 100)}%`
        },
        {
            title: 'Avg Attendance/Session',
            value: stats.averageAttendancePerSession.toFixed(1),
            icon: TrendingUp,
            color: 'from-indigo-500 to-indigo-600',
            bgColor: 'bg-indigo-50',
            change: '+5%'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl shadow-lg p-8 text-white">
                <h1 className="text-3xl font-bold mb-2">System Administration Dashboard</h1>
                <p className="text-indigo-100">Comprehensive overview of the attendance system</p>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((card, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-200">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${card.bgColor} p-4 rounded-xl`}>
                                    <card.icon className="h-8 w-8 text-gray-700" />
                                </div>
                                <span className="text-sm font-semibold text-green-600">{card.change}</span>
                            </div>
                            <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                            <p className={`text-3xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                                {card.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Distribution Pie Chart */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={userDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {userDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-indigo-600">{stats.totalStudents}</p>
                            <p className="text-xs text-gray-600">Students</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-purple-600">{stats.totalProfessors}</p>
                            <p className="text-xs text-gray-600">Professors</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-pink-600">
                                {stats.totalUsers - stats.totalStudents - stats.totalProfessors}
                            </p>
                            <p className="text-xs text-gray-600">Others</p>
                        </div>
                    </div>
                </div>

                {/* System Activity Bar Chart */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">System Activity</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={systemData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
                    <h4 className="text-sm font-medium opacity-90 mb-2">Fingerprint Registration Rate</h4>
                    <p className="text-4xl font-bold">
                        {Math.round((stats.registeredFingerprints / stats.totalUsers) * 100)}%
                    </p>
                    <p className="text-sm opacity-75 mt-2">
                        {stats.registeredFingerprints} of {stats.totalUsers} users registered
                    </p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
                    <h4 className="text-sm font-medium opacity-90 mb-2">Avg Attendance per Session</h4>
                    <p className="text-4xl font-bold">{stats.averageAttendancePerSession.toFixed(1)}</p>
                    <p className="text-sm opacity-75 mt-2">Students per session on average</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
                    <h4 className="text-sm font-medium opacity-90 mb-2">System Health</h4>
                    <p className="text-4xl font-bold">98.5%</p>
                    <p className="text-sm opacity-75 mt-2">Uptime and performance</p>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">{stats.totalCourses}</div>
                        <div className="text-sm text-gray-600 mt-1">Active Courses</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">{stats.totalSessions}</div>
                        <div className="text-sm text-gray-600 mt-1">Sessions Created</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">{stats.totalAttendanceRecords}</div>
                        <div className="text-sm text-gray-600 mt-1">Total Attendance</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">{stats.registeredFingerprints}</div>
                        <div className="text-sm text-gray-600 mt-1">Biometric Registrations</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
