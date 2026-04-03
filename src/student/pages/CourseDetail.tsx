import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCourses } from '@/hooks/useCourses';
import { useEnrollments } from '@/hooks/useEnrollments';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/services/firebase/config';
import { loadRazorpay, RAZORPAY_CONFIG } from '@/services/razorpay/client';
import { Loader2, Play, GraduationCap, Users, DollarSign, Clock, Star, BookOpen } from 'lucide-react';
import { useState } from 'react';

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { courses, loading: coursesLoading } = useCourses();
  const { enrollments, enrollLoading } = useEnrollments();
  const [enrolling, setEnrolling] = useState(false);

  const course = courses.find(c => c.id === courseId);
  const isEnrolled = enrollments.some(e => e.courseId === courseId);
  const loading = coursesLoading || enrollLoading;

  const handleEnroll = async () => {
    if (!user || !course || isEnrolled) return;
    setEnrolling(true);
    try {
      const createOrder = httpsCallable(functions, 'createRazorpayOrder');
      const orderResponse = await createOrder({
        amount: course.price * 100, // paise
        currency: 'INR',
        courseId: course.id,
        userId: user.uid
      });
      
      await loadRazorpay();
      
      const options = {
        key: RAZORPAY_CONFIG.key_id,
        amount: (orderResponse.data as any).order.amount,
        currency: (orderResponse.data as any).order.currency,
        name: RAZORPAY_CONFIG.name,
        description: course.title,
        order_id: (orderResponse.data as any).order.id,
        handler: async (response: any) => {
          // Verify payment
          const verifyPayment = httpsCallable(functions, 'verifyRazorpayPayment');
          await verifyPayment({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature
          });
          // Enrollment created in backend
        },
        theme: { color: RAZORPAY_CONFIG.theme.color }
      };
      
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h1>
          <Link to="/lms" className="text-blue-600 hover:underline">Back to LMS</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back + Breadcrumb */}
        <Link 
          to="/lms" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-12"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All Courses
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Hero Section */}
          <div className="space-y-8">
            <div className="w-full h-64 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-3xl flex items-center justify-center border-4 border-white/50 shadow-2xl backdrop-blur-sm">
              <div className="text-center text-white drop-shadow-2xl">
                <GraduationCap className="w-24 h-24 mx-auto mb-6 opacity-80" />
                <h1 className="text-4xl font-black mb-2">{course.title}</h1>
                <p className="text-xl opacity-90">{course.description}</p>
              </div>
            </div>

            {/* Enroll CTA */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <DollarSign className="w-6 h-6 text-emerald-500" />
                <span className="text-3xl font-bold text-emerald-600">₹{course.price || 0}</span>
              </div>

              {isEnrolled ? (
                <Link
                  to={`/course/${courseId}/learn`}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-6 px-8 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                >
                  <Play className="w-6 h-6" />
                  Continue Learning
                </Link>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling || !user}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-6 px-8 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {enrolling ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6" />}
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
              )}

              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <Users className="w-4 h-4" />
                  <span>5K+ students enrolled</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>4.9 (1.2K reviews)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Course Content */}
          <div className="space-y-8">
            {/* What you'll learn */}
            <section className="bg-white/70 backdrop-blur rounded-3xl p-8 shadow-xl border border-white/50">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <BookOpen className="w-7 h-7 text-blue-600" />
                What you'll learn
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span>Master modern React patterns and hooks</span>
                </li>
                <li className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span>Build production-ready TypeScript applications</span>
                </li>
                <li className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span>Deploy scalable Firebase backends</span>
                </li>
              </ul>
            </section>

            {/* Modules Preview */}
            <section className="bg-white/70 backdrop-blur rounded-3xl p-8 shadow-xl border border-white/50">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-indigo-500 bg-indigo-50 rounded-r-2xl pl-6">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-2 h-8 bg-indigo-500 rounded-full" />
                    <span className="font-semibold text-indigo-800">8 Modules • 32 Lessons</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>12 hours total</span>
                  </div>
                </div>
              </div>
            </section>

            {user && (
              <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-200 rounded-3xl p-8">
                <h3 className="text-xl font-bold text-orange-900 mb-3">Ready to get started?</h3>
                <p className="text-orange-800 mb-6">Enroll now and receive lifetime access + certificate upon completion.</p>
                <button
                  onClick={handleEnroll}
                  disabled={isEnrolled || enrolling}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all disabled:opacity-50"
                >
                  {isEnrolled ? 'Already Enrolled' : 'Enroll & Start Learning'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;

