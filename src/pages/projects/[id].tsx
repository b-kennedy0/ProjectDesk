import { useRouter } from 'next/router';
import useSWR from 'swr';
import { useState } from 'react';
import Layout from '@/components/Layout';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ProjectDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { data: tasks, mutate } = useSWR(id ? `/api/tasks?projectId=${id}` : null, fetcher);
  const [newTask, setNewTask] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  async function addTask() {
    if (!newTask.trim()) return;
    setLoading(true);
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: Number(id), title: newTask, dueDate }),
    });
    setNewTask('');
    setDueDate('');
    setLoading(false);
    mutate();
  }

  async function updateTask(t: any, patch: Record<string, any>) {
    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: t.id, ...patch }),
    });
    mutate();
  }

  async function addComment(taskId: number, text: string) {
    if (!text.trim()) return;
    await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, text }),
    });
    mutate();
  }

  return (
    <Layout title={`Project ${id}`}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Project #{id}</h1>
        <div className="flex gap-2">
          <a href={`/projects/${id}/gantt`} className="text-sm border px-3 py-1 rounded-md">Gantt</a>
          <button onClick={() => router.push('/dashboard')} className="text-sm border px-3 py-1 rounded-md">Back</button>
        </div>
      </div>

      <div className="border rounded-md p-4 bg-gray-50 mb-8">
        <h2 className="text-lg font-medium mb-3">Add Task</h2>
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
          <input type="text" className="border rounded-md px-3 py-2 sm:col-span-3" placeholder="Task title" value={newTask} onChange={(e) => setNewTask(e.target.value)} />
          <input type="date" className="border rounded-md px-3 py-2 sm:col-span-2" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <button disabled={loading} onClick={addTask} className="bg-black text-white rounded-md px-4 py-2 text-sm sm:col-span-1">{loading ? 'Adding…' : 'Add'}</button>
        </div>
      </div>

      {!tasks ? (
        <p>Loading tasks…</p>
      ) : tasks.length === 0 ? (
        <p className="text-gray-600">No tasks yet.</p>
      ) : (
        <div className="space-y-4">
          {tasks.map((t: any) => (
            <TaskItem key={t.id} t={t} onUpdate={(patch: any) => updateTask(t, patch)} onAddComment={addComment} />
          ))}
        </div>
      )}
    </Layout>
  );
}

function TaskItem({ t, onUpdate, onAddComment }: any) {
  const [comment, setComment] = useState('');
  return (
    <div className={`border rounded-lg p-4 ${t.flagged ? 'border-red-400 bg-red-50' : ''}`}>
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <div className="font-medium">{t.title}</div>
          {t.description && <div className="text-sm text-gray-600">{t.description}</div>}
          <div className="flex gap-3 items-center text-sm text-gray-600 mt-1">
            <span>Status:</span>
            <select className="border rounded px-2 py-1" value={t.status} onChange={(e) => onUpdate({ status: e.target.value })}>
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </select>
            <span>Due:</span>
            <input
              type="date"
              className="border rounded px-2 py-1"
              value={t.dueDate ? new Date(t.dueDate).toISOString().slice(0,10) : ''}
              onChange={(e) => onUpdate({ dueDate: e.target.value })}
            />
          </div>
        </div>
        <button
          onClick={() => onUpdate({ flagged: !t.flagged })}
          className={`text-sm px-3 py-1 rounded-md border ${t.flagged ? 'border-red-500 text-red-600' : 'border-gray-300 text-gray-700'}`}
        >
          {t.flagged ? 'Unflag' : 'Flag for Support'}
        </button>
      </div>

      <div className="mt-4 border-t pt-3">
        <div className="space-y-2">
          {t.comments?.length ? t.comments.map((c: any) => (
            <div key={c.id} className="text-sm">
              <span className="font-medium">{c.user?.name || c.user?.email}</span>: {c.text}
            </div>
          )) : <p className="text-sm text-gray-500">No comments yet.</p>}
        </div>
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            className="border rounded-md px-3 py-1 flex-1 text-sm"
            placeholder="Add a comment…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button onClick={() => { onAddComment(t.id, comment); setComment(''); }} className="bg-gray-900 text-white text-sm px-3 py-1 rounded-md">Send</button>
        </div>
      </div>
    </div>
  );
}