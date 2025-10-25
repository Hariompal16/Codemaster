import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authslice';
import { Search, Filter, Trophy, Calendar, BookOpen, User, ChevronDown, BarChart3 } from 'lucide-react';
import DailyProblemCard from '../components/DailyProblemCard';


function Home(){
 const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all' 
  });

  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      try {
        const { data } = await axiosClient.get('/problem/getallproblem');
        setProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/solvedProblem');
        setSolvedProblems(data);
      } catch (error) {
        console.error('Error fetching solved problems:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
    if (user) {
      fetchSolvedProblems();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]); 
  };

  const filteredProblems = problems.filter(problem => {
    const searchMatch = searchTerm === '' || 
                       problem.title.toLowerCase().includes(searchTerm.toLowerCase());
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
    const statusMatch = filters.status === 'all' || 
                      (filters.status === 'solved' ? 
                       solvedProblems.some(sp => sp._id === problem._id) :
                       !solvedProblems.some(sp => sp._id === problem._id));
    return searchMatch && difficultyMatch && tagMatch && statusMatch;
  });

  // Statistics calculation
  const stats = {
    total: problems.length,
    solved: solvedProblems.length,
    easy: problems.filter(p => p.difficulty === 'easy').length,
    medium: problems.filter(p => p.difficulty === 'medium').length,
    hard: problems.filter(p => p.difficulty === 'hard').length,
    easyCompleted: solvedProblems.filter(sp => 
      problems.find(p => p._id === sp._id)?.difficulty === 'easy'
    ).length,
    mediumCompleted: solvedProblems.filter(sp => 
      problems.find(p => p._id === sp._id)?.difficulty === 'medium'
    ).length,
    hardCompleted: solvedProblems.filter(sp => 
      problems.find(p => p._id === sp._id)?.difficulty === 'hard'
    ).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
      {/* Enhanced Navigation Bar */}
      <nav className="navbar bg-base-100/90 backdrop-blur-md shadow-lg border-b border-base-300 px-6">
        <div className="flex-1">
          <NavLink to="/" className="btn btn-ghost text-2xl font-bold bg-clip-text ">
            <BookOpen className="w-8 h-8 mr-2 text-primary" />
            CodeMaster
          </NavLink>
        </div>
        <div className="flex-none gap-4">
          <div className="mobile-hidden hidden md:flex items-center gap-4 text-sm">
            <NavLink to="/daily" className="btn btn-ghost btn-sm gap-2 hover:bg-primary/10">
              <Calendar className="w-4 h-4 text-primary" />
              Daily Challenge
            </NavLink>
            <div className="stat-item flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="font-medium">{stats.solved}/{stats.total} Solved</span>
            </div>
          </div>
          <div className="dropdown dropdown-end">
            <div tabIndex={0} className="btn btn-ghost gap-2 hover:bg-base-300">
              <User className="w-4 h-4" />
              {user?.firstName}
              <ChevronDown className="w-4 h-4" />
            </div>
            <ul className="mt-3 p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-2xl w-52 border border-base-300">
              <li>
                <button onClick={handleLogout} className="hover:bg-red-50 hover:text-red-600 transition-colors">
                  Logout
                </button>
              </li>
              {user.role === 'admin' && (
                <li>
                  <NavLink to="/admin" className="hover:bg-purple-50 hover:text-purple-600 transition-colors">
                    Admin Panel
                  </NavLink>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Statistics Cards */}
        <div className="stats-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="card-enhanced bg-base-100 p-6 fade-in interactive">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-base-content/70">Total Problems</p>
                <p className="text-3xl font-bold text-base-content">{stats.total}</p>
              </div>
              <BarChart3 className="w-10 h-10 text-primary" />
            </div>
            <div className="mt-4">
              <div className="text-sm text-green-600 font-medium">
                {stats.solved > 0 ? `${((stats.solved / stats.total) * 100).toFixed(1)}% Complete` : 'Start solving!'}
              </div>
            </div>
          </div>

          <div className="card-enhanced bg-base-100 p-6 fade-in interactive" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-base-content/70">Easy</p>
                <p className="text-3xl font-bold text-green-600">{stats.easyCompleted}/{stats.easy}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-green-500"></div>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-base-300 rounded-full h-2">
                <div 
                  className="progress-bar bg-green-500 h-2 rounded-full" 
                  style={{ 
                    '--progress-width': `${stats.easy ? (stats.easyCompleted / stats.easy) * 100 : 0}%`,
                    width: `${stats.easy ? (stats.easyCompleted / stats.easy) * 100 : 0}%`,
                    animationDelay: '0.5s'
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="card-enhanced bg-base-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-base-content/70">Medium</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.mediumCompleted}/{stats.medium}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-yellow-500"></div>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-base-300 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${stats.medium ? (stats.mediumCompleted / stats.medium) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="card-enhanced bg-base-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-base-content/70">Hard</p>
                <p className="text-3xl font-bold text-red-600">{stats.hardCompleted}/{stats.hard}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-red-500"></div>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-base-300 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${stats.hard ? (stats.hardCompleted / stats.hard) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Problem Card */}
        <div className="mb-8">
          <DailyProblemCard />
        </div>

        {/* Search and Filters */}
        <div className="card-enhanced bg-base-100 p-4 md:p-6 mb-8">
          <div className="search-filter-container">
            {/* Search Bar */}
            <div className="search-bar-wrapper">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search problems..."
                  className="input input-bordered w-full pl-10 focus-ring h-12"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="filters-wrapper">
              <div className="filter-item">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50 w-4 h-4 z-10" />
                  <select 
                    className="select select-bordered pl-10 focus-ring h-12 w-full min-w-[140px]"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                  >
                    <option value="all">All Status</option>
                    <option value="solved">Solved</option>
                    <option value="unsolved">Unsolved</option>
                  </select>
                </div>
              </div>

              <div className="filter-item">
                <select 
                  className="select select-bordered focus-ring h-12 w-full min-w-[160px]"
                  value={filters.difficulty}
                  onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="filter-item">
                <select 
                  className="select select-bordered focus-ring h-12 w-full min-w-[140px]"
                  value={filters.tag}
                  onChange={(e) => setFilters({...filters, tag: e.target.value})}
                >
                  <option value="all">All Tags</option>
                  <option value="array">Array</option>
                  <option value="linkedList">Linked List</option>
                  <option value="graph">Graph</option>
                  <option value="dp">Dynamic Programming</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Problems List */}
        {loading ? (
          <div className="grid gap-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="card-enhanced bg-white p-6">
                <div className="animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-6 bg-gray-200 rounded w-1/3 shimmer"></div>
                    <div className="h-6 bg-gray-200 rounded w-20 shimmer"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-5 bg-gray-200 rounded w-16 shimmer"></div>
                    <div className="h-5 bg-gray-200 rounded w-20 shimmer"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredProblems.length === 0 ? (
              <div className="card-enhanced bg-white p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto mb-4" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No problems found</h3>
                <p className="text-gray-500">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              filteredProblems.map((problem, index) => {
                const isSolved = solvedProblems.some(sp => sp._id === problem._id);
                return (
                  <div 
                    key={problem._id} 
                    className="card-enhanced bg-white p-6 group fade-in interactive" 
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-3 h-3 rounded-full ${
                            isSolved ? 'bg-green-500' : 'bg-gray-300'
                          }`}></div>
                          <h2 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                            <NavLink 
                              to={`/problem/${problem._id}`} 
                              className="hover:underline"
                            >
                              {problem.title}
                            </NavLink>
                          </h2>
                          {isSolved && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              <Trophy className="w-3 h-3" />
                              Solved
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            problem.difficulty === 'easy' ? 'difficulty-easy' :
                            problem.difficulty === 'medium' ? 'difficulty-medium' :
                            'difficulty-hard'
                          }`}>
                            {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                          </div>
                          <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium border border-blue-200">
                            {problem.tags}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <NavLink 
                          to={`/problem/${problem._id}`}
                          className="btn btn-sm btn-primary btn-animated opacity-0 group-hover:opacity-100 transition-all duration-300"
                        >
                          Solve
                        </NavLink>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Show count */}
        {!loading && filteredProblems.length > 0 && (
          <div className="text-center mt-8 text-gray-600">
            Showing {filteredProblems.length} of {problems.length} problems
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;