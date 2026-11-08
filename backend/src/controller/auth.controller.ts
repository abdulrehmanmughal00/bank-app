import type { Request, Response } from "express";
import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
async function registerUser(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({
        message: "Please fill all the fields correctly",
      });
    }

    const isEmailExist = await userModel.findOne({
      email,
    });

    if (isEmailExist) {
      return res.status(400).json({ message: "user already exist " });
    }

    const createdUser = await userModel.create({
      name,
      email,
      password,
    });

    const token = jwt.sign(
      {
        userId: createdUser._id,
      },
      process.env.JWT_SECRET_KEY!,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "user created Sucessfully",
      createdUser: {
        name,
        email,
      },
    });
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
      return res.status(400).json({ message: "unauthrized user" });
    }

    const token = jwt.sign(
      {
        userId: isUserExist._id,
      },
      process.env.JWT_SECRET_KEY!,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "user login sucessfully",
      isUserExist: {
        UserId: isUserExist._id,
        email: email,
        name: isUserExist.name,
      },
    });
  } catch (error) {
    console.log("login failed !!! ", error);
    res.status(400).json({ message: " internal server error " });
  }
}

export default { registerUser, loginUser };
