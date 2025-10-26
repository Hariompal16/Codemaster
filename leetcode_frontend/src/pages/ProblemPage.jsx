import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useParams, useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient';
import SubmissionHistory from './SubmissionHistory';
import Editorial from '../components/Editorial';
import {
  Play,
  Send,
  Code,
  FileText,
  BookOpen,
  History,
  CheckCircle,
  XCircle,
  Clock,
  MemoryStick,
  Users,
  ArrowLeft,
} from 'lucide-react';
import { useDailyProblem } from '../hooks/useDailyProblem';

const langMap = {
  cpp: 'C++',
  java: 'Java',
  javascript: 'JavaScript',
};

// Fallback data when API is not available
const fallbackProblem = {
  title: 'Sample Problem (Backend Not Connected)',
  difficulty: 'medium',
  tags: 'Array, Hash Table',
  description: 'This is a sample problem shown because the backend server is not running or the API call failed. Please start your backend server on http://localhost:3000 to load actual problem data.',
  visibletestcases: [
    {
      input: 'nums = [2,7,11,15], target = 9',
      output: '[0,1]',
      explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
    }
  ],
  startcode: [
    {
      language: 'JavaScript',
      initialcode: '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    // Write your code here\n    \n};'
    },
    {
      language: 'Java',
      initialcode: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        \n    }\n}'
    },
    {
      language: 'C++',
      initialcode: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n        \n    }\n};'
    }
  ],
  refrencesol: []
};


const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setrunResult] = useState(null);
  const [submitResult, setsubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const [notification, setNotification] = useState(null);
  const editorRef = useRef(null);
  const navigate = useNavigate();
  let { problemId } = useParams();
const { dailyProblem, markProgress } = useDailyProblem();

  // Show notification helper
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch problem data
  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        console.log(`Attempting to fetch problem with ID: ${problemId}`);
        const response = await axiosClient.get(`/problem/problemfetch/${problemId}`);
        

        // Validate that we have the required data
        if (!response.data) {
          throw new Error('No data received from API');
        }

        const initialCode =
          response.data.startcode?.find(
            (sc) => sc.language === langMap[selectedLanguage]
          )?.initialcode || '';

       

        setProblem(response.data);
        setCode(initialCode);
        setLoading(false);
      } catch (err) {
        console.error('❌ Error fetching problem:', err);
        
        
        // Use fallback data instead of showing error
        const initialCode =
          fallbackProblem.startcode?.find(
            (sc) => sc.language === langMap[selectedLanguage]
          )?.initialcode || '// Start coding here...';

      
        
        setProblem(fallbackProblem);
        setCode(initialCode);
        setLoading(false);
        
        // Log helpful debugging info
        if (err.code === 'ERR_NETWORK') {
          console.log('🔧 Backend server is not running on http://localhost:3000');
        } else if (err.response?.status === 404) {
          console.log('🔧 Problem not found or endpoint does not exist');
        } else {
          console.log('🔧 Other API error:', err.message);
        }
      }
    };

    fetchProblem();
  }, [problemId, selectedLanguage]);

  // Update code when language changes
  useEffect(() => {
    if (problem) {
      const initialCode =
        problem.startcode?.find(
          (sc) => sc.language === langMap[selectedLanguage]
        )?.initialcode || `// ${selectedLanguage} code template not available\n// Start coding here...`;
      
    
      setCode(initialCode);
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    setLoading(true);
    setrunResult(null);

    try {
      const response = await axiosClient.post(
        `/submit/run/${problemId}`,
        {
          code,
          language: selectedLanguage,
        },
        {
          withCredentials: true,
        }
      );

      setrunResult(response.data);
      setLoading(false);
      setActiveRightTab('testcase');
    } catch (error) {
      console.error('Error running code:', error);

      setrunResult({
        success: false,
        error: error.response?.data || 'Internal server error',
      });
      setLoading(false);
      setActiveRightTab('testcase');
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setsubmitResult(null);

    try {
      const response = await axiosClient.post(`/submit/submitt/${problemId}`, {
        code: code,
        language: selectedLanguage,
      });
      setsubmitResult(response.data);
      setLoading(false);
      setActiveRightTab('result');
      console.log(dailyProblem.problem._id,response.data.accepted);
       if (dailyProblem && dailyProblem.problem._id === problemId && response.data.accepted) {
        const result = await markProgress(problemId, 'solved');
        console.log('Mark Progress Result:', result);
        if (result.success) {
          showNotification('success', '🎉 Daily problem marked as solved! Your streak is growing!');
        } else {
          showNotification('error', `Failed to mark daily problem: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('Error submitting code:', error);
      setsubmitResult(null);
      setLoading(false);
      setActiveRightTab('result');
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript':
        return 'javascript';
      case 'java':
        return 'java';
      case 'cpp':
        return 'cpp';
      default:
        return 'javascript';
    }
  };

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }


  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-base-100 to-base-200">
      {/* Header with Navigation */}
      <div className="bg-base-100/90 backdrop-blur-sm border-b border-base-300 px-6 py-4 flex items-center gap-4 shadow-sm">
        <button
          onClick={() => navigate('/')}
          className="btn btn-ghost btn-sm gap-2 hover:bg-base-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Problems
        </button>

        {problem && (
          <>
            <div className="h-6 w-px bg-base-300"></div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-base-content">
                {problem.title}
              </h1>
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  problem.difficulty === 'easy'
                    ? 'difficulty-easy'
                    : problem.difficulty === 'medium'
                    ? 'difficulty-medium'
                    : 'difficulty-hard'
                }`}
              >
                {problem.difficulty.charAt(0).toUpperCase() +
                  problem.difficulty.slice(1)}
              </div>
              <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium border border-blue-200">
                {problem.tags}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row problem-split">
        {/* Left Panel */}
        <div className="w-full lg:w-1/2 flex flex-col border-r-0 lg:border-r border-base-300 bg-base-100">
          {/* Left Tabs */}
          <div className="tabs-enhanced bg-base-200 px-3 md:px-6 border-b border-base-300">
            <div className="flex space-x-1 overflow-x-auto">
              <button
                className={`tab flex items-center gap-1 md:gap-2 px-2 md:px-4 py-3 text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
                  activeLeftTab === 'description'
                    ? 'tab-active border-b-2 border-primary text-primary bg-base-100'
                    : 'text-base-content/70 hover:text-base-content hover:bg-base-300'
                }`}
                onClick={() => setActiveLeftTab('description')}
              >
                <FileText className="w-4 h-4" />
                Description
              </button>
              <button
                className={`tab flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
                  activeLeftTab === 'editorial'
                    ? 'tab-active border-b-2 border-primary text-primary bg-base-100'
                    : 'text-base-content/70 hover:text-base-content hover:bg-base-300'
                }`}
                onClick={() => setActiveLeftTab('editorial')}
              >
                <BookOpen className="w-4 h-4" />
                Editorial
              </button>
              <button
                className={`tab flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
                  activeLeftTab === 'solutions'
                    ? 'tab-active border-b-2 border-primary text-primary bg-base-100'
                    : 'text-base-content/70 hover:text-base-content hover:bg-base-300'
                }`}
                onClick={() => setActiveLeftTab('solutions')}
              >
                <Code className="w-4 h-4" />
                Solutions
              </button>
              <button
                className={`tab flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
                  activeLeftTab === 'submissions'
                    ? 'tab-active border-b-2 border-primary text-primary bg-base-100'
                    : 'text-base-content/70 hover:text-base-content hover:bg-base-300'
                }`}
                onClick={() => setActiveLeftTab('submissions')}
              >
                <History className="w-4 h-4" />
                Submissions
              </button>
            </div>
          </div>

          {/* Left Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {problem && (
              <>
                {activeLeftTab === 'description' && (
                  <div className="space-y-6">
                    <div className="prose max-w-none">
                      <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                        {problem.description}
                      </div>
                    </div>

                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-1 h-6 bg-purple-500 rounded"></div>
                        Examples
                      </h3>
                      <div className="space-y-4">
                        {problem.visibletestcases?.map((example, index) => (
                          <div
                            key={index}
                            className="card-enhanced bg-gray-50 p-5 border border-gray-200 fade-in"
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                              <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </span>
                              Example {index + 1}
                            </h4>
                            <div className="space-y-3 font-mono text-sm">
                              <div className="bg-white p-3 rounded-lg border border-gray-200">
                                <span className="text-gray-600 font-semibold">
                                  Input:
                                </span>
                                <div className="text-gray-900 mt-1">
                                  {example.input}
                                </div>
                              </div>
                              <div className="bg-white p-3 rounded-lg border border-gray-200">
                                <span className="text-gray-600 font-semibold">
                                  Output:
                                </span>
                                <div className="text-gray-900 mt-1">
                                  {example.output}
                                </div>
                              </div>
                              {example.explanation && (
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                  <span className="text-blue-700 font-semibold">
                                    Explanation:
                                  </span>
                                  <div className="text-blue-800 mt-1">
                                    {example.explanation}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeLeftTab === 'editorial' && (
                  <div className="prose max-w-none">
                    <h2 className="text-xl font-bold mb-4">Editorial</h2>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      <Editorial
                        secureUrl={problem.secureUrl}
                        thumbnailUrl={problem.thumbnailUrl}
                        duration={problem.duration}
                      />
                    </div>
                  </div>
                )}

                {activeLeftTab === 'solutions' && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">Solutions</h2>
                    <div className="space-y-6">
                      {problem.refrencesol && problem.refrencesol.length > 0 ? (
                        problem.refrencesol.map((solution, index) => (
                          <div
                            key={index}
                            className="border border-base-300 rounded-lg"
                          >
                            <div className="bg-base-200 px-4 py-2 rounded-t-lg">
                              <h3 className="font-semibold">
                                {problem?.title} - {solution?.language}
                              </h3>
                            </div>
                            <div className="p-4">
                              <pre className="bg-base-300 p-4 rounded text-sm overflow-x-auto">
                                <code>{solution?.completecode}</code>
                              </pre>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">
                          Solutions will be available after you solve the
                          problem.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {activeLeftTab === 'submissions' && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">My Submissions</h2>
                    <div className="text-gray-500">
                      <SubmissionHistory problemId={problemId} />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full lg:w-1/2 flex flex-col bg-gray-50">
          {/* Right Tabs */}
          <div className="tabs-enhanced bg-white px-3 md:px-6 border-b border-gray-200">
            <div className="flex space-x-1 overflow-x-auto">
              <button
                className={`tab flex items-center gap-1 md:gap-2 px-2 md:px-4 py-3 text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
                  activeRightTab === 'code'
                    ? 'tab-active border-b-2 border-purple-500 text-purple-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => setActiveRightTab('code')}
              >
                <Code className="w-4 h-4" />
                Code
              </button>
              <button
                className={`tab flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
                  activeRightTab === 'testcase'
                    ? 'tab-active border-b-2 border-purple-500 text-purple-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => setActiveRightTab('testcase')}
              >
                <Play className="w-4 h-4" />
                Test Case
              </button>
              <button
                className={`tab flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
                  activeRightTab === 'result'
                    ? 'tab-active border-b-2 border-purple-500 text-purple-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => setActiveRightTab('result')}
              >
                <Send className="w-4 h-4" />
                Submit Result
              </button>
            </div>
          </div>

          {/* Code Editor Tab */}
          {activeRightTab === 'code' && (
            <div className="flex-1 flex flex-col">
              {/* Language selector and controls */}
              <div className="bg-white px-4 py-3 border-b border-gray-200 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <select
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="select select-bordered select-sm max-w-xs"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleRun}
                    disabled={loading}
                    className="btn btn-sm btn-outline gap-2 hover:bg-green-50 hover:border-green-300 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    Run
                  </button>
                  <button
                    onClick={handleSubmitCode}
                    disabled={loading}
                    className="btn btn-sm btn-primary gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Submit
                  </button>
                </div>
              </div>
              
              {/* Monaco Editor */}
              <div className="flex-1 bg-white">
                <Editor
                  height="100%"
                  language={getLanguageForMonaco(selectedLanguage)}
                  value={code}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    automaticLayout: true,
                  }}
                />
              </div>
            </div>
          )}

          {/* Test Case Tab */}
          {activeRightTab === 'testcase' && (
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="font-semibold mb-4">Test Results</h3>
              
              {runResult ? (
                <div className="space-y-4">
                  <div className={`alert ${
                    runResult.success ? 'alert-success' : 'alert-error'
                  }`}>
                    <div>
                      <h4 className="font-bold">
                        {runResult.success ? '✅ Tests Passed' : '❌ Tests Failed'}
                      </h4>
                      {runResult.error && (
                        <p className="text-sm mt-1">{runResult.error}</p>
                      )}
                    </div>
                  </div>
                  
                  {runResult.testCases && (
                    <div className="space-y-3">
                      {runResult.testCases.map((tc, i) => (
                        <div key={i} className={`card bg-white border ${
                          tc.status_id === 3 
                            ? 'border-green-200' 
                            : 'border-red-200'
                        }`}>
                          <div className="card-body p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-medium text-gray-900">Test Case {i + 1}</h5>
                              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                tc.status_id === 3 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {tc.status_id === 3 ? (
                                  <><CheckCircle className="w-3 h-3" /> Passed</>
                                ) : (
                                  <><XCircle className="w-3 h-3" /> Failed</>
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-3 font-mono text-sm">
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <span className="text-gray-600 font-semibold text-xs uppercase tracking-wider">Input</span>
                                <div className="text-gray-900 mt-1">{tc.stdin}</div>
                              </div>
                              
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <span className="text-gray-600 font-semibold text-xs uppercase tracking-wider">Expected</span>
                                <div className="text-gray-900 mt-1">{tc.expected_output}</div>
                              </div>
                              
                              <div className={`p-3 rounded-lg ${
                                tc.status_id === 3 
                                  ? 'bg-green-50' 
                                  : 'bg-red-50'
                              }`}>
                                <span className="text-gray-600 font-semibold text-xs uppercase tracking-wider">Your Output</span>
                                <div className={`mt-1 ${
                                  tc.status_id === 3 ? 'text-green-900' : 'text-red-900'
                                }`}>{tc.stdout}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Test Results Yet</h3>
                  <p className="text-gray-600 mb-4">Click "Run" to test your code with the example test cases.</p>
                  <button
                    className="btn-animated px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                    onClick={() => setActiveRightTab('code')}
                  >
                    Go to Code Editor
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Submit Result Tab */}
          {activeRightTab === 'result' && (
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="font-semibold mb-4">Submission Result</h3>
           
              {submitResult ? (
                <div className={`alert ${submitResult.accepted ? 'alert-success' : 'alert-error'}`}>
                  <div>
                    {submitResult.accepted ? (
                      <div>
                        <h4 className="font-bold text-lg">🎉 Accepted</h4>
                        <div className="mt-4 space-y-2">
                          <p>Test Cases Passed: {submitResult.passedTestCases}/{submitResult.totalTestCases}</p>
                          <p>Runtime: {submitResult.runtime + " sec"}</p>
                          <p>Memory: {submitResult.memory + "KB"} </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-bold text-lg">❌ {submitResult.error}</h4>
                        <div className="mt-4 space-y-2">
                          <p>Test Cases Passed: {submitResult.passedTestCases}/{submitResult.totalTestCases}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">
                  Click "Submit" to submit your solution for evaluation.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 toast">
          <div className={`alert ${
            notification.type === 'success' 
              ? 'alert-success shadow-lg' 
              : 'alert-error shadow-lg'
          } rounded-lg animate-in fade-in slide-in-from-top-4 duration-300`}>
            <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              {notification.type === 'success' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
            <div>
              <h3 className="font-bold">{notification.type === 'success' ? 'Success!' : 'Error'}</h3>
              <div className="text-xs">{notification.message}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemPage;
