import { useRouter } from "next/router";
import useSWR from "swr";
import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function TaskSetDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const fetcher = (url: string) => fetch(url).then((r) => r.json());
  const { data, error, mutate } = useSWR(
    id ? `/api/tasksets/${id}/templates` : null,
    fetcher
  );
  const [newTemplate, setNewTemplate] = useState({ title: "", description: "", dueOffset: "" });
  // State to track which template is being edited
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  // State to hold editable fields for the template being edited
  const [editFields, setEditFields] = useState<{ title: string; description: string; dueOffset: string }>({ title: "", description: "", dueOffset: "" });
  // Local state for ordering
  const [localOrder, setLocalOrder] = useState<string[]>([]);

  useEffect(() => {
    if (data) {
      const currentIds = Array.isArray(data)
        ? data.map((t) => t.id)
        : data.templates?.map((t) => t.id) || [];

      // Only set once — when localOrder is empty
      if (localOrder.length === 0) {
        setLocalOrder(currentIds);
      }
    }
  }, [data]);

  useEffect(()=>{
  }, [localOrder]);

  // Security check
  if (!session || session.user.role !== "SUPERVISOR") {
    return (
      <Layout title="Access Denied">
        <p className="p-6 text-red-600">Access denied.</p>
      </Layout>
    );
  }

  // Add new template logic
  const handleAddTemplate = async () => {
    if (!newTemplate.title.trim()) {
      toast.error("Title is required");
      return;
    }
    const res = await fetch(`/api/tasksets/${id}/templates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTemplate),
    });

    if (res.ok) {
      toast.success("Task added");
      setNewTemplate({ title: "", description: "", dueOffset: "" });
      mutate();
    } else {
      const err = await res.json();
      toast.error(err.error || "Error adding task");
    }
  };

  // Error/loading UI
  if (error) return <Layout title="Error"><p className="p-6 text-red-600">Failed to load task set.</p></Layout>;
  if (!data) return <Layout title="Loading..."><p className="p-6">Loading task templates...</p></Layout>;

  // Handle template update
  const handleUpdateTemplate = async (templateId: string) => {
    if (!editFields.title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      const res = await fetch(`/api/tasksets/${id}/templates`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId,
          title: editFields.title,
          description: editFields.description,
          dueOffset: editFields.dueOffset ? Number(editFields.dueOffset) : null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Error updating task");
        return;
      }

      toast.success("Task updated successfully");
      setEditingTemplateId(null);
      mutate();
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Network error");
    }
  };

  // Handle template deletion
  const handleDeleteTemplate = async (templateId: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch(`/api/tasksets/${id}/templates/${templateId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Task deleted");
        mutate();
      } else {
        const err = await res.json();
        toast.error(err.error || "Error deleting task");
      }
    } catch (e) {
      toast.error("Network error");
    }
  };

  // Function to update task order on the server
  const updateTaskOrder = async (newOrder: string[]) => {
    try {
      const payload = {
        orderedTasks: newOrder.map((taskId, index) => ({
          id: Number(taskId),
          order: index,
        })),
      };

      const res = await fetch(`/api/tasksets/${id}/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success("Task order updated");
        await mutate(); // ensure SWR refetches latest data
        const refreshed = await fetch(`/api/tasksets/${id}/templates`).then((r) => r.json());
        const updatedTemplates = Array.isArray(refreshed)
          ? refreshed
          : refreshed.templates || [];
        setLocalOrder(updatedTemplates.map((t: any) => String(t.id)));
      } else {
        const err = await res.json();
        toast.error(err.error || "Error updating task order");
      }
    } catch (e) {
      toast.error("Network error");
    }
  };

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = localOrder.indexOf(active.id.toString());
      const newIndex = localOrder.indexOf(over.id.toString());
      const newOrder = arrayMove(localOrder, oldIndex, newIndex);
      setLocalOrder(newOrder);
      updateTaskOrder(newOrder);
    }
  };

  // Get the list of templates based on data shape and sort by order
  const templates = (Array.isArray(data) ? data : data.templates || []).sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  // Sort templates by localOrder, normalizing ID types
  const orderedTemplates = localOrder
    .map((id) => templates.find((t) => String(t.id) === String(id)))
    .filter((t): t is typeof templates[0] => !!t);

  // SortableItem component
  function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 999 : undefined,
      cursor: 'grab',
      backgroundColor: isDragging ? '#f0f0f0' : undefined,
      position: 'relative',
    };

    return (
      <li
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        data-id={id}
        className="py-3 flex flex-col gap-2 border-b bg-white"
      >
        {children}
      </li>
    );
  }

  return (
    <Layout title={`Task Set #${id}`}>
      <div className="max-w-4xl mx-auto p-6 space-y-6 text-gray-700">
        <button
          onClick={() => router.push("/supervisor/task-library")}
          className="text-blue-600 hover:underline"
        >
          ← Back to Task Library
        </button>

        <h1 className="text-2xl font-semibold">Tasks in this Set</h1>
        <h3 className="text-gray-600 mb-4">Drag and drop to reorder tasks</h3>

        <div className="space-y-3">
          {(!templates || templates.length === 0) && (
            <p>No templates yet. Add one below.</p>
          )}

          {templates.length > 0 && (
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              onDragStart={(event) => {}}
              onDragCancel={() => {}}
            >
              <SortableContext items={localOrder} strategy={verticalListSortingStrategy}>
                <ul className="divide-y divide-gray-200">
                  {orderedTemplates.map((t) => (
                    <SortableItem key={String(t.id)} id={String(t.id)}>
                      {/* If editing this template, show input fields */}
                      {editingTemplateId === t.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editFields.title}
                            onChange={(e) =>
                              setEditFields((f) => ({ ...f, title: e.target.value }))
                            }
                            className="border rounded px-3 py-2 w-full mb-1"
                            placeholder="Title"
                          />
                          <textarea
                            value={editFields.description}
                            onChange={(e) =>
                              setEditFields((f) => ({ ...f, description: e.target.value }))
                            }
                            className="border rounded px-3 py-2 w-full mb-1"
                            placeholder="Description (optional)"
                          />
                          <input
                            type="number"
                            value={editFields.dueOffset}
                            onChange={(e) =>
                              setEditFields((f) => ({ ...f, dueOffset: e.target.value }))
                            }
                            className="border rounded px-3 py-2 w-full mb-1"
                            placeholder="Due Offset (days after project start) (optional)"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateTemplate(t.id)}
                              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingTemplateId(null)}
                              className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Normal display mode
                        <div className="flex flex-col gap-1">
                          <div className="font-medium">{t.title}</div>
                          {t.description && (
                            <div className="text-sm text-gray-600">{t.description}</div>
                          )}
                          {t.dueOffset && (
                            <div className="text-xs text-gray-400">
                              Due {t.dueOffset} days after project start
                            </div>
                          )}
                          <div className="flex gap-2 mt-2">
                            {/* Edit button: enables edit mode and sets current values */}
                            <button
                              onClick={() => {
                                setEditingTemplateId(t.id);
                                setEditFields({
                                  title: t.title || "",
                                  description: t.description || "",
                                  dueOffset: t.dueOffset ? String(t.dueOffset) : "",
                                });
                              }}
                              className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                            >
                              Edit
                            </button>
                            {/* Delete button: prompts confirmation and deletes */}
                            <button
                              onClick={() => handleDeleteTemplate(t.id)}
                              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </SortableItem>
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
        </div>

        <div className="border-t pt-4">
          <h2 className="text-xl font-semibold mb-3">Add New Task to this Set</h2>
          <input
            type="text"
            placeholder="Title"
            value={newTemplate.title}
            onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
            className="border rounded px-3 py-2 w-full mb-2"
          />
          <textarea
            placeholder="Description (optional)"
            value={newTemplate.description}
            onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
            className="border rounded px-3 py-2 w-full mb-2"
          />
          <input
            type="number"
            placeholder="Due Offset (days after project start) (optional)"
            value={newTemplate.dueOffset}
            onChange={(e) => setNewTemplate({ ...newTemplate, dueOffset: e.target.value })}
            className="border rounded px-3 py-2 w-full mb-2"
          />
          <button
            onClick={handleAddTemplate}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Task to Set
          </button>
        </div>
      </div>
    </Layout>
  );
}