import { userModel } from "../models/user.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { generateToken } from "../utils/generateToken.js";

export const userRegister = async (req, res) => {
    try {
        const { name, email, password,role, applicationStatus, city, address } = req.body;
        if (!name || !email || !password || !role || !applicationStatus || !city || !address) {
            console.log("All fields are required")
            res.status(400).json({ message: "All fields are required" })
            return
        }
        const existingUser = await userModel.findOne({email});
        if (existingUser) {
            res.status(400).json({ message: "User already exists" })
            return
        }
        const hashedPassword = await bcrypt.hash(password,10);
        const user = await userModel.create({ name, email, password: hashedPassword, applicationStatus,role ,city, address })
        if (!user) {
            res.status(500).json({ message: "User registration failed" })
        }

        const token = generateToken({id:user._id,email,role:user.role,name})
        res.cookie("token",token)
        
        res.status(201).json({ message: "User registered successfully", user })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

export const userLogin = async (req, res) => {
    try {
        const {  email, password } = req.body;
        if (!email || !password) {
            console.log("All fields are required")
            res.status(400).json({ message: "All fields are required" })
            return
        }
        const user = await userModel.findOne({email});
       
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }
        
        const isPasswordValid = await bcrypt.compare(password,user.password);
        if (!isPasswordValid) {
            res.status(400).json({ message: "Invalid credentials" })
            return
        }
        const token = generateToken({id:user._id,email,role:user.role,name:user.name})
        res.cookie("token",token)

        res.status(201).json({ message: "User logged in successfully", user })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

export const userLogout = async (req,res)=>{
    res.clearCookie("token")
    res.send("User logged Out")
}

export const getUserProfile = async (req,res)=>{
    const {email} = req.body
    const user = await userModel.findOne({email}).select("-password")
    if (!user) {
        return res.status(400).json({ message: "User not found" })
    }
    res.status(200).json({user})
}