import { projectService } from '../services/projectService.js';

class ProjectController {
    async create(req, res) {
        try {
            const { title, description } = req.body;
            const managerId = req.user._id;
            
            const projectData = {
                title,
                description,
                manager: managerId 
            };

            const created = await projectService.create(projectData);

            return res.status(201).json({
                message: 'Create project successfully!',
                data: created
            })
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    async getAllProject(req, res) {
        try {
            const projects = await projectService.getAllProject();

            return res.status(200).json({
                message: 'Get all projects successfully!',
                data: projects
            })
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    async getProjectByManager(req, res) {
        try {
            const { managerId } = req.params;
            if (!managerId) {
                return res.status(400).json({ message: 'Manager ID is required parameter' });
            }

            const projects = await projectService.getProjectByManager(managerId);

            return res.status(200).json({
                message: 'Get projects by manager successfully!',
                data: projects
            })
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
}

export const projectController = new ProjectController();