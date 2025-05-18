import express from "express"
import dotenv from "dotenv"
import { connectDB } from "./db/index.js";
import { app } from "./app.js";
import "./birthdayRemainderJob.js";
dotenv.config({
    path: './.env'
})


connectDB()
.then(() => {
    app.on("error", () => {
        console.log(error.message);
    })
    app.listen(process.env.PORT, () => {
        console.log(`Express is listening at:${process.env.PORT} port`);
    })
})
.catch((error) => {
    console.log("Something went wrong while connection MONGODB: ",error.message);
})