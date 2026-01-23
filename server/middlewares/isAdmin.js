import jwt from 'jsonwebtoken'

export const isAuthorized = (...roles) => {
    return (req,res,next) => {
        if (!roles.includes(req.user.role)){
            return res.status(403).json({ message: "Forbidden, Only Admins are allowed" });
        }

        next()
    }
}