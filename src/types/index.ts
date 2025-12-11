export interface User {
    userID: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isActive: boolean;
}

export interface RegisterUserRequest {
    userID: string; // Manual ID input as per request
    firstName: string;
    lastName: string;
    email: string;
    role: 'Student' | 'Doctor' | 'Admin';
    password?: string; // Optional for Student
}

export interface Course {
    courseID: string;
    courseName: string;
    description?: string;
    instructorID: string;
    instructorName?: string; // For display purposes if populated
}

export interface CreateCourseRequest {
    courseID: string;
    courseName: string;
    description?: string;
    instructorID: string;
}

export interface UpdateCourseRequest {
    courseName: string;
    description?: string;
    instructorID: string;
}

export interface MockFidoRegisterRequest {
    userId: string;
    deviceName: string;
}

export interface MockFidoRegisterResponse {
    userId: string;
    credentialId: string;
    deviceName: string;
    message: string;
}

export interface MockFidoLoginRequest {
    userId: string;
    credentialId: string;
}
