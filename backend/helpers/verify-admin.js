const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')

const verifyAdmin = async (req, res, next) => {

    //get user
    const token = getToken(req)
    const user = await getUserByToken(token)

    if (!user.admin) {
        return res.status(401).json({message: 'Acesso Negado.'})
    }

    next()

}

module.exports = verifyAdmin