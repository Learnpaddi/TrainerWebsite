import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AuthSelect from '@/auth/AuthSelect';
import LmsAppShell from '@/layouts/LmsAppShell';
import Layout from '@/shared/layouts/Layout';
import MainLayout from '@/shared/layouts/MainLayout';

const Landing = lazy(() => import('@/student/pages/Landing'));
const ExplorePage = lazy(() => import('@/pages/public/Explore'));
const StudentDashboardPage = lazy(() => import('@/pages/student/Dashboard'));
const StudentCoursePlayerPage = lazy(() => import('@/pages/student/CoursePlayer'));
const TrainerDashboardPage = lazy(() => import('@/pages/trainer/Dashboard'));
const TrainerCreateCoursePage = lazy(() => import('@/pages/trainer/CreateCourse'));
const TrainerManageCoursesPage = lazy(() => import('@/pages/trainer/ManageCourses'));

const LoadingScreen = ({ label }: { label: string }) => (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
    <div className="text-xl font-medium text-gray-600">{label}</div>
  </div>
);

const App = () => {
  return (
    <Suspense fallback={<LoadingScreen label="Loading LearnPaddi LMS..." />}>
      <Routes>
        <Route
          path="/"
          element={(
            <MainLayout contentContainer={false}>
              <Landing />
            </MainLayout>
          )}
        />

        <Route
          path="/auth"
          element={(
            <Layout>
              <AuthSelect />
            </Layout>
          )}
        />

        <Route
          path="/explore"
          element={(
            <MainLayout>
              <ExplorePage />
            </MainLayout>
          )}
        />

        <Route
          path="/student/dashboard"
          element={(
            <LmsAppShell
              role="student"
              title="Student Dashboard"
              subtitle="Track enrolled programs, continue lessons, unlock certificates, and experience a marketplace-style LMS built for scale."
            >
              <StudentDashboardPage />
            </LmsAppShell>
          )}
        />

        <Route
          path="/student/course/:id"
          element={(
            <LmsAppShell
              role="student"
              title="Course Player"
              subtitle="Video learning, lesson completion, reviews, ratings, and certificate generation all live in one focused learning workspace."
            >
              <StudentCoursePlayerPage />
            </LmsAppShell>
          )}
        />

        <Route
          path="/trainer/dashboard"
          element={(
            <LmsAppShell
              role="trainer"
              title="Trainer Dashboard"
              subtitle="Manage your course business like a SaaS operator with catalog oversight, learner analytics, and modular authoring workflows."
            >
              <TrainerDashboardPage />
            </LmsAppShell>
          )}
        />

        <Route
          path="/trainer/create-course"
          element={(
            <LmsAppShell
              role="trainer"
              title="Create Course"
              subtitle="Build a complete course with lessons, videos, thumbnails, pricing, and structured modules designed for modern video-first learning."
            >
              <TrainerCreateCoursePage />
            </LmsAppShell>
          )}
        />

        <Route
          path="/trainer/manage-courses"
          element={(
            <LmsAppShell
              role="trainer"
              title="Manage Courses"
              subtitle="Review enrollments, progress, ratings, and content quality across your full training catalog."
            >
              <TrainerManageCoursesPage />
            </LmsAppShell>
          )}
        />

        <Route path="/lms" element={<Navigate to="/auth" replace />} />
        <Route path="/lms/student" element={<Navigate to="/student/dashboard" replace />} />
        <Route path="/lms/trainer" element={<Navigate to="/trainer/dashboard" replace />} />
        <Route path="/dashboard" element={<Navigate to="/student/dashboard" replace />} />
        <Route path="/admin" element={<Navigate to="/trainer/dashboard" replace />} />
        <Route path="/admin/*" element={<Navigate to="/trainer/dashboard" replace />} />
        <Route path="/courses" element={<Navigate to="/explore" replace />} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/register" element={<Navigate to="/auth" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
