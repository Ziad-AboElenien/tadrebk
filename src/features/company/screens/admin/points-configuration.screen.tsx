'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Sliders,
  TrendingUp,
  Trophy,
  CheckCircle2,
  Search,
  CalendarCheck,
  CheckCircle,
  BarChart2,
  MessageCircle,
  Pencil,
  Trash2,
} from 'lucide-react';
import Sidebar from '@/components/tadrebk/Sidebar';
import TopBar from '@/components/tadrebk/TopBar';
import GlassFilter from '@/components/ui/GlassFilter';
import ConfirmModal from '@/components/ui/ConfirmModal';
import FormModal from '@/features/profiles/components/FormModal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useAppSelector } from '@/store/store';
import {
  pointsService,
  type PointsCategory,
  type PointsFrequency,
  type PointsMilestone,
  type PointsRule,
  type PointsStats,
} from '@/features/company/services/points.service';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

const TABS = ['Earning Rules', 'Milestones & Levels'];

const CATEGORY_META: Record<PointsCategory, { label: string; icon: typeof CalendarCheck; chip: string }> = {
  attendance: { label: 'Attendance', icon: CalendarCheck, chip: 'bg-blue-50 text-blue-600' },
  tasks: { label: 'Tasks', icon: CheckCircle, chip: 'bg-emerald-50 text-emerald-600' },
  performance: { label: 'Performance', icon: BarChart2, chip: 'bg-purple-50 text-purple-600' },
  community: { label: 'Community', icon: MessageCircle, chip: 'bg-orange-50 text-orange-600' },
};

const FREQUENCY_LABELS: Record<PointsFrequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  per_task: 'Per Task',
  one_time: 'One-time',
};

interface RuleForm {
  title: string;
  category: PointsCategory;
  points: string;
  frequency: PointsFrequency;
  status: 'active' | 'inactive';
  description: string;
}

const EMPTY_RULE_FORM: RuleForm = {
  title: '',
  category: 'tasks',
  points: '',
  frequency: 'per_task',
  status: 'active',
  description: '',
};

interface MilestoneForm {
  title: string;
  threshold: string;
  reward: string;
}

const EMPTY_MILESTONE_FORM: MilestoneForm = { title: '', threshold: '', reward: '' };

export default function PointsConfigurationScreen() {
  const companyId = useAppSelector((s) => s.company.currentCompany?._id);
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState<PointsRule[]>([]);
  const [milestones, setMilestones] = useState<PointsMilestone[]>([]);
  const [stats, setStats] = useState<PointsStats | null>(null);
  const [search, setSearch] = useState('');

  const [ruleModal, setRuleModal] = useState<{ open: boolean; rule?: PointsRule }>({ open: false });
  const [ruleForm, setRuleForm] = useState<RuleForm>(EMPTY_RULE_FORM);
  const [savingRule, setSavingRule] = useState(false);
  const [deleteRule, setDeleteRule] = useState<PointsRule | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [milestoneModal, setMilestoneModal] = useState<{ open: boolean; milestone?: PointsMilestone }>({
    open: false,
  });
  const [milestoneForm, setMilestoneForm] = useState<MilestoneForm>(EMPTY_MILESTONE_FORM);
  const [savingMilestone, setSavingMilestone] = useState(false);
  const [deleteMilestone, setDeleteMilestone] = useState<PointsMilestone | null>(null);

  const fetchAll = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const [rulesRes, milestonesRes, statsRes] = await Promise.all([
        pointsService.listRules(companyId, { limit: 100 }),
        pointsService.listMilestones(companyId, { limit: 100 }),
        pointsService.getStats(companyId).catch(() => null),
      ]);
      setRules(rulesRes.rules);
      setMilestones(milestonesRes.milestones);
      setStats(statsRes);
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchAll();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchAll]);

  const filteredRules = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rules;
    return rules.filter((r) =>
      `${r.title} ${r.description || ''} ${r.category}`.toLowerCase().includes(q),
    );
  }, [rules, search]);

  function openNewRule() {
    setRuleForm(EMPTY_RULE_FORM);
    setRuleModal({ open: true });
  }

  function openEditRule(rule: PointsRule) {
    setRuleForm({
      title: rule.title,
      category: rule.category,
      points: String(rule.points),
      frequency: rule.frequency,
      status: rule.status,
      description: rule.description || '',
    });
    setRuleModal({ open: true, rule });
  }

  const refreshStats = useCallback(() => {
    if (!companyId) return;
    pointsService
      .getStats(companyId)
      .then(setStats)
      .catch(() => {});
  }, [companyId]);

  async function saveRule() {
    if (!companyId) return;
    const points = Number(ruleForm.points);
    if (ruleForm.title.trim().length < 2) {
      toastHelper.error('Title must be at least 2 characters.');
      return;
    }
    if (!Number.isInteger(points) || points < 1 || points > 10000) {
      toastHelper.error('Points must be a whole number between 1 and 10000.');
      return;
    }
    setSavingRule(true);
    try {
      const payload = {
        title: ruleForm.title.trim(),
        category: ruleForm.category,
        points,
        frequency: ruleForm.frequency,
        description: ruleForm.description.trim() || undefined,
      };
      if (ruleModal.rule) {
        const updated = await pointsService.updateRule(companyId, ruleModal.rule._id, { ...payload, status: ruleForm.status });
        setRules((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
        toastHelper.success('Rule updated!');
      } else {
        const created = await pointsService.createRule(companyId, payload);
        setRules((prev) => [created, ...prev]);
        toastHelper.success('Rule created!');
      }
      setRuleModal({ open: false });
      refreshStats();
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setSavingRule(false);
    }
  }

  async function confirmDeleteRule() {
    if (!companyId || !deleteRule) return;
    setDeleting(true);
    try {
      await pointsService.deleteRule(companyId, deleteRule._id);
      setRules((prev) => prev.filter((r) => r._id !== deleteRule._id));
      toastHelper.success('Rule deleted');
      setDeleteRule(null);
      refreshStats();
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  async function toggleRuleStatus(rule: PointsRule) {
    if (!companyId) return;
    try {
      const updated = await pointsService.updateRule(companyId, rule._id, {
        status: rule.status === 'active' ? 'inactive' : 'active',
      });
      setRules((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
      refreshStats();
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    }
  }

  function openNewMilestone() {
    setMilestoneForm(EMPTY_MILESTONE_FORM);
    setMilestoneModal({ open: true });
  }

  function openEditMilestone(m: PointsMilestone) {
    setMilestoneForm({ title: m.title, threshold: String(m.threshold), reward: m.reward });
    setMilestoneModal({ open: true, milestone: m });
  }

  async function saveMilestone() {
    if (!companyId) return;
    const threshold = Number(milestoneForm.threshold);
    if (milestoneForm.title.trim().length < 2) {
      toastHelper.error('Title must be at least 2 characters.');
      return;
    }
    if (!Number.isInteger(threshold) || threshold < 1 || threshold > 1000000) {
      toastHelper.error('Threshold must be a whole number between 1 and 1000000.');
      return;
    }
    if (!milestoneForm.reward.trim()) {
      toastHelper.error('Describe the reward.');
      return;
    }
    setSavingMilestone(true);
    try {
      const payload = {
        title: milestoneForm.title.trim(),
        threshold,
        reward: milestoneForm.reward.trim(),
      };
      if (milestoneModal.milestone) {
        const updated = await pointsService.updateMilestone(companyId, milestoneModal.milestone._id, payload);
        setMilestones((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
        toastHelper.success('Milestone updated!');
      } else {
        const created = await pointsService.createMilestone(companyId, payload);
        setMilestones((prev) => [...prev, created]);
        toastHelper.success('Milestone created!');
      }
      setMilestoneModal({ open: false });
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setSavingMilestone(false);
    }
  }

  async function confirmDeleteMilestone() {
    if (!companyId || !deleteMilestone) return;
    setDeleting(true);
    try {
      await pointsService.deleteMilestone(companyId, deleteMilestone._id);
      setMilestones((prev) => prev.filter((m) => m._id !== deleteMilestone._id));
      toastHelper.success('Milestone deleted');
      setDeleteMilestone(null);
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  const statCards = [
    {
      label: 'ACTIVE RULES',
      value: stats ? String(stats.activeRules) : '—',
      icon: Sliders,
      badge: `${rules.length} rule${rules.length !== 1 ? 's' : ''} total`,
    },
    {
      label: 'AVG. POINTS/MONTH',
      value: stats ? String(stats.avgPointsPerMonth) : '—',
      icon: TrendingUp,
      badge: 'Projected monthly pool',
    },
    {
      label: 'TOTAL REDEMPTIONS',
      value: stats ? String(stats.totalRedemptions) : '—',
      icon: Trophy,
      badge: 'Milestones reached',
    },
    {
      label: 'SYSTEM HEALTH',
      value: stats ? (stats.systemHealth === 'operational' ? 'Optimal' : 'Degraded') : '—',
      icon: CheckCircle2,
      badge:
        stats?.systemHealth === 'operational'
          ? 'Rules + milestones live'
          : 'Add a rule and a milestone',
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar active="Points" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar title="Points Configuration" />

        <main className="flex-1 space-y-6 overflow-y-auto px-[2.5%] py-4 sm:p-6 lg:p-8">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-2xl font-semibold text-slate-900">Points & Rewards Engine</h2>
              <p className="text-sm text-slate-500">
                Configure how interns earn points and reach performance milestones.
              </p>
            </div>
            <button
              onClick={() => (activeTab === TABS[1] ? openNewMilestone() : openNewRule())}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
            >
              <Plus size={16} /> {activeTab === TABS[1] ? 'New Milestone' : 'New Rule'}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((s) => (
              <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{s.label}</p>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <s.icon size={18} />
                  </span>
                </div>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{loading ? '—' : s.value}</p>
                <p className="mt-2 text-xs text-slate-400">{s.badge}</p>
              </div>
            ))}
          </div>

          <div className="w-fit max-w-full">
            <GlassFilter
              options={TABS.map((t) => ({ key: t, label: t }))}
              value={activeTab}
              onChange={setActiveTab}
              ariaLabel="Points sections"
            />
          </div>

          {activeTab === 'Earning Rules' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">Activity Point Rules</h3>
                  <p className="text-sm text-slate-400">Define how many points are awarded for specific intern actions.</p>
                </div>
                <div className="relative">
                  <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    placeholder="Search activities..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              <div className="mt-4 overflow-x-auto">
                {loading ? (
                  <div className="space-y-2 py-2">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
                    ))}
                  </div>
                ) : filteredRules.length === 0 ? (
                  <p className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-400">
                    {rules.length === 0
                      ? 'No rules yet — create your first earning rule.'
                      : 'No rules match your search.'}
                  </p>
                ) : (
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                        <th className="py-3 font-medium">Activity Description</th>
                        <th className="py-3 font-medium">Category</th>
                        <th className="py-3 font-medium">Points</th>
                        <th className="py-3 font-medium">Frequency</th>
                        <th className="py-3 font-medium">Status</th>
                        <th className="py-3 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRules.map((r) => {
                        const meta = CATEGORY_META[r.category] || CATEGORY_META.tasks;
                        return (
                          <tr key={r._id}>
                            <td className="py-3.5 pr-4">
                              <span className="flex items-center gap-3">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                  <meta.icon size={15} />
                                </span>
                                <span>
                                  <span className="block font-medium text-slate-900">{r.title}</span>
                                  {r.description && (
                                    <span className="block max-w-xs truncate text-xs text-slate-400">{r.description}</span>
                                  )}
                                </span>
                              </span>
                            </td>
                            <td className="py-3.5 pr-4">
                              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${meta.chip}`}>
                                {meta.label}
                              </span>
                            </td>
                            <td className="py-3.5 pr-4">
                              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                                +{r.points}
                              </span>
                            </td>
                            <td className="py-3.5 pr-4 capitalize text-slate-600">
                              {FREQUENCY_LABELS[r.frequency] || r.frequency.replace('_', ' ')}
                            </td>
                            <td className="py-3.5 pr-4">
                              <button
                                onClick={() => toggleRuleStatus(r)}
                                title={r.status === 'active' ? 'Deactivate' : 'Activate'}
                                className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                                  r.status === 'active'
                                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                }`}
                              >
                                {r.status}
                              </button>
                            </td>
                            <td className="py-3.5 text-right">
                              <span className="inline-flex items-center gap-1">
                                <button
                                  onClick={() => openEditRule(r)}
                                  aria-label={`Edit ${r.title}`}
                                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => setDeleteRule(r)}
                                  aria-label={`Delete ${r.title}`}
                                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Milestones & Levels' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div>
                <h3 className="font-semibold text-slate-900">Milestones & Levels</h3>
                <p className="text-sm text-slate-400">Rewards interns unlock as their points grow.</p>
              </div>
              {loading ? (
                <div className="mt-4 space-y-3">
                  {[0, 1].map((i) => (
                    <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
                  ))}
                </div>
              ) : milestones.length === 0 ? (
                <p className="mt-4 rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-400">
                  No milestones yet — create the first reward tier.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {[...milestones]
                    .sort((a, b) => a.threshold - b.threshold)
                    .map((m) => (
                      <div
                        key={m._id}
                        className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-100 p-5"
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                          <Trophy size={19} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-900">{m.title}</p>
                          <p className="mt-0.5 truncate text-sm text-slate-500">{m.reward}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                          {m.threshold.toLocaleString()} pts
                        </span>
                        <span className="flex shrink-0 items-center gap-1">
                          <button
                            onClick={() => openEditMilestone(m)}
                            aria-label={`Edit ${m.title}`}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteMilestone(m)}
                            aria-label={`Delete ${m.title}`}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Rule modal */}
      {ruleModal.open && (
        <FormModal
          open
          title={ruleModal.rule ? 'Edit rule' : 'New earning rule'}
          subtitle="Points are awarded automatically when the action happens."
          icon={Sliders}
          onClose={() => setRuleModal({ open: false })}
          onSubmit={saveRule}
          submitLabel={ruleModal.rule ? 'Save changes' : 'Create rule'}
          saving={savingRule}
        >
          <Input
            label="Title"
            placeholder="e.g. Task completed on time"
            value={ruleForm.title}
            onChange={(e) => setRuleForm((f) => ({ ...f, title: e.target.value }))}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Category"
              value={ruleForm.category}
              onChange={(e) => setRuleForm((f) => ({ ...f, category: e.target.value as PointsCategory }))}
              options={(Object.entries(CATEGORY_META) as [PointsCategory, { label: string }][]).map(
                ([value, meta]) => ({ value, label: meta.label }),
              )}
            />
            <Select
              label="Frequency"
              value={ruleForm.frequency}
              onChange={(e) => setRuleForm((f) => ({ ...f, frequency: e.target.value as PointsFrequency }))}
              options={(Object.entries(FREQUENCY_LABELS) as [PointsFrequency, string][]).map(
                ([value, label]) => ({ value, label }),
              )}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Points"
              type="number"
              min={1}
              max={10000}
              placeholder="e.g. 20"
              value={ruleForm.points}
              onChange={(e) => setRuleForm((f) => ({ ...f, points: e.target.value }))}
            />
            <Select
              label="Status"
              value={ruleForm.status}
              onChange={(e) => setRuleForm((f) => ({ ...f, status: e.target.value as 'active' | 'inactive' }))}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Description <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              value={ruleForm.description}
              onChange={(e) => setRuleForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              placeholder="When exactly is this awarded?"
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
        </FormModal>
      )}

      {/* Milestone modal */}
      {milestoneModal.open && (
        <FormModal
          open
          title={milestoneModal.milestone ? 'Edit milestone' : 'New milestone'}
          subtitle="A reward tier unlocked at a points threshold."
          icon={Trophy}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          onClose={() => setMilestoneModal({ open: false })}
          onSubmit={saveMilestone}
          submitLabel={milestoneModal.milestone ? 'Save changes' : 'Create milestone'}
          saving={savingMilestone}
        >
          <Input
            label="Title"
            placeholder="e.g. Rising Star"
            value={milestoneForm.title}
            onChange={(e) => setMilestoneForm((f) => ({ ...f, title: e.target.value }))}
          />
          <Input
            label="Points threshold"
            type="number"
            min={1}
            max={1000000}
            placeholder="e.g. 500"
            value={milestoneForm.threshold}
            onChange={(e) => setMilestoneForm((f) => ({ ...f, threshold: e.target.value }))}
          />
          <Input
            label="Reward"
            placeholder="e.g. Certificate + LinkedIn shoutout"
            value={milestoneForm.reward}
            onChange={(e) => setMilestoneForm((f) => ({ ...f, reward: e.target.value }))}
          />
        </FormModal>
      )}

      <ConfirmModal
        open={deleteRule !== null}
        title="Delete this rule?"
        message={`"${deleteRule?.title}" will be removed permanently.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDeleteRule}
        onCancel={() => setDeleteRule(null)}
      />
      <ConfirmModal
        open={deleteMilestone !== null}
        title="Delete this milestone?"
        message={`"${deleteMilestone?.title}" will be removed permanently.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDeleteMilestone}
        onCancel={() => setDeleteMilestone(null)}
      />

      {/*
        NOTE: the old static "General Settings" tab had no backend behind it,
        so it was removed. If a company-level points settings endpoint ships
        later, re-add a third tab here.
      */}
    </div>
  );
}
