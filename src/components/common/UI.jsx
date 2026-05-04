// ─── CARD ─────────────────────────────────────────────────────────────────────
export const Card = ({ children, className = '', hover = false, ...props }) => (
  <div
    className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card
      ${hover ? 'hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer' : ''}
      ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ children, className = '' }) => (
  <div className={`px-5 py-4 border-b border-slate-100 dark:border-slate-800 ${className}`}>{children}</div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`px-5 py-4 ${className}`}>{children}</div>
);

// ─── BADGE ────────────────────────────────────────────────────────────────────
const badgeVariants = {
  default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  danger: 'bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  info: 'bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  easy: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  medium: 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  hard: 'bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

export const Badge = ({ variant = 'default', children, className = '' }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${badgeVariants[variant] || badgeVariants.default} ${className}`}>
    {children}
  </span>
);

// ─── BUTTON ───────────────────────────────────────────────────────────────────
const btnVariants = {
  primary: 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm',
  secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200',
  ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
  outline: 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300',
};

const btnSizes = {
  xs: 'px-2.5 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export const Button = ({ variant = 'primary', size = 'md', loading = false, icon: Icon, children, className = '', ...props }) => (
  <button
    className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed
      ${btnVariants[variant]} ${btnSizes[size]} ${className}`}
    disabled={loading || props.disabled}
    {...props}
  >
    {loading ? (
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    ) : Icon ? <Icon size={16} /> : null}
    {children}
  </button>
);

// ─── STAT CARD ────────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, icon: Icon, color = 'brand', trend, subtitle }) => {
  const colors = {
    brand: { bg: 'bg-brand-50 dark:bg-brand-900/20', icon: 'text-brand-600 dark:text-brand-400' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'text-emerald-600 dark:text-emerald-400' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', icon: 'text-amber-600 dark:text-amber-400' },
    red: { bg: 'bg-red-50 dark:bg-red-900/20', icon: 'text-red-600 dark:text-red-400' },
    sky: { bg: 'bg-sky-50 dark:bg-sky-900/20', icon: 'text-sky-600 dark:text-sky-400' },
  };
  const c = colors[color] || colors.brand;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white font-display">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>}
          {trend && (
            <p className={`text-xs font-medium ${trend > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% this week
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-xl ${c.bg}`}>
          <Icon className={c.icon} size={20} />
        </div>
      </div>
    </Card>
  );
};

// ─── SKELETON ─────────────────────────────────────────────────────────────────
export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg ${className}`} />
);

export const SkeletonCard = () => (
  <Card className="p-5 space-y-3">
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-8 w-1/3" />
    <Skeleton className="h-3 w-full" />
  </Card>
);

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {Icon && (
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-slate-400" />
      </div>
    )}
    <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">{title}</h3>
    {description && <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────
export const ProgressBar = ({ value = 0, max = 100, color = 'brand', className = '', showLabel = false }) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const colors = {
    brand: 'bg-brand-600',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  };
  return (
    <div className={`space-y-1 ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-500">
          <span>Progress</span><span>{pct}%</span>
        </div>
      )}
      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colors[color] || colors.brand}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
export const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-5">
    <div>
      <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

// ─── PAGE HEADER ──────────────────────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, action, backTo }) => (
  <div className="mb-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  </div>
);

// ─── INPUT ────────────────────────────────────────────────────────────────────
export const Input = ({ label, error, className = '', ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
    <input
      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors
        bg-white dark:bg-slate-900 text-slate-900 dark:text-white
        placeholder:text-slate-400 dark:placeholder:text-slate-500
        focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
        ${error
          ? 'border-red-400 dark:border-red-600'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
        }
        ${className}`}
      {...props}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

export const Select = ({ label, error, children, className = '', ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
    <select
      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors
        bg-white dark:bg-slate-900 text-slate-900 dark:text-white
        focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
        border-slate-200 dark:border-slate-700 ${className}`}
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

export const Textarea = ({ label, error, className = '', ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
    <textarea
      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors resize-none
        bg-white dark:bg-slate-900 text-slate-900 dark:text-white
        placeholder:text-slate-400 dark:placeholder:text-slate-500
        focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
        border-slate-200 dark:border-slate-700 ${className}`}
      {...props}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);
