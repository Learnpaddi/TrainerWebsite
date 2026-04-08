import { useEffect, useState } from 'react';
import { useRole } from '@/hooks/useRole';
import {
  getCertificateRecords,
  getStudentDashboardData,
  type CertificateRecord,
  type CourseRecord,
  type EnrollmentRecord,
} from '@/services/firebase/lmsService';

interface StudentWorkspaceState {
  loading: boolean;
  courses: CourseRecord[];
  enrollments: EnrollmentRecord[];
  enrolledCourses: Array<{ course: CourseRecord; enrollment: EnrollmentRecord }>;
  averageProgress: number;
  completedCourses: number;
  certificates: CertificateRecord[];
}

const initialState: StudentWorkspaceState = {
  loading: true,
  courses: [],
  enrollments: [],
  enrolledCourses: [],
  averageProgress: 0,
  completedCourses: 0,
  certificates: [],
};

export const useStudentWorkspace = () => {
  const { profile } = useRole();
  const [state, setState] = useState<StudentWorkspaceState>(initialState);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!profile) {
        if (mounted) {
          setState({ ...initialState, loading: false });
        }
        return;
      }

      try {
        const [dashboard, certificates] = await Promise.all([
          getStudentDashboardData(profile.id),
          getCertificateRecords(profile.id),
        ]);

        if (!mounted) return;
        setState({
          loading: false,
          ...dashboard,
          certificates,
        });
      } catch {
        if (!mounted) return;
        setState({ ...initialState, loading: false });
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [profile]);

  return state;
};
