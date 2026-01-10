import mongoose from "mongoose";

const { Schema } = mongoose;

const favoriteProjectSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    },
    { timestamps: true }
);

const FavoriteProject = mongoose.model("FavoriteProject", favoriteProjectSchema);
export default FavoriteProject;