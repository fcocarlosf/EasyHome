const router = require('express').Router()

const RatingController = require('../controllers/RatingController.js')

//Middlewares
const verifyToken = require('../helpers/verify-token')

router.post('/create', verifyToken, RatingController.create)
router.get('/', RatingController.getAll)
router.get('/:id', RatingController.getById)
router.patch('/edit/:id', verifyToken, RatingController.editRating)
router.delete('/:id', verifyToken, RatingController.removeRatingById)

module.exports = router