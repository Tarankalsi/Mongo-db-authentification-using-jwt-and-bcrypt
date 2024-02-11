const { Router } = require("express");
const router = Router();
const userMiddleware = require("../middleware/user");
const inputValidation = require('../middleware/inputValidation');
const { User, Course } = require("../db/index")
const jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

const jwtPass = "taran@00"

// User Routes
router.post('/signup', inputValidation, async (req, res) => {
    // Implement user signup logic

    const { username, password } = req.body
    const user_exist = await User.findOne({ username: username })

    if (user_exist) {
        return res.status(403).json({
            msg: "User Already Exists"
        })
    }
    const salt = await bcrypt.genSalt(10)
    const secPass = await bcrypt.hash(password, salt)
    const user = await User.create({
        username: username,
        password: secPass
    })
    user.save()
    const token = jwt.sign({ username }, jwtPass)

    res.status(200).json({
        token: token
    })

    res.status(500).json({
        msg: "Internal Error"
    })

});

router.post('/signin', async (req, res) => {
    // Implement admin signup logic
    try {
        const { username, password } = req.body

        const user = await User.findOne({ username })

        if (!user) {
            return res.status(403).json({
                msg: "Admin doesn't exist"
            })
        }
        const password_compare = await bcrypt.compare(password, user.password)
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
            msg: "Internal Error"
        })
    }
});

router.get('/courses', async (req, res) => {
    // Implement listing all courses logic
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

router.post('/courses/:courseId', userMiddleware, async (req, res) => {
    // Implement course purchase logic
    const token = req.headers.authorization
    const course_id = req.params.courseId

    try {
        const decode = jwt.verify(token, jwtPass)

        const user = await User.findOne({ username: decode.username })
        if (user.purchasedCourses.includes(course_id)) {
            return res.status(404).json({
                msg: "Already purchased"
            })
        }

        const purchase = await User.updateOne({
            username: decode.username
        }, {
            $push: {
                purchasedCourses: course_id
            }
        })
        if (purchase.modifiedCount === 0) {
            return res.status(404).json({
                message: "Purchase Failed"
            })
        }
        res.status(200).json({
            message: "Course Purchased"
        });
    } catch (error) {
        res.status(500).json("Internal Error")
    }


});

router.get('/purchasedCourses', userMiddleware, async (req, res) => {
    // Implement fetching purchased courses logic
    const token = req.headers.authorization

    const decode = jwt.verify(token, jwtPass)

    const user = await User.findOne({
        username: decode.username
    })

    const purchased_courses = await Course.find({
        _id : {
            "$in":user.purchasedCourses
        }
    })
    res.status(200).json({
        username : decode.username,
        purchased_Courses : purchased_courses
    })
});

module.exports = router