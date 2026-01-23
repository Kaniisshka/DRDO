import cookieParser from "cookie-parser"
import { config } from "dotenv"
config()
import express from "express"
import { dbConnect } from "./config/db.js"
import { userRouter } from "./routes/auth.js"
import { adminRouter } from "./routes/admin.js"

const app = express()

try {
    await dbConnect();
} catch (err) {
    console.error("Failed to connect to DB, exiting...");
}

app.use(express.static('public'))
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(cookieParser())

app.get("/",(req,res)=>{
    res.send('kclvnlvn')
})

//Routes
app.use("/auth",userRouter)
app.use("/admin",adminRouter)

const PORT = process.env.PORT
app.listen(PORT || 3000,()=>{
    console.log(`Server running on Port: ${PORT}`)
})