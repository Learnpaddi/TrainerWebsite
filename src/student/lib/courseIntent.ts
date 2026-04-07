const PENDING_COURSE_KEY = 'learnpaddi.pendingCourseId';

export const storePendingCourseIntent = (courseId: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(PENDING_COURSE_KEY, courseId);
};

export const readPendingCourseIntent = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.sessionStorage.getItem(PENDING_COURSE_KEY);
};

export const clearPendingCourseIntent = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(PENDING_COURSE_KEY);
};

export const consumePendingCourseIntent = (): string | null => {
  const courseId = readPendingCourseIntent();
  if (courseId) {
    clearPendingCourseIntent();
  }
  return courseId;
};
