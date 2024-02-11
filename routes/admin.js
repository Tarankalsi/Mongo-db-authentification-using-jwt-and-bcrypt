const { Router } = require("express");
const { Admin,  Course } = require("../db/index");
const adminMiddleware = require("../middleware/admin");
const router = Router();
const inputValidation = require("../middleware/inputValidation");
const jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

const jwtPass = "taran@00"

// Admin Routes
router.post('/signup', inputValidation, async (req, res) => {
    // Implement admin signup logic
    try {
        const { username, password } = req.body
        const admin_exist = await Admin.findOne({ username: username })

        if (admin_exist) {
            return res.status(403).json({
                msg: "User Already Exists"
            })
        }
        const salt = await bcrypt.genSalt(10)
        const secPass = await bcrypt.hash(password, salt)
        const user = await Admin.create({
            username: username,
            password: secPass
        })
        user.save()
        const token = jwt.sign({ username }, jwtPass)

        res.status(200).json({
            token: token
        })
    } catch (error) {
        res.status(500).json({
            msg: "Internal Error"
        })
    }

});
router.post('/signin', inputValidation, async (req, res) => {
    // Implement admin signup logic
    try {
        const { username, password } = req.body

        const admin = await Admin.findOne({ username })

        if (!admin) {
            return res.status(403).json({
                msg: "Admin doesn't exist"
            })
        }
        const password_compare = await bcrypt.compare(password, admin.password)
        if (!password_compare) {
            return res.status(403).json({
                msg: "Incorrect Password"
            })
        }

        const token = jwt.sign({ username }, jwtPass)

        res.status(200).json({
            token: token
        })
    } catch (error) {
        res.status(500).json({
            msg:"Internal Error"
        })
    }
});

router.post('/courses', adminMiddleware, async(req, res) => {
    // Implement course creation logic
    const { title, description, price, imageLink } = req.body

    const create_course = await Course.create({
        title: title,
        description: description,
        price: price,
        imageLink: imageLink
    })

    create_course.save()
    res.status(200).json({
        message: "Course created successfully",
        CourseId: create_course._id
    })
});

router.get('/courses', adminMiddleware,async(req, res) => {
    // Implement fetching all courses logic
    try {
        const all_courses = await Course.find()
        res.status(200).json({
            courses: all_courses
        })
    } catch (error) {
        res.status(500).json({
            msg: "Internal Server Error"
        })
    }
});

module.exports = router;