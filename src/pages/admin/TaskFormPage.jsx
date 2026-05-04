import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { taskAPI } from '../../api/services';
import { Card, CardBody, Button, Input, Select, Textarea, PageHeader, Badge } from '../../components/common/UI';
import { Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['coding', 'aptitude', 'hr', 'system-design', 'theory', 'communication'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

export default function TaskFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);

  const [form, setForm] = useState({
    title: '',
    description: '',
    content: '',
    category: 'coding',
    difficulty: 'medium',
    topic: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    deadline: '',
    points: 10,
    isFeatured: false,
    isPublished: true,
    tags: '',
  });

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  useEffect(() => {
    if (!isEditing) return;
    setFetching(true);
    taskAPI.getById(id)
      .then(({ data }) => {
        const t = data.data;
        setForm({
          title: t.title,
          description: t.description,
          content: t.content || '',
          category: t.category,
          difficulty: t.difficulty,
          topic: t.topic || '',
          scheduledDate: t.scheduledDate?.split('T')[0] || '',
          deadline: t.deadline?.split('T')[0] || '',
          points: t.points,
          isFeatured: t.isFeatured,
          isPublished: t.isPublished,
          tags: t.tags?.join(', ') || '',
        });
      })
      .catch(() => toast.error('Failed to load task'))
      .finally(() => setFetching(false));
  }, [id, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.scheduledDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    const payload = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      points: Number(form.points),
    };

    try {
      if (isEditing) {
        await taskAPI.update(id, payload);
        toast.success('Task updated');
      } else {
        await taskAPI.create(payload);
        toast.success('Task created');
      }
      navigate('/admin/tasks');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <PageHeader
        title={isEditing ? 'Edit Task' : 'Create New Task'}
        subtitle={isEditing ? 'Update task details' : 'Schedule a new daily task for students'}
        action={
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/admin/tasks')}>
            Back
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <CardBody className="space-y-5">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Basic Info</h2>
            <Input label="Task Title *" placeholder="e.g. Two Sum Problem" value={form.title} onChange={set('title')} required />
            <Textarea label="Short Description *" placeholder="Brief overview of the task..." value={form.description} onChange={set('description')} rows={3} required />
            <Textarea label="Full Content / Instructions" placeholder="Detailed problem statement, examples, constraints..." value={form.content} onChange={set('content')} rows={6} />
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-5">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Classification</h2>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Category *" value={form.category} onChange={set('category')}>
                {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </Select>
              <Select label="Difficulty *" value={form.difficulty} onChange={set('difficulty')}>
                {DIFFICULTIES.map(d => <option key={d} value={d} className="capitalize">{d}</option>)}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Topic / Tag" placeholder="e.g. Arrays, DP" value={form.topic} onChange={set('topic')} />
              <Input label="Points" type="number" min={1} max={500} value={form.points} onChange={set('points')} />
            </div>
            <Input label="Tags (comma separated)" placeholder="arrays, easy, must-do" value={form.tags} onChange={set('tags')} />
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-5">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Scheduling</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Scheduled Date *" type="date" value={form.scheduledDate} onChange={set('scheduledDate')} required />
              <Input label="Deadline (optional)" type="date" value={form.deadline} onChange={set('deadline')} />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={set('isFeatured')} className="w-4 h-4 rounded accent-brand-600" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Featured Task</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.isPublished} onChange={set('isPublished')} className="w-4 h-4 rounded accent-brand-600" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Published</span>
              </label>
            </div>
          </CardBody>
        </Card>

        {/* Preview */}
        <Card className="border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-900/10">
          <CardBody>
            <p className="text-xs font-semibold text-brand-700 dark:text-brand-400 mb-3">Preview</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={form.difficulty}>{form.difficulty}</Badge>
              <Badge variant="brand">{form.category}</Badge>
              {form.isFeatured && <Badge variant="warning">⭐ Featured</Badge>}
              {form.isPublished ? <Badge variant="success">Published</Badge> : <Badge variant="default">Draft</Badge>}
              <span className="text-xs text-slate-500">{form.points} pts</span>
            </div>
            {form.title && <p className="text-sm font-semibold text-slate-900 dark:text-white mt-2">{form.title}</p>}
          </CardBody>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" loading={loading} icon={Save} size="lg">
            {isEditing ? 'Update Task' : 'Create Task'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/admin/tasks')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
