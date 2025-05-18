import mongoose from 'mongoose'

const birthdaySchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    birthday: {
        type: Date,
        required: true
    },
    upcomingBirthdays: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
},{timestamps: true});


export const Birthday = mongoose.model("Birthday", birthdaySchema);