import { projectService } from '../services/projectService.js';

class ProjectController {
    async create(req, res) {
        try {
            const { title, description, members } = req.body;
            const managerId = req.user._id;
            
            const projectData = {
                title,
                description,
                members,
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

            // Validate manager
            if (req.user.role === 'manager' && req.user.id !== managerId) {
                return res.status(403).json({
                    message: 'You can only view your own projects'
                });
            }

            const projects = await projectService.getProjectByUser(managerId, 'manager');

            return res.status(200).json({
                message: 'Get projects by manager successfully!',
                data: projects
            })
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    async getMyProject(req, res) {
        try {
            const { _id, role } = req.user;

            const projects = await projectService.getProjectByUser(_id, role);

            return res.status(200).json({
                success: true,
                data: projects
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async deleteProject(req, res) {
        try {
            const { id } = req.params; 
            const project = await projectService.getProjectById(id);
            if (!project) {
                return res.status(404).json({ message: 'Project not found' });
            }

            // Validate manager
            if (req.user.role === 'manager' && req.user.id !== project.manager.toString()) {
                return res.status(403).json({
                    message: 'You can only delete your own projects'
                });
            }

            await projectService.deleteProject(id);
            return res.status(200).json({
                message: 'Delete project successfully!',
            })
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
}

export const projectController = new ProjectController();