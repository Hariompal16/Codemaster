import { NavLink } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Calendar, 
  Flame, 
  Trophy, 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  Target,
  Award,
  Play
} from 'lucide-react';
import { useDailyProblem } from '../hooks/useDailyProblem';
import { logoutUser } from '../authSlice';

const DailyProblem = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { dailyProblem, streak, loading, error } = useDailyProblem();

  const handleLogout = () => {
    dispatch(logoutUser());
  };

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
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
        <nav className="navbar bg-base-100/90 backdrop-blur-md shadow-lg border-b border-base-300 px-6">
          <div className="flex-1">
            <NavLink to="/" className="btn btn-ghost gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </NavLink>
          </div>
        </nav>

        <div className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="skeleton h-8 w-64"></div>
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body p-8">
                <div className="space-y-4">
                  <div className="skeleton h-6 w-full"></div>
                  <div className="skeleton h-4 w-3/4"></div>
                  <div className="skeleton h-4 w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dailyProblem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
        <nav className="navbar bg-base-100/90 backdrop-blur-md shadow-lg border-b border-base-300 px-6">
          <div className="flex-1">
            <NavLink to="/" className="btn btn-ghost gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </NavLink>
          </div>
        </nav>

        <div className="container mx-auto px-6 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body p-8 text-center">
                <Clock className="w-16 h-16 text-error mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">No Daily Challenge Available</h2>
                <p className="text-base-content/60 mb-6">
                  {error || 'The daily challenge is not available right now. Please try again later.'}
                </p>
                <NavLink to="/" className="btn btn-primary">
                  Browse All Problems
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
      <nav className="navbar bg-base-100/90 backdrop-blur-md shadow-lg border-b border-base-300 px-6">
        <div className="flex-1">
          <NavLink to="/" className="btn btn-ghost gap-2 hover:bg-base-300">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </NavLink>
        </div>
        <div className="flex-none gap-4">
          {streak && (
            <div className="flex items-center gap-2 bg-orange-100 px-3 py-1.5 rounded-full border border-orange-200">
              <Flame className="w-4 h-4 text-orange-600" />
              <span className="font-semibold text-orange-700">{streak.currentStreak}</span>
            </div>
          )}
          <div className="dropdown dropdown-end">
            <div tabIndex={0} className="btn btn-ghost gap-2">
              {user?.firstName}
            </div>
            <ul className="mt-3 p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-xl w-52 border border-base-300">
              <li>
                <button onClick={handleLogout} className="hover:bg-red-50 hover:text-red-600">
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Calendar className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-base-content">Daily Challenge</h1>
            </div>
            <p className="text-base-content/60">{formatDate(dailyProblem.date)}</p>
          </div>

          {streak && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card bg-gradient-to-r from-orange-100 to-orange-200 border border-orange-300">
                <div className="card-body p-4 text-center">
                  <Flame className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-700">{streak.currentStreak}</div>
                  <div className="text-sm text-orange-600">Current Streak</div>
                </div>
              </div>
              <div className="card bg-gradient-to-r from-yellow-100 to-yellow-200 border border-yellow-300">
                <div className="card-body p-4 text-center">
                  <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-700">{streak.totalSolved}</div>
                  <div className="text-sm text-yellow-600">Total Solved</div>
                </div>
              </div>
              <div className="card bg-gradient-to-r from-blue-100 to-blue-200 border border-blue-300">
                <div className="card-body p-4 text-center">
                  <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-700">{dailyProblem.solved ? '✓' : '○'}</div>
                  <div className="text-sm text-blue-600">Today's Status</div>
                </div>
              </div>
            </div>
          )}

          <div className="card bg-base-100 shadow-xl border border-base-300">
            <div className="card-body p-8">
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <h2 className="text-2xl font-bold text-base-content">
                    {dailyProblem.problem.title}
                  </h2>
                  {dailyProblem.solved && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-100 px-4 py-2 rounded-full border border-green-200">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">Completed</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getDifficultyColor(dailyProblem.problem.difficulty)}`}>
                    {dailyProblem.problem.difficulty}
                  </span>
                  
                  {dailyProblem.problem.tags && (
                    <span className="px-4 py-2 bg-base-200 text-base-content rounded-full text-sm font-medium">
                      {dailyProblem.problem.tags}
                    </span>
                  )}
                </div>
              </div>

              {dailyProblem.problem.description && (
                <div className="space-y-4 mb-8">
                  <h3 className="text-lg font-semibold text-base-content">Problem Description</h3>
                  <div className="bg-base-200 p-4 rounded-lg border border-base-300">
                    <p className="text-base-content whitespace-pre-wrap leading-relaxed">
                      {dailyProblem.problem.description}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 pt-4 border-t border-base-300">
                <NavLink
                  to={`/problem/${dailyProblem.problem._id}`}
                  className="btn btn-primary gap-2 flex-1 md:flex-none"
                >
                  <Play className="w-4 h-4" />
                  {dailyProblem.solved ? 'View Solution' : 'Start Challenge'}
                </NavLink>
                
                {!dailyProblem.solved && (
                  <div className="text-sm text-base-content/60 hidden md:block">
                    💡 Complete this challenge to maintain your streak!
                  </div>
                )}
              </div>

            </div>
          </div>

          <div className="card bg-gradient-to-br from-success/10 to-info/10 border border-success/20">
            <div className="card-body p-6 text-center">
              <Award className="w-12 h-12 text-success mx-auto mb-3" />
              <h3 className="text-lg font-bold text-base-content mb-2">Daily Challenge Benefits</h3>
              <p className="text-base-content/70 text-sm max-w-2xl mx-auto">
                Solve daily challenges to build consistency, improve problem-solving skills, and maintain your coding streak. 
                Each challenge is carefully selected to help you grow as a programmer!
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DailyProblem;
