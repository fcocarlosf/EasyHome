const router = require('express').Router()

const ProfessionalController = require('../controllers/ProfessionalController')

//Middleware
const verifyToken = require('../helpers/verify-token')
const { imageUpload } = require('../helpers/image-upload')

router.post('/register', ProfessionalController.register)
router.post('/login', ProfessionalController.login)
router.get('/checkProfessional', ProfessionalController.checkProfessional)
router.get('/works', ProfessionalController.getProfessionalWorks)
router.get('/:id/works', ProfessionalController.getProfessionalWorksById)
router.get('/service/:id', ProfessionalController.getProfessionalByServiceId)
router.get('/', ProfessionalController.getAll)
router.get('/:id', ProfessionalController.getProfessionalById)
router.patch('/edit/:id', verifyToken, imageUpload.single("image"),  ProfessionalController.editProfessional)

module.exports = router