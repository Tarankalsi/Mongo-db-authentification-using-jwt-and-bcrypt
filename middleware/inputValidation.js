const zod = require('zod');

function inputValidation(req,res,next) {
    const username_schema = zod.string().email()
    const password_schema = zod.string().min(8)

    const {username , password} =  req.body

    const username_res = username_schema.safeParse(username)
    const password_res = password_schema.safeParse(password)

    if (!username_res.success || !password_res.success) {
        if (!username_res.success) {
            return res.status(403).json({
                msg : "Invalid Username"
            })
        }else if (!password_res.success) {
            return res.status(403).json({
                msg: "Invalid Password"
            })
        }
    }else{
        next();
    }
}

module.exports = inputValidation