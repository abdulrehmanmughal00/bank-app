import type { Types } from "mongoose";
import mongoose from "mongoose";

interface ITransaction {
  fromAccount: Types.ObjectId;
  toAccount: Types.ObjectId;
  status: "Pending" | "Completed" | "Failed" | "Reversed";
  amount: number;
  idempotencyKey: string;
}

const transactionSchema = new mongoose.Schema<ITransaction>(
  {
    fromAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
      required: true,
      index: true,
    },
    toAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: {
        values: ["Pending", "Completed", "Failed", "Reversed"],
      },
      default: "Pending",
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  { timestamps: true },
);





const transactionModel = mongoose.model<ITransaction>(
  "transaction",
  transactionSchema,
);

export default transactionModel;
