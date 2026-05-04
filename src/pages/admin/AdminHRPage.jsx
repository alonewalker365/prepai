import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, MessageSquare, CheckCircle, Clock, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { hrAPI } from '../../api/services';
import { Card, CardBody, Badge, Button, PageHeader, EmptyState, Input, Select, Textarea } from '../../components/common/UI';
import { getSocket } from '../../api/socket';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const CATEGORIES = ['behavioral','situational','competency','motivation','culture-fit','leadership','communication','technical'];

const EMPTY_FORM = {
  title: '', description: '', category: 'behavioral', difficulty: 'medium',
  instructions: '', sampleAnswer: '', tips: '', maxPoints: 20, isPublished: true,
  rubric: [{ criterion: 'Content Quality', maxScore: 8, description: 'Accuracy and depth of answer' }, { criterion: 'STAR Structure', maxScore: 6, description: 'Uses Situation-Task-Action-Result framework' }, { criterion: 'Communication', maxScore: 6, description: 'Clarity, flow, and professionalism' }],
};

function RubricBuilder({ rubric, onChange }) {
  const add = () => onChange([...rubric, { criterion: '', maxScore: 5, description: '' }]);
  const update = (i, field, val) => { const r = [...rubric]; r[i] = { ...r[i], [field]: val }; onChange(r); };
  const remove = (i) => onChange(rubric.filter((_, idx) => idx !== i));
  return (
    <div className="space-y-3">
      {rubric.map((r, i) => (
        <div key={i} className="p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/40 space-y-2">
          <div className="flex items-center gap-3">
            <Input label="" value={r.criterion} onChange={e => update(i, 'criterion', e.target.value)} placeholder="Criterion name" className="flex-1" />
            <div className="w-28 flex-shrink-0">
              <Input label="Max Score" type="number" min={1} max={20} value={r.maxScore} onChange={e => update(i, 'maxScore', Number(e.target.value))} />
            </div>
            <button onClick={() => remove(i)} className="p-1.5 mt-5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"><Trash2 size={13} /></button>
          </div>
          <Input label="" value={r.description} onChange={e => update(i, 'description', e.target.value)} placeholder="Description for this criterion..." />
        </div>
      ))}
      <button onClick={add} className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-500 hover:border-brand-400 hover:text-brand-600 transition-colors">
        <Plus size={12} /> Add Criterion
      </button>
    </div>
  );
}

function ReviewPanel({ submission, onReview, onClose }) {
  const [scores, setScores] = useState(
    (submission.task?.rubric || []).map(r => ({ criterion: r.criterion, score: 0, maxScore: r.maxScore, feedback: '' }))
  );
  const [overallFeedback, setOverallFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const totalScore = scores.reduce((s, r) => s + r.score, 0);
  const maxTotal = submission.task?.maxPoints || 20;

  const updateScore = (i, field, val) => {
    const s = [...scores];
    s[i] = { ...s[i], [field]: val };
    setScores(s);
  };

  const handleSubmit = async () => {
    if (!overallFeedback.trim()) { toast.error('Overall feedback is required'); return; }
    setSubmitting(true);
    try {
      await onReview(submission._id, { rubricScores: scores, overallFeedback });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review failed');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        <div className="sticky top-0 bg-white dark:bg-slate-900 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">Review HR Answer</h2>
            <p className="text-xs text-slate-500">{submission.student?.name} · {submission.task?.title}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-lg leading-none">×</button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Question */}
          <div className="p-4 bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-200 dark:border-brand-800">
            <p className="text-xs font-semibold text-brand-700 dark:text-brand-400 mb-1">Question</p>
            <p className="text-sm text-brand-900 dark:text-brand-100 font-medium">{submission.task?.description}</p>
          </div>

          {/* Student answer */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Student's Answer</p>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap max-h-52 overflow-y-auto">
              {submission.answer}
            </div>
          </div>

          {/* Rubric scoring */}
          {scores.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Score per Criterion</p>
              {scores.map((r, i) => (
                <div key={i} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{r.criterion}</p>
                      {submission.task?.rubric?.[i]?.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{submission.task.rubric[i].description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {Array(r.maxScore).fill(0).map((_, si) => (
                        <button key={si} onClick={() => updateScore(i, 'score', si + 1 === r.score ? 0 : si + 1)}
                          className={`w-5 h-5 rounded-full border transition-all ${si < r.score ? 'bg-brand-500 border-brand-500' : 'border-slate-300 dark:border-slate-600 hover:border-brand-400'}`} />
                      ))}
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-2 w-8 text-right">{r.score}/{r.maxScore}</span>
                    </div>
                  </div>
                  <input value={r.feedback} onChange={e => updateScore(i, 'feedback', e.target.value)}
                    placeholder="Specific feedback for this criterion (optional)..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              ))}

              {/* Total */}
              <div className={`flex items-center justify-between p-3 rounded-xl border ${totalScore >= maxTotal * 0.6 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'}`}>
                <span className="text-sm font-bold text-slate-900 dark:text-white">Total Score</span>
                <span className={`text-lg font-bold ${totalScore >= maxTotal * 0.6 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {totalScore} / {maxTotal}
                </span>
              </div>
            </div>
          )}

          {/* No rubric — just score input */}
          {scores.length === 0 && (
            <Input label={`Score (out of ${maxTotal})`} type="number" min={0} max={maxTotal}
              value={scores[0]?.score || 0} onChange={e => setScores([{ score: Number(e.target.value) }])} />
          )}

          {/* Overall feedback */}
          <Textarea
            label="Overall Feedback * (sent to student)"
            value={overallFeedback}
            onChange={e => setOverallFeedback(e.target.value)}
            rows={4}
            placeholder="Write detailed feedback for the student. What did they do well? What could be improved? Any specific suggestions?"
          />

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSubmit} loading={submitting} icon={CheckCircle} className="flex-1">
              Submit Review & Notify Student
            </Button>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminHRPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('tasks');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [reviewing, setReviewing] = useState(null);
  const [statusFilter, setStatusFilter] = useState('under_review');

  const loadTasks = () => {
    setLoading(true);
    hrAPI.getAll()
      .then(r => setTasks(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const loadSubmissions = () => {
    setLoadingSubs(true);
    hrAPI.getAllSubmissions({ status: statusFilter, limit: 50 })
      .then(r => {
        setSubmissions(r.data.data.submissions || []);
        if (statusFilter === 'under_review') setPendingCount(r.data.data.pagination?.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoadingSubs(false));
  };

  useEffect(() => { loadTasks(); }, []);
  useEffect(() => { if (tab === 'submissions') loadSubmissions(); }, [tab, statusFilter]);

  // Socket: increment badge on new HR submission
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = () => { setPendingCount(c => c + 1); if (tab === 'submissions') loadSubmissions(); };
    socket.on('new_notification', handler);
    return () => socket.off('new_notification', handler);
  }, [tab]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    if (!form.title || !form.description) { toast.error('Title and description required'); return; }
    setSaving(true);
    const payload = { ...form, tips: form.tips.split('\n').map(s => s.trim()).filter(Boolean) };
    try {
      if (editingId) { await hrAPI.update(editingId, payload); toast.success('Task updated!'); }
      else { await hrAPI.create(payload); toast.success('HR Task created!'); }
      loadTasks(); setForm(EMPTY_FORM); setEditingId(null); setTab('tasks');
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleEdit = (task) => {
    setForm({ title: task.title, description: task.description, category: task.category, difficulty: task.difficulty, instructions: task.instructions || '', sampleAnswer: task.sampleAnswer || '', tips: (task.tips || []).join('\n'), maxPoints: task.maxPoints, isPublished: task.isPublished, rubric: task.rubric?.length ? task.rubric : EMPTY_FORM.rubric });
    setEditingId(task._id); setTab('create');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this HR task?')) return;
    await hrAPI.delete(id); toast.success('Task deleted'); loadTasks();
  };

  const handleReview = async (subId, reviewData) => {
    await hrAPI.review(subId, reviewData);
    toast.success('✅ Review submitted! Student notified.');
    setSubmissions(prev => prev.filter(s => s._id !== subId));
    setPendingCount(c => Math.max(0, c - 1));
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader title="HR Questions" subtitle="Create HR interview questions and review student answers with rubric scoring"
        action={<Button icon={Plus} onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setTab('create'); }}>New HR Task</Button>}
      />

      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        {[{ k: 'tasks', l: '📋 All Tasks' }, { k: 'create', l: editingId ? '✏️ Edit' : '➕ Create' }, { k: 'submissions', l: `📝 Review (${pendingCount > 0 ? pendingCount + ' pending' : 'All'})` }].map(({ k, l }) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${tab === k ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
            {l}
            {k === 'submissions' && pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{pendingCount > 9 ? '9+' : pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tasks list */}
      {tab === 'tasks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? Array(4).fill(0).map((_, i) => <div key={i} className="h-36 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />) :
            tasks.length === 0 ? <div className="col-span-2"><EmptyState icon={MessageSquare} title="No HR tasks yet" action={<Button onClick={() => setTab('create')} icon={Plus}>Create First Task</Button>} /></div> :
            tasks.map(task => (
              <Card key={task._id}>
                <CardBody className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">{task.title}</p>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => handleEdit(task)} className="p-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/30 text-slate-400 hover:text-brand-600 transition-colors text-sm">✏️</button>
                      <button onClick={() => handleDelete(task._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{task.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="brand" className="capitalize">{task.category}</Badge>
                    <Badge variant={task.difficulty}>{task.difficulty}</Badge>
                    <Badge variant={task.isPublished ? 'success' : 'default'}>{task.isPublished ? 'Live' : 'Draft'}</Badge>
                    <span className="text-xs text-slate-400 ml-auto">{task.maxPoints} pts</span>
                  </div>
                </CardBody>
              </Card>
            ))
          }
        </div>
      )}

      {/* Create/Edit */}
      {tab === 'create' && (
        <div className="max-w-3xl space-y-5">
          <Card><CardBody className="space-y-4">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Task Details</h2>
            <Input label="Question Title *" value={form.title} onChange={set('title')} placeholder="e.g. Tell Me About Yourself" />
            <Textarea label="Full Question *" value={form.description} onChange={set('description')} rows={3} placeholder="Write the complete HR question as it would be asked in an interview..." />
            <div className="grid grid-cols-3 gap-4">
              <Select label="Category" value={form.category} onChange={set('category')}>
                {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </Select>
              <Select label="Difficulty" value={form.difficulty} onChange={set('difficulty')}>
                <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
              </Select>
              <Input label="Max Points" type="number" min={5} max={100} value={form.maxPoints} onChange={set('maxPoints')} />
            </div>
            <Textarea label="Instructions (shown to student)" value={form.instructions} onChange={set('instructions')} rows={2} placeholder="e.g. Use the STAR method. Keep your answer under 2 minutes..." />
            <Textarea label="Key Tips (one per line)" value={form.tips} onChange={set('tips')} rows={3} placeholder="Focus on recent examples&#10;Use specific numbers and results&#10;Keep it under 2 minutes" />
            <Textarea label="Sample Answer (shown after review)" value={form.sampleAnswer} onChange={set('sampleAnswer')} rows={5} placeholder="Write a model answer that students can reference after they receive feedback..." />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} className="w-4 h-4 accent-brand-600" />
              <span className="text-sm text-slate-700 dark:text-slate-300">Published</span>
            </label>
          </CardBody></Card>

          <Card><CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Scoring Rubric</h2>
              <span className="text-xs text-slate-400">Total: {form.rubric.reduce((s, r) => s + r.maxScore, 0)} pts</span>
            </div>
            <RubricBuilder rubric={form.rubric} onChange={r => setForm(f => ({ ...f, rubric: r }))} />
          </CardBody></Card>

          <div className="flex gap-3">
            <Button onClick={handleSave} loading={saving} icon={Save} size="lg">{editingId ? 'Update Task' : 'Create Task'}</Button>
            <Button variant="secondary" onClick={() => { setTab('tasks'); setEditingId(null); setForm(EMPTY_FORM); }}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Submissions review */}
      {tab === 'submissions' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {['under_review', 'reviewed'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all capitalize ${statusFilter === s ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                {s === 'under_review' ? `⏳ Pending Review${pendingCount > 0 ? ` (${pendingCount})` : ''}` : '✅ Reviewed'}
              </button>
            ))}
          </div>

          {loadingSubs ? Array(4).fill(0).map((_, i) => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />) :
            submissions.length === 0 ? (
              <EmptyState icon={MessageSquare}
                title={statusFilter === 'under_review' ? 'No pending submissions' : 'No reviewed submissions'}
                description={statusFilter === 'under_review' ? 'When students submit HR answers, they appear here for review.' : 'Submissions you review appear here.'} />
            ) :
            submissions.map(sub => (
              <Card key={sub._id}>
                <CardBody className="p-4 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-sm font-bold text-brand-700 dark:text-brand-300 flex-shrink-0">
                    {sub.student?.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{sub.task?.title}</p>
                        <p className="text-xs text-slate-500">{sub.student?.name} · {sub.student?.email} · {format(new Date(sub.submittedAt), 'MMM d, h:mm a')}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {sub.status === 'under_review'
                          ? <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-semibold"><Clock size={11} className="animate-pulse" /> Pending</span>
                          : <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold"><CheckCircle size={11} /> Reviewed · {sub.totalScore}pts</span>
                        }
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2">{sub.answer}</p>
                    <div className="flex gap-2 pt-1">
                      {sub.status === 'under_review' && (
                        <Button size="xs" icon={Star} onClick={() => setReviewing(sub)}>Review & Score</Button>
                      )}
                      {sub.status === 'reviewed' && sub.overallFeedback && (
                        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-xs text-emerald-700 dark:text-emerald-400 flex-1">
                          <strong>Feedback:</strong> {sub.overallFeedback}
                        </div>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))
          }
        </div>
      )}

      {reviewing && (
        <ReviewPanel
          submission={reviewing}
          onReview={handleReview}
          onClose={() => setReviewing(null)}
        />
      )}
    </div>
  );
}
