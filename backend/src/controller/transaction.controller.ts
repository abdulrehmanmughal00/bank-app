import type { Request, Response } from "express";
import transactionModel from "../models/transaction.model.js";
import accountModel from "../models/account.model.js";
import mongoose from "mongoose";
import ledgerModel from "../models/ledger.model.js";
import { sendWelcomeEmail } from "../services/email.service.js";

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

  //! transaction session
  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    const [transaction] = await transactionModel.create(
      [
        {
          fromAccount,
          toAccount,
          amount,
          idempotencyKey,
          status: "Pending",
        },
      ],
      { session },
    );

    if (!transaction) {
      throw new Error("Transaction creation failed");
    }
    const debitLedger = await ledgerModel.create(
      [
        {
          account: fromAccount,
          type: "Debit",
          amount,
          transaction: transaction._id,
        },
      ],
      { session },
    );
    const CreditLedger = await ledgerModel.create(
      [
        {
          account: toAccount,
          type: "Credit",
          amount,
          transaction: transaction._id,
        },
      ],
      { session },
    );

    transaction.status = "Completed";
    await transaction.save({ session });
    await session.commitTransaction();
    session.endSession();

    //! sending email

    if (!req.user) {
      return res.status(401).json({
        message: "user not found for sending email",
      });
    }

    await sendWelcomeEmail(req.user.email, req.user.name);

    return res.status(201).json({
      message: "transaction completed sucessfully",
      transaction: createTransaction,
    });
  } catch (error) {
    console.log("transaction session error ");
  }
  //! controller end
}

async function createInitialFundsTransaction(req: Request, res: Response) {
  const { toAccount, amount, idempotencyKey } = req.body;

  if (!toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const toUserAccount = await accountModel.findOne({ _id: toAccount });

  if (!toUserAccount) {
    return res.status(404).json({
      message: "Receiver account not found.",
    });
  }
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  const fromUserAccount = await accountModel.findOne({
    user: req.user?._id,
  });

  if (!fromUserAccount) {
    return res.status(404).json({
      message: "Sender account not found.",
    });
  }

  if (
    fromUserAccount &&
    fromUserAccount._id.toString() === toUserAccount._id.toString()
  ) {
    return res.status(400).json({
      message: "You cannot send money to your own account",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const transaction = new transactionModel({
    fromAccount: fromUserAccount._id,
    toAccount,
    amount,
    idempotencyKey,
    status: "Pending",
  });

  await transaction.save({ session });

  const debitLedger = await ledgerModel.create(
    [
      {
        account: fromUserAccount._id,
        type: "Debit",
        amount,
        transaction: transaction._id,
      },
    ],
    { session },
  );

  const creditLedger = await ledgerModel.create(
    [
      {
        account: toUserAccount._id,
        type: "Credit",
        amount,
        transaction: transaction._id,
      },
    ],
    { session },
  );

  transaction.status = "Completed";
  await transaction.save({ session });

  await session.commitTransaction();
  session.endSession();

  return res.status(201).json({
    message: "Initial funds transaction completed successfully",
    transaction,
  });
}

export default { createTransaction, createInitialFundsTransaction };
