import { BookOpen, CheckCircle2, PlayCircle, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { createCourse, getCourseById, updateCourse } from '@/services/database/lmsService';

interface LessonDraft {
  id: string;
  title: string;
  youtubeUrl: string;
}

interface CourseFormState {
  title: string;
  description: string;
  price: string;
  category: string;
  thumbnail: string;
}

const createEmptyLesson = (index: number): LessonDraft => ({
  id: `lesson-${Date.now()}-${index}`,
  title: '',
  youtubeUrl: '',
});

const getYouTubeId = (url: string): string => {
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
};

const TrainerCreateCoursePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { profile } = useRole();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [showBuilderModal, setShowBuilderModal] = useState(isEditMode);
  const [form, setForm] = useState<CourseFormState>({
    title: '',
    description: '',
    price: '0',
    category: 'General',
    thumbnail: '',
  });
  const [lessons, setLessons] = useState<LessonDraft[]>([createEmptyLesson(0)]);
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode) {
      setShowBuilderModal(true);
    }
  }, [isEditMode]);

  useEffect(() => {
    let mounted = true;

    const loadCourse = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const course = await getCourseById(id);
        if (!mounted) return;

        if (!course) {
          setSubmitError('Course not found.');
          setLoading(false);
          return;
        }

        setForm({
          title: course.title,
          description: course.description,
          price: String(course.price),
          category: course.category,
          thumbnail: course.thumbnail,
        });

        setLessons(
          course.lessons.length > 0
            ? course.lessons.map((lesson, index) => ({
                id: lesson.id || `lesson-${Date.now()}-${index}`,
                title: lesson.title,
                youtubeUrl: lesson.youtubeUrl || lesson.videoUrl || '',
              }))
            : [createEmptyLesson(0)],
        );
      } catch (loadError) {
        if (!mounted) return;
        setSubmitError(loadError instanceof Error ? loadError.message : 'Unable to load course details.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadCourse();

    return () => {
      mounted = false;
    };
  }, [id]);

  const validLessons = useMemo(
    () => lessons.filter((lesson) => lesson.title.trim() && lesson.youtubeUrl.trim()),
    [lessons],
  );

  const draftQuality = useMemo(() => {
    let score = 0;
    if (form.title.trim()) score += 1;
    if (form.description.trim()) score += 1;
    if (form.category.trim()) score += 1;
    if (Number(form.price || 0) >= 0) score += 1;
    if (validLessons.length > 0) score += 1;
    return Math.round((score / 5) * 100);
  }, [form.category, form.description, form.price, form.title, validLessons.length]);

  const previewThumb = form.thumbnail.trim() || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80';
  const previewLesson = validLessons[0] || null;
  const previewVideoId = previewLesson ? getYouTubeId(previewLesson.youtubeUrl) : '';

  const updateLesson = (lessonId: string, field: keyof LessonDraft, value: string) => {
    setLessons((current) => current.map((lesson) => (
      lesson.id === lessonId
        ? { ...lesson, [field]: value }
        : lesson
    )));
  };

  const addLesson = () => {
    setLessons((current) => [...current, createEmptyLesson(current.length)]);
  };

  const removeLesson = (lessonId: string) => {
    setLessons((current) => {
      const next = current.filter((lesson) => lesson.id !== lessonId);
      return next.length ? next : [createEmptyLesson(0)];
    });
  };

  const handleSubmit = async () => {
    if (!profile) return;
    setSubmitError(null);
    setShowDuplicatePopup(false);
    setSuccessToast(null);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category.trim() || 'General',
      thumbnail: form.thumbnail.trim() || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      price: Number(form.price || '0'),
      lessons: validLessons.map((lesson) => ({
        title: lesson.title.trim(),
        youtubeUrl: lesson.youtubeUrl.trim(),
      })),
      trainerId: profile.id,
    };

    if (!payload.title) {
      setSubmitError('Course title is required.');
      return;
    }

    if (payload.lessons.length === 0) {
      setSubmitError('Please add at least one lesson with title and YouTube URL.');
      return;
    }

    try {
      if (isEditMode && id) {
        await updateCourse(id, {
          title: payload.title,
          description: payload.description,
          category: payload.category,
          thumbnail: payload.thumbnail,
          price: payload.price,
          lessons: payload.lessons.map((lesson, index) => ({
            id: `lesson-${Date.now()}-${index}`,
            title: lesson.title,
            youtubeUrl: lesson.youtubeUrl,
            videoUrl: lesson.youtubeUrl,
          })),
        });
      } else {
        await createCourse(payload);
      }

      setSuccessToast(isEditMode ? 'Course updated and republished successfully' : 'Course created successfully');
      setShowBuilderModal(false);
      setTimeout(() => {
        navigate('/trainer/manage-courses');
      }, 800);
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'course/duplicate-title') {
        setShowDuplicatePopup(true);
        return;
      }

      if (error instanceof Error && 'code' in error && error.code === 'course/forbidden') {
        setSubmitError('You can edit or delete only the courses you created.');
        return;
      }

      setSubmitError(error instanceof Error ? error.message : 'Unable to save this course right now.');
    }
  };

  const closeBuilderModal = () => {
    if (isEditMode) {
      navigate('/trainer/manage-courses');
      return;
    }
    setShowBuilderModal(false);
  };

  if (loading) {
    return <div className="lms-panel p-6 text-corporate-muted">Loading course studio...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Course Studio</p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          {isEditMode ? 'Update your course content' : 'Create a new course blueprint'}
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
          Configure title, pricing, category, thumbnail, and lesson playlist in one focused builder experience.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Draft Quality</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{draftQuality}%</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Ready Lessons</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{validLessons.length}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Mode</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{isEditMode ? 'Edit' : 'Create'}</p>
          </article>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowBuilderModal(true)}
            className="primary-cta px-6 py-3 text-sm"
          >
            <Plus className="h-4 w-4" />
            {isEditMode ? 'Open Course Builder' : 'Start Building Course'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/trainer/manage-courses')}
            className="secondary-cta px-6 py-3 text-sm"
          >
            Back to Manage Courses
          </button>
        </div>
      </section>

      {showBuilderModal ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/50 px-4 pb-6 pt-10 backdrop-blur-sm">
          <div className="w-full max-w-7xl overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Course Studio</p>
                <h3 className="text-2xl font-black text-slate-950">{isEditMode ? 'Edit Course' : 'Create Course'}</h3>
              </div>
              <button
                type="button"
                onClick={closeBuilderModal}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
              >
                <X className="h-4 w-4" />
                Close
              </button>
            </div>

            <div className="max-h-[calc(100vh-7rem)] overflow-y-auto p-6 lg:p-8">
              <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
                <div className="space-y-6">
                  <section className="lms-panel p-6 lg:p-8">
                    <div className="mb-6">
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-corporate-accent">Step 1</p>
                      <h3 className="text-2xl font-black text-corporate-text">Course Information</h3>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      {[['Course Title', 'title', 'Corporate Finance Essentials'], ['Category', 'category', 'Finance'], ['Thumbnail URL', 'thumbnail', 'https://images.unsplash.com/...']].map(([label, field, placeholder]) => (
                        <label key={field} className="space-y-2">
                          <span className="text-sm font-semibold text-corporate-secondary">{label}</span>
                          <input
                            value={form[field as keyof CourseFormState]}
                            onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
                            placeholder={placeholder}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-corporate-text outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                          />
                        </label>
                      ))}

                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-corporate-secondary">Price</span>
                        <input
                          type="number"
                          min={0}
                          value={form.price}
                          onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-corporate-text outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                        />
                      </label>

                      <label className="space-y-2 lg:col-span-2">
                        <span className="text-sm font-semibold text-corporate-secondary">Description</span>
                        <textarea
                          value={form.description}
                          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                          rows={5}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-corporate-text outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                        />
                      </label>
                    </div>
                  </section>

                  <section className="lms-panel p-6 lg:p-8">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-corporate-accent">Step 2</p>
                        <h3 className="text-2xl font-black text-corporate-text">Lesson Playlist</h3>
                      </div>
                      <button type="button" onClick={addLesson} className="secondary-cta px-4 py-2.5 text-sm">
                        <Plus className="h-4 w-4" />
                        Add Lesson
                      </button>
                    </div>

                    <div className="space-y-3">
                      {lessons.map((lesson, index) => (
                        <div key={lesson.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <p className="inline-flex items-center gap-2 text-sm font-semibold text-corporate-text">
                              <BookOpen className="h-4 w-4 text-primary" />
                              Lesson {index + 1}
                            </p>
                            <button type="button" onClick={() => removeLesson(lesson.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-corporate-error hover:underline">
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </button>
                          </div>

                          <div className="grid gap-3 lg:grid-cols-2">
                            <input
                              value={lesson.title}
                              onChange={(event) => updateLesson(lesson.id, 'title', event.target.value)}
                              placeholder="Lesson title"
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-corporate-text outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                            />
                            <input
                              value={lesson.youtubeUrl}
                              onChange={(event) => updateLesson(lesson.id, 'youtubeUrl', event.target.value)}
                              placeholder="https://www.youtube.com/watch?v=..."
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-corporate-text outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <aside className="space-y-6">
                  <section className="sticky top-0 rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-corporate-accent">Step 3</p>
                    <h3 className="mt-2 text-2xl font-black text-corporate-text">Review & Publish</h3>
                    <p className="mt-2 text-sm text-slate-600">Validate your blueprint, then publish.</p>

                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Draft Quality</p>
                      <p className="mt-1 text-2xl font-black text-slate-900">{draftQuality}%</p>
                    </div>

                    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                      <img src={previewThumb} alt="Course thumbnail preview" className="h-36 w-full object-cover" />
                    </div>

                    <div className="mt-4 rounded-xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Course Title</p>
                      <p className="mt-1 line-clamp-2 font-bold text-slate-900">{form.title.trim() || 'Untitled Course'}</p>
                      <p className="mt-2 text-xs text-slate-500">{form.category.trim() || 'General'} • ₹{Number(form.price || 0)}</p>
                    </div>

                    <div className="mt-4 space-y-2">
                      {[
                        { label: 'Title', valid: Boolean(form.title.trim()) },
                        { label: 'Description', valid: Boolean(form.description.trim()) },
                        { label: 'At least 1 lesson', valid: validLessons.length > 0 },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className={`h-4 w-4 ${item.valid ? 'text-emerald-500' : 'text-slate-300'}`} />
                          <span className={item.valid ? 'text-slate-700' : 'text-slate-400'}>{item.label}</span>
                        </div>
                      ))}
                    </div>

                    {previewVideoId ? (
                      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                        <iframe
                          src={`https://www.youtube.com/embed/${previewVideoId}?rel=0&modestbranding=1&iv_load_policy=3&fs=1&cc_load_policy=0&disablekb=1&playsinline=1&autoplay=0&mute=0&controls=1&showinfo=0`}
                          title={previewLesson?.title || 'Lesson preview'}
                          className="h-44 w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          frameBorder="0"
                        />
                      </div>
                    ) : (
                      <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                        <PlayCircle className="h-4 w-4" />
                        Add a lesson URL to preview video.
                      </div>
                    )}

                    <button type="button" onClick={handleSubmit} className="primary-cta mt-5 w-full px-5 py-3 text-sm">
                      {isEditMode ? 'Republish Course' : 'Publish Course'}
                    </button>

                    {submitError ? (
                      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {submitError}
                      </div>
                    ) : null}
                  </section>
                </aside>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showDuplicatePopup ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white p-6 text-center shadow-2xl">
            <h3 className="text-2xl font-black text-slate-900">Course already exists</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              You already created a course with this title. Please use a different title to continue.
            </p>
            <button
              type="button"
              onClick={() => setShowDuplicatePopup(false)}
              className="primary-cta mt-5 px-5 py-3 text-sm"
            >
              Got it
            </button>
          </div>
        </div>
      ) : null}

      {successToast ? (
        <div className="fixed bottom-6 right-6 z-[60] rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 shadow-xl">
          {successToast}
        </div>
      ) : null}
    </div>
  );
};

export default TrainerCreateCoursePage;
