import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiError } from "../utils/ApiError.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import {Birthday} from "../models/birthday.model.js"
import mongoose from "mongoose";

const getUpcomingBirthdays = asyncHandler( async (req, res) => {
    const birthdays = await Birthday.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        {
            $unwind: "$ownerDetails"
        },
        {
            $project: {
                username: "$ownerDetails.username",
                birthday: 1,
                // Add daysLeft field: days until next birthday
                daysLeft: {
                    $let: {
                        vars: {
                            today: { $dateTrunc: { date: new Date(), unit: "day" } },
                            thisYearBirthday: {
                                $dateFromParts: {
                                    year: { $year: new Date() },
                                    month: { $month: "$birthday" },
                                    day: { $dayOfMonth: "$birthday" }
                                }
                            }
                        },
                        in: {
                            $cond: [
                                { $gte: ["$$thisYearBirthday", "$$today"] },
                                { $divide: [ { $subtract: ["$$thisYearBirthday", "$$today"] }, 1000 * 60 * 60 * 24 ] },
                                { $divide: [ { $subtract: [
                                    { $dateFromParts: {
                                        year: { $add: [ { $year: new Date() }, 1 ] },
                                        month: { $month: "$birthday" },
                                        day: { $dayOfMonth: "$birthday" }
                                    } },
                                    "$$today"
                                ] }, 1000 * 60 * 60 * 24 ] }
                            ]
                        }
                    }
                }
            }
        }
    ])
    if(!birthdays){
        throw new ApiError(400, "Birthdays not found");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, birthdays, "Upcoming birthdays fetched successfully")
    )
})

const registerBirthday = asyncHandler( async (req, res) => {
    const {birthday} = req.body;
    if(!birthday){
        throw new ApiError(400, "The field is empty");
    }
    const existedBirthday = await Birthday.findOne({birthday});
    if(existedBirthday){
        throw new ApiError(400, "The birthday already exists");
    }
    const createdBirthday = await Birthday.create({
        owner: req.user._id,
        birthday
    })
    if(!createdBirthday){
        throw new ApiError(500, "Something went wrong while registering the birthday");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, createdBirthday, "Birthday registered successfully")
    )
})

const deleteBirthday = asyncHandler( async (req, res) => {
    const {birthdayId} = req.params;
    if(!birthdayId){
        throw new ApiError(400, "Birthday is missing");
    }
    await Birthday.findOneAndDelete(birthdayId);
    return res
    .status(200)
    .json(
        new ApiResponse(200,{}, "Birthday deleted successfully")
    )
})

const updateBirthday = asyncHandler( async (req, res) => {
    const {birthdayId} = req.params;
    const {birthday} = req.body;
    if(!birthdayId){
        throw new ApiError(400, "Birthday is missing");
    }
    if(!birthday){
        throw new ApiError(400, "The field is missing");
    }
    const userBirthday = await Birthday.findByIdAndUpdate(
        birthdayId,
        {
            $set: {
                birthday
            }
        },
        {new: true}
    )
    return res
    .status(200)
    .json(
        new ApiResponse(200, userBirthday, "Birthday updated successfully")
    )
})

const getBirthdayById = asyncHandler( async (req, res) => {
    const {birthdayId} = req.params;
    if(!birthdayId){
        throw new ApiError(400, "Birthday is missing");
    }
    const birthday = await Birthday.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(birthdayId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        {
            $unwind: "$ownerDetails"
        },
        {
            $project: {
                username: 1,
                birthday: 1
            }
        }
    ])
    if(!birthday){
        throw new ApiError(404, "Birthday is missing");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, birthday[0] || null, "Birthday fetched successfully")
    )
})

export {
    getUpcomingBirthdays,
    registerBirthday,
    deleteBirthday,
    updateBirthday,
    getBirthdayById,
}