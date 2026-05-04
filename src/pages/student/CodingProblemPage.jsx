import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play, Send, ChevronLeft, CheckCircle, XCircle, Clock, Trophy,
  Code2, BookOpen, Lightbulb, RefreshCw, Terminal, AlertTriangle,
  Filter, Search, Loader2,
} from 'lucide-react';
import { problemAPI } from '../../api/services';
import { Card, CardBody, Badge, Button, PageHeader, EmptyState } from '../../components/common/UI';
import toast from 'react-hot-toast';

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', icon: '🟡' },
  { id: 'python',     label: 'Python',     icon: '🐍' },
  { id: 'java',       label: 'Java',       icon: '☕' },
  { id: 'cpp',        label: 'C++',        icon: '⚙️' },
];

const DIFFICULTY_COLOR = { easy: 'text-emerald-600 dark:text-emerald-400', medium: 'text-amber-600 dark:text-amber-400', hard: 'text-red-600 dark:text-red-400' };
const STATUS_CONFIG = {
  accepted:      { label: 'Accepted',       color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800', icon: CheckCircle },
  wrong_answer:  { label: 'Wrong Answer',   color: 'text-red-600',     bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800', icon: XCircle },
  time_limit:    { label: 'Time Limit',     color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', icon: Clock },
  runtime_error: { label: 'Runtime Error',  color: 'text-red-600',     bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800', icon: AlertTriangle },
  compile_error: { label: 'Compile Error',  color: 'text-red-600',     bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800', icon: AlertTriangle },
};

// ── Problem list panel ────────────────────────────────────────────────────────
function ProblemList({ onSelect }) {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ difficulty: '', topic: '', search: '' });

  useEffect(() => {
    setLoading(true);
    problemAPI.getAll(filters)
      .then(r => setProblems(r.data.data.problems || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters]);

  const TOPICS = ['array','string','dp','graph','tree','linkedlist','sorting','greedy','binarysearch','stack','queue','heap'];

  return (
    <div className="space-y-4">
      <PageHeader title="Coding Problems" subtitle="LeetCode-style problems with real test case execution" />

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input placeholder="Search..." value={filters.search}
            onChange={e => setFilters(f => ({...f, search: e.target.value}))}
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <select value={filters.difficulty} onChange={e => setFilters(f => ({...f, difficulty: e.target.value}))}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
          <option value="">All Difficulty</option>
          <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
        </select>
        <select value={filters.topic} onChange={e => setFilters(f => ({...f, topic: e.target.value}))}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
          <option value="">All Topics</option>
          {TOPICS.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
        </select>
      </div>

      {/* Table */}
      <Card>
        <CardBody className="p-0">
          <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wide">
            <span className="col-span-1">#</span>
            <span className="col-span-5">Title</span>
            <span className="col-span-2 text-center">Difficulty</span>
            <span className="col-span-2 text-center">Topic</span>
            <span className="col-span-2 text-center">Status</span>
          </div>
          {loading ? Array(8).fill(0).map((_, i) => (
            <div key={i} className="h-12 mx-2 my-1 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
          )) : problems.length === 0 ? (
            <div className="py-10"><EmptyState icon={Code2} title="No problems found" /></div>
          ) : problems.map((p, i) => (
            <button key={p._id} onClick={() => onSelect(p)}
              className="w-full grid grid-cols-12 gap-2 px-5 py-3.5 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group">
              <span className="col-span-1 text-xs text-slate-400">{i + 1}</span>
              <span className="col-span-5 text-sm font-medium text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">{p.title}</span>
              <span className={`col-span-2 text-xs font-semibold text-center capitalize ${DIFFICULTY_COLOR[p.difficulty]}`}>{p.difficulty}</span>
              <span className="col-span-2 text-xs text-slate-500 dark:text-slate-400 text-center capitalize">{p.topic}</span>
              <span className="col-span-2 text-center">
                {p.isSolved
                  ? <CheckCircle size={14} className="text-emerald-500 mx-auto" />
                  : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 dark:border-slate-600 mx-auto" />}
              </span>
            </button>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}

// ── Code editor area (textarea-based) ─────────────────────────────────────────
function CodeEditor({ code, onChange, language }) {
  return (
    <div className="relative h-full">
      <textarea
        value={code}
        onChange={e => onChange(e.target.value)}
        spellCheck={false}
        className="w-full h-full min-h-80 p-4 font-mono text-sm bg-slate-950 text-slate-100 resize-none focus:outline-none rounded-xl leading-relaxed"
        placeholder="// Write your solution here..."
      />
    </div>
  );
}

// ── Test result panel ─────────────────────────────────────────────────────────
function TestResults({ results, type }) {
  if (!results?.length) return null;
  const passed = results.filter(r => r.passed).length;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <span className={`text-sm font-bold ${passed === results.length ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
          {passed}/{results.length} test cases passed
        </span>
        {type === 'run' && <Badge variant="default">Visible only</Badge>}
      </div>
      {results.map((r, i) => (
        <div key={i} className={`p-3 rounded-xl border text-xs font-mono space-y-1 ${r.passed ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
          <div className="flex items-center gap-2 font-sans">
            {r.passed ? <CheckCircle size={13} className="text-emerald-500" /> : <XCircle size={13} className="text-red-500" />}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {r.isHidden ? `Hidden Test ${i + 1}` : `Test Case ${i + 1}`}
            </span>
            {r.executionTime && <span className="text-slate-400 ml-auto">{r.executionTime}ms</span>}
          </div>
          {!r.isHidden && (
            <>
              <p className="text-slate-600 dark:text-slate-400">Input: <span className="text-slate-900 dark:text-slate-200">{r.input}</span></p>
              <p className="text-slate-600 dark:text-slate-400">Expected: <span className="text-emerald-700 dark:text-emerald-400">{r.expectedOutput}</span></p>
              {!r.passed && <p className="text-slate-600 dark:text-slate-400">Got: <span className="text-red-600 dark:text-red-400">{r.actualOutput || 'No output'}</span></p>}
            </>
          )}
          {r.error && <p className="text-red-600 dark:text-red-400 font-sans">⚠ {r.error}</p>}
        </div>
      ))}
    </div>
  );
}

// ── Submission result banner ───────────────────────────────────────────────────
function SubmissionResult({ result }) {
  if (!result) return null;
  const cfg = STATUS_CONFIG[result.status] || STATUS_CONFIG.wrong_answer;
  const Icon = cfg.icon;
  return (
    <div className={`p-4 rounded-xl border ${cfg.bg} space-y-3`}>
      <div className="flex items-center gap-3">
        <Icon size={20} className={cfg.color} />
        <div className="flex-1">
          <p className={`font-bold text-base ${cfg.color}`}>{cfg.label}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {result.passedTestCases}/{result.totalTestCases} test cases · {result.executionTime}ms avg
          </p>
        </div>
        {result.status === 'accepted' && (
          <div className="text-right">
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+{result.pointsEarned} pts</p>
          </div>
        )}
      </div>
      <TestResults results={result.testResults} type="submit" />
    </div>
  );
}

// ── Problem detail + editor ───────────────────────────────────────────────────
function ProblemEditor({ problem: initialProblem, onBack }) {
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [tab, setTab] = useState('description'); // description | submissions
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResults, setRunResults] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    problemAPI.getById(initialProblem._id)
      .then(r => {
        const p = r.data.data;
        setProblem(p);
        setCode(p.starterCode?.[language] || '// Write your solution here');
      })
      .catch(() => toast.error('Failed to load problem'))
      .finally(() => setLoading(false));
  }, [initialProblem._id]);

  useEffect(() => {
    if (problem) setCode(problem.starterCode?.[language] || code);
  }, [language]);

  const handleRun = async () => {
    if (!code.trim()) { toast.error('Write some code first'); return; }
    setRunning(true);
    setRunResults(null);
    setSubmitResult(null);
    try {
      const { data } = await problemAPI.run(problem._id, { code, language });
      setRunResults(data.data.results);
      toast.success(`${data.data.passedCount}/${data.data.totalCount} visible tests passed`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Run failed');
    } finally { setRunning(false); }
  };

  const handleSubmit = async () => {
    if (!code.trim()) { toast.error('Write some code first'); return; }
    setSubmitting(true);
    setRunResults(null);
    setSubmitResult(null);
    try {
      const { data } = await problemAPI.submit(problem._id, { code, language });
      setSubmitResult(data.data);
      if (data.data.status === 'accepted') toast.success(`✅ Accepted! +${data.data.pointsEarned} points`);
      else toast.error(`❌ ${STATUS_CONFIG[data.data.status]?.label || 'Failed'}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally { setSubmitting(false); }
  };

  const loadSubmissions = async () => {
    try {
      const { data } = await problemAPI.getMySubmissions(problem._id);
      setSubmissions(data.data || []);
    } catch {}
  };

  useEffect(() => {
    if (tab === 'submissions' && problem) loadSubmissions();
  }, [tab]);

  if (loading) return (
    <div className="space-y-3">
      {Array(4).fill(0).map((_, i) => <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />)}
    </div>
  );
  if (!problem) return null;

  return (
    <div className="h-[calc(100vh-120px)] flex gap-4">
      {/* Left: Problem */}
      <div className="w-[45%] flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <div className="flex gap-1">
            {['description', 'submissions'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${tab === t ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {tab === 'description' ? (
            <>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">{problem.title}</h2>
                  <span className={`text-sm font-semibold capitalize ${DIFFICULTY_COLOR[problem.difficulty]}`}>{problem.difficulty}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <Badge variant="brand" className="capitalize">{problem.topic}</Badge>
                  {problem.tags?.map(t => <Badge key={t} variant="default">{t}</Badge>)}
                  {problem.companies?.slice(0, 3).map(c => <span key={c} className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md">{c}</span>)}
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{problem.description}</p>
                </div>
              </div>

              {problem.examples?.map((ex, i) => (
                <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Example {i + 1}</p>
                  <p className="text-xs font-mono text-slate-700 dark:text-slate-300">
                    <span className="text-slate-500">Input: </span>{ex.input}<br />
                    <span className="text-slate-500">Output: </span>{ex.output}
                    {ex.explanation && <><br /><span className="text-slate-500">Explanation: </span>{ex.explanation}</>}
                  </p>
                </div>
              ))}

              {problem.constraints?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Constraints</p>
                  <ul className="space-y-1">
                    {problem.constraints.map((c, i) => <li key={i} className="text-xs font-mono text-slate-600 dark:text-slate-400">• {c}</li>)}
                  </ul>
                </div>
              )}

              {problem.testCases?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Sample Test Cases</p>
                  {problem.testCases.map((tc, i) => (
                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg font-mono text-xs mb-2">
                      <p className="text-slate-500">Input: <span className="text-slate-800 dark:text-slate-200">{tc.input}</span></p>
                      <p className="text-slate-500">Expected: <span className="text-emerald-700 dark:text-emerald-400">{tc.expectedOutput}</span></p>
                    </div>
                  ))}
                </div>
              )}

              {problem.hints?.length > 0 && (
                <div>
                  <button onClick={() => setShowHints(h => !h)} className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors">
                    <Lightbulb size={13} /> {showHints ? 'Hide Hints' : 'Show Hints'}
                  </button>
                  {showHints && problem.hints.map((h, i) => (
                    <div key={i} className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300">
                      💡 {h}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-4 text-xs text-slate-400">
                {problem.timeComplexity && <span>⏱ Time: <strong>{problem.timeComplexity}</strong></span>}
                {problem.spaceComplexity && <span>💾 Space: <strong>{problem.spaceComplexity}</strong></span>}
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-bold text-slate-900 dark:text-white">My Submissions</p>
              {submissions.length === 0 ? (
                <EmptyState icon={Terminal} title="No submissions yet" description="Submit your solution to see results here." />
              ) : submissions.map(s => {
                const cfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.wrong_answer;
                const Icon = cfg.icon;
                return (
                  <div key={s._id} className={`p-3 rounded-xl border ${cfg.bg} flex items-center gap-3`}>
                    <Icon size={14} className={cfg.color} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</p>
                      <p className="text-xs text-slate-400">{s.passedTestCases}/{s.totalTestCases} · {s.language} · {new Date(s.submittedAt).toLocaleString()}</p>
                    </div>
                    {s.pointsEarned > 0 && <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+{s.pointsEarned}pts</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right: Editor + Console */}
      <div className="flex-1 flex flex-col gap-3">
        {/* Language selector + action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {LANGUAGES.map(l => (
              <button key={l.id} onClick={() => setLanguage(l.id)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${language === l.id ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                {l.icon} {l.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-auto">
            <Button variant="secondary" size="sm" icon={running ? Loader2 : Play}
              onClick={handleRun} loading={running} disabled={submitting}>
              Run Code
            </Button>
            <Button size="sm" icon={submitting ? Loader2 : Send}
              onClick={handleSubmit} loading={submitting} disabled={running}>
              Submit
            </Button>
          </div>
        </div>

        {/* Code editor */}
        <div className="flex-1 rounded-xl overflow-hidden border border-slate-700 min-h-0">
          <div className="bg-slate-900 px-4 py-2 border-b border-slate-700 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500 opacity-60" />
              <div className="w-3 h-3 rounded-full bg-amber-500 opacity-60" />
              <div className="w-3 h-3 rounded-full bg-emerald-500 opacity-60" />
            </div>
            <span className="text-xs text-slate-500 ml-2 font-mono">{language === 'javascript' ? 'solution.js' : language === 'python' ? 'solution.py' : language === 'java' ? 'Solution.java' : 'solution.cpp'}</span>
          </div>
          <CodeEditor code={code} onChange={setCode} language={language} />
        </div>

        {/* Console / Results */}
        {(runResults || submitResult) && (
          <div className="max-h-64 overflow-y-auto space-y-2 flex-shrink-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <Terminal size={12} />
              {runResults ? 'Run Results (Visible Test Cases)' : 'Submission Results (All Test Cases)'}
            </div>
            {submitResult && <SubmissionResult result={submitResult} />}
            {runResults && !submitResult && <TestResults results={runResults} type="run" />}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function CodingProblemPage() {
  const [selectedProblem, setSelectedProblem] = useState(null);
  if (selectedProblem) return <ProblemEditor problem={selectedProblem} onBack={() => setSelectedProblem(null)} />;
  return <ProblemList onSelect={setSelectedProblem} />;
}
