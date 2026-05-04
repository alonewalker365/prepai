import { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, Bell } from 'lucide-react';
import { announcementAPI } from '../../api/services';
import { Card, CardBody, Badge, Button, PageHeader, EmptyState, Input, Select, Textarea } from '../../components/common/UI';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const typeVariant = { general: 'default', reminder: 'info', tip: 'success', urgent: 'danger' };
const typeEmoji = { general: '📢', reminder: '⏰', tip: '💡', urgent: '🚨' };

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', type: 'general', targetRole: 'all' });

  const load = () => {
    announcementAPI.getAll()
      .then((r) => setAnnouncements(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const createAnnouncement = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) { toast.error('Title and content required'); return; }
    setSaving(true);
    try {
      await announcementAPI.create(form);
      toast.success('Announcement posted!');
      setForm({ title: '', content: '', type: 'general', targetRole: 'all' });
      setShowForm(false);
      load();
    } catch { toast.error('Failed to post announcement'); }
    finally { setSaving(false); }
  };

  const deleteAnnouncement = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    await announcementAPI.delete(id);
    toast.success('Deleted');
    setAnnouncements(a => a.filter(x => x._id !== id));
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <PageHeader
        title="Announcements"
        subtitle="Post platform-wide announcements and tips for learners"
        action={<Button icon={Plus} onClick={() => setShowForm(s => !s)}>{showForm ? 'Cancel' : 'New Announcement'}</Button>}
      />

      {showForm && (
        <Card className="border-brand-200 dark:border-brand-800">
          <CardBody>
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Create Announcement</h2>
            <form onSubmit={createAnnouncement} className="space-y-4">
              <Input label="Title *" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="Announcement title" required />
              <Textarea label="Content *" value={form.content} onChange={e => setForm(f => ({...f, content: e.target.value}))} rows={4} placeholder="Write your announcement..." required />
              <div className="grid grid-cols-2 gap-3">
                <Select label="Type" value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))}>
                  <option value="general">📢 General</option>
                  <option value="reminder">⏰ Reminder</option>
                  <option value="tip">💡 Tip</option>
                  <option value="urgent">🚨 Urgent</option>
                </Select>
                <Select label="Target" value={form.targetRole} onChange={e => setForm(f => ({...f, targetRole: e.target.value}))}>
                  <option value="all">Everyone</option>
                  <option value="student">Students Only</option>
                  <option value="admin">Admins Only</option>
                </Select>
              </div>
              <div className="flex gap-3">
                <Button type="submit" loading={saving} icon={Bell}>Post Announcement</Button>
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      <div className="space-y-3">
        {loading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />)
        ) : announcements.length === 0 ? (
          <EmptyState icon={Megaphone} title="No announcements yet" description="Post an announcement to notify all learners" action={<Button onClick={() => setShowForm(true)}>Create First Announcement</Button>} />
        ) : (
          announcements.map(a => (
            <Card key={a._id}>
              <CardBody className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="text-xl flex-shrink-0">{typeEmoji[a.type] || '📢'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{a.title}</p>
                        <Badge variant={typeVariant[a.type] || 'default'}>{a.type}</Badge>
                        <Badge variant="default">{a.targetRole}</Badge>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{a.content}</p>
                      <p className="text-xs text-slate-400 mt-2">{format(new Date(a.createdAt), 'MMM d, yyyy · h:mm a')} · by {a.createdBy?.name}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteAnnouncement(a._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex-shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
