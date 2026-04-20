import mongoose from 'mongoose';

const examResultSchema = new mongoose.Schema(
  {
    score: { type: Number, min: 0, max: 100 },
    correctAnswers: { type: Number, min: 0 },
    totalQuestions: { type: Number, min: 0 },
    passed: { type: Boolean, default: false },
    attemptedAt: { type: Date },
  },
  { _id: false },
);

const enrollmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    paymentStatus: {
      type: String,
      enum: ['not_required', 'pending', 'success', 'failed'],
      default: 'not_required',
    },
    paymentOrderId: {
      type: String,
      default: '',
    },
    paymentId: {
      type: String,
      default: '',
    },
    paymentSignature: {
      type: String,
      default: '',
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    examResult: {
      type: examResultSchema,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
