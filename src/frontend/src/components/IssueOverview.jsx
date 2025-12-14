import React from "react";
import { X, Calendar, Flag, Tag, CheckCircle, FileText } from "lucide-react";

const IssueOverview = ({ isOpen, issue, onClose }) => {
    if (!isOpen) return null;

    if (!issue) {
        return (
            <div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                onClick={onClose}
            >
                <div
                    className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6"
                    onClick={(e) => e.stopPropagation()}
                >
                    <p className="text-slate-600 dark:text-slate-400">
                        No issue selected
                    </p>
                </div>
            </div>
        );
    }

    const getPriorityColor = (priority) => {
        const colors = {
            low: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700",
            high: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700",
            medium: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700",
        };
        return colors[priority?.toLowerCase()] || colors.medium;
    };

    const getTypeColor = (type) => {
        const colors = {
            story: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700",
            task: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700",
            bug: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700",
            feature:
                "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700",
        };
        return colors[type?.toLowerCase()] || colors.task;
    };

    const getStatusColor = (status) => {
        const colors = {
            todo: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600",
            in_progress:
                "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700",
            in_review:
                "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700",
            done: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700",
        };
        return colors[status] || colors.todo;
    };

    const getStatusLabel = (status) => {
        const labels = {
            todo: "To Do",
            in_progress: "In Progress",
            in_review: "In Review",
            done: "Done",
        };
        return labels[status] || status;
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        Issue Overview
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Project Name & Issue Title */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Project Name */}
                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                                PROJECT
                            </p>
                            <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                {issue.project?.name ||
                                    issue.projectName ||
                                    "Unknown Project"}
                            </p>
                        </div>

                        {/* Issue Title */}
                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                                ISSUE TITLE
                            </p>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {issue.title}
                            </h3>
                        </div>
                    </div>

                    {/* Type, Priority, Status in a grid */}
                    <div className="grid grid-cols-4 gap-4">
                        {/* Type */}
                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
                                <Tag size={14} />
                                TYPE
                            </p>
                            <span
                                className={`inline-block px-3 py-1 rounded-lg text-sm font-medium border ${getTypeColor(
                                    issue.type
                                )}`}
                            >
                                {issue.type
                                    ? issue.type.charAt(0).toUpperCase() +
                                      issue.type.slice(1)
                                    : "Unknown"}
                            </span>
                        </div>

                        {/* Priority */}
                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
                                <Flag size={14} />
                                PRIORITY
                            </p>
                            <span
                                className={`inline-block px-3 py-1 rounded-lg text-sm font-medium border ${getPriorityColor(
                                    issue.priority
                                )}`}
                            >
                                {issue.priority
                                    ? issue.priority.charAt(0).toUpperCase() +
                                      issue.priority.slice(1)
                                    : "Unknown"}
                            </span>
                        </div>

                        {/* Status */}
                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
                                <CheckCircle size={14} />
                                STATUS
                            </p>
                            <span
                                className={`inline-block px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(
                                    issue.status
                                )}`}
                            >
                                {getStatusLabel(issue.status)}
                            </span>
                        </div>

                        {/* Due Date */}
                        <div className=" bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
                                <Calendar size={14} />
                                DUE DATE
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-300 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                {issue.dueDate || "Dec 20, 2024"}
                            </p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
                            <FileText size={14} />
                            DESCRIPTION
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            {issue.description || "No description provided"}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 dark:border-slate-700 p-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IssueOverview;
