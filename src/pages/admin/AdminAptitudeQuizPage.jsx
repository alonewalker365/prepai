import { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, ChevronDown, ChevronUp, Save, BookOpen, BarChart3, CheckCircle, XCircle, Clock } from 'lucide-react';
import { aptitudeAPI } from '../../api/services';
import { Card, CardBody, Badge, Button, PageHeader, EmptyState, Input, Select, Textarea } from '../../components/common/UI';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const TOPICS = ['quantitative','logical','verbal','data-interpretation','general-knowledge','reasoning','technical'];

function QuestionBuilder({ questions, onChange }) {
  const addQuestion = () => {
    onChange([...questions, {
      text: '', options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }],
      explanation: '', points: 4, negativeMark: 1,
    }]);
  };

  const updateQ = (qi, field, val) => {
    const qs = [...questions];
    qs[qi] = { ...qs[qi], [field]: val };
    onChange(qs);
  };

  const updateOpt = (qi, oi, field, val) => {
    const qs = [...questions];
    const opts = [...qs[qi].options];
    opts[oi] = { ...opts[oi], [field]: val };
    // If setting isCorrect to true, reset others
    if (field === 'isCorrect' && val === true) opts.forEach((o, i) => { if (i !== oi) opts[i] = { ...opts[i], isCorrect: false }; });
    qs[qi] = { ...qs[qi], options: opts };
    onChange(qs);
  };

  const removeQ = (qi) => onChange(questions.filter((_, i) => i !== qi));
  const addOption = (qi) => { const qs = [...questions]; qs[qi].options.push({ text: '', isCorrect: false }); onChange(qs); };

  return (
    <div className="space-y-4">
      {questions.map((q, qi) => (
        <div key={qi} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/40 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <span className="w-7 h-7 rounded-lg bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {qi + 1}
            </span>
            <Textarea label="" value={q.text} onChange={e => updateQ(qi, 'text', e.target.value)}
              placeholder="Enter question text..." rows={2} className="flex-1" />
            <button onClick={() => removeQ(qi)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600 transition-colors flex-shrink-0 mt-1">
              <Trash2 size={14} />
            </button>
          </div>

          <div className="space-y-2 pl-10">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Options (click ● to mark correct)</p>
            {q.options.map((opt, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <button onClick={() => updateOpt(qi, oi, 'isCorrect', true)}
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${opt.isCorrect ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 dark:border-slate-600 hover:border-emerald-400'}`}>
                  {opt.isCorrect && <div className="w-2 h-2 bg-white rounded-full" />}
                </button>
                <span className="text-xs text-slate-500 w-5 flex-shrink-0">{String.fromCharCode(65 + oi)}.</span>
                <input value={opt.text} onChange={e => updateOpt(qi, oi, 'text', e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            ))}
            {q.options.length < 6 && (
              <button onClick={() => addOption(qi)} className="text-xs text-brand-600 dark:text-brand-400 hover:underline pl-7">+ Add option</button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 pl-10">
            <Input label="Points" type="number" min={1} max={20} value={q.points} onChange={e => updateQ(qi, 'points', Number(e.target.value))} />
            <Input label="Negative Mark" type="number" min={0} max={5} step={0.25} value={q.negativeMark} onChange={e => updateQ(qi, 'negativeMark', Number(e.target.value))} />
            <Input label="Explanation (optional)" value={q.explanation} onChange={e => updateQ(qi, 'explanation', e.target.value)} placeholder="Why is this correct?" />
          </div>
        </div>
      ))}
      <button onClick={addQuestion} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-sm text-slate-500 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
        <Plus size={16} /> Add Question
      </button>
    </div>
  );
}

const EMPTY_FORM = {
  title: '', description: '', topic: 'quantitative', difficulty: 'medium',
  timeLimit: 20, passingScore: 60, isPublished: false, questions: [],
};

export default function AdminAptitudeQuizPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('quizzes'); // quizzes | create | attempts
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [expandedAttempt, setExpandedAttempt] = useState(null);

  const loadQuizzes = () => {
    setLoading(true);
    aptitudeAPI.getAll()
      .then(r => setQuizzes(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const loadAttempts = () => {
    setLoadingAttempts(true);
    aptitudeAPI.getAllAttempts({ limit: 50 })
      .then(r => setAttempts(r.data.data.attempts || []))
      .catch(() => {})
      .finally(() => setLoadingAttempts(false));
  };

  useEffect(() => { loadQuizzes(); }, []);
  useEffect(() => { if (tab === 'attempts') loadAttempts(); }, [tab]);

  const handleSave = async () => {
    if (!form.title || !form.questions.length) { toast.error('Title and at least one question required'); return; }
    const invalidQ = form.questions.findIndex(q => !q.text || !q.options.some(o => o.isCorrect) || q.options.some(o => !o.text));
    if (invalidQ >= 0) { toast.error(`Question ${invalidQ + 1}: ensure text, all options filled, and one correct answer`); return; }
    setSaving(true);
    try {
      if (editingId) { await aptitudeAPI.update(editingId, form); toast.success('Quiz updated!'); }
      else { await aptitudeAPI.create(form); toast.success('Quiz created!'); }
      loadQuizzes();
      setForm(EMPTY_FORM); setEditingId(null); setTab('quizzes');
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleEdit = (quiz) => {
    setForm({ title: quiz.title, description: quiz.description || '', topic: quiz.topic, difficulty: quiz.difficulty, timeLimit: quiz.timeLimit, passingScore: quiz.passingScore, isPublished: quiz.isPublished, questions: quiz.questions || [] });
    setEditingId(quiz._id);
    setTab('create');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this quiz? All student attempts will also be deleted.')) return;
    await aptitudeAPI.delete(id);
    toast.success('Quiz deleted');
    loadQuizzes();
  };

  const togglePublish = async (quiz) => {
    await aptitudeAPI.update(quiz._id, { isPublished: !quiz.isPublished });
    setQuizzes(qs => qs.map(q => q._id === quiz._id ? { ...q, isPublished: !q.isPublished } : q));
    toast.success(quiz.isPublished ? 'Quiz unpublished' : 'Quiz published!');
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader title="Aptitude Quizzes" subtitle="Create and manage aptitude quizzes with auto-evaluation"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setTab('create'); }} icon={Plus}>New Quiz</Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        {[{ key: 'quizzes', label: '📋 All Quizzes' }, { key: 'create', label: editingId ? '✏️ Edit Quiz' : '➕ Create Quiz' }, { key: 'attempts', label: '📊 Student Attempts' }].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === key ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* All Quizzes tab */}
      {tab === 'quizzes' && (
        <div className="space-y-3">
          {loading ? Array(4).fill(0).map((_, i) => <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />) :
            quizzes.length === 0 ? <EmptyState icon={BookOpen} title="No quizzes yet" action={<Button onClick={() => setTab('create')} icon={Plus}>Create First Quiz</Button>} /> :
            quizzes.map(quiz => (
              <Card key={quiz._id}>
                <CardBody className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{quiz.title}</p>
                      <Badge variant={quiz.difficulty}>{quiz.difficulty}</Badge>
                      <Badge variant={quiz.isPublished ? 'success' : 'default'}>{quiz.isPublished ? 'Published' : 'Draft'}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>📋 {quiz.questions?.length || 0} questions</span>
                      <span>⏱ {quiz.timeLimit}m</span>
                      <span>🎯 Pass: {quiz.passingScore}%</span>
                      <span className="capitalize">📚 {quiz.topic}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => togglePublish(quiz)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${quiz.isPublished ? 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-red-300' : 'border-emerald-300 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'}`}>
                      {quiz.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button onClick={() => handleEdit(quiz)} className="p-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/30 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">✏️</button>
                    <button onClick={() => handleDelete(quiz._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-500 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </CardBody>
              </Card>
            ))
          }
        </div>
      )}

      {/* Create/Edit Quiz tab */}
      {tab === 'create' && (
        <div className="max-w-3xl space-y-5">
          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Quiz Details</h2>
              <Input label="Quiz Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Quantitative Aptitude — Set 1" />
              <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Brief description of this quiz..." />
              <div className="grid grid-cols-2 gap-4">
                <Select label="Topic *" value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}>
                  {TOPICS.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                </Select>
                <Select label="Difficulty" value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
                  <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Input label="Time Limit (minutes)" type="number" min={5} max={180} value={form.timeLimit} onChange={e => setForm(f => ({ ...f, timeLimit: Number(e.target.value) }))} />
                <Input label="Passing Score (%)" type="number" min={1} max={100} value={form.passingScore} onChange={e => setForm(f => ({ ...f, passingScore: Number(e.target.value) }))} />
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} className="w-4 h-4 rounded accent-brand-600" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Publish Now</span>
                  </label>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Questions ({form.questions.length})</h2>
                <p className="text-xs text-slate-400">Total: {form.questions.reduce((s, q) => s + q.points, 0)} pts</p>
              </div>
              <QuestionBuilder questions={form.questions} onChange={qs => setForm(f => ({ ...f, questions: qs }))} />
            </CardBody>
          </Card>

          <div className="flex gap-3">
            <Button onClick={handleSave} loading={saving} icon={Save} size="lg">{editingId ? 'Update Quiz' : 'Create Quiz'}</Button>
            <Button variant="secondary" onClick={() => { setTab('quizzes'); setEditingId(null); setForm(EMPTY_FORM); }}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Attempts tab */}
      {tab === 'attempts' && (
        <div className="space-y-3">
          {loadingAttempts ? Array(5).fill(0).map((_, i) => <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />) :
            attempts.length === 0 ? <EmptyState icon={BarChart3} title="No attempts yet" description="Students haven't taken any quizzes yet." /> :
            attempts.map(attempt => (
              <Card key={attempt._id} className="overflow-hidden">
                <button className="w-full text-left" onClick={() => setExpandedAttempt(e => e === attempt._id ? null : attempt._id)}>
                  <CardBody className="p-4 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-sm font-bold text-brand-700 dark:text-brand-300 flex-shrink-0">
                      {attempt.student?.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{attempt.student?.name}</p>
                      <p className="text-xs text-slate-500">{attempt.quiz?.title} · {format(new Date(attempt.submittedAt || attempt.createdAt), 'MMM d, h:mm a')}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className={`text-sm font-bold ${attempt.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                          {attempt.percentage}%
                        </p>
                        <p className="text-xs text-slate-500">{attempt.score}/{attempt.totalPoints} pts</p>
                      </div>
                      <Badge variant={attempt.passed ? 'success' : 'danger'}>{attempt.passed ? 'Passed' : 'Failed'}</Badge>
                      {expandedAttempt === attempt._id ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                    </div>
                  </CardBody>
                </button>

                {expandedAttempt === attempt._id && (
                  <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-800/40">
                    <div className="grid grid-cols-4 gap-3 mb-3 text-center text-xs">
                      <div><p className="font-bold text-emerald-600 dark:text-emerald-400">{attempt.answers?.filter(a => a.isCorrect).length || 0}</p><p className="text-slate-500">Correct</p></div>
                      <div><p className="font-bold text-red-600 dark:text-red-400">{attempt.answers?.filter(a => !a.isCorrect && a.selectedOption >= 0).length || 0}</p><p className="text-slate-500">Wrong</p></div>
                      <div><p className="font-bold text-slate-500">{attempt.answers?.filter(a => a.selectedOption === -1).length || 0}</p><p className="text-slate-500">Skipped</p></div>
                      <div><p className="font-bold text-brand-600 dark:text-brand-400">{Math.round((attempt.timeTaken || 0) / 60)}m</p><p className="text-slate-500">Time Taken</p></div>
                    </div>
                    <p className="text-xs text-slate-500">{attempt.student?.email}</p>
                  </div>
                )}
              </Card>
            ))
          }
        </div>
      )}
    </div>
  );
}
