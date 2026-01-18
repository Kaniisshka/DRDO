import { model, Schema } from "mongoose";

const appointmentSchema = new Schema({
    user: {
        type:Schema.Types.ObjectId,
        ref:"user"
    },
    centerType:{
        type:String,
        enum:["hospital","police"],
    },
    center: {
        type:Schema.Types.ObjectId,
        ref:"center"
    },
    date:Date,
    status: { type: String, enum: ["booked", "completed", "cancelled"], default: "booked"},
    
},{timestamps:true})

export const appointmentModel = model("appointment",appointmentSchema)