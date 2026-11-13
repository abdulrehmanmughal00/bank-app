import type { Request, Response } from "express";
import accountModel from "../models/account.model.js";
import userModel from "../models/user.model.js";

async function createAccount(req: Request, res: Response) {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({
      message: "Unauthorized. Please login.",
    });
  }

  try {
    const user = await userModel.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }
    const existingAccount = await accountModel.findOne({
      user: user._id,
    });

    if (existingAccount) {
      return res.status(409).json({
        message: "Account already exists.",
      });
    }
    const createdAccount = await accountModel.create({
      user: user._id,
    });
    return res.status(201).json({
      message: "Account created successfully.",
      account: createdAccount,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Account already exists.",
      });
    }

    console.log("account create error !!!", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
}

export default { createAccount };
