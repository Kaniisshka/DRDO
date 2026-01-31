import { model, Schema } from "mongoose";

const appointmentSchema = new Schema({
    userId: {
        type:Schema.Types.ObjectId,
        ref:"user"
    },
    centerType:{
        type:String,
        enum:["hospital","police"],
    },
    centerId: {
        type:Schema.Types.ObjectId,
        ref:"center"
    },
    date: {
        type: Date,
        required: true
    },
    status: { type: String, enum: ["booked", "completed", "cancelled"], default: "booked"},
    
},{timestamps:true})

export const appointmentModel = model("appointment",appointmentSchema)