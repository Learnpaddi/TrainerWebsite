import { BarChart3, ClipboardList, PencilLine, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { deleteCourse, getCourseInsights, getTrainerCourses, type CourseRecord } from '@/services/firebase/lmsService';
import { updateCourse } from '@/services/firebase/lmsService';
import type { CourseExamQuestion } from '@/services/firebase/types';

interface CourseInsightState {
  totalEnrollments: number;
  averageProgress: number;
  averageRating: number;
  reviewCount: number;
}

interface ExamDraftQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

const createEmptyQuestion = (index: number): ExamDraftQuestion => ({
  id: `question-${Date.now()}-${index}`,
  question: '',
  options: ['', '', '', ''],
  correctAnswer: '',
});

const TrainerManageCoursesPage = () => {
  const navigate = useNavigate();
  const { profile } = useRole();
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [insights, setInsights] = useState<Record<string, CourseInsightState>>({});
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [examModalCourseId, setExamModalCourseId] = useState<string | null>(null);
  const [examTitle, setExamTitle] = useState('');
  const [examPassPercentage, setExamPassPercentage] = useState('75');
  const [examQuestions, setExamQuestions] = useState<ExamDraftQuestion[]>([createEmptyQuestion(0)]);
  const [savingExam, setSavingExam] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!profile) return;
      setLoading(true);
      setActionError(null);
      try {
        const trainerCourses = await getTrainerCourses(profile.id);
        const insightEntries = await Promise.all(
          trainerCourses.map(async (course) => [course.id, await getCourseInsights(course.id)] as const),
        );

        if (!mounted) return;
        setCourses(trainerCourses);
        setInsights(Object.fromEntries(insightEntries));
      } catch (error) {
        if (!mounted) return;
        setActionError(error instanceof Error ? error.message : 'Unable to load trainer courses right now.');
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
  }, [profile]);

  const handleDeleteCourse = async (courseId: string) => {
    setActionError(null);
    try {
      await deleteCourse(courseId);
      setCourses((current) => current.filter((course) => course.id !== courseId));
      setInsights((current) => {
        const next = { ...current };
        delete next[courseId];
        return next;
      });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to delete this course.');
    }
  };

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === examModalCourseId) || null,
    [courses, examModalCourseId],
  );

  const openExamModal = (course: CourseRecord) => {
    setActionError(null);
    setExamModalCourseId(course.id);
    setExamTitle(course.exam?.title || `${course.title} Examination`);
    setExamPassPercentage(String(course.exam?.passPercentage || 75));
    setExamQuestions(
      course.exam?.questions?.length
        ? course.exam.questions.map((question, index) => ({
            id: question.id || `question-${Date.now()}-${index}`,
            question: question.question,
            options: [...question.options, '', '', '', ''].slice(0, 4),
            correctAnswer: question.correctAnswer,
          }))
        : [createEmptyQuestion(0)],
    );
  };

  const closeExamModal = () => {
    if (savingExam) return;
    setExamModalCourseId(null);
    setExamTitle('');
    setExamPassPercentage('75');
    setExamQuestions([createEmptyQuestion(0)]);
  };

  const updateQuestion = (questionId: string, field: 'question' | 'correctAnswer', value: string) => {
    setExamQuestions((current) => current.map((question) => (
      question.id === questionId ? { ...question, [field]: value } : question
    )));
  };

  const updateQuestionOption = (questionId: string, optionIndex: number, value: string) => {
    setExamQuestions((current) => current.map((question) => {
      if (question.id !== questionId) return question;
      const nextOptions = question.options.map((option, index) => (index === optionIndex ? value : option));
      const nextCorrectAnswer = question.correctAnswer === question.options[optionIndex] ? value : question.correctAnswer;
      return {
        ...question,
        options: nextOptions,
        correctAnswer: nextCorrectAnswer,
      };
    }));
  };

  const addQuestion = () => {
    setExamQuestions((current) => [...current, createEmptyQuestion(current.length)]);
  };

  const removeQuestion = (questionId: string) => {
    setExamQuestions((current) => {
      const next = current.filter((question) => question.id !== questionId);
      return next.length ? next : [createEmptyQuestion(0)];
    });
  };

  const handleSaveExam = async () => {
    if (!selectedCourse) return;
    setActionError(null);

    const normalizedQuestions: CourseExamQuestion[] = examQuestions.map((question, index) => ({
      id: question.id || `question-${Date.now()}-${index}`,
      question: question.question.trim(),
      options: question.options.map((option) => option.trim()).filter(Boolean),
      correctAnswer: question.correctAnswer.trim(),
    }));

    if (!examTitle.trim()) {
      setActionError('Exam title is required.');
      return;
    }

    if (!normalizedQuestions.length || normalizedQuestions.some((question) => !question.question)) {
      setActionError('Each exam question needs a question prompt.');
      return;
    }

    if (normalizedQuestions.some((question) => question.options.length < 2)) {
      setActionError('Each exam question needs at least two answer options.');
      return;
    }

    if (normalizedQuestions.some((question) => !question.correctAnswer || !question.options.includes(question.correctAnswer))) {
      setActionError('Select a valid correct answer for every question.');
      return;
    }

    setSavingExam(true);
    try {
      const exam = {
        title: examTitle.trim(),
        passPercentage: Math.max(1, Math.min(100, Number(examPassPercentage || '75'))),
        questions: normalizedQuestions,
      };

      await updateCourse(selectedCourse.id, { exam });
      setCourses((current) => current.map((course) => (
        course.id === selectedCourse.id ? { ...course, exam } : course
      )));
      closeExamModal();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to save exam right now.');
    } finally {
      setSavingExam(false);
    }
  };

  return (
    <div className="space-y-6">
      {actionError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {actionError}
        </div>
      ) : null}

      {loading ? (
        <div className="lms-panel p-6 text-sm font-medium text-slate-600">Loading your courses...</div>
      ) : null}

      {!loading && courses.length === 0 ? (
        <div className="lms-panel p-8 text-center">
          <h2 className="text-2xl font-black text-slate-900">No courses created yet</h2>
          <p className="mt-2 text-sm text-slate-600">Create your first course to start building your trainer catalog.</p>
        </div>
      ) : null}

      {courses.map((course) => {
        const courseInsight = insights[course.id];

        return (
          <article key={course.id} className="lms-panel p-6 lg:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex flex-col gap-5 lg:flex-row">
                <img src={course.thumbnail} alt={course.title} className="h-44 w-full rounded-[1.5rem] object-cover lg:w-64" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{course.category}</p>
                  <h2 className="mt-2 text-3xl font-black text-slate-950">{course.title}</h2>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{course.description}</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600">{course.lessons.length} lessons</span>
                    <span className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-600">₹{course.price}</span>
                    <span className="rounded-full bg-blue-50 px-3 py-2 text-sm font-semibold text-primary">{course.level}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => navigate(`/trainer/edit-course/${course.id}`)} className="secondary-cta px-4 py-3 text-sm">
                  <PencilLine className="h-4 w-4" />
                  Edit Course
                </button>
                <button type="button" onClick={() => handleDeleteCourse(course.id)} className="secondary-cta px-4 py-3 text-sm text-corporate-error">
                  <Trash2 className="h-4 w-4" />
                  Delete Course
                </button>
                <button type="button" onClick={() => navigate('/analytics')} className="primary-cta px-4 py-3 text-sm">
                  <BarChart3 className="h-4 w-4" />
                  View Analytics
                </button>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-200 pt-5">
              <button type="button" onClick={() => openExamModal(course)} className="secondary-cta px-4 py-3 text-sm">
                <ClipboardList className="h-4 w-4" />
                {course.exam?.questions?.length ? 'Edit Exam/Test' : 'Add Exam/Test'}
              </button>
              <p className="mt-3 text-sm text-slate-500">
                {course.exam?.questions?.length
                  ? `${course.exam.questions.length} questions configured • Pass mark ${course.exam.passPercentage}%`
                  : 'Create the final assessment students must pass before certification.'}
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {[
                ['Enrollments', courseInsight?.totalEnrollments || 0],
                ['Avg Progress', `${courseInsight?.averageProgress || 0}%`],
                ['Avg Rating', courseInsight?.averageRating || 0],
                ['Reviews', courseInsight?.reviewCount || 0],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
                  <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
                </div>
              ))}
            </div>
          </article>
        );
      })}

      {selectedCourse ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/50 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-[1.75rem] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Assessment Builder</p>
                <h2 className="text-2xl font-black text-slate-950">{selectedCourse.title}</h2>
              </div>
              <button type="button" onClick={closeExamModal} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600">
                <X className="h-4 w-4" />
                Close
              </button>
            </div>

            <div className="max-h-[80vh] overflow-y-auto px-6 py-6">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Exam Title</span>
                  <input
                    value={examTitle}
                    onChange={(event) => setExamTitle(event.target.value)}
                    placeholder="Course Final Examination"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Pass Percentage</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={examPassPercentage}
                    onChange={(event) => setExamPassPercentage(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </div>

              <div className="mt-6 space-y-5">
                {examQuestions.map((question, questionIndex) => (
                  <article key={question.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-black text-slate-900">Question {questionIndex + 1}</h3>
                      <button type="button" onClick={() => removeQuestion(question.id)} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600">
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>

                    <label className="mt-4 block space-y-2">
                      <span className="text-sm font-semibold text-slate-700">Question</span>
                      <textarea
                        value={question.question}
                        onChange={(event) => updateQuestion(question.id, 'question', event.target.value)}
                        rows={3}
                        placeholder="Write the exam question"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {question.options.map((option, optionIndex) => (
                        <label key={`${question.id}-option-${optionIndex}`} className="space-y-2">
                          <span className="text-sm font-semibold text-slate-700">Option {optionIndex + 1}</span>
                          <input
                            value={option}
                            onChange={(event) => updateQuestionOption(question.id, optionIndex, event.target.value)}
                            placeholder={`Optional answer ${optionIndex + 1}`}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                          />
                        </label>
                      ))}
                    </div>

                    <label className="mt-4 block space-y-2">
                      <span className="text-sm font-semibold text-slate-700">Correct Answer</span>
                      <select
                        value={question.correctAnswer}
                        onChange={(event) => updateQuestion(question.id, 'correctAnswer', event.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">Select the correct answer</option>
                        {question.options.map((option, optionIndex) => (
                          <option key={`${question.id}-correct-${optionIndex}`} value={option.trim()}>
                            {option.trim() || `Option ${optionIndex + 1}`}
                          </option>
                        ))}
                      </select>
                    </label>
                  </article>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" onClick={addQuestion} className="secondary-cta px-4 py-3 text-sm">
                  <Plus className="h-4 w-4" />
                  Add Question
                </button>
                <button type="button" onClick={handleSaveExam} disabled={savingExam} className="primary-cta px-4 py-3 text-sm disabled:opacity-70">
                  <ClipboardList className="h-4 w-4" />
                  {savingExam ? 'Saving...' : 'Save Exam/Test'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default TrainerManageCoursesPage;
