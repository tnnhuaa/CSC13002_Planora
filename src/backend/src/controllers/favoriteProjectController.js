import { favoriteProjectService } from "../services/favoriteProjectService.js";

class FavoriteProjectController {
  async list(req, res) {
    try {
      const userId = req.user._id || req.user.id;
      const favorites = await favoriteProjectService.getUserFavorites(userId);
      res.status(200).json(favorites);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async add(req, res) {
    try {
      const userId = req.user._id || req.user.id;
      const { projectId } = req.body;

      if (!projectId) {
        return res.status(400).json({ message: "projectId is required" });
      }

      const favorite = await favoriteProjectService.addToFavorites(userId, projectId);
      res.status(201).json(favorite);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async remove(req, res) {
    try {
      const userId = req.user._id || req.user.id;
      const { projectId } = req.params;

      await favoriteProjectService.removeFromFavorites(userId, projectId);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export const favoriteProjectController = new FavoriteProjectController();
