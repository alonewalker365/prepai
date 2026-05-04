import { useState, useEffect, useCallback } from 'react';
import { Search, Bookmark, Check, Code2, Filter, ChevronRight } from 'lucide-react';
import { codingAPI } from '../../api/services';
import { Card, CardBody, Badge, PageHeader, EmptyState } from '../../components/common/UI';
import toast from 'react-hot-toast';

const TOPICS = ['array','string','dp','graph','tree','linkedlist','sorting','greedy','backtracking','binarysearch','stack','queue','heap','math','twopointers'];
const COMPANIES = ['Google','Amazon','Microsoft','Facebook','Apple','Uber','Adobe','Netflix','Bloomberg','Flipkart'];
const topicEmoji = { array:'📦', string:'🔤', dp:'🧩', graph:'🕸️', tree:'🌲', linkedlist:'🔗', sorting:'📊', greedy:'💰', backtracking:'↩️', binarysearch:'🔍', stack:'📚', queue:'🚶', heap:'⛰️', math:'➗', twopointers:'👉' };

const difficultyCount = (questions) => ({
  easy: questions.filter(q => q.difficulty === 'easy').length,
  medium: questions.filter(q => q.difficulty === 'medium').length,
  hard: questions.filter(q => q.difficulty === 'hard').length,
});

export default function CodingPracticePage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ topic: '', difficulty: '', search: '', company: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const LIMIT = 20;

  const load = useCallback(() => {
    setLoading(true);
    codingAPI.getAll({ ...filters, page, limit: LIMIT })
      .then((r) => {
        setQuestions(r.data.data.questions || []);
        setTotal(r.data.data.pagination?.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters, page]);

  useEffect(() => { load(); }, [load]);

  const toggleBookmark = async (id, e) => {
    e.stopPropagation();
    await codingAPI.bookmark(id);
    setQuestions((qs) => qs.map((q) => q._id === id ? { ...q, isBookmarked: !q.isBookmarked } : q));
    toast.success('Bookmark updated');
  };

  const markSolved = async (id, e) => {
    e.stopPropagation();
    await codingAPI.markSolved(id);
    setQuestions((qs) => qs.map((q) => q._id === id ? { ...q, isSolved: true } : q));
    toast.success('Marked as solved! ✅');
  };

  const setFilter = (key, val) => { setFilters((f) => ({ ...f, [key]: val })); setPage(1); };
  const hasFilters = filters.topic || filters.difficulty || filters.company;

  const solvedCount = questions.filter(q => q.isSolved).length;
  const counts = difficultyCount(questions);

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Coding Practice"
        subtitle="Curated DSA problems from top companies — bookmark, track, and solve"
      />

      {/* Summary row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: total, color: 'text-slate-700 dark:text-slate-300' },
          { label: 'Easy', value: counts.easy, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Medium', value: counts.medium, color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Hard', value: counts.hard, color: 'text-red-600 dark:text-red-400' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="p-4 text-center">
            <p className={`text-2xl font-bold font-display ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      {/* Search + filters */}
      <Card>
        <CardBody className="space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Search questions..."
                value={filters.search}
                onChange={(e) => setFilter('search', e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(s => !s)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${showFilters || hasFilters ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
            >
              <Filter size={14} /> Filters {hasFilters && '●'}
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <select value={filters.difficulty} onChange={(e) => setFilter('difficulty', e.target.value)} className="px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
              </select>
              <select value={filters.topic} onChange={(e) => setFilter('topic', e.target.value)} className="px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="">All Topics</option>
                {TOPICS.map(t => <option key={t} value={t}>{topicEmoji[t]} {t}</option>)}
              </select>
              <select value={filters.company} onChange={(e) => setFilter('company', e.target.value)} className="px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="">All Companies</option>
                {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Topic pills */}
      <div className="flex gap-2 flex-wrap">
        {TOPICS.slice(0, 10).map((t) => (
          <button key={t} onClick={() => setFilter('topic', t === filters.topic ? '' : t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize transition-all ${t === filters.topic ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-400'}`}>
            {topicEmoji[t]} {t}
          </button>
        ))}
      </div>

      {/* Question table */}
      <Card>
        <CardBody className="p-0">
          {/* Table header */}
          <div className="flex items-center gap-4 px-5 py-3 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wide">
            <span className="w-8">#</span>
            <span className="w-5" />
            <span className="flex-1">Title</span>
            <span className="hidden sm:block w-24 text-center">Difficulty</span>
            <span className="hidden md:block w-28 text-center">Topic</span>
            <span className="hidden lg:block flex-1">Companies</span>
            <span className="w-16 text-center">Actions</span>
          </div>

          {loading ? (
            Array(10).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-8 h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="flex-1 h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </div>
            ))
          ) : questions.length === 0 ? (
            <div className="py-12"><EmptyState icon={Code2} title="No questions found" description="Try different filters" /></div>
          ) : (
            questions.map((q, i) => (
              <div
                key={q._id}
                onClick={() => setSelected(selected?._id === q._id ? null : q)}
                className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
              >
                <span className="w-8 text-xs text-slate-400 flex-shrink-0">{(page - 1) * LIMIT + i + 1}</span>
                <div className="w-5 flex-shrink-0">
                  {q.isSolved
                    ? <Check size={14} className="text-emerald-500" />
                    : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 dark:border-slate-600 group-hover:border-brand-400 transition-colors" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">{q.title}</p>
                </div>
                <div className="hidden sm:block w-24 text-center">
                  <Badge variant={q.difficulty}>{q.difficulty}</Badge>
                </div>
                <div className="hidden md:block w-28 text-center">
                  <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                    {topicEmoji[q.topic]} {q.topic}
                  </span>
                </div>
                <div className="hidden lg:flex flex-1 flex-wrap gap-1">
                  {(q.companies || []).slice(0, 3).map((c) => (
                    <span key={c} className="text-xs px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded">{c}</span>
                  ))}
                </div>
                <div className="w-16 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <button onClick={(e) => toggleBookmark(q._id, e)} className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${q.isBookmarked ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`}>
                    <Bookmark size={13} fill={q.isBookmarked ? 'currentColor' : 'none'} />
                  </button>
                  {!q.isSolved && (
                    <button onClick={(e) => markSolved(q._id, e)} className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-slate-400 hover:text-emerald-600 transition-colors">
                      <Check size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardBody>
      </Card>

      {/* Expanded question detail */}
      {selected && (
        <Card className="border-brand-200 dark:border-brand-800 animate-slide-up">
          <CardBody className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">{selected.title}</h2>
              <div className="flex gap-2 flex-shrink-0">
                <Badge variant={selected.difficulty}>{selected.difficulty}</Badge>
                <Badge variant="brand" className="capitalize">{selected.topic}</Badge>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{selected.description}</p>

            {selected.examples?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Examples</p>
                {selected.examples.map((ex, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg font-mono text-xs space-y-1 mb-2">
                    <p><span className="text-slate-500">Input:</span> <span className="text-slate-900 dark:text-white">{ex.input}</span></p>
                    <p><span className="text-slate-500">Output:</span> <span className="text-slate-900 dark:text-white">{ex.output}</span></p>
                    {ex.explanation && <p className="text-slate-400 not-italic">{ex.explanation}</p>}
                  </div>
                ))}
              </div>
            )}

            {selected.hints?.length > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">💡 Hint</p>
                <p className="text-xs text-amber-700 dark:text-amber-300">{selected.hints[0]}</p>
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              {selected.timeComplexity && <span>⏱ Time: <span className="font-mono font-semibold">{selected.timeComplexity}</span></span>}
              {selected.spaceComplexity && <span>💾 Space: <span className="font-mono font-semibold">{selected.spaceComplexity}</span></span>}
              {selected.acceptance > 0 && <span>✅ Acceptance: {selected.acceptance}%</span>}
            </div>

            <button onClick={() => setSelected(null)} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              Close ×
            </button>
          </CardBody>
        </Card>
      )}

      {/* Pagination */}
      {Math.ceil(total / LIMIT) > 1 && (
        <div className="flex justify-center items-center gap-1.5 pt-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-40 hover:border-brand-400 transition-colors">
            ←
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400 px-2">
            Page {page} of {Math.ceil(total / LIMIT)}
          </span>
          <button onClick={() => setPage(p => Math.min(Math.ceil(total / LIMIT), p + 1))} disabled={page >= Math.ceil(total / LIMIT)}
            className="px-3 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-40 hover:border-brand-400 transition-colors">
            →
          </button>
        </div>
      )}
    </div>
  );
}
