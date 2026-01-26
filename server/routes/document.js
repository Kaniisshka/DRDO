import express from "express"
import { isLoggedIn } from "../middlewares/isLoggedIn.js"
import { upload } from "../middlewares/multer.js"
import { cloudinary } from "../config/cloudinary.js"
import { docModel } from "../models/document.js"

export const docsRouter = express.Router()

docsRouter.post("/upload",isLoggedIn,upload.single("file"), async(req,res)=>{
    const {type} = req.body
    if (!req.file) {
    return res.status(400).json({ message: "File Required" });
  }

  if (!["medical", "police", "caste"].includes(type)) {
    return res.status(400).json({ message: "Invalid document type" });
  }
  
  let doc = await docModel.findOne({userId:req.user.id})
  if (!doc) {
    doc = await docModel.create({
        userId:req.user.id
    })
  }
  
  if (doc[type]?.status === "approved") {
    return res.status(400).json({message:`${type} Document already approved. Reupload not allowed`})
  }
  
  const result = await cloudinary.uploader.upload(req.file.path)
  
  if (!result) {
    return res.status(500).json({ message: "File not saved in cloud. Try again." });
}



  doc[type] = {
        url:result.url,
        status:"pending",
        remark:null,
        uploadedAt: new Date()
  }

  await doc.save()

  console.log(doc[type].url)
  res.status(200).json({message:`${type} Document uploaded successfully`})
})

docsRouter.get("/my",isLoggedIn,async(req,res)=>{
    const doc = await docModel.findOne({userId:req.user.id})

    return res.status(200).json(doc)
})


