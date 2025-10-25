const mongoose = require('mongoose');

const dailyProblemSchema = new mongoose.Schema({
  date: {
    type: Date,
    unique: true,
    required: true,
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'problem',
    required: true,
  }
});

const DailyProblem= mongoose.model('DailyProblem', dailyProblemSchema);
module.exports = DailyProblem;
