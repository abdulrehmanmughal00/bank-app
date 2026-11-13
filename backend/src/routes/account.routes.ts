import express from "express";
import accountController from "../controller/account.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/create",
  authMiddleware.authProtectedMiddleware,
  accountController.createAccount,
);

export default router;
