import { useEffect, useState } from 'react';
import { useRole } from '@/hooks/useRole';
import { getTrainerDashboardData, type CourseRecord } from '@/services/firebase/lmsService';

interface TrainerWorkspaceState {
  loading: boolean;
  courses: CourseRecord[];
  totalLearners: number;
  totalRevenue: number;
  averageCompletion: number;
}

export const useTrainerWorkspace = () => {
  const { profile } = useRole();
  const [state, setState] = useState<TrainerWorkspaceState>({
    loading: true,
    courses: [],
    totalLearners: 0,
    totalRevenue: 0,
    averageCompletion: 0,
  });

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!profile) {
        if (mounted) {
          setState({
            loading: false,
            courses: [],
            totalLearners: 0,
            totalRevenue: 0,
            averageCompletion: 0,
          });
        }
        return;
      }

      try {
        const dashboard = await getTrainerDashboardData(profile.id);
        if (!mounted) return;
        setState({ loading: false, ...dashboard });
      } catch {
        if (!mounted) return;
        setState({
          loading: false,
          courses: [],
          totalLearners: 0,
          totalRevenue: 0,
          averageCompletion: 0,
        });
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [profile]);

  return state;
};
