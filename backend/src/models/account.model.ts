import type { Types } from "mongoose";
import mongoose from "mongoose";

interface IAccount {
  user: Types.ObjectId;
  status: "Active" | "Frozen" | "Closed";
  currency: string;
}

const accountSchema = new mongoose.Schema<IAccount>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },

  status: {
    type: String,
    enum: ["Active", "Frozen", "Closed"],
    default: "Active",
  },

  currency: {
    type: String,
    required: true,
    default: "PKR",
  },
});

accountSchema.index({ user: 1, status: 1 });

const accountModel = mongoose.model<IAccount>("account", accountSchema);

export default accountModel;
