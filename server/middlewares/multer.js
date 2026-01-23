import multer from "multer"
import path from "path"
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../public/uploads/')
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = crypto.randomUUID().toString()
    cb(null, file.originalname)
  }
})

export const upload = multer({ storage: storage })