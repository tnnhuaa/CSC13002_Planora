import mongoose from "mongoose";

const { Schema } = mongoose;

const sprintSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    goal: { type: String },
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["planning", "active", "completed", "cancelled"],
      default: "planning",
    },
    issues: [{ type: Schema.Types.ObjectId, ref: "Issue" }],
  },
  { timestamps: true }
);

// Index for faster queries
sprintSchema.index({ project: 1, status: 1 });
sprintSchema.index({ start_date: 1, end_date: 1 });

// Virtual to calculate sprint duration in days
sprintSchema.virtual("duration").get(function () {
  if (this.start_date && this.end_date) {
    const diffTime = Math.abs(this.end_date - this.start_date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return 0;
});

// Validation: end_date must be after start_date
sprintSchema.pre("save", function () {
  if (this.end_date <= this.start_date) {
    throw new Error("End date must be after start date");
  }
});

const Sprint = mongoose.model("Sprint", sprintSchema);
export default Sprint;
