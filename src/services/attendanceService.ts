import api from '../lib/axios';

export interface AttendanceRecord {
    attendanceId: number;
    sessionId: string;
    courseName: string;
    courseId: string;
    checkInTime: string;
    validationMethod: string;
    sessionDate: string;
}

const getStudentAttendance = async (studentId: string): Promise<AttendanceRecord[]> => {
    const response = await api.get(`/attendance/student/${studentId}`);
    return response.data;
};

const getStudentCourseAttendance = async (studentId: string, courseId: string): Promise<AttendanceRecord[]> => {
    const response = await api.get(`/attendance/student/${studentId}/course/${courseId}`);
    return response.data;
};

export default {
    getStudentAttendance,
    getStudentCourseAttendance,
};
