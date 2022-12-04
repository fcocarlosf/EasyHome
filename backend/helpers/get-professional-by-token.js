const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

//Get user by jwt token
const getUserByToken = async (token) =>  {

    if(!token){
        return res.status(401).json({message: 'Acesso Negado!'})
    }

    const decoded = jwt.verify(token, 'osecret')

    const userId = Number(decoded.id)
    
    const user = await prisma.professional.findFirst({
        where: { id: userId},
        select: {
            id: true,
            name: true,
            cpf: true,
            email: true,
            password: true,
        }
    })

    return user

}

module.exports = getUserByToken