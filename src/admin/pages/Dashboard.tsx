import { useState, type FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTrainerCourses } from '@/hooks/useTrainerCourses';
import { useTrainerEnrollments } from '@/hooks/useTrainerEnrollments';
import { createCourse, updateCourse, deleteCourse, type Course } from '@/services/firebase/courseService';
import { Loader2, Plus, Edit3, Trash2, Users, DollarSign, GraduationCap } from 'lucide-react';

type NewCourse = Pick<Course, 'title' | 'description' | 'price' | 'duration'>;

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { courses, loading: coursesLoading, refetch } = useTrainerCourses();
  const { enrollments } = useTrainerEnrollments();
  const [newCourse, setNewCourse] = useState<NewCourse>({
    title: '',
    description: '',
    price: 0,
    duration: '4 weeks'
  });
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const isLoading = authLoading || coursesLoading;

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await createCourse({
        ...newCourse,
        trainerId: user.doc?.trainerId || user.uid,
        thumbnail: ''
      });
      refetch();
      setNewCourse({ title: '', description: '', price: 0, duration: '4 weeks' });
    } catch (error) {
      console.error('Create failed:', error);
    }
  };

  const handleEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    try {
      await updateCourse(editingCourse.id, editingCourse);
      refetch();
      setEditingCourse(null);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('Delete course?')) return;
    try {
      await deleteCourse(courseId);
      refetch();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const totalEnrollments = enrollments.length;
  const totalRevenue = enrollments.reduce((sum, e) => sum + (e.course?.price || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
      </div>
    );
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-xl">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-3xl font-bold text-gray-900">{courses.length}</p>
              <p className="text-gray-600">Courses</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-3xl font-bold text-gray-900">{totalEnrollments}</p>
              <p className="text-gray-600">Enrollments</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-3xl font-bold text-gray-900">${totalRevenue.toFixed(0)}</p>
              <p className="text-gray-600">Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg">
          {/* Create Course Form */}
          <h2 className="text-2xl font-bold mb-6">Create New Course</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Title</label>
                <input
                  type="text"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Price ($)</label>
                <input
                  type="number"
                  value={newCourse.price}
                  onChange={(e) => setNewCourse({...newCourse, price: parseFloat(e.target.value) || 0})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Description</label>
              <textarea
                value={newCourse.description}
                onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button 
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:shadow-lg"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Create Course
            </button>
          </form>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h3 className="text-lg font-bold mb-4">Recent Enrollments</h3>
          <ul className="space-y-2">
            {enrollments.slice(0,3).map(enroll => (
              <li key={enroll.id} className="text-sm text-gray-600">
                {enroll.course?.title || 'Course'}
              </li>
            ))}
            {enrollments.length === 0 && <p className="text-gray-500">No enrollments</p>}
          </ul>
        </div>
      </div>

      {/* My Courses List */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 border-b">
          <h2 className="text-2xl font-bold mb-2">My Courses ({courses.length})</h2>
          <p className="text-gray-600">Manage your courses</p>
        </div>
        <div className="divide-y">
          {courses.map((course) => (
            <div key={course.id} className="p-8 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-2">{course.description}</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>${course.price}</span>
                    <span>{course.duration}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingCourse(course)}
                    className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 flex items-center"
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Form */}
      {editingCourse && (
        <div className="bg-white mt-8 p-8 rounded-2xl shadow-xl">
          <h3 className="text-xl font-bold mb-4">Edit Course</h3>
          <form onSubmit={handleEdit} className="space-y-4">
            <input type="hidden" value={editingCourse.id} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Title</label>
                <input
                  type="text"
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse({...editingCourse, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Price</label>
                <input
                  type="number"
                  value={editingCourse.price}
                  onChange={(e) => setEditingCourse({...editingCourse, price: parseFloat(e.target.value) || 0})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Description</label>
              <textarea
                value={editingCourse.description || ''}
                onChange={(e) => setEditingCourse({...editingCourse, description: e.target.value})}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex-1 px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl">
                Update
              </button>
              <button 
                type="button"
                onClick={() => setEditingCourse(null)}
                className="px-6 py-3 bg-gray-200 font-bold rounded-xl"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Dashboard;
