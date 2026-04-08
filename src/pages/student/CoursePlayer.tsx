import { CheckCircle2, PlayCircle, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import {
  enrollInCourse,
  getCourseById,
  getCourseReviews,
  getRatingSnapshot,
  getStudentEnrollments,
  issueCertificate,
  markLessonCompleted,
  openCertificatePrintView,
  submitCourseReview,
  type CertificateRecord,
  type CourseRecord,
  type EnrollmentRecord,
  type LessonRecord,
  type ReviewRecord,
} from '@/services/firebase/lmsService';

function getYouTubeId(url: string) {
  const regExp = /(?:youtube.com\/watch\?v=|youtu.be\/)([^&]+)/;
  const match = url.match(regExp);
  if (match) return match[1];
  const embedMatch = url.match(/youtube.com\/embed\/([^?&]+)/);
  return embedMatch ? embedMatch[1] : "";
}

const StudentCoursePlayerPage = () => {
  const { id = '' } = useParams();
  const { profile } = useRole();
  const [course, setCourse] = useState<CourseRecord | null>(null);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [enrollment, setEnrollment] = useState<EnrollmentRecord | null>(null);
  const [activeLesson, setActiveLesson] = useState<LessonRecord | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [selectedVideoId, setSelectedVideoId] = useState('');
  const [certificate, setCertificate] = useState<CertificateRecord | null>(null);
  const [reviewInput, setReviewInput] = useState({ rating: 5, comment: '' });
  const [ratingSnapshot, setRatingSnapshot] = useState({ averageRating: 0, reviewsCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!id) {
        setError('Invalid course route.');
        setLoading(false);
        return;
      }

      if (!profile) return;
      setLoading(true);
      setError(null);
      try {
        const [fetchedCourse, fetchedReviews, studentEnrollments, fetchedRating] = await Promise.all([
          getCourseById(id),
          getCourseReviews(id),
          getStudentEnrollments(profile.id),
          getRatingSnapshot(id),
        ]);

        if (!mounted) return;
        if (!fetchedCourse) {
          setError('Course not found.');
          return;
        }

        const existingEnrollment = studentEnrollments.find((item) => item.courseId === id) || null;

        setCourse(fetchedCourse);
        setReviews(fetchedReviews);
        setRatingSnapshot(fetchedRating);
        setEnrollment(existingEnrollment);
        setActiveLesson(fetchedCourse.lessons[0] || null);
        setCurrentLessonIndex(0);
        const firstLessonUrl = fetchedCourse.lessons[0]?.youtubeUrl || fetchedCourse.lessons[0]?.videoUrl || '';
        setSelectedVideoId(getYouTubeId(firstLessonUrl));
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : 'Unable to load course details.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [id, profile]);

  const completedSet = useMemo(() => new Set(enrollment?.completedLessons || []), [enrollment]);

  if (loading || !profile) {
    return <div className="lms-panel p-8 text-slate-500">Loading course player...</div>;
  }

  if (error) {
    return <div className="lms-panel p-8 text-red-600">{error}</div>;
  }

  if (!course) {
    return <div className="lms-panel p-8 text-slate-500">Course not available.</div>;
  }

  const handleEnroll = async () => {
    try {
      const nextEnrollment = await enrollInCourse(profile.id, course.id);
      setEnrollment(nextEnrollment);
    } catch (enrollError) {
      setError(enrollError instanceof Error ? enrollError.message : 'Unable to enroll right now.');
    }
  };

  const handleCompleteLesson = async (lessonId: string) => {
    const updated = await markLessonCompleted(profile.id, course.id, lessonId);
    if (!updated) return;
    setEnrollment(updated);

    if (updated.progress === 100) {
      const issued = await issueCertificate({
        courseId: course.id,
        userId: profile.id,
        userName: profile.name,
      });
      setCertificate(issued);
    }
  };

  const handleReview = async () => {
    if (!reviewInput.comment.trim()) return;
    const created = await submitCourseReview({
      courseId: course.id,
      userId: profile.id,
      userName: profile.name,
      rating: reviewInput.rating,
      comment: reviewInput.comment,
    });
    setReviews((current) => [created, ...current]);
    setReviewInput({ rating: 5, comment: '' });
    const snapshot = await getRatingSnapshot(course.id);
    setRatingSnapshot(snapshot);
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[1.4fr,0.8fr]">
      <section className="space-y-8">
        <article className="lms-panel p-6 lg:p-8">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">{course.category}</span>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">{course.level}</span>
            <span className="rounded-full bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-600">{ratingSnapshot.averageRating} rating</span>
          </div>
          <h2 className="text-4xl font-black text-slate-950">{course.title}</h2>
          <p className="mt-4 text-base leading-8 text-slate-600">{course.description}</p>

          <div className="mt-8 aspect-video overflow-hidden rounded-[1.75rem] bg-slate-950 shadow-2xl">
            {selectedVideoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideoId}`}
                title={activeLesson?.title || 'Course lesson'}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full items-center justify-center text-white">No video linked yet.</div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] bg-slate-50 p-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Active Lesson</p>
              <h3 className="mt-2 text-2xl font-black text-slate-950">{activeLesson?.title}</h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Lesson {currentLessonIndex + 1}</p>
              <p className="mt-2 text-sm text-slate-600">{activeLesson?.summary}</p>
            </div>
            {enrollment ? (
              <button
                type="button"
                onClick={() => activeLesson && handleCompleteLesson(activeLesson.id)}
                className="primary-cta px-5 py-3 text-sm"
              >
                Mark Lesson Complete
              </button>
            ) : (
              <button type="button" onClick={handleEnroll} className="primary-cta px-5 py-3 text-sm">
                Enroll & Start Learning
              </button>
            )}
          </div>
        </article>

        <article className="lms-panel p-6 lg:p-8">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Learner Reviews</p>
            <h3 className="text-3xl font-black text-slate-950">Ratings & feedback</h3>
          </div>
          <div className="mb-6 rounded-[1.5rem] bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              {Array.from({ length: 5 }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setReviewInput((current) => ({ ...current, rating: index + 1 }))}
                  className="text-amber-400"
                >
                  <Star className={`h-6 w-6 ${index < reviewInput.rating ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
            <textarea
              value={reviewInput.comment}
              onChange={(event) => setReviewInput((current) => ({ ...current, comment: event.target.value }))}
              placeholder="Share what worked well in this course..."
              className="mt-4 min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
            <button type="button" onClick={handleReview} className="primary-cta mt-4 px-5 py-3 text-sm">Publish Review</button>
          </div>

          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-slate-950">{review.userName}</p>
                    <p className="text-sm text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-600">{review.rating}/5</span>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">{review.comment}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <aside className="space-y-6">
        <article className="lms-panel p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Course Progress</p>
          <h3 className="mt-3 text-3xl font-black text-slate-950">{enrollment?.progress || 0}% complete</h3>
          <div className="mt-4 h-3 rounded-full bg-slate-100">
            <div className="h-3 rounded-full bg-gradient-to-r from-primary to-cyan-400" style={{ width: `${enrollment?.progress || 0}%` }} />
          </div>
          <p className="mt-3 text-sm text-slate-600">{completedSet.size} of {course.lessons.length} lessons completed</p>
          {certificate && (
            <button type="button" onClick={() => openCertificatePrintView(certificate, course)} className="secondary-cta mt-5 w-full px-5 py-3 text-sm">
              Print Certificate
            </button>
          )}
        </article>

        <article className="lms-panel p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Lesson Sidebar</p>
          <div className="mt-5 space-y-3">
            {course.lessons.map((lesson) => {
              const completed = completedSet.has(lesson.id);
              const active = activeLesson?.id === lesson.id;
              const lessonVideoId = getYouTubeId(lesson.youtubeUrl || lesson.videoUrl || '');
              const lessonIndex = course.lessons.findIndex((entry) => entry.id === lesson.id);

              return (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => {
                    setActiveLesson(lesson);
                    setCurrentLessonIndex(lessonIndex);
                    setSelectedVideoId(lessonVideoId);
                  }}
                  className={`flex w-full items-center gap-4 rounded-[1.25rem] border p-4 text-left transition ${
                    active ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${completed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                    {completed ? <CheckCircle2 className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{lesson.title}</p>
                    <p className="text-sm text-slate-500">
                      Lesson {lessonIndex + 1}
                      {lesson.duration ? ` • ${lesson.duration}` : ''}
                      {active ? ' • Playing' : ''}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </article>
      </aside>
    </div>
  );
};

export default StudentCoursePlayerPage;
