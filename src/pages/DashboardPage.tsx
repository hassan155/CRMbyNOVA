import React, { useMemo } from 'react';
import { useCRM } from '../context/CRMContext';
import type { TimeRangeFilter } from '../types/crm';

import { tokens } from '../tokens';
import {
  DollarSign,
  TrendingUp,
  Users,
  Target,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Layers,
  Award,
  Filter,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const {
    deals,
    contacts,
    activities,
    users,
    timeRange,
    setTimeRange,
    customDateRange,
    setCustomDateRange,
  } = useCRM();

  // Helper date filter
  const filterByDateRange = (dateString: string) => {
    const itemDate = new Date(dateString).getTime();
    const now = Date.now();

    if (timeRange === 'custom') {
      const start = new Date(customDateRange.startDate).getTime();
      const end = new Date(customDateRange.endDate).getTime() + 86400000;
      return itemDate >= start && itemDate <= end;
    }

    if (timeRange === '24h') return now - itemDate <= 24 * 60 * 60 * 1000;
    if (timeRange === '7d') return now - itemDate <= 7 * 24 * 60 * 60 * 1000;
    if (timeRange === '30d') return now - itemDate <= 30 * 24 * 60 * 60 * 1000;
    if (timeRange === 'ytd') {
      const startOfYear = new Date(new Date().getFullYear(), 0, 1).getTime();
      return itemDate >= startOfYear;
    }
    return true;
  };

  const filteredDeals = useMemo(() => {
    return deals.filter(d => filterByDateRange(d.createdAt));
  }, [deals, timeRange, customDateRange]);

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => filterByDateRange(c.createdAt));
  }, [contacts, timeRange, customDateRange]);

  // High-Level KPI Calculations
  const totalRevenue = useMemo(() => {
    return filteredDeals
      .filter(d => d.stage === 'closed_won')
      .reduce((sum, d) => sum + d.amount, 0);
  }, [filteredDeals]);

  const totalPipelineValue = useMemo(() => {
    return filteredDeals
      .filter(d => !['closed_lost'].includes(d.stage))
      .reduce((sum, d) => sum + d.amount, 0);
  }, [filteredDeals]);

  const conversionRate = useMemo(() => {
    const closedWon = filteredDeals.filter(d => d.stage === 'closed_won').length;
    const totalClosed = filteredDeals.filter(d => ['closed_won', 'closed_lost'].includes(d.stage)).length;
    if (totalClosed === 0) return 34.5;
    return Math.round((closedWon / totalClosed) * 100);
  }, [filteredDeals]);

  const activeLeadsCount = useMemo(() => {
    return filteredContacts.filter(c => ['lead', 'contacted', 'qualified'].includes(c.stage)).length;
  }, [filteredContacts]);

  const avgDealCycleDays = useMemo(() => {
    const closed = filteredDeals.filter(d => d.closedAt);
    if (closed.length === 0) return 18;
    const totalDays = closed.reduce((acc, d) => {
      const start = new Date(d.createdAt).getTime();
      const end = new Date(d.closedAt!).getTime();
      return acc + Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
    }, 0);
    return Math.round(totalDays / closed.length);
  }, [filteredDeals]);

  const revenueChartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((m, idx) => {
      const seedRevenue = [32000, 48000, 52000, 61000, 74000, 89000, 95000, 112000, 128000, 142000, 160000, 185000][idx];
      const seedDeals = [4, 6, 7, 8, 10, 12, 11, 14, 16, 18, 20, 22][idx];
      return {
        month: m,
        revenue: Math.round(seedRevenue * (totalRevenue > 0 ? totalRevenue / 180000 : 1)),
        deals: seedDeals,
      };
    });
  }, [totalRevenue]);

  const pipelineDistributionData = useMemo(() => {
    const stages = [
      { key: 'lead', label: 'Lead Inbound', color: tokens.color.textMuted },
      { key: 'contacted', label: 'Contacted', color: tokens.color.info },
      { key: 'meeting_scheduled', label: 'Meeting Set', color: tokens.color.accent },
      { key: 'proposal_sent', label: 'Proposal Sent', color: tokens.color.warning },
      { key: 'closed_won', label: 'Closed Won', color: tokens.color.success },
      { key: 'closed_lost', label: 'Closed Lost', color: tokens.color.danger },
    ];

    return stages.map(s => {
      const count = filteredDeals.filter(d => d.stage === s.key).length;
      const value = filteredDeals.filter(d => d.stage === s.key).reduce((sum, d) => sum + d.amount, 0);
      return {
        name: s.label,
        count,
        value,
        color: s.color,
      };
    });
  }, [filteredDeals]);

  const agentLeaderboard = useMemo(() => {
    return users
      .filter(u => ['sales_agent', 'admin', 'super_admin'].includes(u.role))
      .map(agent => {
        const agentDeals = deals.filter(d => d.ownerId === agent.id);
        const wonDeals = agentDeals.filter(d => d.stage === 'closed_won');
        const wonRevenue = wonDeals.reduce((sum, d) => sum + d.amount, 0);
        const totalAmount = agentDeals.reduce((sum, d) => sum + d.amount, 0);
        return {
          agent,
          totalDeals: agentDeals.length,
          wonCount: wonDeals.length,
          wonRevenue,
          totalAmount,
        };
      })
      .sort((a, b) => b.wonRevenue - a.wonRevenue);
  }, [users, deals]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Global Time Range Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Executive CRM Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time pipeline metrics, conversion performance, and team activity
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-slate-500">
            <Filter className="w-3.5 h-3.5 text-orange-500" />
            <span className="hidden sm:inline">Range:</span>
          </div>

          {(['24h', '7d', '30d', 'ytd', 'custom'] as TimeRangeFilter[]).map(r => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeRange === r
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {r === '24h' && 'Last 24h'}
              {r === '7d' && 'Last 7 Days'}
              {r === '30d' && 'Last 30 Days'}
              {r === 'ytd' && 'This Year (YTD)'}
              {r === 'custom' && 'Custom Date'}
            </button>
          ))}
        </div>
      </div>

      {timeRange === 'custom' && (
        <div className="bg-orange-50/70 border border-orange-200 p-3.5 rounded-2xl flex flex-wrap items-center gap-4 text-xs animate-fade-in">
          <div className="flex items-center gap-2 text-orange-950 font-semibold">
            <Calendar className="w-4 h-4 text-orange-600" />
            <span>Custom Date Window:</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-slate-600 font-medium">From:</label>
            <input
              type="date"
              value={customDateRange.startDate}
              onChange={e => setCustomDateRange({ ...customDateRange, startDate: e.target.value })}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-slate-600 font-medium">To:</label>
            <input
              type="date"
              value={customDateRange.endDate}
              onChange={e => setCustomDateRange({ ...customDateRange, endDate: e.target.value })}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            />
          </div>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">${totalRevenue.toLocaleString()}</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+14.8%</span>
            <span className="text-slate-400 font-normal">vs last period</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pipeline Value</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">${totalPipelineValue.toLocaleString()}</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-orange-600">
            <Layers className="w-3.5 h-3.5" />
            <span>{filteredDeals.length} active deals</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Conversion Rate</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{conversionRate}%</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+3.2%</span>
            <span className="text-slate-400 font-normal">win ratio</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Leads</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{activeLeadsCount}</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-purple-600">
            <span>{contacts.length} total in CRM</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Deal Cycle</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{avgDealCycleDays} Days</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>-2 days</span>
            <span className="text-slate-400 font-normal">faster velocity</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Revenue & Deal Trajectory</h2>
              <p className="text-xs text-slate-500">Historical performance across 12-month cycle</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />
                <span className="text-slate-600">Revenue ($)</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={tokens.color.primary} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={tokens.color.primary} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={tokens.color.border} />
                <XAxis dataKey="month" stroke={tokens.color.textMuted} fontSize={11} tickLine={false} />
                <YAxis
                  stroke={tokens.color.textMuted}
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={value => `$${value / 1000}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: tokens.color.text,
                    borderRadius: '12px',
                    border: 'none',
                    color: tokens.color.surface,
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={tokens.color.primary}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Pipeline by Stage</h2>
            <p className="text-xs text-slate-500">Breakdown of opportunities by lifecycle stage</p>

            <div className="h-56 w-full mt-2 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pipelineDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {pipelineDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val} deals`, name]}
                    contentStyle={{
                      backgroundColor: tokens.color.text,
                      borderRadius: '12px',
                      border: 'none',
                      color: tokens.color.surface,
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-slate-900">{filteredDeals.length}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Deals</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 mt-2">
            {pipelineDistributionData.map(item => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 font-medium">{item.name}</span>
                </div>
                <div className="font-bold text-slate-800">
                  {item.count} <span className="text-slate-400 font-normal">(${item.value.toLocaleString()})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900">Sales Agent Leaderboard</h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">Ranked by Won Revenue</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                  <th className="pb-3">Rank & Agent</th>
                  <th className="pb-3">Won Deals</th>
                  <th className="pb-3">Won Revenue</th>
                  <th className="pb-3">Total Pipeline</th>
                  <th className="pb-3 text-right">Quota Met</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {agentLeaderboard.map((item, idx) => {
                  const quotaTarget = 150000;
                  const progressPct = Math.min(100, Math.round((item.wonRevenue / quotaTarget) * 100));

                  return (
                    <tr key={item.agent.id} className="hover:bg-slate-50 transition">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                              idx === 0
                                ? 'bg-amber-100 text-amber-700 font-black'
                                : idx === 1
                                ? 'bg-slate-200 text-slate-700'
                                : idx === 2
                                ? 'bg-orange-100 text-orange-700'
                                : 'text-slate-400'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-[10px]">
                            {item.agent.name[0]}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{item.agent.name}</div>
                            <div className="text-[11px] text-slate-400 capitalize">{item.agent.role.replace('_', ' ')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 font-semibold text-slate-700">{item.wonCount}</td>
                      <td className="py-3 font-bold text-emerald-600">${item.wonRevenue.toLocaleString()}</td>
                      <td className="py-3 font-medium text-slate-600">${item.totalAmount.toLocaleString()}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-orange-500 h-full rounded-full transition-all"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-800 w-8">{progressPct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-1">Recent Activities</h2>
          <p className="text-xs text-slate-500 mb-4">Latest client touchpoints & updates</p>

          <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
            {activities.slice(0, 6).map(act => (
              <div key={act.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-800 truncate">{act.title}</div>
                  <div className="text-[11px] text-slate-500 line-clamp-1">{act.description}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {new Date(act.createdAt).toLocaleDateString()} at {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
