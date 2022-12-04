const router = require('express').Router()

const WorkController = require('../controllers/WorkController.js')

//Middlewares
const verifyToken = require('../helpers/verify-token')
const { imageUpload } = require('../helpers/image-upload')

router.post('/create', verifyToken, imageUpload.single("image"), WorkController.create)
router.get('/', WorkController.getAll)
router.get('/:id', WorkController.getById)
router.patch('/edit/:id', verifyToken, imageUpload.single("image"), WorkController.editWork)
router.delete('/:id', verifyToken, WorkController.removeWorkById)

module.exports = router