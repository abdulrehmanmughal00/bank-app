import express from "express";
import accountController from "../controller/account.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/create",
  authMiddleware.authProtectedMiddleware,
  accountController.createAccount,
);

router.get(
  "/get-all-account",
  authMiddleware.authProtectedMiddleware,
  accountController.getAccountController,
);

export default router;
