import { model, Schema } from "mongoose";

const docSchema = new Schema({
    userId: {
        type:Schema.Types.ObjectId,
        ref:"user"
    },
    medical: {
        url:String,
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
        remark:String,
        uploadedAt: Date
    },
    police: {
        url:String,
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
        remark:String,
        uploadedAt: Date
    },
    caste: {
        url:String,
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
        remark:String,
        uploadedAt: Date
    },
    
},{timestamps:true})

export const docModel = model("doc",docSchema)