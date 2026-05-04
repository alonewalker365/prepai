import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, Edit, Trash2, Eye, EyeOff, Users, Star } from 'lucide-react';
import { courseAPI } from '../../api/services';
import { Card, CardBody, Badge, Button, PageHeader, EmptyState, Input, Select, Textarea } from '../../components/common/UI';
import toast from 'react-hot-toast';

const CATEGORIES = ['dsa', 'web-dev', 'system-design', 'aptitude', 'soft-skills', 'interview-prep'];
const categoryEmoji = { dsa: '⚡', 'web-dev': '🌐', 'system-design': '🏗️', aptitude: '🧮', 'soft-skills': '💬', 'interview-prep': '🎯' };
const levelBadge = { beginner: 'success', intermediate: 'warning', advanced: 'danger' };

const emptyForm = { title: '', description: '', category: 'dsa', level: 'beginner', isPublished: false, tags: '' };

export default function ManageCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    courseAPI.getAll({ limit: 50 })
      .then(r => setCourses(r.data.data.courses || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };
  const openEdit = (course) => {
    setForm({ title: course.title, description: course.description, category: course.category, level: course.level, isPublished: course.isPublished, tags: course.tags?.join(', ') || '' });
    setEditingId(course._id);
    setShowForm(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) { toast.error('Title and description required'); return; }
    setSaving(true);
    const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
    try {
      if (editingId) {
        await courseAPI.update(editingId, payload);
        toast.success('Course updated!');
      } else {
        await courseAPI.create(payload);
        toast.success('Course created!');
      }
      setShowForm(false);
      setEditingId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (id, isPublished) => {
    try {
      await courseAPI.update(id, { isPublished: !isPublished });
      setCourses(cs => cs.map(c => c._id === id ? { ...c, isPublished: !isPublished } : c));
      toast.success(isPublished ? 'Course unpublished' : 'Course published!');
    } catch { toast.error('Failed to update'); }
  };

  const deleteCourse = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await courseAPI.delete(id);
      toast.success('Course deleted');
      setCourses(cs => cs.filter(c => c._id !== id));
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Manage Courses"
        subtitle={`${courses.length} courses · ${courses.filter(c => c.isPublished).length} published`}
        action={<Button icon={Plus} onClick={openCreate}>New Course</Button>}
      />

      {/* Create / Edit Form */}
      {showForm && (
        <Card className="border-brand-200 dark:border-brand-800">
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300">{editingId ? 'Edit Course' : 'Create New Course'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">✕</button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <Input label="Course Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. DSA Mastery: Zero to Hero" required />
              <Textarea label="Description *" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="What will students learn?" required />
              <div className="grid grid-cols-2 gap-4">
                <Select label="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{categoryEmoji[c]} {c}</option>)}
                </Select>
                <Select label="Level" value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </Select>
              </div>
              <Input label="Tags (comma separated)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="dsa, placement, must-do" />
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} className="w-4 h-4 rounded accent-brand-600" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Publish immediately</span>
              </label>
              <div className="flex gap-3">
                <Button type="submit" loading={saving}>{editingId ? 'Save Changes' : 'Create Course'}</Button>
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {/* Course grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState icon={BookOpen} title="No courses yet" description="Create your first course to get students learning."
          action={<Button onClick={openCreate} icon={Plus}>Create First Course</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => (
            <Card key={course._id} className="flex flex-col">
              <div className={`h-24 rounded-t-xl flex items-center justify-center text-4xl ${course.isPublished ? 'bg-gradient-to-br from-brand-500 to-brand-700' : 'bg-slate-200 dark:bg-slate-700'}`}>
                {categoryEmoji[course.category] || '📚'}
              </div>
              <CardBody className="flex-1 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 flex-1">{course.title}</h3>
                  <Badge variant={levelBadge[course.level] || 'default'} className="flex-shrink-0 capitalize">{course.level}</Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span><Users size={10} className="inline mr-0.5" />{course.enrolledCount || 0}</span>
                  <span><BookOpen size={10} className="inline mr-0.5" />{course.totalLessons || 0} lessons</span>
                  {course.rating > 0 && <span><Star size={10} className="inline mr-0.5 text-amber-400" />{course.rating}</span>}
                </div>
                <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Badge variant={course.isPublished ? 'success' : 'default'}>{course.isPublished ? 'Published' : 'Draft'}</Badge>
                  <div className="flex gap-1 ml-auto">
                    <button onClick={() => togglePublish(course._id, course.isPublished)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors" title={course.isPublished ? 'Unpublish' : 'Publish'}>
                      {course.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button onClick={() => openEdit(course)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors" title="Edit">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => deleteCourse(course._id, course.title)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
