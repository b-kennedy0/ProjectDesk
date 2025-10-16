ProjectForm.tsx
```tsx
import { useState } from 'react';

export default function ProjectForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  async function submit() {
    setLoading(true);
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, startDate, endDate }),
    });
    setLoading(false);
    if (res.ok) {
      setOpen(false);
      setTitle('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      onCreated();
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error || 'Failed to create project');
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="px-3 py-2 bg-black text-white rounded-md text-sm">
        New Project
      </button>
    );
  }

  return (
    <div className="border rounded-md p-4 w-full max-w-xl bg-white shadow-sm">
      <div className="space-y-3">
        <div className="text-lg font-medium">Create Project</div>
        <input className="border w-full rounded px-3 py-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="border w-full rounded px-3 py-2" placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <input type="date" className="border w-full rounded px-3 py-2" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <input type="date" className="border w-full rounded px-3 py-2" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <button disabled={loading} onClick={submit} className="px-3 py-2 bg-black text-white rounded-md text-sm">
            {loading ? 'Creating…' : 'Create'}
          </button>
          <button onClick={() => setOpen(false)} className="px-3 py-2 border rounded-md text-sm">Cancel</button>
        </div>
      </div>
    </div>
  );
}
```