import { useEffect, useState } from "react";
import { userService } from "../services/userService";

const UseProfile = () => {
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setIsLoading(true);
                const data = await userService.getCurrentUser();
                setUserData(data.user);
            } catch (err) {
                setError(
                    err.response?.data?.message || "Failed to load user data"
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // Format role for display
    const formatRole = (role) => {
        if (!role) return "N/A";
        return role
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return {
        userData,
        isLoading,
        error,
        formatRole,
        formatDate,
    };
};

export default UseProfile;
