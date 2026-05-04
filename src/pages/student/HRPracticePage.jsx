import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare, Send, CheckCircle, Clock, Star,
  ChevronLeft, Lightbulb, User, Trophy, BookOpen,
  AlertCircle, RotateCcw,
} from 'lucide-react';
import { hrAPI } from '../../api/services';
import { getSocket } from '../../api/socket';
import { Card, CardBody, Badge, Button, PageHeader, EmptyState, Textarea } from '../../components/common/UI';
import toast from 'react-hot-toast';

const CATEGORY_META = {
  behavioral:    { label: 'Behavioral',    emoji: '🤝', color: 'brand' },
  situational:   { label: 'Situational',   emoji: '🎯', color: 'sky' },
  competency:    { label: 'Competency',    emoji: '⚡', color: 'emerald' },
  motivation:    { label: 'Motivation',    emoji: '🔥', color: 'amber' },
  'culture-fit': { label: 'Culture Fit',   emoji: '🌱', color: 'green' },
  leadership:    { label: 'Leadership',    emoji: '👑', color: 'purple' },
  communication: { label: 'Communication', emoji: '💬', color: 'rose' },
  'technical':   { label: 'Technical',     emoji: '💻', color: 'blue'},
};

const STAR_TIPS = [
  '**S**ituation — Set the context briefly',
  '**T**ask — Describe your responsibility',
  '**A**ction — Explain what YOU did (use "I", not "we")',
  '**R**esult — Quantify the outcome if possible',
];

function StatusBadge({ status, score, maxPoints }) {
  if (!status) return null;
  if (status === 'under_review') {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-full border border-amber-200 dark:border-amber-800">
        <Clock size={11} className="animate-pulse" /> Awaiting Review
      </span>
    );
  }
  if (status === 'reviewed') {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full border border-emerald-200 dark:border-emerald-800">
        <CheckCircle size={11} /> Reviewed · {score}/{maxPoints} pts
      </span>
    );
  }
  return null;
}

function RubricDisplay({ rubricScores }) {
  if (!rubricScores?.length) return null;
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Score Breakdown</p>
      {rubricScores.map((r, i) => (
        <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{r.criterion}</p>
            {r.feedback && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{r.feedback}</p>}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-3">
            {Array(r.maxScore).fill(0).map((_, si) => (
              <div key={si} className={`w-3 h-3 rounded-full ${si < r.score ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
            ))}
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">{r.score}/{r.maxScore}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function TaskDetailModal({ task, onClose, onSubmit }) {
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const hasSubmission = task.mySubmission;
  const isReviewed = task.mySubmission?.status === 'reviewed';

  const handleSubmit = async () => {
    if (answer.trim().split(/\s+/).length < 20) {
      toast.error('Please write at least 20 words for a meaningful answer');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(task._id, answer.trim());
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{CATEGORY_META[task.category]?.emoji}</span>
              <Badge variant={CATEGORY_META[task.category]?.color || 'default'}>{CATEGORY_META[task.category]?.label || task.category}</Badge>
              <Badge variant={task.difficulty}>{task.difficulty}</Badge>
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display leading-snug">{task.title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0">✕</button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Question */}
          <div className="p-4 bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-200 dark:border-brand-800">
            <p className="text-sm text-brand-900 dark:text-brand-100 leading-relaxed font-medium">{task.description}</p>
          </div>

          {/* Instructions */}
          {task.instructions && (
            <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{task.instructions}</div>
          )}

          {/* STAR tips */}
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 space-y-2">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5"><Lightbulb size={12} /> STAR Framework Tips</p>
            {STAR_TIPS.map((tip, i) => (
              <p key={i} className="text-xs text-amber-700 dark:text-amber-300" dangerouslySetInnerHTML={{ __html: tip.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            ))}
          </div>

          {/* Tips */}
          {task.tips?.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Key Points to Cover</p>
              {task.tips.map((tip, i) => (
                <p key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <span className="text-brand-500 flex-shrink-0">•</span> {tip}
                </p>
              ))}
            </div>
          )}

          {/* Rubric preview */}
          {task.rubric?.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">How You'll Be Scored</p>
              {task.rubric.map((r, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">{r.criterion}</span>
                  <span className="text-brand-600 dark:text-brand-400 font-semibold">{r.maxScore} pts</span>
                </div>
              ))}
              <p className="text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">Total: {task.maxPoints} points</p>
            </div>
          )}

          {/* Submission area */}
          {hasSubmission ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Your Answer</p>
                <StatusBadge status={task.mySubmission.status} score={task.mySubmission.totalScore} maxPoints={task.maxPoints} />
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {task.mySubmission.answer}
              </div>

              {isReviewed && (
                <>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">Admin Feedback</p>
                    <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">{task.mySubmission.overallFeedback}</p>
                  </div>
                  <RubricDisplay rubricScores={task.mySubmission.rubricScores} />
                  {task.sampleAnswer && (
                    <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-xl border border-sky-200 dark:border-sky-800">
                      <p className="text-xs font-semibold text-sky-700 dark:text-sky-400 mb-1">💡 Sample Answer</p>
                      <p className="text-sm text-sky-800 dark:text-sky-300 leading-relaxed">{task.sampleAnswer}</p>
                    </div>
                  )}
                </>
              )}

              {task.mySubmission.status === 'under_review' && (
                <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-200 dark:border-amber-800">
                  <Clock size={13} className="animate-pulse" />
                  Submitted and waiting for admin review. You'll be notified when reviewed.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Your Answer</p>
                <span className="text-xs text-slate-400">{wordCount} words · aim for 150–250</span>
              </div>
              <Textarea
                value={answer}
                onChange={e => { setAnswer(e.target.value); setWordCount(e.target.value.trim() ? e.target.value.trim().split(/\s+/).length : 0); }}
                rows={8}
                placeholder="Use the STAR method: Situation → Task → Action → Result&#10;&#10;Example: 'In my previous internship (Situation), I was tasked with reducing API response time (Task). I profiled the endpoints and found N+1 queries, then implemented eager loading (Action). This reduced response time by 60% (Result).'&#10;&#10;Write your answer here..."
              />
              <Button onClick={handleSubmit} loading={submitting} icon={Send} className="w-full">
                Submit for Review
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HRPracticePage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('');

  const loadTasks = () => {
    hrAPI.getAll()
      .then(r => setTasks(r.data.data || []))
      .catch(() => toast.error('Failed to load tasks'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadTasks(); }, []);

  // Socket: update task status when reviewed
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = (data) => {
      setTasks(prev => prev.map(t =>
        t._id === data.taskId?.toString()
          ? { ...t, mySubmission: { ...t.mySubmission, status: 'reviewed', totalScore: data.score } }
          : t
      ));
      loadTasks(); // refresh to get full data
    };
    socket.on('submission_reviewed', handler);
    return () => socket.off('submission_reviewed', handler);
  }, []);

  const handleSubmit = async (taskId, answer) => {
    const { data } = await hrAPI.submit(taskId, { answer });
    toast.success('Answer submitted! Admin will review it shortly 🕐');
    setTasks(prev => prev.map(t =>
      t._id === taskId ? { ...t, mySubmission: { status: 'under_review', answer } } : t
    ));
  };

  const filteredTasks = filter ? tasks.filter(t => t.category === filter) : tasks;
  const totalReviewed = tasks.filter(t => t.mySubmission?.status === 'reviewed').length;
  const totalPending = tasks.filter(t => t.mySubmission?.status === 'under_review').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="HR Interview Practice"
        subtitle="Real HR questions reviewed by admin with personalized feedback and rubric scoring"
      />

      {/* Summary stats */}
      {(totalReviewed > 0 || totalPending > 0) && (
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-brand-600 dark:text-brand-400 font-display">{tasks.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Total Questions</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-display">{totalReviewed}</p>
            <p className="text-xs text-slate-500 mt-0.5">Reviewed</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-display">{totalPending}</p>
            <p className="text-xs text-slate-500 mt-0.5">Pending Review</p>
          </Card>
        </div>
      )}

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${!filter ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-400'}`}>
          All
        </button>
        {Object.entries(CATEGORY_META).map(([key, { label, emoji }]) => (
          <button key={key} onClick={() => setFilter(k => k === key ? '' : key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${filter === key ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-400'}`}>
            {emoji} {label}
          </button>
        ))}
      </div>

      {/* Task list */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(6).fill(0).map((_, i) => <div key={i} className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No HR questions yet" description="Admin will add questions soon. Check back later." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map(task => {
            const meta = CATEGORY_META[task.category] || { label: task.category, emoji: '💬', color: 'default' };
            const sub = task.mySubmission;
            const isReviewed = sub?.status === 'reviewed';
            const isPending = sub?.status === 'under_review';

            return (
              <Card key={task._id} hover className="flex flex-col" onClick={() => setSelected(task)}>
                <CardBody className="flex flex-col gap-3 p-5 flex-1">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xl">{meta.emoji}</span>
                      <Badge variant={meta.color}>{meta.label}</Badge>
                      <Badge variant={task.difficulty}>{task.difficulty}</Badge>
                    </div>
                    <div className="flex-shrink-0">
                      {isReviewed && <CheckCircle size={18} className="text-emerald-500" />}
                      {isPending && <Clock size={18} className="text-amber-500 animate-pulse" />}
                      {!sub && <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600" />}
                    </div>
                  </div>

                  {/* Question */}
                  <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2">{task.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{task.description}</p>

                  {/* Score if reviewed */}
                  {isReviewed && (
                    <div className="flex items-center gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <Trophy size={13} className="text-emerald-500" />
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        Score: {sub.totalScore}/{task.maxPoints} pts
                      </span>
                    </div>
                  )}
                  {isPending && (
                    <div className="flex items-center gap-2 p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                      <Clock size={13} className="text-amber-500 animate-pulse" />
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Submitted · Awaiting review</span>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-400 flex items-center gap-1"><Trophy size={10} /> {task.maxPoints} pts</span>
                    <button className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                      {sub ? 'View Answer →' : 'Answer Now →'}
                    </button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* Task modal */}
      {selected && (
        <TaskDetailModal
          task={selected}
          onClose={() => setSelected(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
