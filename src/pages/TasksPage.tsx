import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Task } from '../types/crm';
import {
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  Trash2,
  X,
  Phone,
  Mail,
  Users,
  FileText,
} from 'lucide-react';

export const TasksPage: React.FC = () => {
  const { tasks, contacts, addTask, toggleTaskComplete, deleteTask } = useCRM();
  const { currentUser } = useAuth();
  const { success, error } = useToast();

  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Task Form
  const [title, setTitle] = useState('');
  const [type, setType] = useState<Task['type']>('call');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [contactId, setContactId] = useState('');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return t.status === 'pending';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      error('Missing title', 'Please enter a task title');
      return;
    }

    const newTask = addTask({
      title,
      type,
      priority,
      status: 'pending',
      dueDate,
      contactId: contactId || undefined,
      assignedToId: currentUser?.id || 'usr_superadmin_01',
    });

    success('Task Scheduled', `Task "${newTask.title}" added to your queue.`);
    setIsModalOpen(false);
    setTitle('');
  };

  const getTaskIcon = (taskType: Task['type']) => {
    switch (taskType) {
      case 'call':
        return <Phone className="w-4 h-4 text-blue-500" />;
      case 'email':
        return <Mail className="w-4 h-4 text-purple-500" />;
      case 'meeting':
        return <Users className="w-4 h-4 text-emerald-500" />;
      default:
        return <FileText className="w-4 h-4 text-orange-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Task & Activity Tracker</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Follow-ups, scheduled calls, client milestones, and assigned agent tasks
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs w-fit">
        {(['all', 'pending', 'completed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
              filter === tab ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab} ({tasks.filter(t => (tab === 'all' ? true : t.status === tab)).length})
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">
            No tasks found in this view.
          </div>
        ) : (
          filteredTasks.map(task => {
            const contact = contacts.find(c => c.id === task.contactId);
            const isCompleted = task.status === 'completed';

            return (
              <div
                key={task.id}
                className={`p-4 flex items-center justify-between gap-4 transition hover:bg-slate-50 ${
                  isCompleted ? 'bg-slate-50/50 opacity-60' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => {
                      toggleTaskComplete(task.id);
                      success(
                        isCompleted ? 'Marked Incomplete' : 'Task Completed',
                        task.title
                      );
                    }}
                    className="text-slate-400 hover:text-orange-600 transition"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300" />
                    )}
                  </button>

                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    {getTaskIcon(task.type)}
                  </div>

                  <div className="min-w-0">
                    <div
                      className={`font-bold text-xs truncate ${
                        isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {task.title}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      {contact && (
                        <span>
                          {contact.firstName} {contact.lastName} ({contact.companyName || 'Independent'})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      task.priority === 'high'
                        ? 'bg-rose-50 text-rose-600 border border-rose-200'
                        : task.priority === 'medium'
                        ? 'bg-amber-50 text-amber-600 border border-amber-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {task.priority}
                  </span>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>

                  <button
                    onClick={() => {
                      deleteTask(task.id);
                      success('Deleted', 'Task removed');
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Add New Follow-up</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Follow-up demo call"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as Task['type'])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl capitalize"
                  >
                    {['call', 'email', 'meeting', 'follow_up'].map(t => (
                      <option key={t} value={t}>
                        {t.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as Task['priority'])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl capitalize"
                  >
                    {['low', 'medium', 'high'].map(p => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Link to Contact</label>
                <select
                  value={contactId}
                  onChange={e => setContactId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="">None (General Task)</option>
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} ({c.companyName || 'Independent'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md shadow-orange-500/20"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
