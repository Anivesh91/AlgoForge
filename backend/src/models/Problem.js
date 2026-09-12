const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Problem title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Problem description is required'],
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    topic: {
      type: String,
      default: 'General DSA',
    },
    tags: {
      type: [String],
      default: [],
    },
    userPrompt: {
      type: String,
      default: '',
    },
    reference: {
      type: {
        type: String,
        enum: ['text', 'image', 'pdf', null],
        default: null,
      },
      url: String,
      originalName: String,
      mimeType: String,
    },
    functionSpec: {
      name: {
        type: String,
        required: true,
      },
      returnType: {
        type: String,
        required: true,
      },
      parameters: [
        {
          name: { type: String, required: true },
          type: { type: String, required: true },
        },
      ],
    },
    starterCode: {
      type: String,
      required: true,
    },
    supportCode: {
      type: String,
      default: '',
    },
    constraints: {
      type: [String],
      default: [],
    },
    examples: [
      {
        inputDisplay: { type: String, required: true },
        outputDisplay: { type: String, required: true },
        explanation: { type: String, default: '' },
      },
    ],
    visibleTests: [
      {
        id: { type: String, required: true },
        input: { type: mongoose.Schema.Types.Mixed, required: true },
        expectedOutput: { type: mongoose.Schema.Types.Mixed, required: true },
      },
    ],
    // BACKEND-ONLY: Never leak to frontend
    hiddenTests: [
      {
        id: { type: String, required: true },
        input: { type: mongoose.Schema.Types.Mixed, required: true },
        expectedOutput: { type: mongoose.Schema.Types.Mixed, required: true },
      },
    ],
    // BACKEND-ONLY: Never leak to frontend
    referenceSolution: {
      type: String,
      default: '',
    },
    validation: {
      status: {
        type: String,
        enum: ['PENDING', 'VALID', 'INVALID'],
        default: 'PENDING',
      },
      issues: {
        type: [String],
        default: [],
      },
      checkedAt: {
        type: Date,
      },
    },
    status: {
      type: String,
      enum: ['GENERATING', 'READY', 'INVALID'],
      default: 'GENERATING',
      index: true,
    },
    isSaved: {
      type: Boolean,
      default: false,
      index: true,
    },
    latestDraftCode: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes specified in Blueprint Section 10.5
problemSchema.index({ ownerId: 1, createdAt: -1 });
problemSchema.index({ ownerId: 1, isSaved: 1, updatedAt: -1 });

// Helper to sanitize payload for public/frontend consumption
// Strips hiddenTests, referenceSolution, and internal validation details
problemSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.hiddenTests;
  delete obj.referenceSolution;
  delete obj.validation;
  delete obj.__v;
  return obj;
};

const Problem = mongoose.model('Problem', problemSchema);

module.exports = Problem;
