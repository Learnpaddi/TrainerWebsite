import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { createCourse, type CourseModuleRecord } from '@/services/firebase/lmsService';

const createEmptyLesson = (index: number) => ({
  id: `lesson-${Date.now()}-${index}`,
  title: '',
  duration: '',
  videoUrl: '',
  summary: '',
});

const createEmptyModule = (index: number): CourseModuleRecord => ({
  id: `module-${Date.now()}-${index}`,
  title: '',
  lessons: [createEmptyLesson(index)],
});

interface CourseFormState {
  title: string;
  description: string;
  price: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  thumbnail: string;
  duration: string;
}

const TrainerCreateCoursePage = () => {
  const navigate = useNavigate();
  const { profile } = useRole();
  const [form, setForm] = useState<CourseFormState>({
    title: '',
    description: '',
    price: '0',
    category: 'General',
    level: 'Beginner',
    thumbnail: '',
    duration: '',
  });
  const [modules, setModules] = useState<CourseModuleRecord[]>([createEmptyModule(0)]);

  const updateModule = (moduleId: string, next: Partial<CourseModuleRecord>) => {
    setModules((current) => current.map((module) => module.id === moduleId ? { ...module, ...next } : module));
  };

  const updateLesson = (moduleId: string, lessonId: string, field: string, value: string) => {
    setModules((current) => current.map((module) => {
      if (module.id !== moduleId) return module;
      return {
        ...module,
        lessons: module.lessons.map((lesson) => lesson.id === lessonId ? { ...lesson, [field]: value } : lesson),
      };
    }));
  };

  const addLesson = (moduleId: string) => {
    setModules((current) => current.map((module) => (
      module.id === moduleId
        ? { ...module, lessons: [...module.lessons, createEmptyLesson(module.lessons.length)] }
        : module
    )));
  };

  const handleSubmit = async () => {
    if (!profile) return;

    await createCourse({
      title: form.title,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      level: form.level,
      thumbnail: form.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      trainerId: profile.id,
      trainerName: profile.name,
      duration: form.duration || 'Self-paced',
      modules,
    });

    navigate('/trainer/manage-courses');
  };

  return (
    <div className="space-y-8">
      <section className="lms-panel p-6 lg:p-8">
        <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Course Creation System</p>
            <h2 className="text-3xl font-black text-slate-950">Build a modular video course</h2>
          </div>
          <button type="button" onClick={handleSubmit} className="primary-cta px-5 py-3 text-sm">Publish Course</button>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {[
            ['Course Title', 'title', 'Analytics & ROI Masterclass'],
            ['Category', 'category', 'Analytics'],
            ['Thumbnail URL', 'thumbnail', 'https://images.unsplash.com/...'],
            ['Estimated Duration', 'duration', '6h 30m'],
          ].map(([label, field, placeholder]) => (
            <label key={field}>
              <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
              <input
                value={form[field as keyof typeof form]}
                onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
                placeholder={placeholder}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              />
            </label>
          ))}
          <label>
            <span className="mb-2 block text-sm font-semibold text-slate-700">Price</span>
            <input
              type="number"
              value={form.price}
              onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-slate-700">Level</span>
            <select
              value={form.level}
              onChange={(event) => setForm((current) => ({ ...current, level: event.target.value as 'Beginner' | 'Intermediate' | 'Advanced' }))}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </label>
          <label className="lg:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Description</span>
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              rows={5}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
          </label>
        </div>
      </section>

      <section className="space-y-5">
        {modules.map((module, moduleIndex) => (
          <article key={module.id} className="lms-panel p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Module {moduleIndex + 1}</p>
                <input
                  value={module.title}
                  onChange={(event) => updateModule(module.id, { title: event.target.value })}
                  placeholder="Module title"
                  className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-2xl font-black text-slate-950 shadow-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
              </div>
              <button
                type="button"
                onClick={() => setModules((current) => current.filter((item) => item.id !== module.id))}
                className="secondary-cta px-4 py-3 text-sm"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            </div>

            <div className="space-y-4">
              {module.lessons.map((lesson, lessonIndex) => (
                <div key={lesson.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                  <p className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Lesson {lessonIndex + 1}</p>
                  <div className="grid gap-4 lg:grid-cols-2">
                    {[
                      ['title', 'Lesson title'],
                      ['duration', '12 min'],
                      ['videoUrl', 'https://www.youtube.com/embed/...'],
                      ['summary', 'Lesson summary'],
                    ].map(([field, placeholder]) => (
                      <input
                        key={field}
                        value={lesson[field as keyof typeof lesson]}
                        onChange={(event) => updateLesson(module.id, lesson.id, field, event.target.value)}
                        placeholder={placeholder}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button type="button" onClick={() => addLesson(module.id)} className="secondary-cta mt-5 px-5 py-3 text-sm">
              <Plus className="h-4 w-4" />
              Add Lesson
            </button>
          </article>
        ))}

        <button type="button" onClick={() => setModules((current) => [...current, createEmptyModule(current.length)])} className="primary-cta px-5 py-3 text-sm">
          <Plus className="h-4 w-4" />
          Add Module
        </button>
      </section>
    </div>
  );
};

export default TrainerCreateCoursePage;
