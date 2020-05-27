const multer = require('@koa/multer')
const path = require('path')
module.exports = {
    upload: multer({
        limits: {
            fileSize: 1024*1024
        },
        fileFilter(ctx, file, cb) {
            if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
                return cb(new Error('Please upload a World document'))
            }
            cb(undefined, true)
        }
    })

}