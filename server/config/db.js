import mongoose from "mongoose";

export const dbConnect = async ()=>{
try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("Mongodb database connected successfully")
} catch (error) {
    console.error("Database error : ",error)
}}