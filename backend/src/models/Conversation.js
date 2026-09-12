const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  type: {
    type: String,
    enum: ['chat', 'hint', 'debug', 'review'],
    default: 'chat',
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const conversationSchema = new mongoose.Schema(
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
    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

// One conversation thread per user per problem
conversationSchema.index({ problemId: 1, userId: 1 }, { unique: true });

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
