import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
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
const ExploreCourses = lazy(() => import('@/student/pages/ExploreCourses'));
const CoursePlayer = lazy(() => import('@/student/pages/CoursePlayer'));
const Certificates = lazy(() => import('@/student/pages/Certificates'));
const StudentLayout = lazy(() => import('@/student/components/StudentLayout').then((mod) => ({ default: mod.StudentLayout })));

const LoadingScreen = ({ label }: { label: string }) => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <div className="text-xl font-medium text-gray-600">{label}</div>
  </div>
);

const App = () => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen label="Loading..." />;
  }

  return (
    <Suspense fallback={<LoadingScreen label="Loading LMS..." />}>
      <Routes>
        <Route
          path="/login"
          element={(
            <MainLayout>
              <Login />
            </MainLayout>
          )}
        />
        <Route
          path="/register"
          element={(
            <MainLayout>
              <Register />
            </MainLayout>
          )}
        />

        <Route
          path="/"
          element={(
            <MainLayout contentContainer={false}>
              <Landing />
            </MainLayout>
          )}
        />
        <Route
          path="/courses"
          element={(
            <ProtectedRoute requireRole="student">
              <StudentLayout />
            </ProtectedRoute>
          )}
        >
          <Route index element={<ExploreCourses />} />
        </Route>

        <Route
          path="/"
          element={(
            <ProtectedRoute requireRole="student">
              <StudentLayout />
            </ProtectedRoute>
          )}
        >
          <Route path="dashboard" element={<Home />} />
          <Route path="course/:id" element={<CoursePlayer />} />
          <Route path="my-courses" element={<MyCourses />} />
          <Route path="certificates" element={<Certificates />} />
        </Route>

        <Route
          path="/admin/*"
          element={(
            <ProtectedRoute requireRole="trainer">
              <AdminLayout />
            </ProtectedRoute>
          )}
        >
          <Route index element={<Dashboard />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="enrollments" element={<EnrollmentsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
