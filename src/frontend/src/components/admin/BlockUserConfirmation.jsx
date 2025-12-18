import React, { useState } from "react";
import { X } from "lucide-react";
import { userService } from "../../services/userService";

const BlockUserConfirmation = ({ isOpen, user, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isBlocked = user?.status === "Blocked" || user?.status === "banned";
  const actionText = isBlocked ? "Unblock" : "Block";
  const buttonColor = isBlocked
    ? "bg-green-600 hover:bg-green-700" // Unblock = Green
    : "bg-orange-600 hover:bg-orange-700"; // Block = Orange

  const handleConfirm = async () => {
    setError(null);
    setLoading(true);

    try {
      await userService.toggleBanUser(user.id);

      onConfirm(user.id);
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to update user status";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-slate-200 dark:border-slate-700 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {actionText} User
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* Confirmation Message */}
            <div className="space-y-2">
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Are you sure you want to {actionText.toLowerCase()}{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {user.name}
                </span>
                ?
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                This user will not be able to log in to the system until
                unblocked.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors font-medium text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`px-4 py-2 text-white rounded-xl transition-colors font-medium text-sm flex items-center gap-2 ${buttonColor}`}
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? `${actionText}ing...` : `${actionText} User`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlockUserConfirmation;
