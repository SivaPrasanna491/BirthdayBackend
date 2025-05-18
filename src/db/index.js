import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async() => {
    try {
        const connectInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`MONGODB CONNECTED SUCCESSFULLY !!! CONNECTION HOST AT: ${connectInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB CONNECTION FAILED !!!");
    }
}

export {connectDB}