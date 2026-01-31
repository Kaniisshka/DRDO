import express from "express";
import { isAuthorized } from "../middlewares/isAdmin.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import { upload } from "../middlewares/multer.js";
import { userModel } from "../models/user.js";
import { getAllUsers, getOneUser, uploadCentersCsv } from "../controllers/admin.js";
import { parseCSV } from "../utils/csvParser.js";
import { docModel } from "../models/document.js";

export const adminRouter = express.Router();

adminRouter.use(isLoggedIn, isAuthorized("admin")); // So that we don't need to write middleware again and again

adminRouter.get("/hi", (req, res) => {
  res.send("HI This route working");
});

adminRouter.get("/users", getAllUsers);

adminRouter.get("/user/:id", getOneUser);

adminRouter.post("/upload", upload.single("file"), uploadCentersCsv);

adminRouter.post("/review/:userId",async(req,res)=>{
    try {
      const {userId} = req.params
    const {type,status,remark} = req.body

    if (!["medical", "police", "caste"].includes(type)) {
      return res.status(400).json({message: "Invalid Document type"})
    }
    
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const doc = await docModel.findOne({userId})
    if (!doc || !doc[type]) {
      return res.status(404).json({message: "Document not found"})
    }

    doc[type].status = status
    doc[type].remark = remark

    await doc.save()

    res.status(200).json({message: ` ${type} Document ${status}`,document:doc[type]})
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Document review failed" }); 
    }

})
