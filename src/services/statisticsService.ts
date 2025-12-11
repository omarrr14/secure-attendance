import api from '../lib/axios';

export interface AdminStatistics {
    totalUsers: number;
    totalStudents: number;
    totalProfessors: number;
    totalCourses: number;
    totalSessions: number;
    totalAttendanceRecords: number;
    registeredFingerprints: number;
    averageAttendancePerSession: number;
}

export interface ProfessorStatistics {
    totalCourses: number;
    totalSessions: number;
    totalStudentsAcrossCourses: number;
    averageAttendanceRate: number;
    mostActiveCourse: string;
}

export interface StudentStatistics {
    totalCoursesEnrolled: number;
    totalSessionsAttended: number;
    totalSessionsAvailable: number;
    overallAttendancePercentage: number;
    currentStreak: number;
    bestCourse: string;
}

const getAdminStatistics = async (): Promise<AdminStatistics> => {
    const response = await api.get('/statistics/admin');
    return response.data;
};

const getProfessorStatistics = async (professorId: string): Promise<ProfessorStatistics> => {
    const response = await api.get(`/statistics/professor/${professorId}`);
    return response.data;
};

const getStudentStatistics = async (studentId: string): Promise<StudentStatistics> => {
    const response = await api.get(`/statistics/student/${studentId}`);
    return response.data;
};

export default {
    getAdminStatistics,
    getProfessorStatistics,
    getStudentStatistics,
};
