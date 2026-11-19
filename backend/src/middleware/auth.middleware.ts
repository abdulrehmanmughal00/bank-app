import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import { log } from "node:console";

async function authProtectedMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized. Please login.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY!,
    ) as jwt.JwtPayload & { userId: string };

    req.userId = decoded.userId;

    next();
  } catch (error) {
    console.log("auth Protected Middleware failed !!! ", error);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}

async function authSystemUserMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized. Please login.",
      });
    }
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY!,
    ) as jwt.JwtPayload & { userId: string };

    const user = await userModel.findById(decoded.userId).select("+systemUser");
    if (!user || !user.systemUser) {
      return res.status(403).json({
        message:
          "Forbidden. You do not have permission to access this resource.",
      });
    }
    req.user = user;
    return next();
  } catch (error) {
    log("auth System User Middleware failed !!! ", error);
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}
export default { authProtectedMiddleware , authSystemUserMiddleware };
