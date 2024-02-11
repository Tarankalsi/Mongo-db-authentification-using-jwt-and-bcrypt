const jwt = require("jsonwebtoken");
const jwtPass = "taran@00"
// Middleware for handling auth
function adminMiddleware(req, res, next) {
    // Implement admin auth logic
    // You need to check the headers and validate the admin from the admin DB. Check readme for the exact headers to be expected
    const authtoken = req.headers.authorization
    try {
        const decode = jwt.verify(authtoken,jwtPass)
        if (decode.username) {
            next();
        }else{
            return res.status(403).json({
                msg:"You're not authenticated"
            })
        }
    } catch (error) {
        res.status(500).json({
            msg:"Internal Error"
        })
    }

}

module.exports = adminMiddleware;