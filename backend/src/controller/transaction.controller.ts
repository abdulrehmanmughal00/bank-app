import type { Request, Response } from "express";
import transactionModel from "../models/transaction.model.js";
import accountModel from "../models/account.model.js";

async function createTransaction(req: Request, res: Response) {
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;
  //! requirments field check

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  //! check both account exist or not

  const isFromAccountExist = await accountModel.findById(fromAccount);
  const isToAccountExist = await accountModel.findById(toAccount);

  if (!isFromAccountExist) {
    return res.status(404).json({
      message: "Sender account not found.",
    });
  }

  if (!isToAccountExist) {
    return res.status(404).json({
      message: "Receiver account not found.",
    });
  }

  if (fromAccount === toAccount) {
    return res.status(400).json({
      message: "Cannot transfer to the same account.",
    });
  }

  //! check transaction exists

  const isTransactionExists = await transactionModel.findOne({
    idempotencyKey,
  });

  if (isTransactionExists) {
    if (isTransactionExists.status === "Completed") {
      return res.status(200).json({
        message: "transaction already processed",
        transaction: isTransactionExists,
      });
    }
    if (isTransactionExists.status === "Pending") {
      return res.status(200).json({ message: "transaction is pending " });
    }
    if (isTransactionExists.status === "Failed") {
      return res
        .status(500)
        .json({ message: "transaction failed please try again later " });
    }
    if (isTransactionExists.status === "Reversed") {
      return res.status(500).json({ message: "transaction Reversed ! " });
    }
  }

  //! check sender and reciver  account status

  if (
    isFromAccountExist.status !== "Active" ||
    isToAccountExist.status !== "Active"
  ) {
    return res.status(400).json({
      message: "both account status must be active to process transaction",
    });
  }

  const balance = await isFromAccountExist.getBalance();

  if (balance < amount) {
    return res.status(400).json({
      message: "Insufficient balance",
    });
  }
}
