import jwt from "jsonwebtoken";

export const isLoggedIn = (req,res,next) => {
    try {
        const token = req.cookies?.token
        if (!token) return res.status(401).json({ message: "User Not authenticated" })
        
        const decoded = jwt.verify(token,process.env.JSONWEBTOKEN)
        req.user = {
            id:decoded.id,
            email:decoded.email,
            name:decoded.name,
            role:decoded.role
        }

        next()
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" })
    }
}
