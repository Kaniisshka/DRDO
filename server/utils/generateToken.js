import jwt from "jsonwebtoken"

export const generateToken = ({id,email,role,name}) => {
    return jwt.sign({id,email,role,name},process.env.JSONWEBTOKEN)
}