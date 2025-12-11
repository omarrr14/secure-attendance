import { useState, useEffect } from 'react';
import type { AttendanceRecord } from '../services/attendanceService';
import attendanceService from '../services/attendanceService';
import type { CourseEnrollment } from '../services/enrollmentService';
import enrollmentService from '../services/enrollmentService';
import { Calendar, Filter, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface AttendanceHistoryProps {
    studentId: string;
}

export default function AttendanceHistory({ studentId }: AttendanceHistoryProps) {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [studentId]);

    useEffect(() => {
        if (selectedCourse !== 'all') {
            fetchCourseAttendance(selectedCourse);
        } else {
            fetchData();
        }
    }, [selectedCourse]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [attendanceData, enrollmentData] = await Promise.all([
                attendanceService.getStudentAttendance(studentId),
                enrollmentService.getStudentEnrollments(studentId)
            ]);
            setRecords(attendanceData);
            setEnrollments(enrollmentData);
        } catch (error) {
            console.error('Failed to fetch attendance history:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourseAttendance = async (courseId: string) => {
        try {
            setLoading(true);
            const data = await attendanceService.getStudentCourseAttendance(studentId, courseId);
            setRecords(data);
        } catch (error) {
            console.error('Failed to fetch course attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Calendar className="h-6 w-6 text-indigo-600 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-900">Attendance History</h2>
                </div>

                <div className="flex items-center space-x-2">
                    <Filter className="h-5 w-5 text-gray-500" />
                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="all">All Courses</option>
                        {enrollments.map((enrollment) => (
                            <option key={enrollment.courseID} value={enrollment.courseID}>
                                {enrollment.course?.courseName || enrollment.courseID}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : records.length === 0 ? (
                <div className="text-center py-12">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {selectedCourse === 'all'
                            ? "You haven't attended any sessions yet."
                            : "No attendance records for this course yet."}
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Course
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Session Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Check-in Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Method
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {records.map((record) => (
                                <tr key={record.attendanceId} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {record.courseName}
                                        </div>
                                        <div className="text-sm text-gray-500">{record.courseId}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {record.sessionDate ? format(new Date(record.sessionDate), 'MMM dd, yyyy') : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {format(new Date(record.checkInTime), 'hh:mm a')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {record.validationMethod}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-green-600">
                                            <CheckCircle className="h-5 w-5 mr-1" />
                                            <span className="text-sm font-medium">Present</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-4 text-sm text-gray-500 text-right">
                        Total Records: {records.length}
                    </div>
                </div>
            )}
        </div>
    );
}
