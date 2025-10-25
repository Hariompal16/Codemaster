import { NavLink } from 'react-router';
import { Calendar, Flame, Trophy, ExternalLink, CheckCircle, Clock } from 'lucide-react';
import { useDailyProblem } from '../hooks/useDailyProblem';

const DailyProblemCard = () => {
  const { dailyProblem, streak, loading, error } = useDailyProblem();

  if (loading) {
    return (
      <div className="card bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 shadow-lg">
        <div className="card-body p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">Daily Challenge</h2>
            <div className="skeleton w-12 h-4 ml-auto"></div>
          </div>
          <div className="space-y-3">
            <div className="skeleton h-6 w-3/4"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-5/6"></div>
            <div className="skeleton h-10 w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-gradient-to-br from-error/10 to-error/20 border border-error/20 shadow-lg">
        <div className="card-body p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-error" />
            <h2 className="text-xl font-bold">Daily Challenge</h2>
          </div>
          <div className="alert alert-error">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!dailyProblem) {
    return (
      <div className="card bg-gradient-to-br from-base-200/50 to-base-300/50 border border-base-300 shadow-lg">
        <div className="card-body p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-base-content/50" />
            <h2 className="text-xl font-bold text-base-content/70">Daily Challenge</h2>
          </div>
          <p className="text-base-content/60">No daily problem available today.</p>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'hard': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="card bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="card-body p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-full">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-base-content">Daily Challenge</h2>
              <p className="text-sm text-base-content/60">{formatDate(dailyProblem.date)}</p>
            </div>
          </div>
          
          {/* Streak display */}
          {streak && (
            <div className="flex items-center gap-2 bg-orange-100 px-3 py-1.5 rounded-full border border-orange-200">
              <Flame className="w-4 h-4 text-orange-600" />
              <span className="font-semibold text-orange-700">
                {streak.currentStreak}
              </span>
            </div>
          )}
        </div>

        {/* Problem Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-lg font-semibold text-base-content">
              {dailyProblem.problem.title}
            </h3>
            
            {dailyProblem.solved && (
              <div className="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded-full text-sm border border-green-200">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">Solved</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(dailyProblem.problem.difficulty)}`}>
              {dailyProblem.problem.difficulty}
            </span>
            
            {dailyProblem.problem.tags && (
              <span className="px-3 py-1 bg-base-200 text-base-content rounded-full text-sm">
                {dailyProblem.problem.tags}
              </span>
            )}
          </div>

          {/* Problem Description Preview */}
          {dailyProblem.problem.description && (
            <p className="text-base-content/70 text-sm line-clamp-2">
              {dailyProblem.problem.description.length > 120
                ? `${dailyProblem.problem.description.substring(0, 120)}...`
                : dailyProblem.problem.description}
            </p>
          )}

          {/* Stats */}
          {streak && (
            <div className="flex items-center gap-4 pt-2 border-t border-base-300">
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="w-4 h-4 text-yellow-600" />
                <span className="font-medium text-base-content/80">
                  {streak.totalSolved} problems solved
                </span>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            <NavLink
              to={`/problem/${dailyProblem.problem._id}`}
              className="btn btn-primary btn-sm gap-2 hover:btn-primary-focus transition-all"
            >
              {dailyProblem.solved ? 'View Solution' : 'Start Challenge'}
              <ExternalLink className="w-4 h-4" />
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyProblemCard;
