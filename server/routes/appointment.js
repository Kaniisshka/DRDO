import express from "express"
import { isLoggedIn } from "../middlewares/isLoggedIn.js"
import { appointmentModel } from "../models/appointment.js"
import { isAuthorized } from "../middlewares/isAdmin.js"
import { userModel } from "../models/user.js"
import { centerModel } from "../models/center.js"
export const appointmentRouter = express.Router()


appointmentRouter.get("/my",isLoggedIn,async(req,res)=>{
    const apps = await appointmentModel.find({userId:req.user.id}).populate("centerId")
    if (apps.length===0) return res.status(404).json({message:"No appointments found"})
    
        return res.status(200).json(apps)
    
})

appointmentRouter.get("/all",isLoggedIn,isAuthorized("admin"),async(req,res)=>{
    const apps = await appointmentModel.find().populate("centerId")
    if (!apps.length) return res.status(404).json({message:"No appointments found"})
    
    return res.status(200).json(apps)
    
})

appointmentRouter.post("/completed/:id",isLoggedIn,isAuthorized("admin"),async(req,res)=>{
    const id = req.params.id
    if (!id) return res.status(400).json({ message: "Either appointmentId is invalid" })
    const appointment = await appointmentModel.findById(id)
    if (!appointment) return res.status(404).json({ message: "Appointment not found" })
    
    if (appointment.status === "completed") return res.status(400).json({ message: "Already Completed" })
    
    appointment.status = "completed"
    await appointment.save();

    res.json({
        message:"Appointment marked as completed",
        appointment
    })
})

appointmentRouter.post("/allot",isLoggedIn,isAuthorized("admin"),async (req,res)=>{
    try {
        const {userId,type,date} = req.body;

    const user = await userModel.findById(userId)

    if (!user) return res.status(404).json({ message: "User not found" })
    if (!["hospital","police"].includes(type)) return res.status(400).json({message:"Invalid centre type"})

    const centerType = type 


    const existing = await appointmentModel.findOne({
        userId:user._id, centerType, status:"booked"
    })
    if (existing) return res.status(400).json({message: "User already has appointment"})

    const centers = await centerModel.find({type:centerType,city:user.city})
    if (!centers.length) return res.status(404).json({message: "No center in this city available"})
    
    let selectedCenter = null;

    for (const center of centers)
    {
        const booked = await appointmentModel.countDocuments({centerId:center._id,date,status:"booked"})
        if (booked < center.capacityPerDay) 
            {
                selectedCenter = center
                break;
            } 
    }

    if (!selectedCenter) return res.status(400).json({message: "No Capacity available"})
    
    const appointment = await appointmentModel.create({
        centerId:selectedCenter._id,
        centerType,
        date,
        userId,
        status:"booked"
    })

    return res.status(200).json({message: "Appointment Alotted successfully",appointment})
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "allotment failed" });
    }

})

appointmentRouter.post("/book", isLoggedIn, async (req, res) => {
    try {
        const { type, date } = req.body;
        const userId = req.user.id;

        if (!type || !date) {
            return res.status(400).json({ message: "Type and date are required" });
        }

        if (!["hospital", "police"].includes(type)) {
            return res.status(400).json({ message: "Invalid type" });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const centers = await centerModel.find({ type, city: user.city });
        if (!centers.length) {
            return res.status(404).json({ message: "No centers available in your city" });
        }

        const randomCenter = centers[Math.floor(Math.random() * centers.length)];

        const appointment = new appointmentModel({
            userId,
            centerType: type,
            centerId: randomCenter._id,
            date
        });

        await appointment.save();
        io.emit('notification', { type: 'appointment', message: 'New appointment booked' });
        res.status(201).json({ message: "Appointment booked successfully", appointment: { ...appointment.toObject(), center: randomCenter } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Booking failed" });
    }
});

