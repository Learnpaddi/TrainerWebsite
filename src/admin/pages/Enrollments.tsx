import { useTrainerEnrollments } from '@/hooks/useTrainerEnrollments';
import { Loader2 } from 'lucide-react';

const EnrollmentsPage = () => {
  const { enrollments, loading } = useTrainerEnrollments();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        <span>Loading enrollments...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Enrollments</h1>
        <p className="text-xl text-gray-600">View and manage student progress</p>
      </div>
      
      {enrollments.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-32 h-32 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <div className="text-4xl text-gray-400">👥</div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No enrollments yet</h2>
          <p className="text-gray-600 mb-8">Students will appear here once they enroll in your courses</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-8 py-6 text-left text-sm font-bold text-gray-900">Student</th>
                <th className="px-8 py-6 text-left text-sm font-bold text-gray-900">Course</th>
                <th className="px-8 py-6 text-left text-sm font-bold text-gray-900">Status</th>
                <th className="px-8 py-6 text-left text-sm font-bold text-gray-900">Enrolled</th>
                <th className="w-32"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {enrollments.map(enroll => (
                <tr key={enroll.id} className="hover:bg-gray-50">
                  <td className="px-8 py-6">
                    <div className="font-medium text-gray-900">Student Name</div>
                    <div className="text-sm text-gray-500">student@example.com</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-medium text-gray-900">{enroll.course?.title}</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      {enroll.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm text-gray-500">
                    {new Date(enroll.enrolledAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6">
                    <button className="text-blue-600 hover:text-blue-900 font-semibold text-sm">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EnrollmentsPage;

