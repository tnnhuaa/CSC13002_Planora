import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  CheckCircle,
  Users,
  Edit2,
  Trash2,
  Star,
  Heart,
} from "lucide-react";
import { projectService } from "../services/projectService";
import { userService } from "../services/userService";
import { favoriteProjectService } from "../services/favoriteProjectService";
import { showToast } from "../utils/toastUtils";
import { ClipLoader } from "react-spinners";

function FavoriteProjects() {
  const navigate = useNavigate();
  const [favoriteProjects, setFavoriteProjects] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isProjectManager = (project) => {
    if (!currentUser || !project || !project.manager) return false;
    const managerId = project.manager._id || project.manager;
    return managerId.toString() === currentUser._id.toString();
  };

  // Fetch favorite projects
  const fetchFavoriteProjects = async () => {
    try {
      setLoading(true);

      const [favoritesRes, userRes] = await Promise.all([
        favoriteProjectService.getFavorites(),
        userService.getCurrentUser(),
      ]);

      const favorites = favoritesRes.data || favoritesRes || [];
      const projectsWithDetails = favorites
        .map((fav) => fav.project)
        .filter(Boolean);

      setFavoriteProjects(projectsWithDetails);
      setCurrentUser(userRes.user || userRes.data || userRes);
    } catch (error) {
      console.error("Error when fetching favorite projects:", error);
      showToast.error("Failed to load favorite projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavoriteProjects();
  }, []);

  const handleRemoveFavorite = async (projectId, e) => {
    e.stopPropagation();
    try {
      await favoriteProjectService.removeFavorite(projectId);
      setFavoriteProjects((prev) =>
        prev.filter((project) => project._id !== projectId)
      );
      showToast.success("Removed from favorites");
    } catch (error) {
      console.error("Failed to remove favorite:", error);
      showToast.error("Failed to remove favorite. Please try again.");
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await projectService.deleteProject(id);
        await fetchFavoriteProjects();
        showToast.success("Project deleted successfully!");
      } catch (error) {
        console.error("Failed to delete project:", error);
        showToast.error("Failed to delete project. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <ClipLoader color="#3b82f6" size={50} />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Star className="text-yellow-500" size={28} />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Favorite Projects
          </h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Projects you have marked as favorites
        </p>
      </div>

      {/* Stats Card */}
      <div className="mb-6">
        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg inline-block">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
            Total Favorites
          </p>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">
            {favoriteProjects.length}
          </p>
        </div>
      </div>

      {/* Projects Grid */}
      {favoriteProjects.length === 0 ? (
        <div className="text-center py-12">
          <Star
            size={64}
            className="mx-auto text-slate-300 dark:text-slate-600 mb-4"
          />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
            No favorite projects yet
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Start adding projects to your favorites by clicking the star icon
          </p>
          <button
            onClick={() => navigate("/projects")}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            Browse Projects
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {favoriteProjects.map((project) => {
            const role =
              project.members?.find(
                (member) => member.user?._id === currentUser?._id
              )?.role || "member";

            return (
              <div
                key={project._id}
                onClick={() => navigate(`/projects/${project._id}`)}
                className="bg-slate-50 dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">
                      {project.name}
                      <span className="inline-block px-2 py-1 text-xs uppercase font-medium bg-blue-100 dark:bg-blue-500 text-blue-700 dark:text-white rounded ml-2">
                        {role || "member"}
                      </span>
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                      {project.description || (
                        <span className="italic">No description.</span>
                      )}
                    </p>
                  </div>
                  <div
                    className="flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => handleRemoveFavorite(project._id, e)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition"
                      title="Remove from favorites"
                    >
                      <Star
                        size={16}
                        className="text-yellow-500 fill-yellow-500"
                      />
                    </button>
                    {isProjectManager(project) && (
                      <>
                        <button
                          onClick={() => navigate(`/projects/${project._id}`)}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                        >
                          <Edit2
                            size={16}
                            className="text-slate-600 dark:text-slate-400"
                          />
                        </button>
                        <button
                          onClick={(e) => handleDelete(project._id, e)}
                          className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 dark:text-slate-400">
                      Progress
                    </span>
                    <span className="text-slate-800 dark:text-white font-medium">
                      {(project.progress || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${project.progress || 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Project Info */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Start Date
                      </p>
                      <p className="text-sm font-medium text-slate-800 dark:text-white">
                        {project.createdAt
                          ? new Date(project.createdAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Issues
                      </p>
                      <p className="text-sm font-medium text-slate-800 dark:text-white">
                        {project.issueCount || 0} issues
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Members
                      </p>
                      <p className="text-sm font-medium text-slate-800 dark:text-white">
                        {Array.isArray(project.members)
                          ? project.members.length
                          : 0}{" "}
                        members
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FavoriteProjects;
