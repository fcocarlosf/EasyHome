const router = require('express').Router()

const UserFavoriteController = require('../controllers/UserFavoriteController.js')

//Middlewares
const verifyToken = require('../helpers/verify-token')

router.post('/create', UserFavoriteController.create)
router.get('/', UserFavoriteController.getAll)
router.get('/:id', UserFavoriteController.getById)
router.delete('/:id', UserFavoriteController.removeUserFavoriteById)

module.exports = router