const jwt = require('jsonwebtoken')

const createUserToken = async(user, req, res) => {
    //Create Token
    const token = jwt.sign({
        name: user.name,
        id: user.id
    }, "osecret")

    //return token
    res.status(200).json({
        message: "Você está autenticado.",
        token: token, 
        userid: user.id,
        usercheck: true,
        professionalcheck: false,
    })

}

module.exports = createUserToken