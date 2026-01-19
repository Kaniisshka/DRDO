import express from "express"
import {  getUserProfile, userLogin, userLogout, userRegister } from "../controllers/auth.js";

export const userRouter = express.Router()

userRouter.post("/register",userRegister)
userRouter.post("/login",userLogin)
userRouter.post("/logout",userLogout)
userRouter.get("/me",getUserProfile)


