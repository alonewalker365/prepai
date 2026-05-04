// LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, Zap } from 'lucide-react';
import { loginUser, clearError } from '../../store';
import { Button, Input } from '../../components/common/UI';
import toast from 'react-hot-toast';

export function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    console.log("API URL:", import.meta.env.VITE_API_URL);
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back!');
      navigate(result.payload.role === 'admin' ? '/admin' : '/dashboard');
    } else {
      toast.error(result.payload || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-slate-900 dark:text-white tracking-tight">PrepWise</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card p-8">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white font-display mb-1">Welcome back</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Sign in to continue your prep journey</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
                <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-xs text-brand-600 dark:text-brand-400 hover:underline">Forgot password?</Link>
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">Sign In</Button>
          </form>

          {/* Demo accounts */}
          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Demo accounts</p>
            <div className="space-y-1">
              <button onClick={() => setForm({ email: 'student@demo.com', password: 'password123' })} className="w-full text-left text-xs text-brand-600 dark:text-brand-400 hover:underline">
                Student: student@demo.com / password123
              </button>
              <button onClick={() => setForm({ email: 'admin@demo.com', password: 'password123' })} className="w-full text-left text-xs text-brand-600 dark:text-brand-400 hover:underline">
                Admin: admin@demo.com / password123
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
