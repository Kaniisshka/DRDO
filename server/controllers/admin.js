import fs from "fs";
import { userModel } from "../models/user.js";
import { parseCSV, validatedCenters } from "../utils/csvParser.js";
import path from "path";
import { centerModel } from "../models/center.js";


export const getAllUsers = async (req, res) => {
  const users = await userModel.find({ role: "user" });
  res.status(200).json({ users });
};

export const getOneUser = async (req, res) => {
  const userId = req.params?.id;

  const user = await userModel.findOne({ _id: userId });
  if (!user) return res.status(404).send("User Not Found");

  res.status(200).send(user);
};

export const uploadCentersCsv = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "File Required" });
  }
  const extName = path.extname(req.file.originalname).toLowerCase();

  if (extName !== ".csv") {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: "Only csv files are allowed" });
  }

  try {
    const rows = await parseCSV(req.file.path);
  
    const centers = validatedCenters(rows); // Ignored typos and not name or no types rows
  
    await centerModel.insertMany(centers)
    res.send("File uploaded successfully");
  } catch (error) {
    return res.status(500).json({
      message: "Failed to process CSV",
      error: error.message
    })
  } finally {
    fs.unlinkSync(req.file.path)
  }
};
