import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
const app = express();


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser())



import { userRouter } from "./routes/user.route.js";
import { birthdayRouter } from "./routes/birthday.route.js";
app.use("/api/v2/users", userRouter);
app.use("/api/v2/birthdays", birthdayRouter);


export {app}