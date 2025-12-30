import mongoose from "mongoose";

const { Schema } = mongoose;

const issueSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },

    // Information of issue
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["backlog", "todo", "in_progress", "in_review", "done"],
      default: "backlog",
    },
    listPosition: { type: Number, default: 0 }, // Drag and drop ordering
    // sprint: { type: Schema.Types.ObjectId, ref: "Sprint" }, // Comming soon
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    type: {
      type: String,
      enum: ["task", "bug"],
      default: "task",
    },
    assignee: { type: Schema.Types.ObjectId, ref: "User" },
    reporter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    start_date: { type: Date, default: Date.now },
    due_date: { type: Date },
    story_points: { type: Number },
    attachments: { type: [String] },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    sprint: { type: Schema.Types.ObjectId, ref: "Sprint" },
  },
  { timestamps: true }
);
issueSchema.index({ title: "text", key: "text" });

const Issue = mongoose.model("Issue", issueSchema);
export default Issue;
