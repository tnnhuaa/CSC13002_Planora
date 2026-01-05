import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { issueService } from "../services/issueService"; // Import your service

const DeleteIssueConfirmation = ({ isOpen, issue, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      // Call Backend API
      await issueService.deleteIssue(issue._id || issue.id);

      // Notify Parent
      onConfirm(issue._id || issue.id);
    } catch (err) {
      setError(err.message || "Failed to delete issue");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !issue) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Delete Issue?
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>

          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              "{issue.title}"
            </span>
            ?
          </p>
          <p className="text-slate-500 dark:text-slate-500 text-xs">
            This action cannot be undone. All comments and attachments will be
            removed.
          </p>

          {error && (
            <div className="mt-3 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            {loading ? "Deleting..." : "Delete Task"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteIssueConfirmation;
