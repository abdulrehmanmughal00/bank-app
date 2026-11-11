import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

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
export default { authProtectedMiddleware };
