const mongoose = require('mongoose');

const userDailyProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'problem',
    required: true,
  },
  status: {
    type: String,
    enum: ['solved', 'unsolved'],
    default: 'unsolved'
  }
});

const UserDailyProgress= mongoose.model('UserDailyProgress', userDailyProgressSchema);
module.exports = UserDailyProgress;
