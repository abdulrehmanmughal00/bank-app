import express from "express";
import transactionController from "../controller/transaction.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware.authSystemUserMiddleware,
  transactionController.createTransaction,
);

router.post(
  "/initial-funds",
  authMiddleware.authSystemUserMiddleware,
  transactionController.createInitialFundsTransaction,
);

export default router;
