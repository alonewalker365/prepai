import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, Settings, Shield, Target, Flame, Trophy, BookOpen, Check } from 'lucide-react';
import { updateProfile } from '../../store';
import { authAPI } from '../../api/services';
import { Card, CardBody, Button, Input, Textarea, Select, PageHeader, Badge, StatCard } from '../../components/common/UI';
import toast from 'react-hot-toast';

const ROLES = ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Engineer', 'DevOps Engineer', 'Data Scientist', 'Product Manager'];
const SKILL_OPTIONS = ['DSA', 'System Design', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'Docker', 'AWS', 'TypeScript', 'Machine Learning', 'Problem Solving'];

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    preferredRole: user?.preferredRole || '',
    skillGoals: user?.skillGoals || [],
    dailyGoalMinutes: user?.dailyGoalMinutes || 60,
  });

  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const toggleSkill = (skill) => {
    setForm((f) => ({
      ...f,
      skillGoals: f.skillGoals.includes(skill)
        ? f.skillGoals.filter((s) => s !== skill)
        : [...f.skillGoals, skill],
    }));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await dispatch(updateProfile(form));
    if (updateProfile.fulfilled.match(result)) {
      toast.success('Profile updated successfully!');
    } else {
      toast.error('Failed to update profile');
    }
    setSaving(false);
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (pwdForm.newPassword.length < 6) { toast.error('Min 6 characters'); return; }
    setChangingPwd(true);
    try {
      await authAPI.changePassword({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      toast.success('Password changed successfully!');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPwd(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'goals', label: 'Goals & Skills', icon: Target },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <PageHeader title="Profile & Settings" subtitle="Manage your account, goals, and preferences" />

      {/* User card */}
      <Card>
        <CardBody className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xl font-bold text-slate-900 dark:text-white font-display">{user?.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge variant="brand" className="capitalize">{user?.role}</Badge>
                {user?.preferredRole && <Badge variant="default">{user.preferredRole}</Badge>}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-amber-500 font-display">🔥{user?.streak || 0}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Day Streak</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400 font-display">{user?.totalPoints || 0}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Total Points</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-amber-600 font-display">{user?.badges?.length || 0}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Badges</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === id ? 'bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Tab: Profile */}
      {activeTab === 'profile' && (
        <form onSubmit={saveProfile}>
          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Personal Info</h2>
              <Input label="Full Name" value={form.name} onChange={set('name')} placeholder="Your full name" />
              <Textarea label="Bio" value={form.bio} onChange={set('bio')} rows={3} placeholder="Tell us about yourself — your background, interests, and goals..." />
              <Select label="Target Role" value={form.preferredRole} onChange={set('preferredRole')}>
                <option value="">Select target role</option>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </Select>
              <Input label="Daily Goal (minutes)" type="number" min={15} max={480} step={15} value={form.dailyGoalMinutes} onChange={set('dailyGoalMinutes')} />
              <Button type="submit" loading={saving}>Save Changes</Button>
            </CardBody>
          </Card>
        </form>
      )}

      {/* Tab: Goals */}
      {activeTab === 'goals' && (
        <form onSubmit={saveProfile}>
          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Skill Goals</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Select the skills you want to improve. These help personalize your content.</p>
              <div className="flex flex-wrap gap-2">
                {SKILL_OPTIONS.map((skill) => {
                  const selected = form.skillGoals.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selected ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-400'}`}
                    >
                      {selected && <Check size={10} />}
                      {skill}
                    </button>
                  );
                })}
              </div>
              {form.skillGoals.length > 0 && (
                <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl">
                  <p className="text-xs font-semibold text-brand-700 dark:text-brand-400 mb-1">Selected Goals ({form.skillGoals.length})</p>
                  <p className="text-xs text-brand-600 dark:text-brand-300">{form.skillGoals.join(', ')}</p>
                </div>
              )}
              <Button type="submit" loading={saving}>Save Goals</Button>
            </CardBody>
          </Card>
        </form>
      )}

      {/* Tab: Security */}
      {activeTab === 'security' && (
        <form onSubmit={changePassword}>
          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Change Password</h2>
              <Input
                label="Current Password"
                type="password"
                placeholder="Your current password"
                value={pwdForm.currentPassword}
                onChange={(e) => setPwdForm((f) => ({ ...f, currentPassword: e.target.value }))}
                required
              />
              <Input
                label="New Password"
                type="password"
                placeholder="Min 6 characters"
                value={pwdForm.newPassword}
                onChange={(e) => setPwdForm((f) => ({ ...f, newPassword: e.target.value }))}
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Repeat new password"
                value={pwdForm.confirmPassword}
                onChange={(e) => setPwdForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                required
              />
              <Button type="submit" loading={changingPwd} variant="danger">Change Password</Button>
            </CardBody>
          </Card>
        </form>
      )}

      {/* Badges section */}
      {user?.badges?.length > 0 && (
        <Card>
          <CardBody>
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-3">Earned Badges</h2>
            <div className="flex flex-wrap gap-3">
              {user.badges.map((badge, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <span className="text-lg">{badge.icon || '🏅'}</span>
                  <div>
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">{badge.name}</p>
                    {badge.earnedAt && <p className="text-xs text-amber-500 dark:text-amber-600">{new Date(badge.earnedAt).toLocaleDateString()}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
