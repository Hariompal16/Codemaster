// Type definitions and validation for daily problem feature

export const DailyProblemType = {
  date: 'string',
  problem: {
    _id: 'string',
    title: 'string',
    description: 'string',
    difficulty: 'string', // 'easy' | 'medium' | 'hard'
    tags: 'string',
    visibletestcases: 'array',
    startcode: 'array'
  },
  solved: 'boolean'
};

export const StreakType = {
  currentStreak: 'number',
  totalSolved: 'number'
};

// Validation helpers
export const validateDailyProblem = (data) => {
  if (!data) return false;
  
  const requiredFields = ['date', 'problem', 'solved'];
  const hasRequiredFields = requiredFields.every(field => Object.prototype.hasOwnProperty.call(data, field));
  
  if (!hasRequiredFields) return false;
  
  // Validate problem object
  if (!data.problem || typeof data.problem !== 'object') return false;
  
  const problemRequiredFields = ['_id', 'title', 'difficulty'];
  const hasRequiredProblemFields = problemRequiredFields.every(field => 
    Object.prototype.hasOwnProperty.call(data.problem, field)
  );
  
  return hasRequiredProblemFields;
};

export const validateStreak = (data) => {
  if (!data) return false;
  
  return typeof data.currentStreak === 'number' && 
         typeof data.totalSolved === 'number';
};

// Default values
export const defaultDailyProblem = {
  date: new Date().toISOString().split('T')[0],
  problem: {
    _id: '',
    title: 'Loading...',
    description: '',
    difficulty: 'easy',
    tags: '',
    visibletestcases: [],
    startcode: []
  },
  solved: false
};

export const defaultStreak = {
  currentStreak: 0,
  totalSolved: 0
};
