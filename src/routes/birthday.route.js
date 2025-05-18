import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteBirthday, getBirthdayById, getUpcomingBirthdays, registerBirthday, updateBirthday } from "../controllers/birthday.controller.js";

const birthdayRouter = Router();

birthdayRouter.use(verifyJWT);

birthdayRouter.route("/upcomingBirthdays").get(getUpcomingBirthdays);
birthdayRouter.route("/registerBirthday").post(registerBirthday);
birthdayRouter.route("/c/:birthdayId").post(deleteBirthday);
birthdayRouter.route("/c/:birthdayId").patch(updateBirthday);
birthdayRouter.route("/c/:birthdayId").get(getBirthdayById);


export {birthdayRouter}