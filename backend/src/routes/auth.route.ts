import express from "express";
import authController from "../controller/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.get("/profile",authMiddleware.authProtectedMiddleware, authController.getUser);

export default router;
