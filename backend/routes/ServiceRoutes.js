const router = require('express').Router()

const ServiceController = require('../controllers/ServiceController.js')

//Middlewares
const verifyToken = require('../helpers/verify-token')

router.post('/create', verifyToken, ServiceController.create)
router.get('/', ServiceController.getAll)
router.get('/:id', ServiceController.getById)
router.patch('/edit/:id', verifyToken, ServiceController.editService)
router.delete('/:id', verifyToken, ServiceController.removeServiceById)

module.exports = router