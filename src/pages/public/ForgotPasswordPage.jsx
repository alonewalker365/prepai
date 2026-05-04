import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowLeft, Mail } from 'lucide-react';
import { authAPI } from '../../api/services';
import { Button, Input } from '../../components/common/UI';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-slate-900 dark:text-white">PrepWise</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto">
                <Mail className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">Check your email</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                We've sent a password reset link to <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>
              </p>
              <Link to="/login">
                <Button variant="secondary" className="w-full mt-2" icon={ArrowLeft}>Back to Login</Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white font-display mb-1">Forgot password?</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Enter your email and we'll send you a reset link.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" loading={loading} className="w-full" size="lg">
                  Send Reset Link
                </Button>
              </form>
              <div className="mt-4 text-center">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  <ArrowLeft size={14} /> Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
