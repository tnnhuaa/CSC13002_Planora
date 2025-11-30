import React, { useState } from "react";
import { X, ChevronDown } from "lucide-react";

const CreateTask = ({ isOpen, onClose, onCreateTask, column }) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "Medium",
        type: "Feature",
    });

    const [isPriorityOpen, setIsPriorityOpen] = useState(false);
    const [isTypeOpen, setIsTypeOpen] = useState(false);

    const priorities = ["Low", "Medium", "High"];
    const types = ["Feature", "Bug", "Story"];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCreateTask = () => {
        if (formData.title.trim()) {
            onCreateTask({
                ...formData,
                column: column,
            });
            setFormData({
                title: "",
                description: "",
                priority: "Medium",
                type: "Feature",
            });
            onClose();
        }
    };

    const handleCancel = () => {
        setFormData({
            title: "",
            description: "",
            priority: "Medium",
            type: "Feature",
        });
        setIsPriorityOpen(false);
        setIsTypeOpen(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 transition-opacity h-full"
                onClick={handleCancel}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex-1">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                                Create New Task
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Add a new task to your project. Fill in the
                                details below.
                            </p>
                        </div>
                        <button
                            onClick={handleCancel}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors ml-4"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                        {/* Task Title */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                                Task Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Enter task title..."
                                className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Describe the task..."
                                rows="4"
                                className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
                            />
                        </div>

                        {/* Priority and Type */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Priority Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                                    Priority
                                </label>
                                <div className="relative">
                                    <button
                                        onClick={() =>
                                            setIsPriorityOpen(!isPriorityOpen)
                                        }
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm font-normal flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        {formData.priority}
                                        <ChevronDown
                                            size={16}
                                            className="text-slate-400"
                                        />
                                    </button>
                                    {isPriorityOpen && (
                                        <div className="absolute top-full mt-1 w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-10">
                                            {priorities.map((priority) => (
                                                <button
                                                    key={priority}
                                                    onClick={() => {
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            priority,
                                                        }));
                                                        setIsPriorityOpen(
                                                            false
                                                        );
                                                    }}
                                                    className={`w-full text-left px-3 py-2 text-sm font-normal hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                                                        formData.priority ===
                                                        priority
                                                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                                            : "text-slate-900 dark:text-white"
                                                    }`}
                                                >
                                                    {priority}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Type Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                                    Type
                                </label>
                                <div className="relative">
                                    <button
                                        onClick={() =>
                                            setIsTypeOpen(!isTypeOpen)
                                        }
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm font-normal flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        {formData.type}
                                        <ChevronDown
                                            size={16}
                                            className="text-slate-400"
                                        />
                                    </button>
                                    {isTypeOpen && (
                                        <div className="absolute top-full mt-1 w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-10">
                                            {types.map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => {
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            type,
                                                        }));
                                                        setIsTypeOpen(false);
                                                    }}
                                                    className={`w-full text-left px-3 py-2 text-sm font-normal hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                                                        formData.type === type
                                                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                                            : "text-slate-900 dark:text-white"
                                                    }`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700 mt-5">
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreateTask}
                            disabled={!formData.title.trim()}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                        >
                            Create Task
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CreateTask;
