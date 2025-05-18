import { Router } from "express";
import { changePassword, changeUserDetails, generateNewAccessToken, loginUser, logout, register } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(register);
userRouter.route("/login").post(loginUser);
userRouter.route("/logout").post(verifyJWT, logout);
userRouter.route("/accessToken").post(verifyJWT, generateNewAccessToken);
userRouter.route("/passwordChange").patch(verifyJWT, changePassword);
userRouter.route("/changeAccount-details").patch(verifyJWT, changeUserDetails);
export {userRouter}