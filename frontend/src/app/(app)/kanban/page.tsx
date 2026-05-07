"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Calendar, AlertTriangle, X, Loader2, Kanban, ArrowLeft } from "lucide-react";
import { taskApi } from "@/lib/api";
import { useWorkspaceStore } from "@/store/workspace.store";
import { TaskPriority, TaskStatus } from "@/types";
import { cn } from "@/lib/utils";
import { format, isPast, parseISO } from "date-fns";
import { useRouter } from "next/navigation";

const COLUMNS: { id: TaskStatus; label: string; dot: string; header: string }[] = [
  { id: "TODO",        label: "To Do",       dot: "bg-slate-400",   header: "border-t-slate-400" },
  { id: "IN_PROGRESS", label: "In Progress", dot: "bg-blue-500",    header: "border-t-blue-500" },
  { id: "REVIEW",      label: "Review",      dot: "bg-amber-500",   header: "border-t-amber-500" },
  { id: "DONE",        label: "Done",        dot: "bg-emerald-500", header: "border-t-emerald-500" },
];

const PRIORITY_LEFT: Record<string, string> = {
  LOW:      "border-l-slate-300",
  MEDIUM:   "border-l-blue-400",
  HIGH:     "border-l-amber-400",
  CRITICAL: "border-l-red-500",
};

const PRIORITY_BADGE: Record<string, string> = {
  LOW:      "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  MEDIUM:   "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  HIGH:     "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  CRITICAL: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

export default function KanbanPage() {
  const router = useRouter();
  const { activeWorkspace, activeProject, tasks, setTasks, updateTask, addTask } = useWorkspaceStore();
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<TaskStatus | null>(null);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

useEffect(() => {
     if (!activeWorkspace || !activeProject?.id) { setLoading(false); return; }
     setLoading(true);
     taskApi.list(activeWorkspace.id, activeProject.id)
       .then((res) => setTasks(res.data))
       .catch((err) => {
         console.error('Failed to load tasks:', err);
         alert('Could not load tasks for this project');
       })
       .finally(() => setLoading(false));
   }, [activeWorkspace?.id, activeProject?.id]);

  const byStatus = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status).sort((a, b) => a.position - b.position);

const onDragEnd = async (result: DropResult) => {
     const { destination, source, draggableId } = result;
     if (!destination || !activeWorkspace?.id || !activeProject?.id) return;
     if (destination.droppableId === source.droppableId && destination.index === source.index) return;

     const newStatus = destination.droppableId as TaskStatus;
     const task = tasks.find((t) => t.id === draggableId);
     if (!task) return;

     updateTask({ ...task, status: newStatus, position: destination.index });
     try {
       const res = await taskApi.move(activeWorkspace.id, activeProject.id, draggableId, {
         status: newStatus, position: destination.index,
       });
       updateTask(res.data);
     } catch (err) {
       console.error("Move task failed:", err);
       updateTask(task);
     }
   };

  const openModal = (status: TaskStatus) => {
    setTitle(""); setPriority("MEDIUM"); setDueDate("");
    setModal(status);
  };

const createTask = async () => {
     if (!title.trim() || !activeWorkspace?.id || !activeProject?.id || !modal) return;
     setSaving(true);
     try {
       const res = await taskApi.create(activeWorkspace.id, activeProject.id, {
         title,
         description: "",
         priority,
         dueDate: dueDate || null,
         status: modal,
       });
       addTask(res.data);
       setModal(null);
     } catch (err: any) {
       console.error("Create task failed:", err);
       alert("Failed to create task");
     } finally {
       setSaving(false);
     }
   };

  if (loading) {
    return (
      <div className="p-8 flex gap-4">
        {COLUMNS.map((c) => (
          <div key={c.id} className="w-72 shrink-0 space-y-3">
            <div className="h-8 rounded-lg bg-muted animate-pulse" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
          <Kanban className="w-8 h-8 opacity-30" />
        </div>
        <div className="text-center">
          <p className="font-medium text-foreground">No project selected</p>
          <p className="text-sm mt-1">Open a project from the Projects page to view its board.</p>
        </div>
        <button
          onClick={() => router.push("/workspace")}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" /> Go to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg"
            style={{ backgroundColor: activeProject.color + "30", border: `1px solid ${activeProject.color}40` }}
          >
            <div className="w-full h-full rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: activeProject.color }} />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">{activeProject.name}</h1>
            <p className="text-xs text-muted-foreground">{tasks.length} tasks · drag cards to update status</p>
          </div>
        </div>
        {/* Priority legend */}
        <div className="hidden md:flex items-center gap-1.5">
          {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as TaskPriority[]).map((p) => (
            <span key={p} className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold", PRIORITY_BADGE[p])}>
              {p}
            </span>
          ))}
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 flex-1 overflow-x-auto pb-2">
          {COLUMNS.map((col) => {
            const colTasks = byStatus(col.id);
            return (
              <div key={col.id} className="flex flex-col w-72 shrink-0">
                {/* Column header */}
                <div className={cn(
                  "flex items-center gap-2 mb-3 px-3 py-2.5 rounded-xl border border-t-2 bg-card",
                  col.header
                )}>
                  <div className={cn("w-2 h-2 rounded-full", col.dot)} />
                  <span className="text-sm font-semibold">{col.label}</span>
                  <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
                    {colTasks.length}
                  </span>
                </div>

                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "flex-1 rounded-xl p-2 space-y-2 min-h-[200px] transition-colors duration-150",
                        snapshot.isDraggingOver
                          ? "bg-indigo-500/5 ring-1 ring-indigo-500/20"
                          : "bg-muted/30"
                      )}
                    >
                      <AnimatePresence initial={false}>
                        {colTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(drag, dragSnap) => {
                              const { onDragStart: _, ...handleProps } = drag.dragHandleProps || {};
                              const isOverdue = task.dueDate &&
                                isPast(parseISO(task.dueDate)) &&
                                task.status !== "DONE";

                              return (
                                <motion.div
                                  ref={drag.innerRef}
                                  {...drag.draggableProps}
                                  {...handleProps}
                                  layout
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  transition={{ duration: 0.15 }}
                                  className={cn(
                                    "bg-card rounded-xl border border-l-[3px] p-3.5 cursor-grab active:cursor-grabbing select-none",
                                    "shadow-sm hover:shadow-md transition-shadow duration-150",
                                    PRIORITY_LEFT[task.priority],
                                    dragSnap.isDragging && "shadow-xl rotate-1 scale-105 ring-1 ring-indigo-500/30"
                                  )}
                                >
                                  <p className="text-sm font-medium leading-snug mb-3 text-foreground">
                                    {task.title}
                                  </p>

                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-md font-semibold", PRIORITY_BADGE[task.priority])}>
                                      {task.priority}
                                    </span>

                                    {task.dueDate && (
                                      <span className={cn(
                                        "flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md font-medium",
                                        isOverdue
                                          ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                          : "bg-muted text-muted-foreground"
                                      )}>
                                        {isOverdue && <AlertTriangle className="w-2.5 h-2.5" />}
                                        <Calendar className="w-2.5 h-2.5" />
                                        {format(parseISO(task.dueDate), "MMM d")}
                                      </span>
                                    )}

                                    {task.assignee && (
                                      <div
                                        className="ml-auto w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold ring-1 ring-background"
                                        style={{ backgroundColor: task.assignee.avatarColor }}
                                        title={task.assignee.name}
                                      >
                                        {task.assignee.name[0].toUpperCase()}
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            }}
                          </Draggable>
                        ))}
                      </AnimatePresence>
                      {provided.placeholder}

                      <button
                        onClick={() => openModal(col.id)}
                        className="w-full flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition mt-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add task
                      </button>
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Task creation modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl border shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-semibold">New task</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Adding to <span className="font-medium text-foreground">{COLUMNS.find(c => c.id === modal)?.label}</span>
                  </p>
                </div>
                <button
                  onClick={() => setModal(null)}
                  className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Title</label>
                  <input
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && createTask()}
                    placeholder="What needs to be done?"
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as TaskPriority)}
                      className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Due date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-1">
                  <button
                    onClick={() => setModal(null)}
                    className="flex-1 py-2.5 rounded-xl border text-sm font-medium hover:bg-muted transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createTask}
                    disabled={saving || !title.trim()}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {saving ? "Creating…" : "Create task"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
