import { useState, useEffect, useCallback } from 'react';
import {
  FileText, CheckCircle, XCircle, Clock, Eye,
  User, Calendar, Tag, Trophy, MessageSquare,
  ChevronRight, RefreshCw, Loader2,
} from 'lucide-react';
import { submissionAPI } from '../../api/services';
import { getSocket } from '../../api/socket';
import { Card, CardBody, Badge, Button, PageHeader, EmptyState, Textarea, Input } from '../../components/common/UI';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_TABS = [
  { key: 'under_review', label: 'Pending Review', icon: Clock, color: 'text-amber-600 dark:text-amber-400' },
  { key: 'completed',   label: 'Accepted',       icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400' },
  { key: 'rejected',    label: 'Rejected',        icon: XCircle, color: 'text-red-600 dark:text-red-400' },
];

const categoryColor = {
  coding: 'brand', aptitude: 'info', hr: 'success',
  'system-design': 'warning', theory: 'default', communication: 'success',
};

export default function ManageSubmissionsPage() {
  const [activeTab, setActiveTab] = useState('under_review');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [selected, setSelected] = useState(null); // full submission being reviewed
  const [reviewForm, setReviewForm] = useState({ feedback: '', score: '' });
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await submissionAPI.getAll({ status: activeTab, page, limit: LIMIT });
      setSubmissions(data.data.submissions || []);
      setTotal(data.data.pagination?.total || 0);
    } catch { toast.error('Failed to load submissions'); }
    finally { setLoading(false); }
  }, [activeTab, page]);

  // Load pending count separately for badge
  const loadPendingCount = useCallback(async () => {
    try {
      const { data } = await submissionAPI.getAll({ status: 'under_review', limit: 1 });
      setPendingCount(data.data.pagination?.total || 0);
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadPendingCount(); }, [loadPendingCount]);

  // Real-time: when a student submits, add to pending list if we're on that tab
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = () => {
      loadPendingCount();
      if (activeTab === 'under_review') load();
    };
    socket.on('new_notification', handler);
    return () => socket.off('new_notification', handler);
  }, [activeTab, load, loadPendingCount]);

  const openReview = (sub) => {
    setSelected(sub);
    setReviewForm({ feedback: '', score: '' });
    // Scroll to review panel
    setTimeout(() => document.getElementById('review-panel')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const closeReview = () => { setSelected(null); setReviewForm({ feedback: '', score: '' }); };

  const submitReview = async (action) => {
    if (!reviewForm.feedback.trim()) {
      toast.error('Feedback is required before reviewing');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await submissionAPI.review(selected._id, {
        action,
        feedback: reviewForm.feedback.trim(),
        score: reviewForm.score ? Number(reviewForm.score) : undefined,
      });

      toast.success(
        action === 'accept'
          ? `✅ Accepted! +${data.data.pointsAwarded} points awarded to ${selected.student?.name}`
          : `❌ Rejected. Feedback sent to ${selected.student?.name}`
      );

      // Remove from list
      setSubmissions(prev => prev.filter(s => s._id !== selected._id));
      setPendingCount(c => Math.max(0, c - 1));
      setTotal(t => Math.max(0, t - 1));
      closeReview();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Review Submissions"
        subtitle="Review student answers and accept or reject them"
        action={
          <button onClick={load} className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:border-brand-400 transition-colors">
            <RefreshCw size={14} /> Refresh
          </button>
        }
      />

      {/* Status tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
        {STATUS_TABS.map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setPage(1); setSelected(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all relative ${
              activeTab === key
                ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Icon size={14} className={activeTab === key ? color : ''} />
            <span className="hidden sm:inline">{label}</span>
            {key === 'under_review' && pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {pendingCount > 99 ? '99+' : pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Two-column layout: list + review panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Submission list */}
        <div className="space-y-2">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
            ))
          ) : submissions.length === 0 ? (
            <Card>
              <CardBody>
                <EmptyState
                  icon={activeTab === 'under_review' ? Clock : activeTab === 'completed' ? CheckCircle : XCircle}
                  title={activeTab === 'under_review' ? 'No pending submissions' : activeTab === 'completed' ? 'No accepted submissions yet' : 'No rejected submissions'}
                  description={activeTab === 'under_review' ? 'When students submit answers, they will appear here for review.' : 'Submissions you review will appear here.'}
                />
              </CardBody>
            </Card>
          ) : (
            submissions.map((sub) => {
              const isSelected = selected?._id === sub._id;
              return (
                <Card
                  key={sub._id}
                  className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-brand-500 dark:ring-brand-400' : 'hover:shadow-card-hover'}`}
                  onClick={() => isSelected ? closeReview() : openReview(sub)}
                >
                  <CardBody className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-sm font-bold text-brand-700 dark:text-brand-300 flex-shrink-0">
                        {sub.student?.name?.[0]?.toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{sub.task?.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {sub.student?.name} · {format(new Date(sub.submittedAt), 'MMM d, h:mm a')}
                            </p>
                          </div>
                          <div className="flex gap-1.5 flex-shrink-0">
                            <Badge variant={categoryColor[sub.task?.category] || 'default'}>{sub.task?.category}</Badge>
                            <Badge variant={sub.task?.difficulty}>{sub.task?.difficulty}</Badge>
                          </div>
                        </div>

                        {/* Preview of answer */}
                        {sub.content && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                            {sub.content}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                            {sub.task?.points} pts at stake
                          </span>
                          {activeTab === 'under_review' && (
                            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <Clock size={11} /> Awaiting review
                            </span>
                          )}
                          {sub.score != null && (
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Score: {sub.score}/100</span>
                          )}
                        </div>
                      </div>

                      <ChevronRight
                        size={14}
                        className={`text-slate-400 flex-shrink-0 transition-transform ${isSelected ? 'rotate-90' : ''}`}
                      />
                    </div>
                  </CardBody>
                </Card>
              );
            })
          )}

          {/* Pagination */}
          {Math.ceil(total / LIMIT) > 1 && (
            <div className="flex justify-center gap-1.5 pt-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-40">←</button>
              <span className="px-3 py-2 text-sm text-slate-500">Page {page} of {Math.ceil(total / LIMIT)}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / LIMIT)}
                className="px-3 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-40">→</button>
            </div>
          )}
        </div>

        {/* Review panel */}
        <div id="review-panel">
          {selected ? (
            <Card className="sticky top-6">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Review Answer</h2>
                <button onClick={closeReview} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-lg leading-none">×</button>
              </div>

              <CardBody className="space-y-5">
                {/* Student + Task info */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <User size={13} className="text-slate-400" />
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{selected.student?.name}</span>
                    <span className="text-xs text-slate-400">{selected.student?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag size={13} className="text-slate-400" />
                    <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{selected.task?.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Trophy size={11} /> {selected.task?.points} points
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar size={11} /> {format(new Date(selected.submittedAt), 'MMM d, h:mm a')}
                    </span>
                    {selected.timeTaken > 0 && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock size={11} /> {Math.round(selected.timeTaken / 60)}m taken
                      </span>
                    )}
                  </div>
                </div>

                {/* Student's answer */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Student's Answer</p>
                  <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl max-h-60 overflow-y-auto">
                    <pre className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                      {selected.content || <span className="text-slate-400 italic">No text answer provided</span>}
                    </pre>
                  </div>
                </div>

                {/* Review form — only for under_review */}
                {activeTab === 'under_review' && (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <Textarea
                          label="Feedback * (required)"
                          value={reviewForm.feedback}
                          onChange={e => setReviewForm(f => ({ ...f, feedback: e.target.value }))}
                          rows={4}
                          placeholder="Give constructive feedback to the student..."
                        />
                      </div>
                      <div>
                        <Input
                          label="Score (0–100)"
                          type="number"
                          min={0}
                          max={100}
                          value={reviewForm.score}
                          onChange={e => setReviewForm(f => ({ ...f, score: e.target.value }))}
                          placeholder="Optional"
                        />
                        <p className="text-xs text-slate-400 mt-1">Leave blank to skip scoring</p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => submitReview('accept')}
                        disabled={submitting || !reviewForm.feedback.trim()}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
                      >
                        {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                        Accept Answer
                      </button>
                      <button
                        onClick={() => submitReview('reject')}
                        disabled={submitting || !reviewForm.feedback.trim()}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
                      >
                        {submitting ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                        Reject Answer
                      </button>
                    </div>

                    <div className="flex gap-4 text-xs text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-1">
                        <CheckCircle size={10} className="text-emerald-500" />
                        Accept = marks complete + awards {selected.task?.points} pts
                      </span>
                      <span className="flex items-center gap-1">
                        <XCircle size={10} className="text-red-500" />
                        Reject = sends feedback, no points
                      </span>
                    </div>
                  </>
                )}

                {/* Already reviewed — show stored feedback */}
                {activeTab !== 'under_review' && selected.feedback && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Your Feedback</p>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{selected.feedback}</p>
                      {selected.score != null && (
                        <p className="text-xs font-bold text-brand-600 dark:text-brand-400 mt-2">Score: {selected.score}/100</p>
                      )}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardBody>
                <div className="py-12 text-center">
                  <Eye className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Select a submission to review</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Click any submission on the left to read the answer and accept or reject it
                  </p>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
