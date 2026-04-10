import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import AuthPage from '@/auth/AuthPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useRole } from '@/hooks/useRole';
import DashboardLayout from '@/layouts/DashboardLayout';
import MainLayout from '@/shared/layouts/MainLayout';

const Landing = lazy(() => import('@/student/pages/Landing'));
const StudentDashboardPage = lazy(() => import('@/pages/student/Dashboard'));
const StudentCoursePlayerPage = lazy(() => import('@/pages/student/CoursePlayer'));
const StudentCertificatesPage = lazy(() => import('@/student/pages/Certificates'));
const ExaminationPortalPage = lazy(() => import('@/pages/student/ExaminationPortal'));
const CertificateViewPage = lazy(() => import('@/pages/student/CertificateView'));
const TrainerDashboardPage = lazy(() => import('@/pages/trainer/Dashboard'));
const TrainerCreateCoursePage = lazy(() => import('@/pages/trainer/CreateCourse'));
const TrainerManageCoursesPage = lazy(() => import('@/pages/trainer/ManageCourses'));
const CoursesPage = lazy(() => import('@/pages/common/Courses'));
const AnalyticsPage = lazy(() => import('@/pages/common/Analytics'));
const MessagesPage = lazy(() => import('@/pages/common/Messages'));
const SettingsPage = lazy(() => import('@/pages/common/Settings'));

const LoadingScreen = ({ label }: { label: string }) => (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
    <div className="text-xl font-medium text-gray-600">{label}</div>
  </div>
);

const LegacyStudentCourseRedirect = () => {
  const { id } = useParams();
  return <Navigate to={id ? `/student/course/${id}` : '/student/dashboard'} replace />;
};

const LegacyStudentCertificateRedirect = () => {
  const { courseId } = useParams();
  return <Navigate to={courseId ? `/student/certificates/${courseId}` : '/student/certificates'} replace />;
};

const LegacyTrainerEditCourseRedirect = () => {
  const { id } = useParams();
  return <Navigate to={id ? `/trainer/edit-course/${id}` : '/trainer/manage-courses'} replace />;
};

const DashboardRouteRedirect = () => {
  const { role, loading } = useRole();
  if (loading) {
    return <LoadingScreen label="Loading LearnPaddi LMS..." />;
  }
  if (!role) {
    return <Navigate to="/select-role?mode=login" replace />;
  }
  return <Navigate to={role === 'trainer' ? '/trainer/dashboard' : '/student/dashboard'} replace />;
};

const RoleAwareDashboardShell = ({
  title,
  subtitle,
  actionLabel,
  actionPath,
  children,
}: {
  title: string;
  subtitle: string;
  actionLabel: string;
  actionPath: string;
  children: ReactNode;
}) => {
  const { role } = useRole();
  const shellRole = role === 'trainer' ? 'trainer' : 'student';

  return (
    <DashboardLayout
      role={shellRole}
      title={title}
      subtitle={subtitle}
      actionLabel={actionLabel}
      actionPath={actionPath}
    >
      {children}
    </DashboardLayout>
  );
};

const CoursesRoutePage = () => {
  const { role } = useRole();
  return (
    <RoleAwareDashboardShell
      title="Courses"
      subtitle="Browse, manage, and optimize your course catalog with a modern LMS workflow."
      actionLabel={role === 'trainer' ? 'Add Course' : 'Explore'}
      actionPath={role === 'trainer' ? '/trainer/add-course' : '/courses'}
    >
      <CoursesPage />
    </RoleAwareDashboardShell>
  );
};

const AnalyticsRoutePage = () => {
  const { role } = useRole();
  return (
    <RoleAwareDashboardShell
      title="Analytics"
      subtitle="Track performance, engagement, and growth metrics from one analytics layer."
      actionLabel={role === 'trainer' ? 'Export Report' : 'View Progress'}
      actionPath="/analytics"
    >
      <AnalyticsPage />
    </RoleAwareDashboardShell>
  );
};

const MessagesRoutePage = () => (
  <RoleAwareDashboardShell
    title="Messages"
    subtitle="Centralize learner and trainer communication with a clean inbox experience."
    actionLabel="New Message"
    actionPath="/messages"
  >
    <MessagesPage />
  </RoleAwareDashboardShell>
);

const SettingsRoutePage = () => (
  <RoleAwareDashboardShell
    title="Settings"
    subtitle="Manage account preferences, notifications, and security settings."
    actionLabel="Save Changes"
    actionPath="/settings"
  >
    <SettingsPage />
  </RoleAwareDashboardShell>
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
          path="/select-role"
          element={(
            <MainLayout contentContainer={false}>
              <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <AuthPage />
              </div>
            </MainLayout>
          )}
        />

        <Route
          path="/student/login"
          element={(
            <MainLayout contentContainer={false}>
              <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <AuthPage fixedRole="student" fixedMode="login" />
              </div>
            </MainLayout>
          )}
        />

        <Route
          path="/student/signup"
          element={(
            <MainLayout contentContainer={false}>
              <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <AuthPage fixedRole="student" fixedMode="signup" />
              </div>
            </MainLayout>
          )}
        />

        <Route
          path="/trainer/login"
          element={(
            <MainLayout contentContainer={false}>
              <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <AuthPage fixedRole="trainer" fixedMode="login" />
              </div>
            </MainLayout>
          )}
        />

        <Route
          path="/trainer/signup"
          element={<Navigate to="/trainer/login" replace />}
        />

        <Route
          path="/student/dashboard"
          element={(
            <ProtectedRoute requireRole="student">
              <DashboardLayout
                role="student"
                title="Student Dashboard"
                subtitle="Track enrolled courses, monitor completion trends, and stay focused on progress."
                actionLabel="Explore Courses"
                actionPath="/courses"
              >
                <StudentDashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          )}
        />

        <Route
          path="/student/examinations"
          element={(
            <ProtectedRoute requireRole="student">
              <DashboardLayout
                role="student"
                title="Examination Portal"
                subtitle="Attend final course exams, review results, and unlock certification once you pass."
                actionLabel="Certificates"
                actionPath="/student/certificates"
              >
                <ExaminationPortalPage />
              </DashboardLayout>
            </ProtectedRoute>
          )}
        />

        <Route
          path="/student/certificates"
          element={(
            <ProtectedRoute requireRole="student">
              <DashboardLayout
                role="student"
                title="Certificates"
                subtitle="View and download certifications for the courses you have completed and passed."
                actionLabel="Examination Portal"
                actionPath="/student/examinations"
              >
                <StudentCertificatesPage />
              </DashboardLayout>
            </ProtectedRoute>
          )}
        />

        <Route
          path="/student/certificates/:courseId"
          element={(
            <ProtectedRoute requireRole="student">
              <DashboardLayout
                role="student"
                title="Certificate View"
                subtitle="Review your earned certificate and export it in PDF format."
                actionLabel="Certificates"
                actionPath="/student/certificates"
              >
                <CertificateViewPage />
              </DashboardLayout>
            </ProtectedRoute>
          )}
        />

        <Route
          path="/student/course/:id"
          element={(
            <ProtectedRoute requireRole="student">
              <DashboardLayout
                role="student"
                title="Course Player"
                subtitle="Video learning, lesson completion, reviews, ratings, and certificate generation all live in one focused learning workspace."
                actionLabel="Explore Courses"
                actionPath="/courses"
              >
                <StudentCoursePlayerPage />
              </DashboardLayout>
            </ProtectedRoute>
          )}
        />

        <Route
          path="/course/:id"
          element={(
            <ProtectedRoute requireRole="student">
              <DashboardLayout
                role="student"
                title="Course View"
                subtitle="Watch lessons, switch videos, and continue your learning journey."
                actionLabel="Back to Dashboard"
                actionPath="/student/dashboard"
              >
                <StudentCoursePlayerPage />
              </DashboardLayout>
            </ProtectedRoute>
          )}
        />

        <Route
          path="/trainer/dashboard"
          element={(
            <ProtectedRoute requireRole="trainer">
              <DashboardLayout
                role="trainer"
                title="Trainer Dashboard"
                subtitle="Operate your LMS business with revenue intelligence, learner analytics, and performance insights."
                actionLabel="Add Course"
                actionPath="/trainer/add-course"
              >
                <TrainerDashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          )}
        />

        <Route
          path="/trainer/add-course"
          element={(
            <ProtectedRoute requireRole="trainer">
              <DashboardLayout
                role="trainer"
                title="Create Course"
                subtitle="Build a complete course with lessons, videos, thumbnails, pricing, and structured modules designed for modern video-first learning."
                actionLabel="Manage Courses"
                actionPath="/trainer/manage-courses"
              >
                <TrainerCreateCoursePage />
              </DashboardLayout>
            </ProtectedRoute>
          )}
        />

        <Route
          path="/trainer/edit-course/:id"
          element={(
            <ProtectedRoute requireRole="trainer">
              <DashboardLayout
                role="trainer"
                title="Edit Course"
                subtitle="Update course details, YouTube lessons, pricing, and content structure."
                actionLabel="Manage Courses"
                actionPath="/trainer/manage-courses"
              >
                <TrainerCreateCoursePage />
              </DashboardLayout>
            </ProtectedRoute>
          )}
        />

        <Route
          path="/trainer/manage-courses"
          element={(
            <ProtectedRoute requireRole="trainer">
              <DashboardLayout
                role="trainer"
                title="Manage Courses"
                subtitle="Review enrollments, progress, ratings, and content quality across your full training catalog."
                actionLabel="Add Course"
                actionPath="/trainer/add-course"
              >
                <TrainerManageCoursesPage />
              </DashboardLayout>
            </ProtectedRoute>
          )}
        />

        <Route path="/courses" element={<ProtectedRoute><CoursesRoutePage /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsRoutePage /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><MessagesRoutePage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsRoutePage /></ProtectedRoute>} />

        <Route path="/lms" element={<Navigate to="/select-role?mode=login" replace />} />
        <Route path="/lms/" element={<Navigate to="/select-role?mode=login" replace />} />
        <Route path="/lms/auth" element={<Navigate to="/select-role?mode=login" replace />} />
        <Route path="/lms/login" element={<Navigate to="/select-role?mode=login" replace />} />
        <Route path="/lms/register" element={<Navigate to="/select-role?mode=signup" replace />} />
        <Route path="/lms/explore" element={<Navigate to="/courses" replace />} />
        <Route path="/lms/student" element={<Navigate to="/student/dashboard" replace />} />
        <Route path="/lms/student/dashboard" element={<Navigate to="/student/dashboard" replace />} />
        <Route path="/lms/student/examinations" element={<Navigate to="/student/examinations" replace />} />
        <Route path="/lms/student/certificates" element={<Navigate to="/student/certificates" replace />} />
        <Route path="/lms/student/certificates/:courseId" element={<LegacyStudentCertificateRedirect />} />
        <Route path="/lms/student/course/:id" element={<LegacyStudentCourseRedirect />} />
        <Route path="/lms/course/:id" element={<LegacyStudentCourseRedirect />} />
        <Route path="/lms/trainer" element={<Navigate to="/trainer/dashboard" replace />} />
        <Route path="/lms/trainer/dashboard" element={<Navigate to="/trainer/dashboard" replace />} />
        <Route path="/trainer/create-course" element={<Navigate to="/trainer/add-course" replace />} />
        <Route path="/lms/trainer/create-course" element={<Navigate to="/trainer/add-course" replace />} />
        <Route path="/lms/trainer/edit-course/:id" element={<LegacyTrainerEditCourseRedirect />} />
        <Route path="/lms/trainer/manage-courses" element={<Navigate to="/trainer/manage-courses" replace />} />
        <Route path="/lms/profile" element={<Navigate to="/profile" replace />} />
        <Route path="/src" element={<Navigate to="/select-role?mode=login" replace />} />
        <Route path="/src/*" element={<Navigate to="/select-role?mode=login" replace />} />
        <Route path="/dashboard" element={<DashboardRouteRedirect />} />
        <Route path="/admin" element={<Navigate to="/trainer/dashboard" replace />} />
        <Route path="/admin/*" element={<Navigate to="/trainer/dashboard" replace />} />
        <Route path="/profile" element={<Navigate to="/settings" replace />} />
        <Route path="/lms/courses" element={<Navigate to="/courses" replace />} />
        <Route path="/lms/analytics" element={<Navigate to="/analytics" replace />} />
        <Route path="/lms/messages" element={<Navigate to="/messages" replace />} />
        <Route path="/lms/settings" element={<Navigate to="/settings" replace />} />
        <Route path="/auth" element={<Navigate to="/select-role?mode=login" replace />} />
        <Route path="/login" element={<Navigate to="/select-role?mode=login" replace />} />
        <Route path="/register" element={<Navigate to="/select-role?mode=signup" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
