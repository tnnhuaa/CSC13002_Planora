import { useState } from "react";

export const useDashboard = () => {
    const [activeTab, setActiveTab] = useState("kanban");
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [selectedColumn, setSelectedColumn] = useState(null);
    const [draggedTask, setDraggedTask] = useState(null);
    const [draggedFromColumn, setDraggedFromColumn] = useState(null);

    // Mock data for tasks in each column
    const [tasks, setTasks] = useState({
        "To Do": [
            {
                taskId: "PLA-14",
                title: "Update user documentation",
                priority: "Low",
                type: "Story",
                assignees: ["CW", "DL"],
                dueDate: "Nov 29",
            },
        ],
        "In Progress": [
            {
                taskId: "PLA-12",
                title: "Design new landing page for product launch",
                priority: "High",
                type: "Feature",
                assignees: ["AJ", "BS"],
                dueDate: "Due Soon",
            },
            {
                taskId: "PLA-13",
                title: "Fix login authentication bug",
                priority: "High",
                type: "Bug",
                assignees: ["BS"],
                dueDate: "Due Soon",
            },
        ],
        Review: [],
        Done: [],
    });

    const handleAddTaskClick = (column) => {
        setSelectedColumn(column);
        setIsAddTaskModalOpen(true);
    };

    const handleCreateTask = (newTask) => {
        const taskId = `PLA-${Math.floor(Math.random() * 1000)}`;
        const columnName = newTask.column;
        setTasks((prev) => ({
            ...prev,
            [columnName]: [
                ...prev[columnName],
                {
                    taskId,
                    title: newTask.title,
                    description: newTask.description,
                    priority: newTask.priority,
                    type: newTask.type,
                    assignees: [],
                    dueDate: new Date().toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                    }),
                },
            ],
        }));
    };

    const handleDragStart = (e, task, column) => {
        setDraggedTask(task);
        setDraggedFromColumn(column);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e, targetColumn) => {
        e.preventDefault();

        if (!draggedTask || !draggedFromColumn) return;

        // If dropping in the same column, do nothing
        if (draggedFromColumn === targetColumn) {
            setDraggedTask(null);
            setDraggedFromColumn(null);
            return;
        }

        // Move task from source column to target column
        setTasks((prev) => ({
            ...prev,
            [draggedFromColumn]: prev[draggedFromColumn].filter(
                (task) => task.taskId !== draggedTask.taskId
            ),
            [targetColumn]: [...prev[targetColumn], draggedTask],
        }));

        setDraggedTask(null);
        setDraggedFromColumn(null);
    };

    const handleDragEnd = () => {
        setDraggedTask(null);
        setDraggedFromColumn(null);
    };

    const getFilteredTasks = () => {
        if (!searchQuery.trim()) {
            return tasks;
        }

        const query = searchQuery.toLowerCase();
        const filteredTasks = {};

        Object.keys(tasks).forEach((column) => {
            filteredTasks[column] = tasks[column].filter((task) => {
                const titleMatch = task.title.toLowerCase().includes(query);
                const taskIdMatch = task.taskId.toLowerCase().includes(query);
                const typeMatch = task.type?.toLowerCase().includes(query);
                const priorityMatch = task.priority
                    ?.toLowerCase()
                    .includes(query);

                return titleMatch || taskIdMatch || typeMatch || priorityMatch;
            });
        });

        return filteredTasks;
    };

    return {
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        isAddTaskModalOpen,
        setIsAddTaskModalOpen,
        selectedColumn,
        setSelectedColumn,
        tasks,
        setTasks,
        handleAddTaskClick,
        handleCreateTask,
        handleDragStart,
        handleDragOver,
        handleDrop,
        handleDragEnd,
        draggedTask,
        getFilteredTasks,
    };
};
