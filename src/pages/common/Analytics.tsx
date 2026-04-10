import { BarChart3, Sparkles, TrendingUp, Users } from 'lucide-react';
import { useRole } from '@/hooks/useRole';
import { useStudentWorkspace } from '@/hooks/useStudentWorkspace';
import { useTrainerWorkspace } from '@/hooks/useTrainerWorkspace';
import Chart from '@/components/Chart';
import StatCard from '@/components/StatCard';

const AnalyticsPage = () => {
  const { role } = useRole();
  const isTrainer = role === 'trainer';
  const student = useStudentWorkspace();
  const trainer = useTrainerWorkspace();

  const studentLine = student.enrolledCourses.map(({ course, progress }) => ({
    name: course.title.length > 14 ? `${course.title.slice(0, 14)}…` : course.title,
    value: progress.percentage || 0,
  }));

  const trainerLine = trainer.courses.map((course) => ({
    name: course.title.length > 14 ? `${course.title.slice(0, 14)}…` : course.title,
    value: course.price,
  }));

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isTrainer ? (
          <>
            <StatCard title="Revenue Growth" value={`₹${trainer.totalRevenue}`} icon={TrendingUp} tone="emerald" hint="Course earnings trend" to="/trainer/dashboard" />
            <StatCard title="Learner Volume" value={trainer.totalLearners} icon={Users} tone="blue" hint="Total learners in ecosystem" to="/trainer/manage-courses" />
            <StatCard title="Completion Quality" value={`${trainer.averageCompletion}%`} icon={Sparkles} tone="violet" hint="Average completion signal" to="/trainer/manage-courses" />
            <StatCard title="Course Metrics" value={trainer.courses.length} icon={BarChart3} tone="amber" hint="Tracked courses" to="/trainer/manage-courses" />
          </>
        ) : (
          <>
            <StatCard title="Progress Trend" value={`${student.averageProgress}%`} icon={TrendingUp} tone="blue" hint="Average completion trend" to="/student/dashboard" />
            <StatCard title="Active Learning" value={student.enrolledCourses.length} icon={Users} tone="emerald" hint="Enrolled learning paths" to="/courses" />
            <StatCard title="Completed Paths" value={student.completedCourses} icon={Sparkles} tone="amber" hint="Courses completed" to="/student/examinations" />
            <StatCard title="Certificates" value={student.certificates.length} icon={BarChart3} tone="violet" hint="Issued certificates" to="/student/certificates" />
          </>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.45fr_0.85fr]">
        <Chart
          variant="line"
          title={isTrainer ? 'Revenue Intelligence' : 'Learning Progress'}
          subtitle={isTrainer ? 'Revenue per course in your catalog' : 'Progress per enrolled course'}
          lineData={isTrainer ? trainerLine : studentLine}
          lineXKey="name"
          lineYKey="value"
          lineColor="#2563EB"
        />
        <Chart
          variant="donut"
          title={isTrainer ? 'Engagement Mix' : 'Learning Mix'}
          subtitle={isTrainer ? 'Student engagement segments' : 'Completed vs pending distribution'}
          donutData={isTrainer
            ? [
              { name: 'High', value: Math.max(Math.round(trainer.averageCompletion / 10), 1), color: '#16A34A' },
              { name: 'Medium', value: 5, color: '#2563EB' },
              { name: 'Low', value: 4, color: '#F59E0B' },
            ]
            : [
              { name: 'Completed', value: student.completedCourses, color: '#16A34A' },
              { name: 'Pending', value: Math.max(student.enrolledCourses.length - student.completedCourses, 0), color: '#2563EB' },
            ]}
        />
      </section>
    </div>
  );
};

export default AnalyticsPage;
