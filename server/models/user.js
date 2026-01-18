import  { model, Schema } from "mongoose";

const userSchema = new Schema({
    name: {
        type:String,
        trim:true,
        required:true
    },
    email: {
        type:String,
        unique:true,
        lowercase:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role: {
        type:String,
        enum:["user","admin"],
        default:"user"
    },
    applicationStatus:{
        type:String,
        enum:["pending","in-review","approved","rejected"],
        default:"pending"
    },
    city:String,
    address:String
},{timestamps:true})

export const userModel = model("user",userSchema)