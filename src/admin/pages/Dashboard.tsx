import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCourses } from '@/hooks/useCourses';
import { createCourse, updateCourse, deleteCourse, type Course } from '@/services/firebase/courseService';
import { logout } from '@/services/firebase/authService';
import { Loader2, Plus, Edit3, Trash2, Users, DollarSign, BarChart3, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { isAdmin } from '@/services/firebase/config';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { courses, loading: coursesLoading, refetch } = useCourses();
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    price: 0,
    duration: '4 weeks'
  });
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const isLoading = authLoading || coursesLoading;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCourse(newCourse as any);
      refetch();
      setNewCourse({ title: '', description: '', price: 0, duration: '4 weeks' });
    } catch (error) {
      console.error('Create failed:', error);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-2" />
        <span className="text-xl text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-primary bg-clip-text text-transparent mb-4">
            Admin Dashboard
          </h1>
          <div className="flex gap-4 items-center">
            <span className="text-sm text-gray-500">
              {user ? `Logged in as ${user.email}` : 'Not logged in'}
            </span>
            {user && (
              <button 
                onClick={logout}
                className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
              >
                Logout
              </button>
            )}
          </div>
        </div>

        {user && !isAdmin(user.email || '') && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-6 py-4 rounded-xl mb-8">
            Admin access required for course management.
          </div>
        )}

        {/* Create Course Form */}
        {(user && isAdmin(user.email || '')) && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <h2 className="text-2xl font-bold mb-6">Create New Course</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Title</label>
                <input
                  type="text"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <button 
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl hover:shadow-lg transition-all"
              >
                Create Course
              </button>
            </form>
          </div>
        )}

        {/* Edit Form */}
        {editingCourse && user && isAdmin(user.email || '') && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <h2 className="text-2xl font-bold mb-6">Edit Course</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <input type="hidden" value={editingCourse.id} />
              <div>
                <label className="block text-sm font-semibold mb-2">Title</label>
                <input
                  type="text"
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse({...editingCourse, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  value={editingCourse.description || ''}
                  onChange={(e) => setEditingCourse({...editingCourse, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-3">
                <button 
                  type="submit"
                  className="flex-1 px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:shadow-lg"
                >
                  Update Course
                </button>
                <button 
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Courses List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-2xl font-bold mb-2">Courses ({courses.length})</h2>
            <p className="text-gray-600">Manage all courses below</p>
          </div>
          <div className="divide-y divide-gray-100">
            {courses.map((course) => (
              <div key={course.id} className="p-8 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                    <p className="text-gray-600 mb-4">{course.description}</p>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>ID: {course.id?.substring(0,8)}...</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setEditingCourse(course)}
                      className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600"
                      disabled={!user || !isAdmin(user.email || '')}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(course.id!)}
                      className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600"
                      disabled={!user || !isAdmin(user.email || '')}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {courses.length === 0 && (
          <div className="text-center py-24 text-gray-500">
            <i className="fas fa-book text-6xl mb-6 opacity-50"></i>
            <h3 className="text-2xl font-bold mb-2">No courses yet</h3>
            <p>Create your first course above!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

