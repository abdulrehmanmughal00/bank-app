import type { Request, Response } from "express";
import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";

import { sendLoginEmail, sendWelcomeEmail } from "../services/email.service.js";

const createToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET_KEY!, { expiresIn: "7d" });
};

const setTokenCookie = (res: Response, token: string) => {
    res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

async function registerUser(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim().toLowerCase() || !password?.trim()) {
      return res.status(400).json({
        message: "Please fill all the fields correctly",
      });
    }
    const normalizedEmail = email.trim().toLowerCase();

    const isEmailExist = await userModel.findOne({
      email: normalizedEmail,
    });

    if (isEmailExist) {
      return res.status(400).json({ message: "user already exist " });
    }

    const createdUser = await userModel.create({
      name,
      email: normalizedEmail,
      password,
    });

    const token = createToken(createdUser._id.toString());
    setTokenCookie(res, token);

    res.status(201).json({
      message: "user created Sucessfully",
      createdUser: {
        name,
        email,
      },
    });
    await sendWelcomeEmail(createdUser.email, createdUser.name);
  } catch (error) {
    console.error("user register failed !!! ", error);
    res.status(400).json({ message: "internal server error " });
  }
}

async function loginUser(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({
        message: "Please fill all the fields correctly",
      });
    }

    const isUserExist = await userModel
      .findOne({
        email: email.trim().toLowerCase(),
      })
      .select("+password");

    if (!isUserExist) {
      return res.status(401).json({ message: "user not found" });
    }

    const isPasswordMatched = await isUserExist.comparePassword(password);

    if (!isPasswordMatched) {
      return res.status(400).json({ message: "user not found" });
    }
    await sendLoginEmail(isUserExist.email, isUserExist.name);
    const token = createToken(isUserExist._id.toString());
    setTokenCookie(res, token);

    res.status(200).json({
      message: "user login sucessfully",
      isUserExist: {
        UserId: isUserExist._id,
        email: isUserExist.email,
        name: isUserExist.name,
      },
    });
  } catch (error) {
    console.log("login failed !!! ", error);
    res.status(400).json({ message: " internal server error " });
  }
}

async function getUser(req: Request, res: Response) {
  try {
    const user = await userModel.findById(req.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized. Please login.",
      });
    }

    res.status(200).json({ message: "user fetched sucessfully", user });
  } catch (error) {
    console.log("get user failed !!! ", error);

    return res.status(500).json({
      message: "internal server error ",
    });
  }
}

export default { registerUser, loginUser, getUser };
