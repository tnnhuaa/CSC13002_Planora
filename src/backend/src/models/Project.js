    import mongoose from "mongoose";

    const { Schema } = mongoose;

    const projectSchema = new mongoose.Schema(
        {
            name: { type: String, required: true },
            key: { type: String, required: true, unique: true },
            description: { type: String },
            manager: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            issueCount: { type: Number, default: 0 },
        },
        { timestamps: true, }
    );

    const projectMembersSchema = new mongoose.Schema(
      {
        project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, enum : ['manager', 'member', 'viewer'], default: 'viewer' },
      },
      { timestamps: true, }
    )
    projectMembersSchema.index({ project: 1, user: 1 }, { unique: true });

    const Project = mongoose.model("Project", projectSchema);
    const ProjectMember = mongoose.model("ProjectMember", projectMembersSchema);
    export default Project;
    export { Project, ProjectMember };