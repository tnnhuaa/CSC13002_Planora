import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  Plus,
  Trash2,
} from "lucide-react";
import { generateAvatarColor, getAvatarInitial } from "../utils/avatarUtils";
import { issueService } from "../services/issueService";
import { sprintService } from "../services/sprintService";
import { showToast } from "../utils/toastUtils";
import SprintBoard from "./SprintBoard";

function BacklogBoard({
  sprintsData,
  issues,
  onSprintsUpdate,
  onIssuesUpdate,
  onCreateIssue,
  onDeleteIssue,
  onIssueClick,
  formatDate,
  calculateDaysLeft,
}) {
  // Color helper functions
  const getPriorityColor = (priority) => {
    const colors = {
      high: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700",
      medium:
        "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700",
      low: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700",
    };
    return colors[priority] || colors.medium;
  };

  const getTypeColor = (type) => {
    const colors = {
      task: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700",
      bug: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700",
      story:
        "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700",
    };
    return colors[type] || colors.task;
  };

  // Local state for optimistic updates
  const [localSprintsData, setLocalSprintsData] = useState(sprintsData);
  const [localIssues, setLocalIssues] = useState(issues);
  
  const [isBacklogExpanded, setIsBacklogExpanded] = useState(true);
  const [expandedSprints, setExpandedSprints] = useState({});
  const [draggedIssue, setDraggedIssue] = useState(null);
  const [dragOverSprint, setDragOverSprint] = useState(null);

  // Sync local state with props
  useEffect(() => {
    setLocalSprintsData(sprintsData);
  }, [sprintsData]);

  useEffect(() => {
    setLocalIssues(issues);
  }, [issues]);

  const getUnassignedIssues = () => {
    return localIssues.filter((issue) => issue.status === "backlog");
  };

  const toggleSprint = (sprintId) => {
    setExpandedSprints((prev) => ({
      ...prev,
      [sprintId]: !prev[sprintId],
    }));
  };

  // Drag and Drop handlers
  const handleDragStart = (e, issue, fromSprintId = null) => {
    setDraggedIssue({ issue, fromSprintId });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedIssue(null);
    setDragOverSprint(null);
  };

  const handleDragOver = (e, targetSprintId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverSprint(targetSprintId === null ? "backlog" : targetSprintId);
  };

  const handleDragLeave = () => {
    setDragOverSprint(null);
  };

  const handleDrop = async (e, targetSprintId = null) => {
    e.preventDefault();

    if (!draggedIssue) return;

    const { issue, fromSprintId } = draggedIssue;

    // Do nothing if dropped in the same sprint/backlog
    if (fromSprintId === targetSprintId) {
      setDraggedIssue(null);
      setDragOverSprint(null);
      return;
    }

    // Backup current state for potential revert
    const backupSprintsData = [...localSprintsData];
    const backupIssues = [...localIssues];

    // OPTIMISTIC UPDATE: Update local state immediately
    try {
      // Update UI instantly
      if (fromSprintId && targetSprintId) {
        // Sprint to Sprint
        setLocalSprintsData((prev) =>
          prev.map((sprint) => {
            if (sprint._id === fromSprintId) {
              return {
                ...sprint,
                issues: sprint.issues.filter((i) => (i._id || i.id) !== (issue._id || issue.id)),
              };
            }
            if (sprint._id === targetSprintId) {
              return {
                ...sprint,
                issues: [...sprint.issues, issue],
              };
            }
            return sprint;
          })
        );
      } else if (fromSprintId && !targetSprintId) {
        // Sprint to Backlog
        setLocalSprintsData((prev) =>
          prev.map((sprint) =>
            sprint._id === fromSprintId
              ? {
                  ...sprint,
                  issues: sprint.issues.filter((i) => (i._id || i.id) !== (issue._id || issue.id)),
                }
              : sprint
          )
        );
        setLocalIssues((prev) => [...prev, { ...issue, status: "backlog" }]);
      } else if (!fromSprintId && targetSprintId) {
        // Backlog to Sprint
        setLocalIssues((prev) => prev.filter((i) => i._id !== issue._id));
        setLocalSprintsData((prev) =>
          prev.map((sprint) =>
            sprint._id === targetSprintId
              ? {
                  ...sprint,
                  issues: [...sprint.issues, issue],
                }
              : sprint
          )
        );
      }

      // Clear drag state
      setDraggedIssue(null);
      setDragOverSprint(null);

      const statusTarget = targetSprintId ? (await sprintService.getSprintById(targetSprintId)).status : null;
      if (statusTarget === "completed" || statusTarget === "cancelled") {
        throw new Error("Cannot move issue to a completed or cancelled sprint.");
      }

      if (fromSprintId && targetSprintId) {
        // Sprint to Sprint: remove from old, add to new
        await sprintService.removeIssueFromSprint(fromSprintId, issue._id, true);
        await sprintService.addIssueToSprint(targetSprintId, issue._id);
      } else if (fromSprintId && !targetSprintId) {
        // Sprint to Backlog: just remove from sprint
        await sprintService.removeIssueFromSprint(fromSprintId, issue._id);
      } else if (!fromSprintId && targetSprintId) {
        // Backlog to Sprint: add to sprint
        await sprintService.addIssueToSprint(targetSprintId, issue._id);
      }

      // Refresh from backend to ensure consistency
      onSprintsUpdate();
      onIssuesUpdate();

      showToast.success(
        targetSprintId
          ? "Issue moved to sprint successfully"
          : "Issue moved to backlog successfully"
      );
    } catch (error) {
      console.error("Failed to move issue:", error);
      showToast.error("Failed to move issue: " + error.message);

      // REVERT: Restore backup state
      setLocalSprintsData(backupSprintsData);
      setLocalIssues(backupIssues);

      // Also refresh from backend
      onSprintsUpdate();
      onIssuesUpdate();

      // Clear drag state
      setDraggedIssue(null);
      setDragOverSprint(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Product Backlog
        </h3>
      </div>

      {/* Backlog Issues Container */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        {/* Backlog Header */}
        <div className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition border-b border-transparent hover:border-slate-200 dark:hover:border-slate-700">
          <div
            onClick={() => setIsBacklogExpanded(!isBacklogExpanded)}
            className="flex items-center gap-3 cursor-pointer flex-1"
          >
            <ChevronRight
              size={20}
              className={`text-slate-400 transition-transform ${
                isBacklogExpanded ? "rotate-90" : ""
              }`}
            />
            <div className="flex items-center gap-2">
              <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                Backlog
              </h4>
              <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg">
                Not in Sprint
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {getUnassignedIssues().length}{" "}
              {getUnassignedIssues().length === 1 ? "issue" : "issues"}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onCreateIssue("backlog");
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all"
            title="Add issue directly to backlog"
          >
            <Plus size={16} />
            Add Backlog Item
          </button>
        </div>

        {/* Issues List */}
        {isBacklogExpanded && (
          <div
            className={`p-4 border-t border-slate-200 dark:border-slate-700 transition-colors ${
              dragOverSprint === "backlog"
                ? "bg-blue-50 dark:bg-blue-900/20"
                : ""
            }`}
            onDragOver={(e) => handleDragOver(e, null)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, null)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getUnassignedIssues().length === 0 && (
                <div className="col-span-full text-center py-8 text-slate-500">
                  No issues in backlog. Create one to see it here!
                </div>
              )}

              {getUnassignedIssues().map((issue) => {
                const daysLeft = calculateDaysLeft(issue.due_date);
                const isOverdue = daysLeft !== null && daysLeft < 0;
                const assigneeName = issue.assignee?.username || "Unassigned";
                const assigneeInitial = getAvatarInitial(assigneeName);
                const avatarColor = generateAvatarColor(assigneeName);

                return (
                  <div
                    key={issue._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, issue, null)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onIssueClick(issue)}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-move group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="text-base font-bold text-slate-900 dark:text-white mb-3 line-clamp-2">
                        {issue.title}
                      </h5>
                      <button
                        onClick={(e) => onDeleteIssue(issue, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition text-slate-400 hover:text-red-500"
                        title="Delete issue"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span
                        className={`px-2 py-0.5 text-xs font-bold rounded border ${getPriorityColor(issue.priority)}`}
                      >
                        {issue.priority.charAt(0).toUpperCase() +
                              issue.priority.slice(1)} 
                      </span>

                      <span
                        className={`px-2 py-0.5 text-xs font-bold rounded border ${getTypeColor(issue.type || "task")}`}
                      >
                        {issue.type || "task"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                        style={{ backgroundColor: avatarColor }}
                      >
                        {assigneeInitial}
                      </div>

                      {isOverdue ? (
                        <span className="px-2 py-1 text-[10px] font-bold text-white bg-red-600/80 border border-red-500 rounded-md">
                          {Math.abs(daysLeft)} days overdue
                        </span>
                      ) : issue.due_date ? (
                        <span className="text-xs text-slate-500">
                          {formatDate(issue.due_date)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

        {/* Sprints in Backlog View */}
        {localSprintsData.map((sprint) => (
          <div
            key={sprint._id}
            className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-visible mt-3"
          >
            {/* Sprint Header - Simplified version without action buttons */}
            <div className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
              <button
                onClick={() => toggleSprint(sprint._id)}
                className="flex items-center gap-3 flex-1"
              >
                <ChevronRight
                  size={20}
                  className={`text-slate-400 transition-transform ${
                    expandedSprints[sprint._id] ? "rotate-90" : ""
                  }`}
                />
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                    {sprint.name}
                  </h4>
                  {sprint.status === "active" && (
                    <span className="px-2 py-1 bg-primary text-white text-xs font-medium rounded-lg">
                      Active
                    </span>
                  )}
                  {sprint.status === "planning" && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg">
                      Planning
                    </span>
                  )}
                  {sprint.status === "completed" && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-lg">
                      Completed
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-2">
                  <span>
                    {formatDate(sprint.start_date)} → {formatDate(sprint.end_date)}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span>
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                      Goal:
                    </span>{" "}
                    {sprint.goal || (
                      <span className="italic text-slate-400">No goal set</span>
                    )}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span>
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                      Issues:
                    </span>{" "}
                    {sprint.issues.length}
                  </span>
                </p>
              </button>
            </div>

            {/* Sprint Issues */}
            {expandedSprints[sprint._id] && (
              <div
                className={`p-4 pt-0 border-t border-slate-200 dark:border-slate-700 transition-colors ${
                  dragOverSprint === sprint._id
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : ""
                }`}
                onDragOver={(e) => handleDragOver(e, sprint._id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, sprint._id)}
              >
                {sprint.issues.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400 mt-4">
                    No issues in this sprint. Drag issues here to add them.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                    {sprint.issues.map((issue) => (
                      <div
                        key={issue.id}
                        draggable
                        onDragStart={(e) =>
                          handleDragStart(e, issue, sprint._id)
                        }
                        onDragEnd={handleDragEnd}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 hover:shadow-md transition cursor-move"
                      >
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                          {issue.id}
                        </p>
                        <h5 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
                          {issue.title}
                        </h5>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-lg border ${getPriorityColor(issue.priority)}`}
                          >
                            {issue.priority.charAt(0).toUpperCase() +
                              issue.priority.slice(1)}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-lg border ${getTypeColor(issue.type)}`}
                          >
                            {issue.type}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{
                              backgroundColor: generateAvatarColor(
                                issue.assignee?.username ||
                                  issue.assignee ||
                                  "Unknown"
                              ),
                            }}
                          >
                            {getAvatarInitial(
                              issue.assignee?.username ||
                                issue.assignee ||
                                "Unknown"
                            )}
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-lg border ${
                              issue.status === "Due Soon"
                                ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                            }`}
                          >
                            {issue.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      
    </>
  );
}

export default BacklogBoard;
