import cookieParser from "cookie-parser"
import { config } from "dotenv"
config()
import express from "express"
import { Server } from "socket.io"
import http from "http"
import { dbConnect } from "./config/db.js"
import { userRouter } from "./routes/auth.js"
import { adminRouter } from "./routes/admin.js"
import { docsRouter } from "./routes/document.js"
import { appointmentRouter } from "./routes/appointment.js"
import { medicalRecordRouter } from "./routes/medicalRecord.js"
import path from "path"
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177"],
        methods: ["GET", "POST"]
    }
})

try {
    await dbConnect();
} catch (err) {
    console.error("Failed to connect to DB, exiting...");
}

app.use(express.static(path.join(__dirname, '../client/dist')))
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(cookieParser())

app.get("/",(req,res)=>{
    res.send('kclvnlvn')
})

//Routes
app.use("/api/auth",userRouter)
app.use("/api/admin",adminRouter)
app.use("/api/documents",docsRouter)
app.use("/api/appointment",appointmentRouter)
app.use("/api/medical-records", medicalRecordRouter)

// Catch-all handler: send back index.html for client routes
app.use((req, res) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  } else {
    res.status(404).send('Not Found');
  }
});

const PORT = process.env.PORT
server.listen(PORT || 3000,()=>{
    console.log(`Server running on Port: ${PORT}`)
})