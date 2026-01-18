import cookieParser from "cookie-parser"
import { config } from "dotenv"
config()
import express from "express"
import { dbConnect } from "./config/db"

const app = express()

try {
    await dbConnect();
} catch (err) {
    console.error("Failed to connect to DB, exiting...");
}


app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(cookieParser())

app.get("/",(req,res)=>{
    res.send('kclvnlvn')
})

const PORT = process.env.PORT
app.listen(PORT || 4000,()=>{
    console.log(`Server running on Port: ${PORT}`)
})