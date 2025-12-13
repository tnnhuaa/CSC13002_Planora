import React, { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { projectService } from "../services/projectService"; // Import service

const CreateIssue = ({
  isOpen,
  onClose,
  onCreateIssue,
  column,
  projectPropId,
  members = [],
}) => {
  const initialFormState = {
    title: "",
    description: "",
    priority: "Medium",
    type: "task",
    project: projectPropId || "",
    assignee: "",
    status: "todo",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [projects, setProjects] = useState([]);

  const mapColumnToStatus = (colName) => {
    if (!colName) return "todo";
    const mapping = {
      "To Do": "todo",
      "In Progress": "in_progress",
      Review: "review", // hoặc "in_review" tùy backend của bạn
      Done: "done",
    };
    return mapping[colName] || "todo";
  };

  useEffect(() => {
    if (isOpen) {
      // Reset form khi mở modal
      setFormData((prev) => ({
        ...initialFormState,
        project: projectPropId || prev.project,
        // Nếu có props column truyền vào (ví dụ bấm nút + ở cột Done), map nó sang status
        status: mapColumnToStatus(column),
      }));

      if (!projectPropId) {
        const fetchProjects = async () => {
          try {
            const res = await projectService.getMyProjects();
            const projectList = res.data || [];
            setProjects(projectList);

            if (projectList.length > 0 && !formData.project) {
              setFormData((prev) => ({ ...prev, project: projectList[0]._id }));
            }
          } catch (error) {
            console.error("Failed to load projects", error);
          }
        };
        fetchProjects();
      }
    }
  }, [isOpen, projectPropId, column]);

  const handleCreate = () => {
    if (!formData.title.trim()) return;
    if (!formData.project) {
      alert("Please select a project");
      return;
    }

    const payload = {
      ...formData,
      priority: formData.priority.toLowerCase(),
      type: formData.type.toLowerCase(),
    };

    onCreateIssue(payload);

    setFormData(initialFormState);
  };

  const handleCancel = () => {
    setFormData(initialFormState);
    onClose();
  };
  if (!isOpen) return null;

  return (
    // 3. Click Backdrop (Khoảng đen) -> Cancel
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 transition-opacity"
      onClick={handleCancel}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Chặn sự kiện click để không bị đóng khi bấm vào form
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Create Issue
            </h2>
            <p className="text-sm text-slate-500">
              Add a new task to {column || "To Do"}
            </p>
          </div>
          {/* 1. Nút X -> Cancel */}
          <button
            onClick={handleCancel}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Project Select (Chỉ hiện khi ở Dashboard) */}
          {!projectPropId && (
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Project
              </label>
              <select
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.project}
                onChange={(e) =>
                  setFormData({ ...formData, project: e.target.value })
                }
              >
                <option value="" disabled>
                  Select a project...
                </option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              type="text"
              placeholder="Ex: Fix login page bug..."
              className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              onKeyDown={(e) => e.key === "Enter" && handleCreate()} // Bấm Enter để tạo nhanh
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Add more details..."
              className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Assignee
            </label>
            <select
              className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
              value={formData.assignee}
              onChange={(e) =>
                setFormData({ ...formData, assignee: e.target.value })
              }
            >
              <option value="">Unassigned</option>
              {members.map((member) => {
                const realUserId =
                  member.user?._id || member.user || member._id;
                const realUsername = member.user?.username || member.username;

                return (
                  <option key={realUserId} value={realUserId}>
                    {realUsername}
                  </option>
                );
              })}
            </select>
          </div>
          {/* Priority & Type Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Priority
              </label>
              <select
                className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Type
              </label>
              <select
                className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="Task">Task</option>
                <option value="Bug">Bug</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
          {/* 2. Nút Cancel ở Footer */}
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!formData.title.trim() || !formData.project}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors shadow-sm"
          >
            Create Issue
          </button>
        </div>
      </div>
    </div>
  );
};
export default CreateIssue;
