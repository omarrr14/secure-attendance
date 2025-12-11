import api from '../lib/axios';

export interface CourseEnrollment {
    enrollmentID: number;
    studentID: string;
    courseID: string;
    enrollmentDate: string;
    student?: {
        userID: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    course?: {
        courseID: string;
        courseName: string;
    };
}

const createEnrollment = async (studentId: string, courseId: string): Promise<any> => {
    const response = await api.post('/enrollments', {
        studentID: studentId,
        courseID: courseId,
    });
    return response.data;
};

const getStudentEnrollments = async (studentId: string): Promise<CourseEnrollment[]> => {
    const response = await api.get(`/enrollments/student/${studentId}`);
    return response.data;
};

const getCourseEnrollments = async (courseId: string): Promise<CourseEnrollment[]> => {
    const response = await api.get(`/enrollments/course/${courseId}`);
    return response.data;
};

const deleteEnrollment = async (enrollmentId: number): Promise<any> => {
    const response = await api.delete(`/enrollments/${enrollmentId}`);
    return response.data;
};

export default {
    createEnrollment,
    getStudentEnrollments,
    getCourseEnrollments,
    deleteEnrollment,
};
