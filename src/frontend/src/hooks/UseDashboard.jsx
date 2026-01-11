import { useState, useEffect, useCallback } from "react";
import { issueService } from "../services/issueService";
import { projectService } from "../services/projectService";
import { sprintService } from "../services/sprintService";
import { showToast } from "../utils/toastUtils";
import { useAuthStore } from "../stores/useAuthStore";

export const useDashboard = () => {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState("kanban");
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddIssueModalOpen, setIsAddIssueModalOpen] = useState(false);
    const [selectedColumn, setSelectedColumn] = useState(null);
    const [draggedIssue, setDraggedIssue] = useState(null);
    const [draggedFromColumn, setDraggedFromColumn] = useState(null);
    const [isEditIssueModalOpen, setIsEditIssueModalOpen] = useState(false);
    const [issueToEdit, setIssueToEdit] = useState(null);
    const [isIssueOverviewOpen, setIsIssueOverviewOpen] = useState(false);
    const [issueForOverview, setIssueForOverview] = useState(null);

    // Filter states
    const [selectedProjects, setSelectedProjects] = useState([]);
    const [selectedSprints, setSelectedSprints] = useState([]);
    const [projects, setProjects] = useState([]);
    const [sprints, setSprints] = useState([]);

    // Mock data for issues in each column
    const [issues, setIssues] = useState({
        "To Do": [],
        "In Progress": [],
        Review: [],
        Done: [],
    });

    const mapStatusToColumn = (status) => {
        switch (status) {
            case "in_progress":
                return "In Progress";
            case "in_review":
                return "Review";
            case "done":
                return "Done";
            default:
                return "To Do"; // todo
        }
    };

    const mapColumnToStatus = (column) => {
        switch (column) {
            case "In Progress":
                return "in_progress";
            case "Review":
                return "in_review";
            case "Done":
                return "done";
            default:
                return "todo";
        }
    };

    const fetchIssues = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                console.warn(
                    "No access token found. User may not be authenticated."
                );
                return;
            }

            const data = await issueService.getIssuesForUser();

            const newIssues = {
                "To Do": [],
                "In Progress": [],
                Review: [],
                Done: [],
            };

            // Filter only issues assigned to current user and in active sprint
            data.forEach((issue) => {
                // Check if issue is assigned to current user and has active sprint
                if (issue.assignee?._id === user?._id && 
                    issue.sprint?.status === "active") {
                    const column = mapStatusToColumn(issue.status);
                    if (newIssues[column]) {
                        newIssues[column].push({
                            ...issue,
                            issueId: issue._id, // Map _id của Mongo sang issueId dùng ở Frontend
                            // Đảm bảo các trường khác khớp
                            dueDate: issue.dueDate
                                ? new Date(issue.dueDate).toLocaleDateString()
                                : "",
                        });
                    }
                }
            });

            setIssues(newIssues);
        } catch (error) {
            console.error("Error fetching issues:", error);
        }
    };

    const fetchProjects = async () => {
        try {
            const data = await projectService.getMyProjects();
            setProjects(data);
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };

    const fetchSprints = async () => {
        try {
            const data = await sprintService.getAllSprints();
            const activeSprints = data.filter(sprint => sprint.status === "active");
            setSprints(activeSprints);
        } catch (error) {
            console.error("Error fetching sprints:", error);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            fetchIssues();
            fetchProjects();
            fetchSprints();
        }
    }, []);

    const handleAddIssueClick = (column) => {
        setSelectedColumn(column);
        setIsAddIssueModalOpen(true);
    };

    const handleCreateIssue = async (formData) => {
        try {
            const payload = {
                ...formData,
                status: mapColumnToStatus(formData.column || selectedColumn),
            };

            const newIssue = await issueService.createIssue(payload);

            const column = mapStatusToColumn(newIssue.status);
            const formattedIssue = {
                ...newIssue,
                issueId: newIssue._id,
                dueDate: newIssue.dueDate
                    ? new Date(newIssue.dueDate).toLocaleDateString()
                    : "",
            };

            setIssues((prev) => ({
                ...prev,
                [column]: [formattedIssue, ...prev[column]],
            }));
        } catch (error) {
            console.error("Failed to create issue:", error);
            showToast.error(
                "Failed to create issue. Please check if Project is selected."
            );
        }
    };

    const handleDragStart = (e, issue, column) => {
        const issueWithStatus = { ...issue, status: column };
        setDraggedIssue(issue);
        setDraggedFromColumn(column);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = async (e, targetColumn) => {
        e.preventDefault();

        if (
            !draggedIssue ||
            !draggedFromColumn ||
            draggedFromColumn === targetColumn
        ) {
            setDraggedIssue(null);
            setDraggedFromColumn(null);
            return;
        }

        // If dropping in the same column, do nothing
        if (draggedFromColumn === targetColumn) {
            setDraggedIssue(null);
            setDraggedFromColumn(null);
            return;
        }

        // Move issue from source column to target column
        setIssues((prev) => ({
            ...prev,
            [draggedFromColumn]: prev[draggedFromColumn].filter(
                (issue) => issue.issueId !== draggedIssue.issueId
            ),
            [targetColumn]: [
                { ...draggedIssue, status: mapColumnToStatus(targetColumn) }, // Update status trong object
                ...prev[targetColumn],
            ],
        }));

        // Call API to update status of issue
        try {
            await issueService.updateIssue(draggedIssue.issueId, {
                status: mapColumnToStatus(targetColumn),
            });
            showToast.success(`Issue moved to ${targetColumn} successfully`);
        } catch (error) {
            console.error("Error updating issue status:", error);
            showToast.error("Failed to update issue status");
            // Nếu lỗi, nên revert lại UI (Optional: fetchIssues() lại)
            fetchIssues();
        }

        setDraggedIssue(null);
        setDraggedFromColumn(null);
    };

    const handleDragEnd = () => {
        setDraggedIssue(null);
        setDraggedFromColumn(null);
    };

    const getFilteredIssues = () => {
        let filtered = issues;

        // Filter by selected projects
        if (selectedProjects.length > 0) {
            const projectFiltered = {};
            Object.keys(filtered).forEach((column) => {
                projectFiltered[column] = filtered[column].filter((issue) =>
                    selectedProjects.includes(issue.project?._id)
                );
            });
            filtered = projectFiltered;
        }

        // Filter by selected sprints
        if (selectedSprints.length > 0) {
            const sprintFiltered = {};
            Object.keys(filtered).forEach((column) => {
                sprintFiltered[column] = filtered[column].filter((issue) =>
                    issue.sprint && selectedSprints.includes(issue.sprint._id)
                );
            });
            filtered = sprintFiltered;
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const searchFiltered = {};
            Object.keys(filtered).forEach((column) => {
                searchFiltered[column] = filtered[column].filter((issue) => {
                    const titleMatch = issue.title.toLowerCase().includes(query);
                    const issueIdMatch = issue.issueId
                        .toLowerCase()
                        .includes(query);
                    const typeMatch = issue.type?.toLowerCase().includes(query);
                    const priorityMatch = issue.priority
                        ?.toLowerCase()
                        .includes(query);

                    return titleMatch || issueIdMatch || typeMatch || priorityMatch;
                });
            });
            filtered = searchFiltered;
        }

        return filtered;
    };

    const handleEditIssueClick = useCallback((issue) => {
        // setIssueToEdit(issue);
        // setIsEditIssueModalOpen(true);
        return;
    }, []);

    const handleShowIssueOverview = useCallback((issue) => {
        setIssueForOverview(issue);
        setIsIssueOverviewOpen(true);
    }, []);

    const handleUpdateIssue = useCallback(async (updatedData) => {
        const { _id, issueId } = updatedData;
        const idToUpdate = _id || issueId;

        try {
            const result = await issueService.updateIssue(
                idToUpdate,
                updatedData
            );

            fetchIssues();
        } catch (error) {
            console.error("Error updating issue:", error);
        } finally {
            setIsEditIssueModalOpen(false);
            setIssueToEdit(null);
        }
    }, []);

    return {
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        isAddIssueModalOpen,
        setIsAddIssueModalOpen,
        isEditIssueModalOpen,
        setIsEditIssueModalOpen,
        issueToEdit,
        handleEditIssueClick,
        handleShowIssueOverview,
        handleUpdateIssue,
        selectedColumn,
        setSelectedColumn,
        issues,
        setIssues,
        handleAddIssueClick,
        handleCreateIssue,
        handleDragStart,
        handleDragOver,
        handleDrop,
        handleDragEnd,
        draggedIssue,
        getFilteredIssues,
        isIssueOverviewOpen,
        setIsIssueOverviewOpen,
        issueForOverview,
        selectedProjects,
        setSelectedProjects,
        selectedSprints,
        setSelectedSprints,
        projects,
        sprints,
    };
};
