import mongoose from "mongoose";

const blackListSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export const BlackList = mongoose.model("BlackList", blackListSchema);
