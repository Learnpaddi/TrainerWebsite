export function canAccessExam(course, enrollment) {
  if (!course?.examAvailable) {
    return {
      allowed: false,
      reason: 'exam_not_available',
      message: 'This course does not have an exam yet.',
    };
  }

  if (!enrollment) {
    return {
      allowed: false,
      reason: 'not_enrolled',
      message: 'Enroll in the course to continue.',
    };
  }

  if (!enrollment.completed) {
    return {
      allowed: false,
      reason: 'course_incomplete',
      message: 'Complete course to unlock exam.',
    };
  }

  if (course.price > 0 && enrollment.paymentStatus !== 'success') {
    return {
      allowed: false,
      reason: 'payment_required',
      message: 'Payment required to access exam.',
    };
  }

  return {
    allowed: true,
    reason: 'allowed',
    message: 'Exam access granted.',
  };
}
