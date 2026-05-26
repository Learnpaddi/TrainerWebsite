import { CheckCircle2, PlayCircle, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import {
  enrollInCourse,
  getCourseById,
  getCourseReviews,
  getRatingSnapshot,
  getStudentEnrollments,
  markCourseCompleted,
  markLessonCompleted,
  submitCourseReview,
  type CourseRecord,
  type EnrollmentRecord,
  type LessonRecord,
  type ReviewRecord,
} from '@/services/database/lmsService';
import { hasCourseExam } from '@/services/database/examUtils';

function getYouTubeId(url: string): string {
  if (!url) return '';

  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return '';
}

function isValidYouTubeUrl(url: string): boolean {
  if (!url) return false;
  const videoId = getYouTubeId(url);
  return videoId.length === 11; // YouTube video IDs are 11 characters
}

const StudentCoursePlayerPage = () => {
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const { profile } = useRole();
  const [course, setCourse] = useState<CourseRecord | null>(null);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [enrollment, setEnrollment] = useState<EnrollmentRecord | null>(null);
  const [activeLesson, setActiveLesson] = useState<LessonRecord | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState('');
  const [reviewInput, setReviewInput] = useState({ rating: 5, comment: '' });
  const [ratingSnapshot, setRatingSnapshot] = useState({ averageRating: 0, reviewsCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);

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
        const firstLessonUrl = fetchedCourse.lessons[0]?.youtubeUrl || fetchedCourse.lessons[0]?.videoUrl || '';
        const firstVideoId = getYouTubeId(firstLessonUrl);
        const isValidFirstVideo = isValidYouTubeUrl(firstLessonUrl);
        setSelectedVideoId(isValidFirstVideo ? firstVideoId : '');
        setVideoLoading(isValidFirstVideo);
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
  const courseLessons = useMemo(
    () => (course?.lessons?.length ? course.lessons : course?.modules.flatMap((module) => module.lessons) || []),
    [course],
  );
  const courseModules = useMemo(() => {
    if (!course) return [];
    if (course.modules.length > 0) return course.modules;
    return [
      {
        id: 'course-content',
        title: 'Course Content',
        lessons: courseLessons,
      },
    ];
  }, [course, courseLessons]);

  const activeLessonIndex = Math.max(
    0,
    courseLessons.findIndex((lesson) => lesson.id === activeLesson?.id),
  );

  const completedLessonsCount = completedSet.size;
  const remainingLessonsCount = Math.max(courseLessons.length - completedLessonsCount, 0);

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
    try {
      const completedAfterThisClick = new Set(completedSet);
      completedAfterThisClick.add(lessonId);
      const reachedFullCompletion = completedAfterThisClick.size >= courseLessons.length && courseLessons.length > 0;

      const updated = reachedFullCompletion
        ? await markCourseCompleted(profile.id, course.id)
        : await markLessonCompleted(profile.id, course.id, lessonId);

      if (!updated) return;
      setEnrollment(updated);
    } catch (completionError) {
      setError(completionError instanceof Error ? completionError.message : 'Unable to update course completion.');
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
    <div className="space-y-8">
      <section className="lms-panel p-6 lg:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">{course.category}</span>
          <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">{course.level}</span>
          <span className="rounded-full bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-600">{ratingSnapshot.averageRating} rating</span>
        </div>
        <h2 className="mt-5 text-4xl font-black text-slate-950">{course.title}</h2>
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <section className="space-y-8">
          <article className="lms-panel p-5 lg:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Video Player</p>
                <h3 className="mt-2 text-2xl font-black text-slate-950">{activeLesson?.title || 'Select a lesson to start'}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Lesson {activeLessonIndex + 1}
                  {activeLesson?.duration ? ` • ${activeLesson.duration}` : ''}
                </p>
              </div>
              {enrollment ? (
                <button
                  type="button"
                  onClick={() => activeLesson && handleCompleteLesson(activeLesson.id)}
                  className="primary-cta px-5 py-3 text-sm"
                >
                  {enrollment.completed || remainingLessonsCount <= 1 ? 'Mark as Completed' : 'Mark Complete'}
                </button>
              ) : (
                <button type="button" onClick={handleEnroll} className="primary-cta px-5 py-3 text-sm">
                  Enroll & Start Learning
                </button>
              )}
            </div>

            <div className="mx-auto w-full max-w-4xl">
              <div className="relative aspect-video overflow-hidden rounded-[1.4rem] bg-slate-950 shadow-xl">
                {selectedVideoId && isValidYouTubeUrl(activeLesson?.youtubeUrl || activeLesson?.videoUrl || '') ? (
                  <>
                    {videoLoading && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950">
                        <div className="text-center text-white">
                          <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-white" />
                          <p className="text-sm">Loading video...</p>
                        </div>
                      </div>
                    )}
                    <iframe
                      src={`https://www.youtube.com/embed/${selectedVideoId}?rel=0&modestbranding=1&iv_load_policy=3&fs=1&cc_load_policy=0&disablekb=1&playsinline=1&autoplay=0&mute=0&controls=1&showinfo=0`}
                      title={activeLesson?.title || 'Course lesson'}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      frameBorder="0"
                      onLoad={() => setVideoLoading(false)}
                      onError={(event) => {
                        console.error('YouTube video failed to load:', event);
                        setVideoLoading(false);
                      }}
                    />
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-white">
                    <div className="text-center px-6">
                      <PlayCircle className="mx-auto mb-4 h-16 w-16 opacity-50" />
                      <p className="text-lg font-semibold">
                        {selectedVideoId ? 'Video unavailable' : 'No video linked yet'}
                      </p>
                      <p className="text-sm opacity-75">
                        {selectedVideoId
                          ? 'This video may be private, deleted, or not embeddable. Please contact the instructor.'
                          : 'Please check back later'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
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
              <button type="button" onClick={handleReview} className="primary-cta mt-4 px-5 py-3 text-sm">
                Publish Review
              </button>
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

        <aside className="space-y-6 xl:sticky xl:top-[9.5rem] xl:self-start">
          <article className="lms-panel p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Course Description</p>
            <p className="mt-4 text-sm leading-7 text-slate-600">{course.description}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.35rem] bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Trainer</p>
                <p className="mt-2 text-sm font-bold text-slate-950">{course.trainerName}</p>
              </div>
              <div className="rounded-[1.35rem] bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Duration</p>
                <p className="mt-2 text-sm font-bold text-slate-950">{course.duration}</p>
              </div>
              <div className="rounded-[1.35rem] bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Lessons</p>
                <p className="mt-2 text-sm font-bold text-slate-950">{courseLessons.length}</p>
              </div>
              <div className="rounded-[1.35rem] bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Students</p>
                <p className="mt-2 text-sm font-bold text-slate-950">{course.studentsCount.toLocaleString()}</p>
              </div>
            </div>
          </article>

          <article className="lms-panel p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Course Progress</p>
            <h3 className="mt-3 text-3xl font-black text-slate-950">{enrollment?.progress || 0}% complete</h3>
            <div className="mt-4 h-3 rounded-full bg-slate-100">
              <div className="h-3 rounded-full bg-gradient-to-r from-primary to-cyan-400" style={{ width: `${enrollment?.progress || 0}%` }} />
            </div>
            <p className="mt-3 text-sm text-slate-600">
              {completedLessonsCount} of {courseLessons.length} lessons completed
            </p>
            {(enrollment?.progress || 0) >= 100 ? (
              hasCourseExam(course) ? (
                <div className="mt-5 rounded-[1.25rem] border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-blue-700">Course learning completed</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Your final exam is now available in the examination portal. Pass above {course.exam?.passPercentage || 75}% to obtain certification.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/student/examinations')}
                    className="primary-cta mt-4 w-full px-5 py-3 text-sm"
                  >
                    Go to Examination Portal
                  </button>
                </div>
              ) : (
                <div className="mt-5 rounded-[1.25rem] border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                  Course learning is completed. Ask the trainer to add the final exam before certification becomes available.
                </div>
              )
            ) : null}
          </article>

          <article className="lms-panel p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Modules</p>
            <div className="mt-5 space-y-4">
              {courseModules.map((module) => {
                const lessonCount = module.lessons.length;
                const completedCount = module.lessons.filter((lesson) => completedSet.has(lesson.id)).length;

                return (
                  <div key={module.id} className="rounded-[1.4rem] border border-slate-200 bg-white p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-950">{module.title}</p>
                        <p className="text-xs text-slate-500">
                          {completedCount}/{lessonCount} lessons completed
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {lessonCount}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {module.lessons.map((lesson) => {
                        const completed = completedSet.has(lesson.id);
                        const active = activeLesson?.id === lesson.id;
                        const lessonIndex = courseLessons.findIndex((entry) => entry.id === lesson.id);

                        return (
                          <button
                            key={lesson.id}
                            type="button"
                            onClick={() => {
                              setActiveLesson(lesson);
                              const lessonUrl = lesson.youtubeUrl || lesson.videoUrl || '';
                              const videoId = getYouTubeId(lessonUrl);
                              const isValid = isValidYouTubeUrl(lessonUrl);
                              setSelectedVideoId(isValid ? videoId : '');
                              setVideoLoading(isValid);
                            }}
                            className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                              active ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
                            }`}
                          >
                            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${completed ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-slate-500'}`}>
                              {completed ? <CheckCircle2 className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900">{lesson.title}</p>
                              <p className="text-xs text-slate-500">
                                Lesson {lessonIndex + 1}
                                {lesson.duration ? ` • ${lesson.duration}` : ''}
                                {active ? ' • Playing' : ''}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        </aside>
      </div>
    </div>
  );
};

export default StudentCoursePlayerPage;
