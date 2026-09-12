const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
      index: true,
    },
    language: {
      type: String,
      default: 'cpp',
      enum: ['cpp'],
    },
    code: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        'ACCEPTED',
        'WRONG_ANSWER',
        'COMPILATION_ERROR',
        'RUNTIME_ERROR',
        'TIME_LIMIT_EXCEEDED',
        'MEMORY_LIMIT_EXCEEDED',
        'INTERNAL_ERROR',
      ],
      default: 'ACCEPTED',
    },
    passedTests: {
      type: Number,
      default: 0,
    },
    totalTests: {
      type: Number,
      default: 0,
    },
    runtimeMs: {
      type: Number,
      default: 0,
    },
    memoryKb: {
      type: Number,
      default: 0,
    },
    compileOutput: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes specified in Blueprint Section 10.5
submissionSchema.index({ userId: 1, createdAt: -1 });
submissionSchema.index({ problemId: 1, userId: 1, createdAt: -1 });

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;
