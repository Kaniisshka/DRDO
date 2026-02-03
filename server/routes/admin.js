import express from "express";
import { isAuthorized } from "../middlewares/isAdmin.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import { upload } from "../middlewares/multer.js";
import { userModel } from "../models/user.js";
import { getAllUsers, getOneUser, uploadCentersCsv } from "../controllers/admin.js";
import { parseCSV } from "../utils/csvParser.js";
import { docModel } from "../models/document.js";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const adminRouter = express.Router();

adminRouter.use(isLoggedIn, isAuthorized("admin")); // So that we don't need to write middleware again and again

adminRouter.get("/hi", (req, res) => {
  res.send("HI This route working");
});

adminRouter.get("/users", getAllUsers);

adminRouter.get("/user/:id", getOneUser);

adminRouter.post("/upload", upload.single("file"), uploadCentersCsv);

adminRouter.post("/review/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const { type, status, remark } = req.body

    if (!["medical", "police", "caste"].includes(type)) {
      return res.status(400).json({ message: "Invalid Document type" })
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const doc = await docModel.findOne({ userId })
    if (!doc || !doc[type]) {
      return res.status(404).json({ message: "Document not found" })
    }

    doc[type].status = status
    // If approved, clear the remark. If rejected, set the remark.
    doc[type].remark = status === 'approved' ? "" : remark

    await doc.save()

    // Auto-Finalization Logic
    // Check if all required documents are present and approved
    const requiredDocs = ["medical", "police", "caste"];
    const allApproved = requiredDocs.every(docType =>
      doc[docType] && doc[docType].status === 'approved'
    );

    const applicationStatus = allApproved ? 'approved' :
      status === 'rejected' ? 'rejected' : 'pending'; // simplistic fallback, strict would be 'in-review'

    // Update User status
    // We need to find the user to update their status
    // Note: usage of userModel here requires importing it or assuming it's available via relation if needed, 
    // but we have userId from params.

    const user = await userModel.findById(userId);
    if (user) {
      // Only update if it changes to approved, or if we are rejecting.
      // If currently approved but one gets rejected, it should probably drop out of approved?
      // User requested: "If a user has three documents and all three are marked 'approved', automatically update the User’s main status field to 'Approved'. If any are rejected, the main status should remain 'Pending' or change to 'Action Required'."

      if (allApproved) {
        user.applicationStatus = 'approved';
      } else if (status === 'rejected') {
        // If we just rejected one, set user to rejected (or per user request 'Pending'/'Action Required'). 
        // Let's use 'rejected' to be clear, or 'pending' if preferred. 
        // User said: "If any are rejected, the main status should remain 'Pending' or change to 'Action Required'."
        // Standardizing on existing enum: ["pending", "in-review", "approved", "rejected"]
        user.applicationStatus = 'rejected';
      } else {
        // If we approved one but others are still pending, maybe set to 'in-review' or keep 'pending'
        if (user.applicationStatus !== 'rejected') {
          user.applicationStatus = 'pending';
        }
      }
      await user.save();
    }

    res.status(200).json({
      message: ` ${type} Document ${status}`,
      document: doc[type],
      userStatus: user ? user.applicationStatus : undefined
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Document review failed" });
  }

})
