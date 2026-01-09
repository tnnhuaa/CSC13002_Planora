import React, { useState, useEffect } from "react";
import { X, Users2 } from "lucide-react";

// Assuming you have a reusable Modal wrapper component
// If you don't have one, you'll need to implement the modal overlay/structure yourself
const Modal = ({ isOpen, onClose, children, title, subtitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 bg-opacity-50 flex items-center justify-center p-4">
      <div
        className="bg-white dark:bg-slate-900 rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transition-all transform duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// --- EditIssue Component ---

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const TYPE_OPTIONS = [
  { value: "task", label: "Task" },
  { value: "bug", label: "Bug" },
];

const STATUS_OPTIONS = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "done", label: "Done" },
];

const sprintOptions = ["Sprint 1", "Sprint 2", "Sprint 3", "Sprint 4"];
// Note: You would typically fetch available users dynamically
const mockAssignedUsers = ["Bob Smith", "Alice Johnson", "Charlie Brown"];

const EditIssue = ({
  isOpen,
  onClose,
  issueData,
  onUpdateIssue,
  sprints = [],
  members = [],
}) => {
  // Initialize form state with issueData, ensuring fallbacks for fields
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    type: "task",
    status: "todo",
    dueDate: "",
    sprint: "",
    assignee: "",
  });

  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (issueData) {
      const sprintId = issueData.sprint?._id || issueData.sprint || "";
      const assigneeId = issueData.assignee?._id || issueData.assignee || "";
      setFormData({
        title: issueData.title || "",
        description: issueData.description || "",
        priority: issueData.priority || "medium",
        type: issueData.type || "task",
        status: issueData.status || "todo",
        dueDate: issueData.due_date
          ? new Date(issueData.due_date).toISOString().substring(0, 10)
          : "",
        sprint: sprintId,
        assignee: assigneeId,
      });
    }
  }, [issueData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleUserRemove = (userToRemove) => {
    setFormData((prev) => ({
      ...prev,
      assignedUsers: prev.assignedUsers.filter((user) => user !== userToRemove),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate task has assignee
    if (formData.type === "task" && !formData.assignee) {
      alert("Tasks must be assigned to a member");
      return;
    }

    // Merge updates with original ID
    const updatedIssue = {
      ...issueData,
      ...formData,
      // Ensure date is formatted if needed, backend usually handles ISO strings fine
      due_date: formData.dueDate,
      sprint: formData.sprint || null,
      assignee: formData.assignee || null,
    };

    onUpdateIssue(updatedIssue);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Task"
      subtitle="Update the task details below."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Task Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Task Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            required
            placeholder="Implement dark mode"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe the task..."
          />
        </div>

        {/* Sprint */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Sprint
          </label>
          <select
            name="sprint"
            value={formData.sprint}
            onChange={handleChange}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Backlog (No Sprint)</option>
            {sprints
              .filter((s) => s.status !== "completed") // Optional: Hide completed sprints
              .map((sprint) => (
                <option key={sprint._id} value={sprint._id}>
                  {sprint.name} ({sprint.status})
                </option>
              ))}
          </select>
        </div>

        {/* Assignee */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Assignee
            {formData.type === "task" && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
          <select
            name="assignee"
            value={formData.assignee}
            onChange={handleChange}
            disabled={formData.type === "bug"}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {formData.type === "bug" ? "Not Required" : "Select Assignee..."}
            </option>
            {formData.type === "task" && members.map((member) => {
              // Handle different member object structures (populated vs ID)
              const userId = member.user?._id || member.user || member._id;
              const username =
                member.user?.username || member.username || "Unknown User";

              return (
                <option key={userId} value={userId}>
                  {username}
                </option>
              );
            })}
          </select>
          {formData.type === "bug" && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Bugs don't require assignment
            </p>
          )}
        </div>

        {/* Priority, Type, Status Row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={(e) => {
                const newType = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  type: newType,
                  // Clear assignee when switching to Bug
                  assignee: newType === "bug" ? "" : prev.assignee
                }));
              }}
              disabled
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Due Date
          </label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Footer Buttons */}
        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditIssue;
