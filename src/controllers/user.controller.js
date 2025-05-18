import { asyncHandler } from "../utils/asyncHandler.util.js"
import { ApiError } from "../utils/ApiError.util.js"
import { ApiResponse } from "../utils/ApiResponse.util.js"
import {User} from "../models/user.model.js"
import jwt from "jsonwebtoken"
import { Birthday } from "../models/birthday.model.js"
import nodemailder from "nodemailer"
const generateAccessandRefreshToken = async(userId) => {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false});
    return {accessToken, refreshToken};
}

const register = asyncHandler( async (req, res) => {
    /*
        1) Fetch the data from the frontend
        2) Validate the data whether anything is not null
        3) Check whether same user is present or not, email, password
        4) If user is not present then store the data in the database
        5) Check whether the data is stored in the database or not
        6) If data is stored then return the response but dont' send password
    */
   const {username, email, password} = req.body;
   console.log(req.body);
   if(
        [username,email,password].some((field) => (
            field?.trim() === ""
        ))
   ){
    throw new ApiError(400, "The field email or password is empty");
   }
   const existedUser = await User.findOne({email});
   if(existedUser){
    throw new ApiError(400, "User already exists");
   }
   const createdUser = await User.create({
    username,
    email,
    password
   })
   const user =  await User.findById(createdUser._id).select("-password").lean();
   if(!user){
    throw new ApiError(500, "Something went wrong while registering");
   }
   return res
   .status(200)
   .json(
    new ApiResponse(200, user, "User registered successfully")
   )
})


const loginUser = asyncHandler(async (req, res) => {
    if (!req.body || typeof req.body !== "object") {
        throw new ApiError(400, "Request body is missing or invalid");
    }
    const { username, email, password } = req.body;
    if (
        (!username && !email) ||
        !(username || email) ||
        !password ||
        [username, email, password].every(field => field !== undefined && typeof field === "string" && field.trim() === "")
    ) {
        throw new ApiError(400, "Username/email and password are required and must not be empty");
    }
    /*
        1) Fetch the data from the frontend
        2) Validate if fields are not empty
        3) Check if the user exists or not
        4) If the user exists check the password with the password in the database
        5) If password is correct the generate refresh and access tokens
        6) If generated store them in cookies
        7) If stored then send the response to the user
    */
   const user = await User.findOne({email});
   if(!user){
    throw new ApiError(400, "The user does not exist");
   }
   const isPasswordValid = await user.isPasswordCorrect(password);
   if(!isPasswordValid){
    throw new ApiError(401, "The password is invalid");
   }
   const loggedInUser = await User.findById(user._id).select("-password")
   const {accessToken, refreshToken} = await generateAccessandRefreshToken(user._id);
   const options = {
    httpOnly: true,
    secure: true
   }
   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
    new ApiResponse(
        200,
        {
         user: loggedInUser, accessToken, refreshToken   
        },
        "User logged in successfully"
    )
   )
})

const logout = asyncHandler( async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {new: true}
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "User logged out successfully")
    )
})


const generateNewAccessToken = asyncHandler( async (req, res) => {
    /*
        1) Get the refresh token from the cookies
        2) Check whether refreshToken is not null
        3) If it's not null then verify the refreshToken with secret refreshToken
        4) If it's valid then we get decoded data
        5) Now from the decoded verify the refreshToken with the refreshToken from the cookies
        6) If it's correct then generate new access and refresh tokens
        7) If generated then store the tokens in the database
    */
   const token = req.cookies?.refreshToken || req.body.refreshToken
   if(!token){
    throw new ApiError(400, "Unauthorized request");
   }
   const decodedData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
   const user = await User.findById(decodedData?._id);
   if(!user){
    throw new ApiError(404, "User not found");
   }
   const {newAccessToken, newRefreshToken} = await generateAccessandRefreshToken(user._id);
   const options = {
    httpOnly: true,
    secure: true
   }
   return res
   .status(200)
   .cookie("accessToken", newAccessToken, options)
   .cookie("refreshToken", newRefreshToken, options)
   .json(
    new ApiResponse(
        200,
        {user, newAccessToken, newRefreshToken},
        "Session restored successfully"
    )
   )
})

const changePassword = asyncHandler( async (req, res) => {
    const {oldPassword, newPassword, confirmPassword} = req.body;
    if(
        [oldPassword, newPassword, confirmPassword].some((field) => {
            field?.trim() === ""
        })
    ){
        throw new ApiError(400, "The password field is empty");
    }
    const user = await User.findById(req.user._id);
    if(!user){
        throw new ApiError(404, "User not found");
    }
    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    if(!isPasswordValid){
        throw new ApiError(400, "Invalid password");
    }
    if(newPassword !== confirmPassword){
        throw new ApiError(401, "Please enter correct password");
    }
    user.password = newPassword;
    await user.save({validateBeforeSave: false});
    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Password changed successfully")
    )
})

const changeUserDetails = asyncHandler( async (req, res) => {
    const {username, email} = req.body;
    if((!username && !email) || !(username || email)){
        throw new ApiError(400, "The username or email field is empty");
    }
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                username,
                email
            }
        },
        {new: true}
    ).select("-password");
    if(!user){
        throw new ApiError(404, "User not found");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "User details changed successfully")
    )
})


export {
    register,
    loginUser,
    logout,
    generateNewAccessToken,
    changePassword,
    changeUserDetails,
}