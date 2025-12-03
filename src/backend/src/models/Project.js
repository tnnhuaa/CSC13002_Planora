    import mongoose from "mongoose";

    const { Schema } = mongoose;

    const projectSchema = new mongoose.Schema(
        {
            title: { type: String, required: true },
            description: { type: String },
            manager: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            key: { type: String, required: true, unique: true },
            members: [{ type: Schema.Types.ObjectId, ref: 'User' }]
        },
        { timestamps: true }
    )

    const Project = mongoose.model("Project", projectSchema);
    export default Project;