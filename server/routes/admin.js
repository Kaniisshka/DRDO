import express from "express";
import { isAuthorized } from "../middlewares/isAdmin.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import { upload } from "../middlewares/multer.js";
import { userModel } from "../models/user.js";
import { getAllUsers, getOneUser, uploadCentersCsv } from "../controllers/admin.js";
import { parseCSV } from "../utils/csvParser.js";

export const adminRouter = express.Router();

adminRouter.use(isLoggedIn, isAuthorized("admin")); // So that we don't need to write middleware again and again

adminRouter.get("/hi", (req, res) => {
  res.send("HI This route working");
});

adminRouter.get("/users", getAllUsers);

adminRouter.get("/user/:id", getOneUser);

adminRouter.post("/upload", upload.single("file"), uploadCentersCsv);
