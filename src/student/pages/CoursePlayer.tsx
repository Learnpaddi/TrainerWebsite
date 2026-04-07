import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Loader2, PlayCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCourses } from '@/hooks/useCourses';
import { useEnrollments } from '@/hooks/useEnrollments';
import { markLessonComplete } from '@/services/firebase/progressService';
import { getStorageAssetUrl } from '@/services/firebase/storageService';

const CoursePlayer = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { courses, loading } = useCourses();
  const { progress, refetch } = useEnrollments();
  const [activeLessonId, setActiveLessonId] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  const course = courses.find((item) => item.id === id);
  const lessons = useMemo(
    () => (course?.modules || []).flatMap((module) => module.lessons || []),
    [course],
  );

  const progressForCourse = id ? progress[id] : undefined;
  const completed = new Set(progressForCourse?.completedLessons || []);
  const activeLesson = lessons.find((lesson) => lesson.id === activeLessonId) || lessons[0];

  useEffect(() => {
    const resolveVideo = async () => {
      if (!activeLesson) {
        setVideoSrc(null);
        return;
      }
      if (activeLesson.videoUrl) {
        setVideoSrc(activeLesson.videoUrl);
        return;
      }
      const storageUrl = await getStorageAssetUrl(activeLesson.videoPath);
      setVideoSrc(storageUrl);
    };
    resolveVideo();
  }, [activeLesson]);

  const onComplete = async (lessonId: string) => {
    if (!user || !course) return;
    setSaving(true);
    try {
      await markLessonComplete(user.uid, course, lessonId);
      await refetch();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="section-shell p-10 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary mr-3" />
        <span className="text-gray-700 font-medium">Loading course...</span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="section-shell p-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Course not found</h1>
        <Link to="/courses" className="primary-cta px-6 py-3">Back to courses</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 lg:py-14">
      <section className="section-shell p-8 md:p-10 mb-8">
        <p className="text-sm uppercase tracking-[0.2em] text-primary font-semibold mb-2">Course Player</p>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">{course.title}</h1>
        <p className="text-muted mb-5">{course.description}</p>
        <div className="w-full bg-gray-200/80 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 bg-gradient-to-r from-emerald-500 to-teal-600 transition-all"
            style={{ width: `${progressForCourse?.percentage || 0}%` }}
          />
        </div>
        <p className="text-sm mt-2 text-gray-700 font-medium">
          Progress: {progressForCourse?.percentage || 0}% ({completed.size}/{lessons.length || 0} lessons)
        </p>
      </section>

      <div className="grid lg:grid-cols-[1.35fr_1fr] gap-8">
        <article className="metric-card p-8">
          {videoSrc ? (
            <video
              className="aspect-video w-full rounded-3xl bg-black mb-6"
              src={videoSrc}
              controls
              preload="metadata"
            />
          ) : (
            <div className="aspect-video rounded-3xl bg-gradient-to-br from-gray-900 to-slate-800 mb-6 p-6 text-white flex flex-col justify-end">
              <p className="text-xs uppercase tracking-[0.2em] text-white/70 mb-2">Now Playing</p>
              <h2 className="text-2xl font-bold">{activeLesson?.title || 'Select a lesson'}</h2>
              <p className="text-sm text-white/80 mt-1">{activeLesson?.duration || 'Lesson video'}</p>
            </div>
          )}
          <button
            disabled={!activeLesson || saving}
            onClick={() => activeLesson && onComplete(activeLesson.id)}
            className="primary-cta px-6 py-3"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Mark Lesson Complete
          </button>
        </article>

        <aside className="metric-card p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Lessons</h3>
          <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
            {lessons.map((lesson, index) => {
              const done = completed.has(lesson.id);
              const active = activeLesson?.id === lesson.id;
              return (
                <button
                  key={lesson.id}
                  onClick={() => setActiveLessonId(lesson.id)}
                  className={`w-full text-left rounded-2xl p-4 border transition ${
                    active ? 'border-primary bg-primary/10' : 'border-gray-200 bg-white/80 hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {done ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <PlayCircle className="w-5 h-5 text-primary shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">Lesson {index + 1}: {lesson.title}</p>
                      <p className="text-xs text-gray-500">{lesson.duration || 'Video lesson'}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CoursePlayer;
