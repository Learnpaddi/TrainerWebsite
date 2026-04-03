
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '@/auth/Login';
import Register from '@/auth/Register';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminLayout } from '@/admin/components/AdminLayout';
import Dashboard from '@/admin/pages/Dashboard';
import CoursesPage from '@/admin/pages/Courses';
import EnrollmentsPage from '@/admin/pages/Enrollments';
import Home from '@/student/pages/Home';
import Landing from '@/student/pages/Landing';
import MyCourses from '@/student/pages/MyCourses';
import CourseDetail from '@/student/pages/CourseDetail';
import { useAuth } from '@/hooks/useAuth';

const AppRoutes = () => {
  const { loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-xl font-medium text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Public/Student Routes */}
        <Route path="/" element={
          <ProtectedRoute requireAuth={false}>
            <Landing />
          </ProtectedRoute>
        } />
        <Route path="/courses" element={
          <ProtectedRoute requireAuth={false}>
            <Landing />
          </ProtectedRoute>
        } />
        <Route path="/lms" element={
          <ProtectedRoute requireRole="student">
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/lms/course/:courseId" element={
          <ProtectedRoute requireRole="student">
            <CourseDetail />
          </ProtectedRoute>
        } />
        <Route path="/my-courses" element={
          <ProtectedRoute requireRole="student">
            <MyCourses />
          </ProtectedRoute>
        } />
        
        {/* Trainer Admin Panel */}
        <Route path="/admin/*" element={
          <ProtectedRoute requireRole="trainer">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="enrollments" element={<EnrollmentsPage />} />
        </Route>
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;

