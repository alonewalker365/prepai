// LeaderboardPage.jsx
import { useState, useEffect } from 'react';
import { Trophy, Flame, Target } from 'lucide-react';
import { analyticsAPI } from '../../api/services';
import { useSelector } from 'react-redux';
import { Card, CardBody, Badge, PageHeader, StatCard } from '../../components/common/UI';

export function LeaderboardPage() {
  const { user } = useSelector((s) => s.auth);
  const [data, setData] = useState({ leaderboard: [], myRank: 0 });
  const [period, setPeriod] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    analyticsAPI.getLeaderboard({ period })
      .then((r) => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  const rankMedal = (r) => {
    if (r === 1) return '🥇';
    if (r === 2) return '🥈';
    if (r === 3) return '🥉';
    return null;
  };

  const myEntry = data.leaderboard.find((u) => u._id === user?._id);

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <PageHeader
        title="Leaderboard"
        subtitle="See how you rank among other learners"
      />

      {/* My rank card */}
      {data.myRank > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-800 text-white">
          <p className="text-brand-200 text-xs font-semibold uppercase tracking-wide mb-1">Your Ranking</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold font-display">#{data.myRank}</p>
              <p className="text-brand-200 text-sm mt-0.5">out of {data.leaderboard.length} learners</p>
            </div>
            {myEntry && (
              <div className="text-right">
                <p className="text-2xl font-bold">{myEntry.totalPoints}</p>
                <p className="text-brand-200 text-xs">points</p>
                <p className="text-brand-200 text-xs mt-1">🔥 {myEntry.streak}d streak</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Period selector */}
      <div className="flex gap-2">
        {[{ val: 'all', label: 'All Time' }, { val: 'month', label: 'This Month' }, { val: 'week', label: 'This Week' }].map(({ val, label }) => (
          <button
            key={val}
            onClick={() => setPeriod(val)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${period === val ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-400'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Podium — top 3 */}
      {!loading && data.leaderboard.length >= 3 && (
        <div className="flex items-end justify-center gap-3 py-4">
          {[data.leaderboard[1], data.leaderboard[0], data.leaderboard[2]].map((u, i) => {
            const heights = ['h-24', 'h-32', 'h-20'];
            const rank = i === 0 ? 2 : i === 1 ? 1 : 3;
            return (
              <div key={u._id} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-lg font-bold text-brand-700 dark:text-brand-300 border-2 border-brand-200 dark:border-brand-700">
                  {u.name[0]}
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-16 truncate text-center">{u.name.split(' ')[0]}</p>
                <p className="text-xs text-brand-600 dark:text-brand-400 font-bold">{u.totalPoints}pts</p>
                <div className={`${heights[i]} w-20 rounded-t-xl flex items-start justify-center pt-2 text-xl ${i === 1 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {rankMedal(rank)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full table */}
      <Card>
        <CardBody className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              Array(10).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
                  <div className="flex-1 h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                </div>
              ))
            ) : (
              data.leaderboard.map((u) => {
                const isMe = u._id === user?._id;
                return (
                  <div key={u._id} className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${isMe ? 'bg-brand-50 dark:bg-brand-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}>
                    <div className="w-8 text-center flex-shrink-0">
                      {rankMedal(u.rank) ? (
                        <span className="text-lg">{rankMedal(u.rank)}</span>
                      ) : (
                        <span className="text-sm font-bold text-slate-400">#{u.rank}</span>
                      )}
                    </div>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${isMe ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                      {u.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-semibold truncate ${isMe ? 'text-brand-700 dark:text-brand-400' : 'text-slate-900 dark:text-white'}`}>
                          {u.name}
                        </p>
                        {isMe && <Badge variant="brand" className="text-xs">You</Badge>}
                      </div>
                      <p className="text-xs text-slate-400">{u.preferredRole || 'Student'}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-bold text-brand-600 dark:text-brand-400">{u.totalPoints}</p>
                        <p className="text-xs text-slate-400">pts</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-amber-600 dark:text-amber-400">🔥{u.streak}</p>
                        <p className="text-xs text-slate-400">streak</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default LeaderboardPage;
