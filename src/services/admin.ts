import api from '../lib/axios';
import type { User, RegisterUserRequest, Course, CreateCourseRequest, UpdateCourseRequest } from '../types';

export const adminService = {
    // User Management
    getUsers: async () => {
        const response = await api.get<User[]>('/users');
        return response.data;
    },

    getUserById: async (userId: string) => {
        const response = await api.get<User>(`/users/${userId}`);
        return response.data;
    },

    registerUser: async (data: RegisterUserRequest) => {
        const response = await api.post('/users/register', data);
        return response.data;
    },

    // Course Management
    getCourses: async () => {
        const response = await api.get<Course[]>('/courses');
        return response.data;
    },

    createCourse: async (data: CreateCourseRequest) => {
        const response = await api.post('/courses', data);
        return response.data;
    },

    updateCourse: async (courseId: string, data: UpdateCourseRequest) => {
        const response = await api.put(`/courses/${courseId}`, data);
        return response.data;
    },

    deleteCourse: async (courseId: string) => {
        const response = await api.delete(`/courses/${courseId}`);
        return response.data;
    }
};
