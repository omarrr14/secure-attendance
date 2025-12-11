import React, { useState, useEffect } from 'react';
import { adminService } from '../services/admin';
import type { User, Course, RegisterUserRequest, CreateCourseRequest } from '../types';
import { Users, BookOpen, Plus, Trash, Edit, X, Search, GraduationCap, Stethoscope, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'users' | 'courses'>('users');

    // New State for Filters and Tabs
    const [userRoleTab, setUserRoleTab] = useState<'Student' | 'Doctor' | 'Admin'>('Student');
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [courseSearchQuery, setCourseSearchQuery] = useState('');

    const [users, setUsers] = useState<User[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Modal States
    const [showUserModal, setShowUserModal] = useState(false);
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [instructors, setInstructors] = useState<User[]>([]); // To populate instructor dropdown

    // Form States
    const [userForm, setUserForm] = useState<RegisterUserRequest>({
        userID: '',
        firstName: '',
        lastName: '',
        email: '',
        role: 'Student',
        password: ''
    });

    const [courseForm, setCourseForm] = useState<CreateCourseRequest>({
        courseID: '',
        courseName: '',
        description: '',
        instructorID: ''
    });

    useEffect(() => {
        loadData();
    }, [activeTab]);

    // Fetch instructors when course modal opens
    useEffect(() => {
        if (showCourseModal) {
            fetchInstructors();
        }
    }, [showCourseModal]);

    const fetchInstructors = async () => {
        try {
            const allUsers = await adminService.getUsers();
            setInstructors(allUsers.filter(u => u.role === 'Doctor' || u.role === 'Admin'));
        } catch (err) {
            console.error("Failed to fetch instructors", err);
        }
    };

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            if (activeTab === 'users') {
                const data = await adminService.getUsers();
                setUsers(data);
            } else {
                const data = await adminService.getCourses();
                setCourses(data);
            }
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await adminService.registerUser(userForm);
            setShowUserModal(false);
            loadData();
            // Reset form
            setUserForm({ userID: '', firstName: '', lastName: '', email: '', role: 'Student', password: '' });
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to register user.');
        }
    };

    const handleCourseSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCourse) {
                await adminService.updateCourse(editingCourse.courseID, {
                    courseName: courseForm.courseName,
                    description: courseForm.description,
                    instructorID: courseForm.instructorID
                });
            } else {
                await adminService.createCourse(courseForm);
            }
            setShowCourseModal(false);
            setEditingCourse(null);
            loadData();
            setCourseForm({ courseID: '', courseName: '', description: '', instructorID: '' });
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to save course.');
        }
    };

    const handleDeleteCourse = async (id: string) => {
        if (!confirm('Are you sure you want to delete this course?')) return;
        try {
            await adminService.deleteCourse(id);
            loadData();
        } catch (err: any) {
            setError('Failed to delete course.');
        }
    };

    const openEditCourse = (course: Course) => {
        setEditingCourse(course);
        setCourseForm({
            courseID: course.courseID,
            courseName: course.courseName,
            description: course.description || '',
            instructorID: course.instructorID || ''
        });
        setShowCourseModal(true);
    };

    // Filtering Logic
    const filteredUsers = users.filter(user => {
        const matchesRole = user.role === userRoleTab;
        const searchLower = userSearchQuery.toLowerCase();
        const matchesSearch = user.firstName.toLowerCase().includes(searchLower) ||
            user.lastName.toLowerCase().includes(searchLower) ||
            user.userID.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower);
        return matchesRole && matchesSearch;
    });

    const filteredCourses = courses.filter(course => {
        const searchLower = courseSearchQuery.toLowerCase();
        return course.courseName.toLowerCase().includes(searchLower) ||
            (course.description && course.description.toLowerCase().includes(searchLower)) ||
            course.courseID.toLowerCase().includes(searchLower);
    });


    return (
        <Layout title="Admin Dashboard">
            {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded shadow-sm flex items-center">
                    <span className="mr-2">⚠️</span> {error}
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex flex-col space-y-6">
                
                {/* Header Controls */}
                <Card className="flex flex-col sm:flex-row justify-between items-center bg-white p-4">
                    {/* Tabs */}
                    <div className="flex bg-gray-100 p-1 rounded-lg mb-4 sm:mb-0">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex items-center px-4 py-2 rounded-md transition-all ${
                                activeTab === 'users' 
                                ? 'bg-white text-indigo-600 shadow-sm font-medium' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Users className="w-4 h-4 mr-2" /> Users
                        </button>
                        <button
                            onClick={() => setActiveTab('courses')}
                            className={`flex items-center px-4 py-2 rounded-md transition-all ${
                                activeTab === 'courses' 
                                ? 'bg-white text-indigo-600 shadow-sm font-medium' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <BookOpen className="w-4 h-4 mr-2" /> Courses
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                        <Input 
                            placeholder={`Search ${activeTab}...`}
                            value={activeTab === 'users' ? userSearchQuery : courseSearchQuery}
                            onChange={(e) => activeTab === 'users' ? setUserSearchQuery(e.target.value) : setCourseSearchQuery(e.target.value)}
                            icon={<Search className="h-4 w-4" />}
                            className="w-full sm:w-64"
                        />
                        <Button
                            onClick={() => {
                                if (activeTab === 'users') {
                                    setUserForm(prev => ({ ...prev, role: userRoleTab }));
                                    setShowUserModal(true);
                                } else {
                                    setShowCourseModal(true);
                                }
                            }}
                            icon={<Plus className="w-4 h-4" />}
                        >
                            Add {activeTab === 'users' ? 'User' : 'Course'}
                        </Button>
                    </div>
                </Card>

                {/* Content */}
                {loading ? (
                     <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                     </div>
                ) : (
                    <div className="space-y-6">
                        {activeTab === 'users' ? (
                            <>
                                {/* Role Filters */}
                                <div className="flex space-x-2 overflow-x-auto pb-2">
                                    {[
                                        { name: 'Students', role: 'Student', icon: GraduationCap, color: 'text-blue-600 bg-blue-50' },
                                        { name: 'Doctors', role: 'Doctor', icon: Stethoscope, color: 'text-green-600 bg-green-50' },
                                        { name: 'Admins', role: 'Admin', icon: Shield, color: 'text-purple-600 bg-purple-50' },
                                    ].map((tab) => (
                                        <button
                                            key={tab.name}
                                            onClick={() => setUserRoleTab(tab.role as any)}
                                            className={`
                                                px-4 py-2 rounded-full font-medium text-sm flex items-center transition-all border
                                                ${userRoleTab === tab.role
                                                    ? `${tab.color} border-${tab.color.split('-')[1]}-200 shadow-sm`
                                                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                                }
                                            `}
                                        >
                                            <tab.icon className={`w-4 h-4 mr-2`} />
                                            {tab.name}
                                        </button>
                                    ))}
                                </div>

                                {/* Users Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredUsers.map((user) => (
                                        <Card key={user.userID} hover className="border-t-4 border-t-indigo-500">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{user.firstName} {user.lastName}</h3>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                                <Badge variant={user.role === 'Admin' ? 'info' : user.role === 'Doctor' ? 'success' : 'neutral'}>
                                                    {user.role}
                                                </Badge>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                                <span className="text-xs text-gray-400 font-mono">ID: {user.userID}</span>
                                                {/* Actions like edit/delete could go here */}
                                            </div>
                                        </Card>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <div className="col-span-full text-center py-12 text-gray-500">
                                            No {userRoleTab.toLowerCase()}s found matching your search.
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredCourses.map((course) => (
                                    <Card key={course.courseID} hover className="border-l-4 border-l-purple-500">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-xl text-gray-900">{course.courseName}</h3>
                                                <p className="text-xs text-indigo-500 font-mono mb-2">{course.courseID}</p>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button onClick={() => openEditCourse(course)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleDeleteCourse(course.courseID)} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors">
                                                    <Trash className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 mt-2 mb-4 line-clamp-2">{course.description}</p>
                                        {course.instructorName && (
                                            <div className="flex items-center text-sm text-gray-500 bg-gray-50 p-2 rounded">
                                                <Stethoscope className="w-4 h-4 mr-2 text-indigo-500" />
                                                Instructor: {course.instructorName}
                                            </div>
                                        )}
                                    </Card>
                                ))}
                                {filteredCourses.length === 0 && (
                                    <div className="col-span-full text-center py-12 text-gray-500">
                                        No courses found matching your search.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* User Modal */}
            {showUserModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <Card className="max-w-md w-full relative">
                        <button 
                            onClick={() => setShowUserModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <h3 className="text-xl font-bold mb-6 text-gray-900">Register New User</h3>
                        
                        <form onSubmit={handleUserSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={userForm.role}
                                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                                    className="block w-full rounded-lg border-gray-300 bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="Student">Student</option>
                                    <option value="Doctor">Doctor</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>

                            <Input 
                                label="User ID"
                                value={userForm.userID}
                                onChange={(e) => setUserForm({ ...userForm, userID: e.target.value })}
                                required
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Input 
                                    label="First Name"
                                    value={userForm.firstName}
                                    onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                                    required
                                />
                                <Input 
                                    label="Last Name"
                                    value={userForm.lastName}
                                    onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                                    required
                                />
                            </div>

                            <Input 
                                label="Email"
                                type="email"
                                value={userForm.email}
                                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                required
                            />

                            {userForm.role !== 'Student' && (
                                <Input 
                                    label="Password"
                                    type="password"
                                    value={userForm.password}
                                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                                    required
                                />
                            )}

                            <div className="pt-2">
                                <Button type="submit" className="w-full">Register User</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Course Modal */}
            {showCourseModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <Card className="max-w-md w-full relative">
                        <button 
                            onClick={() => { setShowCourseModal(false); setEditingCourse(null); }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <h3 className="text-xl font-bold mb-6 text-gray-900">
                            {editingCourse ? 'Edit Course' : 'Create New Course'}
                        </h3>

                        <form onSubmit={handleCourseSubmit} className="space-y-4">
                            <Input 
                                label="Course ID"
                                value={courseForm.courseID}
                                onChange={(e) => setCourseForm({ ...courseForm, courseID: e.target.value })}
                                disabled={!!editingCourse}
                                required
                                className={!!editingCourse ? 'bg-gray-100 cursor-not-allowed' : ''}
                            />

                            <Input 
                                label="Course Name"
                                value={courseForm.courseName}
                                onChange={(e) => setCourseForm({ ...courseForm, courseName: e.target.value })}
                                required
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={courseForm.description}
                                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                                    rows={3}
                                    className="block w-full rounded-lg border-gray-300 bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm sm:text-sm p-3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
                                <select
                                    required
                                    value={courseForm.instructorID}
                                    onChange={(e) => setCourseForm({ ...courseForm, instructorID: e.target.value })}
                                    className="block w-full rounded-lg border-gray-300 bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm sm:text-sm p-2.5"
                                >
                                    <option value="">Select an Instructor</option>
                                    {instructors.map(inst => (
                                        <option key={inst.userID} value={inst.userID}>
                                            {inst.firstName} {inst.lastName} ({inst.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-2">
                                <Button type="submit" className="w-full">
                                    {editingCourse ? 'Update Course' : 'Create Course'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </Layout>
    );
}
