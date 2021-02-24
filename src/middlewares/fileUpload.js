const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination:(req, file, cb) => {
        cb(null, './public/images/')
    },
    filename:(req, file, cb) => {
        cb(null, Date.now()+path.extname(file.originalname))
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype == 'image/jpeg' || file.mimetype == 'image/png'){
        cb(null, true)
    }else{
        cb(new Error('file not supported'))
    }
}

const fileUpload = multer({storage, fileFilter})

module.exports = fileUpload