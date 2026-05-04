import { useEffect, useRef, useState, useCallback } from 'react';
import { X, CheckCircle, XCircle, Clock, Bell } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useOutsideClick } from '../../hooks';
import { notificationAPI } from '../../api/services';
import { getSocket } from '../../api/socket';
import { formatRelative } from '../../utils';

// ─── MODAL ────────────────────────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children, size = 'md', footer }) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in" />
      <div
        className={`relative w-full ${sizeClasses[size]} bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-slide-up`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}

// ─── CONFIRM DIALOG ───────────────────────────────────────────────────────────
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', variant = 'danger' }) {
  const btnClass = variant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'bg-brand-600 hover:bg-brand-700 text-white';
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${btnClass}`}>{confirmLabel}</button>
        </>
      }
    >
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{message}</p>
    </Modal>
  );
}

// ─── NOTIFICATION BELL ────────────────────────────────────────────────────────
const typeConfig = {
  new_submission:       { icon: Clock,         color: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-900/20',   label: 'Pending Review' },
  submission_accepted:  { icon: CheckCircle,   color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', label: 'Accepted' },
  submission_rejected:  { icon: XCircle,       color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20',      label: 'Needs Revision' },
};

export function NotificationBell() {
  const { user } = useSelector((s) => s.auth);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useOutsideClick(() => setOpen(false));

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await notificationAPI.getAll({ limit: 30 });
      setNotifications(data.data.notifications || []);
      setUnreadCount(data.data.unreadCount || 0);
    } catch {}
    finally { setLoading(false); }
  }, []);

  // Fetch unread count on mount
  useEffect(() => {
    notificationAPI.getUnreadCount()
      .then(({ data }) => setUnreadCount(data.data.count || 0))
      .catch(() => {});
  }, []);

  // Socket: listen for real-time new_notification events
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewNotif = (notif) => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(c => c + 1);
    };

    socket.on('new_notification', handleNewNotif);
    return () => socket.off('new_notification', handleNewNotif);
  }, []);

  const markRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleOpen = () => {
    setOpen(o => !o);
    if (!open && notifications.length === 0) fetchNotifications();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 animate-slide-up overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium">
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[440px] overflow-y-auto">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex gap-3 p-4 border-b border-slate-50 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                  </div>
                </div>
              ))
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400 dark:text-slate-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const cfg = typeConfig[n.type] || typeConfig.new_submission;
                const Icon = cfg.icon;
                const isUnread = !n.isRead;

                return (
                  <div
                    key={n._id}
                    onClick={() => !n.isRead && markRead(n._id)}
                    className={`flex gap-3 p-4 border-b border-slate-50 dark:border-slate-800/50 transition-colors cursor-pointer
                      ${isUnread ? 'bg-brand-50/40 dark:bg-brand-900/10 hover:bg-brand-50 dark:hover:bg-brand-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                      <Icon size={16} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-semibold leading-snug ${isUnread ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                          {n.title}
                        </p>
                        {isUnread && <span className="w-2 h-2 bg-brand-600 rounded-full flex-shrink-0 mt-1" />}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        <span className="text-[10px] text-slate-400">{formatRelative(n.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-center">
              <button onClick={fetchNotifications} className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium">
                Refresh
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { default as toast } from "react-hot-toast";
