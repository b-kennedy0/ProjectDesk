import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { toast } from "react-hot-toast";

export default function TaskFormModal({ projectId, isOpen, onClose, mutate }: any) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to create task");
      toast.success("Task created!");
      mutate(); // Refresh task list
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Error creating task");
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <Dialog.Panel className="bg-white p-6 rounded-lg w-full max-w-md">
        <Dialog.Title className="text-lg font-semibold mb-4">Create New Task</Dialog.Title>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="title"
            placeholder="Task title"
            value={formData.title}
            onChange={handleChange}
            required
            className="border rounded w-full p-2"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="border rounded w-full p-2"
          />
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="border rounded w-full p-2"
          />
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 px-4 py-2 rounded">
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
              Create Task
            </button>
          </div>
        </form>
      </Dialog.Panel>
    </Dialog>
  );
}