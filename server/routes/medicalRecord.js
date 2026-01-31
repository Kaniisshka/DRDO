import express from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import { medicalRecordModel } from "../models/medicalRecord.js";
import { upload } from "../middlewares/multer.js";

export const medicalRecordRouter = express.Router();

medicalRecordRouter.post("/upload", isLoggedIn, upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const medicalRecord = new medicalRecordModel({
            userId: req.user.id,
            fileUrl: req.file.path,
            fileName: req.file.originalname
        });

        await medicalRecord.save();
        io.emit('notification', { type: 'medicalRecord', message: 'New medical record uploaded' });
        res.status(201).json({ message: "Medical record uploaded successfully", medicalRecord });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Upload failed" });
    }
});

medicalRecordRouter.get("/my", isLoggedIn, async (req, res) => {
    try {
        const records = await medicalRecordModel.find({ userId: req.user.id });
        res.json(records);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch records" });
    }
});