import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';

// ─── DATE FORMATTERS ──────────────────────────────────────────────────────────
export const formatDate = (date, pattern = 'MMM d, yyyy') => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : new Date(date);
  return format(d, pattern);
};

export const formatDateTime = (date) => formatDate(date, 'MMM d, yyyy · h:mm a');

export const formatRelative = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isToday(d)) return `Today at ${format(d, 'h:mm a')}`;
  if (isYesterday(d)) return `Yesterday at ${format(d, 'h:mm a')}`;
  return formatDistanceToNow(d, { addSuffix: true });
};

export const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

export const formatMinutes = (minutes) => {
  if (!minutes) return '0m';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

// ─── NUMBER FORMATTERS ────────────────────────────────────────────────────────
export const formatNumber = (n) => {
  if (n === null || n === undefined) return '0';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
};

export const formatPercent = (value, total) => {
  if (!total) return 0;
  return Math.round((value / total) * 100);
};

// ─── STRING HELPERS ───────────────────────────────────────────────────────────
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const titleCase = (str) => {
  if (!str) return '';
  return str.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

export const truncate = (str, maxLength = 100) => {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + '...';
};

export const slugify = (str) => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80);
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
};

// ─── VALIDATORS ───────────────────────────────────────────────────────────────
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

export const validateForm = (fields) => {
  const errors = {};
  Object.entries(fields).forEach(([key, { value, required, minLength, label }]) => {
    if (required && !value?.toString().trim()) {
      errors[key] = `${label || capitalize(key)} is required`;
    } else if (minLength && value?.length < minLength) {
      errors[key] = `${label || capitalize(key)} must be at least ${minLength} characters`;
    }
  });
  return errors;
};

// ─── CATEGORY / DIFFICULTY HELPERS ───────────────────────────────────────────
export const CATEGORY_META = {
  coding:           { label: 'Coding',        emoji: '💻', color: 'brand' },
  aptitude:         { label: 'Aptitude',       emoji: '🧮', color: 'sky' },
  hr:               { label: 'HR',             emoji: '💬', color: 'emerald' },
  'system-design':  { label: 'System Design',  emoji: '🏗️', color: 'amber' },
  theory:           { label: 'Theory',         emoji: '📖', color: 'purple' },
  communication:    { label: 'Communication',  emoji: '🗣️', color: 'emerald' },
};

export const DIFFICULTY_META = {
  easy:   { label: 'Easy',   color: 'text-emerald-600', badge: 'easy' },
  medium: { label: 'Medium', color: 'text-amber-600',   badge: 'medium' },
  hard:   { label: 'Hard',   color: 'text-red-600',     badge: 'hard' },
};

export const getCategoryMeta = (category) => CATEGORY_META[category] || { label: category, emoji: '📋', color: 'default' };
export const getDifficultyMeta = (difficulty) => DIFFICULTY_META[difficulty] || DIFFICULTY_META.medium;

// ─── SCORE HELPERS ────────────────────────────────────────────────────────────
export const getScoreColor = (score) => {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
};

export const getScoreLabel = (score) => {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Average';
  return 'Needs Improvement';
};

// ─── STREAK HELPERS ───────────────────────────────────────────────────────────
export const getStreakMessage = (streak) => {
  if (streak === 0) return 'Start your streak today!';
  if (streak === 1) return 'Great start! Day 1 🔥';
  if (streak < 7)  return `${streak} days strong! Keep it up!`;
  if (streak < 30) return `${streak} day streak! You're on fire! 🔥`;
  return `${streak} day mega streak! Legendary! 🏆`;
};

export const getStreakColor = (streak) => {
  if (streak === 0) return 'text-slate-400';
  if (streak < 3)  return 'text-orange-500';
  if (streak < 7)  return 'text-amber-500';
  return 'text-red-500';
};

// ─── SORT/FILTER HELPERS ──────────────────────────────────────────────────────
export const sortByDate = (arr, field = 'createdAt', asc = false) => {
  return [...arr].sort((a, b) => {
    const da = new Date(a[field]);
    const db = new Date(b[field]);
    return asc ? da - db : db - da;
  });
};

export const groupByDate = (arr, dateField = 'scheduledDate') => {
  return arr.reduce((groups, item) => {
    const date = format(new Date(item[dateField]), 'yyyy-MM-dd');
    if (!groups[date]) groups[date] = [];
    groups[date].push(item);
    return groups;
  }, {});
};

// ─── GREETINGS ────────────────────────────────────────────────────────────────
export const getGreeting = (name) => {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = name?.split(' ')[0] || 'there';
  return `${timeGreeting}, ${firstName}`;
};

// ─── AVATAR COLOR ─────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300',
  'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
];

export const getAvatarColor = (name) => {
  if (!name) return AVATAR_COLORS[0];
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};
