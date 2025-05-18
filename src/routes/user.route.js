import { Router } from "express";
import { loginUser, logout, register } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(register);
userRouter.route("/login").post(loginUser);
userRouter.route("/logout").post(verifyJWT, logout);

export {userRouter}