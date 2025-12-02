import React, { useState } from 'react';
import { Plus, Calendar, CheckCircle, Users, Edit2, Trash2 } from 'lucide-react';
import { useProjects } from '../hooks/UseProjects';

function Projects() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { projects, loading, stats, createProject, deleteProject, updateProject } = useProjects();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        startDate: '',
        endDate: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createProject(formData);
            setIsModalOpen(false);
            setFormData({ name: '', description: '', startDate: '', endDate: '' });
        } catch (error) {
            console.error('Failed to create project:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await deleteProject(id);
            } catch (error) {
                console.error('Failed to delete project:', error);
            }
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-slate-900 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                            Projects
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Create and manage your projects
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    >
                        <Plus size={20} />
                        Create Project
                    </button>
                </div>
            </div>

            {/* Project Management Section */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-1">
                    Project Management
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Create and manage your projects
                </p>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                            Total Projects
                        </p>
                        <p className="text-3xl font-bold text-slate-800 dark:text-white">
                            {stats.total}
                        </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                            Active Projects
                        </p>
                        <p className="text-3xl font-bold text-slate-800 dark:text-white">
                            {stats.active}
                        </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                            Completed
                        </p>
                        <p className="text-3xl font-bold text-slate-800 dark:text-white">
                            {stats.completed}
                        </p>
                    </div>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {projects.map(project => (
                        <div
                            key={project.id}
                            className="bg-slate-50 dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">
                                        {project.name}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {project.description}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                                        <Edit2 size={16} className="text-slate-600 dark:text-slate-400" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(project.id)}
                                        className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                    >
                                        <Trash2 size={16} className="text-red-600" />
                                    </button>
                                </div>
                            </div>

                            <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded mb-3">
                                {project.status}
                            </span>

                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600 dark:text-slate-400">Progress</span>
                                    <span className="text-slate-800 dark:text-white font-medium">{project.progress}%</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all"
                                        style={{ width: `${project.progress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Project Info */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Start Date</p>
                                        <p className="text-sm font-medium text-slate-800 dark:text-white">{project.startDate}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Tasks</p>
                                        <p className="text-sm font-medium text-slate-800 dark:text-white">{project.tasks}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users size={16} className="text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Members</p>
                                        <p className="text-sm font-medium text-slate-800 dark:text-white">{project.members}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create Project Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                    Create New Project
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Set up a new project
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Project Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter project name..."
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        placeholder="Describe the project..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                >
                                    Create Project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Projects;