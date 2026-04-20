import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    duration: { type: String, default: '' },
  },
  { _id: false },
);

const questionSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true, trim: true },
    options: {
      type: [String],
      validate: {
        validator: (value) => Array.isArray(value) && value.length >= 2,
        message: 'Each exam question needs at least two options.',
      },
    },
    correctOption: { type: Number, required: true, min: 0 },
  },
  { _id: true },
);

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    timeLimitMinutes: { type: Number, default: 15, min: 1 },
    passingScore: { type: Number, default: 70, min: 1, max: 100 },
    questions: {
      type: [questionSchema],
      default: [],
    },
  },
  { _id: false },
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    examAvailable: { type: Boolean, default: false },
    lessons: {
      type: [lessonSchema],
      default: [],
    },
    exam: {
      type: examSchema,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export const Course = mongoose.model('Course', courseSchema);
