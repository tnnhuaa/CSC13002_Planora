import { useState } from 'react';

export function useProjects() {
    const [projects, setProjects] = useState([
        {
            id: 1,
            name: 'Website Redesign',
            description: 'Complete overhaul of company website',
            status: 'ACTIVE',
            progress: 65,
            startDate: '15/1/2024',
            tasks: 24,
            members: 2
        },
        {
            id: 2,
            name: 'Mobile App Development',
            description: 'Native iOS and Android app',
            status: 'ACTIVE',
            progress: 40,
            startDate: '1/2/2024',
            tasks: 32,
            members: 2
        }
    ]);
    const [loading, setLoading] = useState(false);

    // Fetch projects from API
    const fetchProjects = async () => {
        setLoading(true);
        try {
            // TODO: Call API
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    // Create new project
    const createProject = async (projectData) => {
        try {
            // TODO: Call API 
            const newProject = {
                id: Date.now(),
                name: projectData.name,
                description: projectData.description,
                status: 'ACTIVE',
                progress: 0,
                startDate: projectData.startDate,
                endDate: projectData.endDate,
                tasks: 0,
                members: 0
            };
            
            setProjects([...projects, newProject]);
            return newProject;
        } catch (error) {
            console.error('Error creating project:', error);
            throw error;
        }
    };

    // Update existing project
    const updateProject = async (id, updates) => {
        try {
            // TODO: Call API
            setProjects(projects.map(p => 
                p.id === id ? { ...p, ...updates } : p
            ));
        } catch (error) {
            console.error('Error updating project:', error);
            throw error;
        }
    };

    // Delete project
    const deleteProject = async (id) => {
        try {
            // TODO: Call API
            setProjects(projects.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting project:', error);
            throw error;
        }
    };

    // Statistics
    const stats = {
        total: projects.length,
        active: projects.filter(p => p.status === 'ACTIVE').length,
        completed: projects.filter(p => p.status === 'COMPLETED').length
    };

    return {
        projects,
        loading,
        stats,
        fetchProjects,
        createProject,
        updateProject,
        deleteProject
    };
}
