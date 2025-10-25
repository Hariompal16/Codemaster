const cron = require('node-cron');
const DailyProblem = require('../models/dailyproblem');
const Problem = require('../models/problems');

cron.schedule('0 0 * * *', async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day
    
    const existing = await DailyProblem.findOne({ 
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (existing) {
      console.log('Daily problem already exists for today');
      return;
    }

    const allProblems = await Problem.find();
    if (allProblems.length === 0) {
      console.log('No problems available for daily challenge');
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * allProblems.length);
    const chosenProblem = allProblems[randomIndex];

    await DailyProblem.create({
      date: today,
      problemId: chosenProblem._id
    });

    console.log(`Daily problem for ${today.toISOString().split('T')[0]} set: ${chosenProblem.title}`);
  } catch (error) {
    console.error('Error setting daily problem:', error);
  }
});

console.log('Daily problem cron job initialized');
