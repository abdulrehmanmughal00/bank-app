import type { Types } from "mongoose";
import mongoose from "mongoose";

interface ILedger {
  account: Types.ObjectId;
  amount: number;
  transaction: Types.ObjectId;
  type: "Credit" | "Debit";
}

const ledgerSchema = new mongoose.Schema<ILedger>({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
    required: true,
    index: true,
    immutable: true,
  },

  amount: {
    type: Number,
    required: true,
    min: 0,
    immutable: true,
  },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "transaction",
    immutable: true,
    index: true,
    required: true,
  },
  type: {
    type: String,
    immutable: true,
    required: true,
    enum: {
      values: ["Credit", "Debit"],
    },
  },
});

function ledgerModificationBlocker() {
  throw new Error(
    "Ledger entries are immutable and cannot be modified or deleted.",
  );
}

ledgerSchema.pre("updateOne", ledgerModificationBlocker);
ledgerSchema.pre("deleteOne", ledgerModificationBlocker);
ledgerSchema.pre("findOneAndUpdate", ledgerModificationBlocker);
ledgerSchema.pre("findOneAndDelete", ledgerModificationBlocker);
ledgerSchema.pre("updateMany", ledgerModificationBlocker);
ledgerSchema.pre("deleteMany", ledgerModificationBlocker);
ledgerSchema.pre("findOneAndReplace", ledgerModificationBlocker);
ledgerSchema.pre("replaceOne", ledgerModificationBlocker);

const ledger = mongoose.model<ILedger>("ledger", ledgerSchema);


export default ledger;