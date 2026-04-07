import { useMemo, useState } from 'react';
import { Loader2, Plus, Trash2, Upload, Video, BookOpen } from 'lucide-react';
import { useTrainerCourses } from '@/hooks/useTrainerCourses';
import { useAuth } from '@/hooks/useAuth';
import {
  createCourse,
  deleteCourse,
  type Course,
  type CourseLesson,
  type CourseModule,
  updateCourse,
} from '@/services/firebase/courseService';
import { uploadCourseAsset } from '@/services/firebase/storageService';

interface EditableLesson extends CourseLesson {
  file?: File | null;
}

interface EditableModule extends Omit<CourseModule, 'lessons'> {
  lessons: EditableLesson[];
}

interface CourseForm {
  title: string;
  description: string;
  price: number;
  duration: string;
  thumbnail: string;
  thumbnailFile?: File | null;
  modules: EditableModule[];
}

const createEmptyLesson = (): EditableLesson => ({
  id: `lesson_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  title: '',
  duration: '',
  file: null,
});

const createEmptyModule = (): EditableModule => ({
  id: `module_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  title: '',
  lessons: [createEmptyLesson()],
});

const emptyForm = (): CourseForm => ({
  title: '',
  description: '',
  price: 0,
  duration: '4 weeks',
  thumbnail: '',
  thumbnailFile: null,
  modules: [createEmptyModule()],
});

const fromCourseToForm = (course: Course): CourseForm => ({
  title: course.title || '',
  description: course.description || '',
  price: Number(course.price || 0),
  duration: course.duration || '4 weeks',
  thumbnail: course.thumbnail || '',
  thumbnailFile: null,
  modules: (course.modules || []).map((module) => ({
    id: module.id,
    title: module.title,
    lessons: (module.lessons || []).map((lesson) => ({
      ...lesson,
      file: null,
    })),
  })),
});

const CoursesPage = () => {
  const { user } = useAuth();
  const { courses, loading, refetch } = useTrainerCourses();

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [form, setForm] = useState<CourseForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>('');

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) || null,
    [courses, selectedCourseId],
  );

  const trainerId = user?.doc?.trainerId || user?.uid || '';

  const selectCourse = (course: Course | null) => {
    if (!course) {
      setSelectedCourseId(null);
      setForm(emptyForm());
      setMessage('');
      return;
    }
    setSelectedCourseId(course.id);
    setForm(fromCourseToForm(course));
    setMessage('');
  };

  const setModuleField = (moduleIndex: number, key: keyof EditableModule, value: string) => {
    setForm((prev) => {
      const modules = [...prev.modules];
      modules[moduleIndex] = { ...modules[moduleIndex], [key]: value };
      return { ...prev, modules };
    });
  };

  const setLessonField = (
    moduleIndex: number,
    lessonIndex: number,
    key: keyof EditableLesson,
    value: string | File | null,
  ) => {
    setForm((prev) => {
      const modules = [...prev.modules];
      const lessons = [...modules[moduleIndex].lessons];
      lessons[lessonIndex] = { ...lessons[lessonIndex], [key]: value };
      modules[moduleIndex] = { ...modules[moduleIndex], lessons };
      return { ...prev, modules };
    });
  };

  const addModule = () => {
    setForm((prev) => ({ ...prev, modules: [...prev.modules, createEmptyModule()] }));
  };

  const removeModule = (moduleIndex: number) => {
    setForm((prev) => {
      const modules = prev.modules.filter((_, idx) => idx !== moduleIndex);
      return { ...prev, modules: modules.length ? modules : [createEmptyModule()] };
    });
  };

  const addLesson = (moduleIndex: number) => {
    setForm((prev) => {
      const modules = [...prev.modules];
      modules[moduleIndex] = {
        ...modules[moduleIndex],
        lessons: [...modules[moduleIndex].lessons, createEmptyLesson()],
      };
      return { ...prev, modules };
    });
  };

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    setForm((prev) => {
      const modules = [...prev.modules];
      const nextLessons = modules[moduleIndex].lessons.filter((_, idx) => idx !== lessonIndex);
      modules[moduleIndex] = {
        ...modules[moduleIndex],
        lessons: nextLessons.length ? nextLessons : [createEmptyLesson()],
      };
      return { ...prev, modules };
    });
  };

  const buildModulesPayload = async (courseIdOrDraft: string): Promise<CourseModule[]> => {
    const payload: CourseModule[] = [];

    for (const module of form.modules) {
      const lessons: CourseLesson[] = [];
      for (const lesson of module.lessons) {
        let videoUrl = lesson.videoUrl;
        let videoPath = lesson.videoPath;

        if (lesson.file) {
          const path = `courses/${trainerId}/${courseIdOrDraft}/videos/${module.id}_${lesson.id}_${Date.now()}`;
          videoUrl = await uploadCourseAsset(path, lesson.file);
          videoPath = path;
        }

        lessons.push({
          id: lesson.id,
          title: lesson.title || 'Untitled Lesson',
          duration: lesson.duration || '10 min',
          videoUrl,
          videoPath,
        });
      }

      payload.push({
        id: module.id,
        title: module.title || 'Untitled Module',
        lessons,
      });
    }

    return payload;
  };

  const onSave = async () => {
    if (!trainerId) return;
    setSaving(true);
    setMessage('');
    try {
      const draftId = selectedCourseId || `draft_${Date.now()}`;
      const modules = await buildModulesPayload(draftId);

      let thumbnail = form.thumbnail;
      if (form.thumbnailFile) {
        const thumbPath = `courses/${trainerId}/${draftId}/thumbnail_${Date.now()}`;
        thumbnail = await uploadCourseAsset(thumbPath, form.thumbnailFile);
      }

      const payload = {
        title: form.title,
        description: form.description,
        price: Number(form.price || 0),
        duration: form.duration,
        thumbnail,
        trainerId,
        modules,
      };

      if (selectedCourseId) {
        await updateCourse(selectedCourseId, payload);
        setMessage('Course updated successfully.');
      } else {
        const createdId = await createCourse(payload as Omit<Course, 'id' | 'createdAt'>);
        setSelectedCourseId(createdId);
        setMessage('Course created successfully.');
      }

      await refetch();
    } catch (error) {
      console.error(error);
      setMessage('Failed to save course.');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!selectedCourseId) return;
    if (!confirm('Delete this course and all associated lessons?')) return;
    setSaving(true);
    try {
      await deleteCourse(selectedCourseId);
      selectCourse(null);
      await refetch();
      setMessage('Course deleted.');
    } catch (error) {
      console.error(error);
      setMessage('Failed to delete course.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="section-shell p-10 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary mr-3" />
        <span className="font-medium text-gray-700">Loading trainer courses...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
      <div className="grid lg:grid-cols-[320px_1fr] gap-8">
        <aside className="metric-card p-5 h-fit lg:sticky lg:top-24">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Your Courses</h2>
            <button
              onClick={() => selectCourse(null)}
              className="secondary-cta px-3 py-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              New
            </button>
          </div>
          <div className="space-y-2 max-h-[520px] overflow-auto pr-1">
            {courses.map((course) => {
              const active = selectedCourseId === course.id;
              return (
                <button
                  key={course.id}
                  onClick={() => selectCourse(course)}
                  className={`w-full text-left rounded-2xl px-4 py-3 border transition ${
                    active ? 'bg-primary/10 border-primary/40' : 'bg-white/80 border-gray-200 hover:border-primary/30'
                  }`}
                >
                  <p className="font-semibold text-gray-900 line-clamp-1">{course.title}</p>
                  <p className="text-xs text-gray-500 mt-1">₹{course.price || 0} • {(course.modules || []).length} modules</p>
                </button>
              );
            })}
            {courses.length === 0 && <p className="text-sm text-gray-500">No courses yet. Create your first course.</p>}
          </div>
        </aside>

        <section className="metric-card p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-primary font-semibold mb-2">Course CMS</p>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900">
                {selectedCourse ? 'Edit Course' : 'Create Course'}
              </h1>
            </div>
            <div className="flex gap-3">
              {selectedCourse && (
                <button onClick={onDelete} disabled={saving} className="secondary-cta px-4 py-3 text-red-600">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
              <button onClick={onSave} disabled={saving} className="primary-cta px-6 py-3">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Save Course
              </button>
            </div>
          </div>

          {message && <div className="mb-5 rounded-2xl bg-blue-50 border border-blue-100 p-4 text-blue-800">{message}</div>}

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-4 py-3"
                placeholder="React for Beginners"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Duration</label>
              <input
                value={form.duration}
                onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-4 py-3"
                placeholder="6 weeks"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Price (INR)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value || 0) }))}
                className="w-full rounded-xl border border-gray-200 px-4 py-3"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Thumbnail Upload</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setForm((prev) => ({ ...prev, thumbnailFile: e.target.files?.[0] || null }))}
                className="w-full rounded-xl border border-gray-200 px-4 py-3"
              />
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full rounded-xl border border-gray-200 px-4 py-3"
              placeholder="What will students learn from this course?"
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Modules & Lessons</h2>
              <button onClick={addModule} className="secondary-cta px-4 py-2 text-sm">
                <Plus className="w-4 h-4" />
                Add Module
              </button>
            </div>

            {form.modules.map((module, moduleIndex) => (
              <div key={module.id} className="rounded-2xl border border-gray-200 p-5 bg-white/80">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <input
                    value={module.title}
                    onChange={(e) => setModuleField(moduleIndex, 'title', e.target.value)}
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-2"
                    placeholder={`Module ${moduleIndex + 1} title`}
                  />
                  <button onClick={() => removeModule(moduleIndex)} className="secondary-cta px-3 py-2 text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  {module.lessons.map((lesson, lessonIndex) => (
                    <div key={lesson.id} className="rounded-xl border border-gray-200 p-4 bg-slate-50/70">
                      <div className="grid md:grid-cols-[1fr_150px_1fr_auto] gap-3 items-center">
                        <input
                          value={lesson.title}
                          onChange={(e) => setLessonField(moduleIndex, lessonIndex, 'title', e.target.value)}
                          className="rounded-lg border border-gray-200 px-3 py-2"
                          placeholder={`Lesson ${lessonIndex + 1} title`}
                        />
                        <input
                          value={lesson.duration || ''}
                          onChange={(e) => setLessonField(moduleIndex, lessonIndex, 'duration', e.target.value)}
                          className="rounded-lg border border-gray-200 px-3 py-2"
                          placeholder="15 min"
                        />
                        <label className="rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-600 flex items-center gap-2 cursor-pointer hover:border-primary/50 bg-white">
                          <Video className="w-4 h-4" />
                          {lesson.file ? lesson.file.name : lesson.videoUrl ? 'Replace Video' : 'Upload Video'}
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => setLessonField(moduleIndex, lessonIndex, 'file', e.target.files?.[0] || null)}
                          />
                        </label>
                        <button
                          onClick={() => removeLesson(moduleIndex, lessonIndex)}
                          className="secondary-cta px-3 py-2 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={() => addLesson(moduleIndex)} className="secondary-cta mt-4 px-4 py-2 text-sm">
                  <Plus className="w-4 h-4" />
                  Add Lesson
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CoursesPage;
