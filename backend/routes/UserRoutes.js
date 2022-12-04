const router = require('express').Router()

const UserControllers = require('../controllers/UserControllers')

//Middleware
const verifyToken = require('../helpers/verify-token')
const { imageUpload } = require('../helpers/image-upload')

router.post('/register', UserControllers.register)
router.post('/login', UserControllers.login)
router.get('/checkuser', UserControllers.checkUser)
router.get('/favorite', UserControllers.getUserFavorite)
router.get('/:id', UserControllers.getUserById)
router.patch('/edit/:id', verifyToken, imageUpload.single("image"),  UserControllers.editUser)

module.exports = router