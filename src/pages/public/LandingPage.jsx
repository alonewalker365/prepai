import { useNavigate, Link } from 'react-router-dom';
import { Zap, CheckCircle, Mic2, Code2, Trophy, BookOpen, Target, ArrowRight, Star } from 'lucide-react';

const FEATURES = [
  { icon: Mic2, title: 'AI Mock Interviews', desc: 'Practice HR, technical, coding & behavioral interviews with Claude AI feedback in real-time.', color: 'brand' },
  { icon: CheckCircle, title: 'Daily Task System', desc: 'Curated daily coding, aptitude, and communication tasks to build consistent habits.', color: 'emerald' },
  { icon: Code2, title: 'Coding Question Bank', desc: '500+ DSA problems organized by topic, difficulty, and company — track your progress.', color: 'sky' },
  { icon: BookOpen, title: 'Structured Courses', desc: 'In-depth courses on DSA, system design, aptitude, and soft skills with progress tracking.', color: 'amber' },
  { icon: Trophy, title: 'Leaderboard & Streaks', desc: 'Stay motivated with streak tracking, point rewards, and a competitive leaderboard.', color: 'red' },
  { icon: Target, title: 'Admin-Managed Content', desc: 'Admins/mentors schedule and manage tasks, courses, and announcements in real time.', color: 'purple' },
];

const STATS = [
  { label: 'Questions', value: '500+' },
  { label: 'Interview Types', value: '5' },
  { label: 'Daily Tasks', value: '4/day' },
  { label: 'Companies Covered', value: '50+' },
];

const colorMap = {
  brand: 'bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400',
  emerald: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
  sky: 'bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400',
  amber: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
  red: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400',
  purple: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
};

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-slate-900 dark:text-white">PrepWise AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              Sign In
            </Link>
            <button
              onClick={() => navigate('/signup')}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-sky-50 dark:from-slate-900 dark:via-slate-950 dark:to-brand-950/20" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-400/10 dark:bg-brand-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-xs font-semibold rounded-full border border-brand-200 dark:border-brand-800 mb-6">
            <Zap size={12} /> AI-powered interview preparation
          </div>

          <h1 className="text-5xl md:text-6xl font-bold font-display tracking-tight mb-6 leading-tight">
            Land Your Dream Job{' '}
            <span className="bg-gradient-to-r from-brand-600 to-sky-500 bg-clip-text text-transparent">
              with AI Prep
            </span>
          </h1>

          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            PrepWise AI combines daily practice tasks, AI-powered mock interviews, structured courses, and a coding question bank — everything you need to ace placements.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigate('/signup')}
              className="flex items-center gap-2 px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30"
            >
              Start Preparing Free <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-6 py-3.5 border border-slate-300 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-600 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-all"
            >
              Demo Login
            </button>
          </div>

          {/* Demo creds */}
          <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
            Demo: <span className="font-mono">student@demo.com</span> / <span className="font-mono">password123</span>
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-bold font-display text-brand-600 dark:text-brand-400">{value}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold font-display mb-3">Everything you need to get placed</h2>
          <p className="text-slate-500 dark:text-slate-400 text-base max-w-xl mx-auto">
            A complete ecosystem for placement prep — from daily habits to AI-powered interview simulation.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-card-hover transition-all group"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${colorMap[color]}`}>
                <Icon size={20} />
              </div>
              <h3 className="text-base font-bold mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold font-display mb-14">Your daily prep routine</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Login Daily', desc: 'Check your dashboard and see today\'s tasks' },
              { step: '02', title: 'Complete Tasks', desc: 'Solve coding, aptitude, and HR challenges' },
              { step: '03', title: 'Mock Interview', desc: 'Practice with AI and get instant feedback' },
              { step: '04', title: 'Track Progress', desc: 'Watch your streak grow and climb the leaderboard' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative">
                <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-bold text-lg font-display flex items-center justify-center mx-auto mb-4">
                  {step}
                </div>
                <h3 className="font-bold mb-2">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="p-10 rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-2xl shadow-brand-500/20">
          <div className="flex justify-center mb-4">
            {[1,2,3,4,5].map(i => <Star key={i} size={18} className="text-amber-300 fill-amber-300" />)}
          </div>
          <h2 className="text-3xl font-bold font-display mb-3">Ready to start your prep?</h2>
          <p className="text-brand-200 mb-8 max-w-md mx-auto">
            Join thousands of students who are building daily practice habits and acing their placement interviews.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="px-8 py-3.5 bg-white text-brand-700 font-bold rounded-xl hover:bg-brand-50 transition-colors shadow-lg"
          >
            Create Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center">
            <Zap size={12} className="text-white" />
          </div>
          <span className="font-semibold text-slate-600 dark:text-slate-400">PrepWise AI</span>
        </div>
        <p>Built with ❤️ for placement preparation · MERN + Claude AI</p>
      </footer>
    </div>
  );
}
