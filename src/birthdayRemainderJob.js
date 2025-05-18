import cron from "node-cron"
import nodemailer from "nodemailer"
import { Birthday } from "./models/birthday.model.js"

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
})

cron.schedule("0 0 * * *", async () => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    const birthdaysToday = await Birthday.aggregate([
        {
            $addFields: {
                month: {$month: "$birthday"},
                day: {$dayOfMonth: "$birthday"}
            }
        },
        {
            $match: {month, day}
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "user"
            }
        },
        {
            $unwind: "$user"
        }
    ])

    for(const b of birthdaysToday){
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: b.user.email,
            subject: "Happy birthday!",
            text: `Happy birthday ${b.user.username}! 🎉`
        })
    }
    console.log("Birthday remainders sent");
})
