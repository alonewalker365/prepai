import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Code2, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { problemAPI } from '../../api/services';
import { Card, CardBody, Badge, Button, PageHeader, EmptyState, Input, Select, Textarea } from '../../components/common/UI';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const TOPICS = ['array','string','dp','graph','tree','linkedlist','sorting','greedy','binarysearch','stack','queue','heap','math','twopointers'];
const STATUS_CONFIG = {
  accepted:      { label: 'Accepted',      badge: 'success' },
  wrong_answer:  { label: 'Wrong Answer',  badge: 'danger'  },
  time_limit:    { label: 'Time Limit',    badge: 'warning' },
  runtime_error: { label: 'Runtime Error', badge: 'danger'  },
  compile_error: { label: 'Compile Error', badge: 'danger'  },
  running:       { label: 'Running',       badge: 'info'    },
};

const EMPTY_FORM = {
  title: '', description: '', difficulty: 'medium', topic: 'array', companies: '',
  tags: '', constraints: '', timeComplexity: '', spaceComplexity: '', maxPoints: 100, isPublished: true,
  examples: [{ input: '', output: '', explanation: '' }],
  testCases: [{ input: '', expectedOutput: '', isHidden: false, explanation: '' }],
  starterCode: { javascript: '// Write your solution here\nfunction solution(input) {\n  \n}', python: '# Write your solution here\ndef solution(input):\n    pass', java: 'public class Solution {\n    public static void main(String[] args) {\n        \n    }\n}', cpp: '#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n    \n    return 0;\n}' },
};

function TestCaseBuilder({ testCases, onChange }) {
  const add = () => onChange([...testCases, { input: '', expectedOutput: '', isHidden: false, explanation: '' }]);
  const update = (i, field, val) => { const tcs = [...testCases]; tcs[i] = { ...tcs[i], [field]: val }; onChange(tcs); };
  const remove = (i) => onChange(testCases.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      {testCases.map((tc, i) => (
        <div key={i} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3 bg-slate-50 dark:bg-slate-800/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500">Test Case {i + 1}</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={tc.isHidden} onChange={e => update(i, 'isHidden', e.target.checked)} className="w-3 h-3 rounded accent-brand-600" />
                <span className="text-xs text-slate-500">Hidden</span>
              </label>
            </div>
            <button onClick={() => remove(i)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Textarea label="Input" value={tc.input} onChange={e => update(i, 'input', e.target.value)} rows={2} placeholder="[2,7,11,15]" />
            <Textarea label="Expected Output" value={tc.expectedOutput} onChange={e => update(i, 'expectedOutput', e.target.value)} rows={2} placeholder="[0,1]" />
          </div>
          <Input label="Explanation (optional)" value={tc.explanation || ''} onChange={e => update(i, 'explanation', e.target.value)} placeholder="Why this output?" />
        </div>
      ))}
      <button onClick={add} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-sm text-slate-500 hover:border-brand-400 hover:text-brand-600 transition-colors">
        <Plus size={14} /> Add Test Case
      </button>
    </div>
  );
}

export default function AdminCodingPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('problems');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [expandedSub, setExpandedSub] = useState(null);

  const loadProblems = () => {
    setLoading(true);
    problemAPI.getAll({ limit: 100 })
      .then(r => setProblems(r.data.data?.problems || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const loadSubmissions = () => {
    setLoadingSubs(true);
    problemAPI.getAllSubmissions({ limit: 50 })
      .then(r => setSubmissions(r.data.data?.submissions || []))
      .catch(() => {})
      .finally(() => setLoadingSubs(false));
  };

  useEffect(() => { loadProblems(); }, []);
  useEffect(() => { if (tab === 'submissions') loadSubmissions(); }, [tab]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    if (!form.title || !form.description) { toast.error('Title and description are required'); return; }
    if (!form.testCases.some(tc => tc.input && tc.expectedOutput)) { toast.error('Add at least one test case with input and output'); return; }
    setSaving(true);
    const payload = {
      ...form,
      companies: form.companies.split(',').map(s => s.trim()).filter(Boolean),
      tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
      constraints: form.constraints.split('\n').map(s => s.trim()).filter(Boolean),
    };
    try {
      if (editingId) { await problemAPI.update(editingId, payload); toast.success('Problem updated!'); }
      else { await problemAPI.create(payload); toast.success('Problem created!'); }
      loadProblems();
      setForm(EMPTY_FORM); setEditingId(null); setTab('problems');
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleEdit = (p) => {
    setForm({ title: p.title, description: p.description, difficulty: p.difficulty, topic: p.topic, companies: (p.companies || []).join(', '), tags: (p.tags || []).join(', '), constraints: (p.constraints || []).join('\n'), timeComplexity: p.timeComplexity || '', spaceComplexity: p.spaceComplexity || '', maxPoints: p.maxPoints, isPublished: p.isPublished, examples: p.examples?.length ? p.examples : EMPTY_FORM.examples, testCases: p.testCases?.length ? p.testCases : EMPTY_FORM.testCases, starterCode: p.starterCode || EMPTY_FORM.starterCode });
    setEditingId(p._id); setTab('create');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this problem and all submissions?')) return;
    await problemAPI.delete(id); toast.success('Problem deleted'); loadProblems();
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader title="Coding Problems" subtitle="Create LeetCode-style problems with test cases and auto-evaluation"
        action={<Button icon={Plus} onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setTab('create'); }}>New Problem</Button>}
      />

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        {[{ k: 'problems', l: '📋 Problems' }, { k: 'create', l: editingId ? '✏️ Edit' : '➕ Create' }, { k: 'submissions', l: '📊 Submissions' }].map(({ k, l }) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === k ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>{l}</button>
        ))}
      </div>

      {/* Problems list */}
      {tab === 'problems' && (
        <div className="space-y-2">
          {loading ? Array(5).fill(0).map((_, i) => <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />) :
            problems.length === 0 ? <EmptyState icon={Code2} title="No problems yet" action={<Button onClick={() => setTab('create')} icon={Plus}>Create First Problem</Button>} /> :
            problems.map((p, i) => (
              <Card key={p._id}>
                <CardBody className="p-4 flex items-center gap-4">
                  <span className="text-sm text-slate-400 w-6 flex-shrink-0">{i+1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{p.title}</p>
                      <Badge variant={p.difficulty}>{p.difficulty}</Badge>
                      <Badge variant={p.isPublished ? 'success' : 'default'}>{p.isPublished ? 'Live' : 'Draft'}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 capitalize">{p.topic} · {p.totalAttempts} attempts · {p.totalSolved} solved</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleEdit(p)} className="p-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/30 text-slate-400 hover:text-brand-600 transition-colors">✏️</button>
                    <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={13} /></button>
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
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Problem Details</h2>
            <Input label="Title *" value={form.title} onChange={set('title')} placeholder="e.g. Two Sum" />
            <Textarea label="Problem Description *" value={form.description} onChange={set('description')} rows={6} placeholder="Describe the problem clearly with all details..." />
            <div className="grid grid-cols-3 gap-4">
              <Select label="Difficulty" value={form.difficulty} onChange={set('difficulty')}>
                <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
              </Select>
              <Select label="Topic" value={form.topic} onChange={set('topic')}>
                {TOPICS.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
              </Select>
              <Input label="Max Points" type="number" min={10} max={500} value={form.maxPoints} onChange={set('maxPoints')} />
            </div>
            <Input label="Companies (comma separated)" value={form.companies} onChange={set('companies')} placeholder="Google, Amazon, Microsoft" />
            <Input label="Tags (comma separated)" value={form.tags} onChange={set('tags')} placeholder="array, hashmap, two-pointer" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Time Complexity" value={form.timeComplexity} onChange={set('timeComplexity')} placeholder="O(n)" />
              <Input label="Space Complexity" value={form.spaceComplexity} onChange={set('spaceComplexity')} placeholder="O(n)" />
            </div>
            <Textarea label="Constraints (one per line)" value={form.constraints} onChange={set('constraints')} rows={3} placeholder="1 <= nums.length <= 10^4&#10;-10^9 <= nums[i] <= 10^9" />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} className="w-4 h-4 accent-brand-600" />
              <span className="text-sm text-slate-700 dark:text-slate-300">Published</span>
            </label>
          </CardBody></Card>

          <Card><CardBody className="space-y-4">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Test Cases</h2>
            <p className="text-xs text-slate-500">Hidden test cases are not shown to students but used in evaluation.</p>
            <TestCaseBuilder testCases={form.testCases} onChange={tcs => setForm(f => ({ ...f, testCases: tcs }))} />
          </CardBody></Card>

          <Card><CardBody className="space-y-4">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Starter Code</h2>
            {Object.keys(form.starterCode).map(lang => (
              <div key={lang}>
                <p className="text-xs font-semibold text-slate-500 capitalize mb-1.5">{lang}</p>
                <textarea value={form.starterCode[lang]} onChange={e => setForm(f => ({ ...f, starterCode: { ...f.starterCode, [lang]: e.target.value } }))}
                  rows={4} className="w-full px-3 py-2 font-mono text-xs bg-slate-900 text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
              </div>
            ))}
          </CardBody></Card>

          <div className="flex gap-3">
            <Button onClick={handleSave} loading={saving} icon={Save} size="lg">{editingId ? 'Update Problem' : 'Create Problem'}</Button>
            <Button variant="secondary" onClick={() => { setTab('problems'); setEditingId(null); setForm(EMPTY_FORM); }}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Submissions */}
      {tab === 'submissions' && (
        <div className="space-y-2">
          {loadingSubs ? Array(6).fill(0).map((_, i) => <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />) :
            submissions.length === 0 ? <EmptyState icon={Code2} title="No submissions yet" /> :
            submissions.map(s => {
              const cfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.wrong_answer;
              return (
                <Card key={s._id}>
                  <button className="w-full text-left" onClick={() => setExpandedSub(e => e === s._id ? null : s._id)}>
                    <CardBody className="p-4 flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-xs font-bold text-brand-700 dark:text-brand-300 flex-shrink-0">
                        {s.student?.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{s.problem?.title}</p>
                        <p className="text-xs text-slate-500">{s.student?.name} · {s.language} · {format(new Date(s.submittedAt), 'MMM d, h:mm a')}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs text-slate-500">{s.passedTestCases}/{s.totalTestCases} tests</span>
                        <Badge variant={cfg.badge}>{cfg.label}</Badge>
                        {s.pointsEarned > 0 && <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+{s.pointsEarned}pts</span>}
                      </div>
                    </CardBody>
                  </button>
                  {expandedSub === s._id && (
                    <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-800/40">
                      <p className="text-xs font-semibold text-slate-500 mb-2">Submitted Code ({s.language})</p>
                      <pre className="text-xs font-mono bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto max-h-48">{s.code}</pre>
                      {s.testResults?.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          <p className="text-xs font-semibold text-slate-500">Test Results</p>
                          {s.testResults.map((r, i) => (
                            <div key={i} className={`flex items-center gap-2 p-2 rounded-lg text-xs ${r.passed ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                              {r.passed ? <CheckCircle size={11} /> : <XCircle size={11} />}
                              {r.isHidden ? `Hidden ${i+1}` : `Test ${i+1}`}: {r.passed ? 'Passed' : `Expected "${r.expectedOutput}" got "${r.actualOutput}"`}
                              {r.executionTime && <span className="ml-auto text-slate-400">{r.executionTime}ms</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })
          }
        </div>
      )}
    </div>
  );
}
