import type { Types } from "mongoose";
import mongoose from "mongoose";
import ledgerModel from "./ledger.model.js";

interface IAccount {
  user: Types.ObjectId;
  status: "Active" | "Frozen" | "Closed";
  currency: string;
}

interface IAccountMethods {
  getBalance(): Promise<number>;
}

const accountSchema = new mongoose.Schema<
  IAccount,
  mongoose.Model<IAccount>,
  IAccountMethods
>({
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

accountSchema.methods.getBalance = async function () {
  const balanceData = await ledgerModel.aggregate([
    {
      $match: { account: this._id },
    },
    {
      $group: {
        _id: null,
        totalDebit: {
          $sum: {
            $cond: [{ $eq: ["$type", "Debit"] }, "$amount", 0],
          },
        },
        totalCredit: {
          $sum: {
            $cond: [{ $eq: ["$type", "Credit"] }, "$amount", 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        balance: { $subtract: ["$totalCredit", "$totalDebit"] },
      },
    },
  ]);
  if (balanceData.length == 0) {
    return 0;
  }
  return balanceData[0].balance;
};

const accountModel = mongoose.model<
  IAccount,
  mongoose.Model<IAccount, {}, IAccountMethods>
>("account", accountSchema);

export default accountModel;
