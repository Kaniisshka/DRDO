import express from "express"
import { isAuthorized } from "../middlewares/isAdmin.js"
import { isLoggedIn } from "../middlewares/isLoggedIn.js"
import { upload } from "../middlewares/multer.js"

export const adminRouter = express.Router()

adminRouter.get("/hi",isLoggedIn,isAuthorized("admin"),(req,res)=>{
    res.send("HI This route working")
})

adminRouter.post("/upload",isLoggedIn,isAuthorized("admin"),upload.single("file"),(req,res)=>{
    res.send("File uploaded successfully")
})
