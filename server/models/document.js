import { model, Schema } from "mongoose";

const docSchema = new Schema({
    user: {
        type:Schema.Types.ObjectId,
        ref:"user"
    },
    medicalCert: {
        url:String,
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
        remark:String,
    },
    policeCert: {
        url:String,
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
        remark:String,
    },
    casteCert: {
        url:String,
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
        remark:String,
    },
    
},{timestamps:true})

export const docModel = model("doc",docSchema)