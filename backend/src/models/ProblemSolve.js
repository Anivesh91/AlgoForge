const mongoose = require('mongoose');

const problemSolveSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

problemSolveSchema.index({ userId: 1, problemId: 1 }, { unique: true });

module.exports = mongoose.model('ProblemSolve', problemSolveSchema);
