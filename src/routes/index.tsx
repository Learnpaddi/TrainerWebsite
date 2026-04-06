import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '@/auth/Login';
import Register from '@/auth/Register';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import MainLayout from '@/shared/layouts/MainLayout';
import { useAuth } from '@/hooks/useAuth';

const AdminLayout = lazy(() => import('@/admin/components/AdminLayout').then((mod) => ({ default: mod.AdminLayout })));
const Dashboard = lazy(() => import('@/admin/pages/Dashboard'));
const CoursesPage = lazy(() => import('@/admin/pages/Courses'));
const EnrollmentsPage = lazy(() => import('@/admin/pages/Enrollments'));
const Home = lazy(() => import('@/student/pages/Home'));
const Landing = lazy(() => import('@/student/pages/Landing'));
const MyCourses = lazy(() => import('@/student/pages/MyCourses'));
const CourseDetail = lazy(() => import('@/student/pages/CourseDetail'));
const StudentLayout = lazy(() => import('@/student/components/StudentLayout').then((mod) => ({ default: mod.StudentLayout })));

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
    <BrowserRouter basename="/lms">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="text-xl font-medium text-gray-600">Loading LMS...</div>
        </div>
      }>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={
            <MainLayout>
              <Login />
            </MainLayout>
          } />
          <Route path="/register" element={
            <MainLayout>
              <Register />
            </MainLayout>
          } />
          
          {/* LMS Public Routes */}
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
          <Route path="/*" element={
            <ProtectedRoute requireRole="student">
              <StudentLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<Home />} />
            <Route path="course/:courseId" element={<CourseDetail />} />
            <Route path="my-courses" element={<MyCourses />} />
          </Route>
          
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
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;

