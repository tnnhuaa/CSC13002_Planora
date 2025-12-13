import React, { useState, useEffect } from "react";
import { X, Users2 } from "lucide-react";

// Assuming you have a reusable Modal wrapper component
// If you don't have one, you'll need to implement the modal overlay/structure yourself
const Modal = ({ isOpen, onClose, children, title, subtitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
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

const priorityOptions = ["Low", "Medium", "High"];
const typeOptions = ["Story", "Feature", "Bug"];
const statusOptions = ["To Do", "In Progress", "Review", "Done"];
const sprintOptions = ["Sprint 1", "Sprint 2", "Sprint 3", "Sprint 4"];
// Note: You would typically fetch available users dynamically
const mockAssignedUsers = ["Bob Smith", "Alice Johnson", "Charlie Brown"];

const EditIssue = ({ isOpen, onClose, issueData, onUpdateIssue }) => {
  // Initialize form state with issueData, ensuring fallbacks for fields
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    type: "Feature",
    status: "To Do",
    storyPoints: "",
    sprint: "",
    dueDate: "",
    assignedUsers: [],
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (issueData) {
      setFormData({
        title: issueData.title || "",
        description: issueData.description || "",
        priority: issueData.priority || "Medium",
        type: issueData.type || "Feature",
        status: issueData.status || "To Do",
        storyPoints: issueData.storyPoints || "5",
        sprint: issueData.sprint || "Sprint 3",
        dueDate: issueData.dueDate || new Date().toISOString().substring(0, 10), // Example: "YYYY-MM-DD"
        assignedUsers: issueData.assignedUsers || ["Bob Smith"], // Mock data
        tags: issueData.tags || ["UI/UX", "Frontend"], // Mock data
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
    // 1. Prepare data (e.g., ensure correct format, merge with issueId)
    const updatedIssue = {
      ...issueData, // Preserve issueId and other meta-data
      ...formData,
    };

    // 2. Call the update function passed from the parent
    onUpdateIssue(updatedIssue);

    // 3. Close the modal
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
              {priorityOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
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
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            >
              {typeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
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
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Story Points & Sprint Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Story Points */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Story Points
            </label>
            <input
              type="number"
              name="storyPoints"
              value={formData.storyPoints}
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="5"
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
              {sprintOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
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

        {/* Assigned Users */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Assigned Users
          </label>
          <div className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm">
            <p className="text-slate-600 dark:text-slate-400 mb-2">
              {formData.assignedUsers.length} user(s) assigned
            </p>
            <div className="flex flex-wrap gap-2">
              {formData.assignedUsers.map((user, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium cursor-pointer"
                  onClick={() => handleUserRemove(user)}
                >
                  <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-xs text-white font-medium">
                    {user
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                  {user}
                  <X size={12} className="text-blue-500" />
                </span>
              ))}
            </div>
            {/* Note: User assignment typically uses a select/dropdown, omitted here for simplicity */}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Tags
          </label>
          <div className="flex gap-2 mb-2 flex-wrap">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-full text-xs font-medium cursor-pointer"
                onClick={() => handleTagRemove(tag)}
              >
                {tag}
                <X size={12} className="text-slate-500" />
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), handleTagAdd())
              }
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add a tag..."
            />
            <button
              type="button"
              onClick={handleTagAdd}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Add
            </button>
          </div>
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
