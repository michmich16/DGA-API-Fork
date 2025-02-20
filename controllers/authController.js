import express from "express";
import { Authenticate, Authorize } from "../utils/authUtils.js";

export const authController = express.Router();

// Login route
authController.post("/login", (req, res) => {
  Authenticate(req, res);
});

// Authorization route
authController.get("/authorize", Authorize, (req, res, next) => {
  res.send({ message: "You are logged in" });
});
