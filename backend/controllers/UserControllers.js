const bcrypt = require('bcrypt')
const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')

//Helpers
const createUserToken = require('../helpers/create-user-token')
const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')

const prisma = new PrismaClient()

module.exports = class UserControllers {

    static async register(req, res) {
        const { name, cpf, email, password, confirmpassword } = req.body

        //Validations
        if (!name) {
            res.status(422).json({ message: 'O nome é obrigatório!' })
            return
        }

        if (!cpf) {
            res.status(422).json({ message: 'O cpf é obrigatório!' })
            return
        }

        if (!email) {
            res.status(422).json({ message: 'O e-mail é obrigatório!' })
            return
        }

        if (!password) {
            res.status(422).json({ message: 'A senha é obrigatória!' })
            return
        }

        if (!confirmpassword) {
            res.status(422).json({ message: 'A confirmação de senha é obrigatória!' })
            return
        }

        if (password !== confirmpassword) {
            res.status(422).json({ message: 'A senha e a confirmação precisam ser iguais.' })
            return
        }

        //Check user exist
        const userExist = await prisma.user.findFirst({
            where: {
                OR: [{ email: email },
                { cpf: cpf },
                ]
            },
        })

        if (userExist) {
            res.status(422).json({ message: 'Email ou cpf já cadastrado. Por favor, utilize outro email/cpf.' })
            return
        }

        //Create a password
        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(password, salt)

        //Create a user
        try {
            const newUser = await prisma.user.create({
                data: {
                    name: name,
                    cpf: cpf,
                    email: email,
                    password: passwordHash,
                },
            })

            await createUserToken(newUser, req, res)

        } catch (error) {
            res.status(500).json({ message: error })
        }


    }

    static async login(req, res) {

        const { email, password } = req.body

        if (!email) {
            res.status(422).json({ message: 'O e-mail é obrigatório ' })
            return
        }

        if (!password) {
            res.status(422).json({ message: 'A senha é obrigatória ' })
            return
        }

        //Check user exist
        const user = await prisma.user.findFirst({
            where: { email: email }
        })

        if (!user) {
            res.status(422).json({ message: 'E-mail ou senha incorreta!' })
            return
        }

        //Check if password match wiuth db password
        const checkPassword = await bcrypt.compare(password, user.password)

        if (!checkPassword) {
            res.status(422).json({ message: 'Senha inválida!' })
            return
        }

        await createUserToken(user, req, res)

    }

    static async checkUser(req, res) {

        let currentUser

        if (req.headers.authorization) {

            const token = getToken(req)
            const decoded = jwt.verify(token, 'osecret')

            currentUser = await prisma.user.findFirst({
                where: { id: Number(decoded.id) }
            })



            currentUser.password = undefined

        } else {
            currentUser = null
        }

        res.status(200).send(currentUser)

    }

    static async getUserById(req, res) {

        const id = req.params.id

        const user = await prisma.user.findFirst({
            where: { id: Number(id) },
            select: {
                id: true,
                name: true,
                cpf: true,
                email: true,
            }
        })

        if (!user) {
            res.status(422).json({ message: 'Usuário não encontrado!' })
            return
        } else {
            res.status(200).json({ user })
        }

    }

    static async getUserFavorite(req, res) {

        //get user
        const token = getToken(req)
        const user = await getUserByToken(token)

        //validation
        if (!user) {
            res.status(422).json({ message: 'Profissionais não possuem favoritos.' })
            return
        }

        const userFavorites = await prisma.user_favorite.findMany({
            where: {
                userId: Number(user.id)
            },
            orderBy: {
                createdAt: 'asc' //Ordena do menor para o maior
            }
        })

        if (!userFavorites) {
            res.status(422).json({ message: 'Favoritos não encontrados!' })
        }

        const professionalIdList = userFavorites.map(element => element.professionalId)
        
        const professionals = await prisma.professional.findMany({
            where: {
                id: {
                    in: professionalIdList
                }
            }
        })
        
        if (!professionals) {
            res.status(422).json({ message: 'Favoritos não encontrados!' })
        }

        if (userFavorites && professionals) {
            res.status(200).json({
                userFavorites: userFavorites, professionals
            })
        }

    }

    static async editUser(req, res) {

        const id = Number(req.params.id)

        //get user
        const token = getToken(req)
        const user = await getUserByToken(token)

        const { name, cpf, email, password, confirmpassword } = req.body

        if (req.file) {
            user.image = req.file.filename
        }

        //Validations
        if (!name) {
            res.status(422).json({ message: 'O nome é obrigatório ' })
            return
        }

        user.name = name

        if (!cpf) {
            res.status(422).json({ message: 'O cpf é obrigatório ' })
            return
        }

        if (!email) {
            res.status(422).json({ message: 'O e-mail é obrigatório ' })
            return
        }

        //check if email has already taken
        const userExist = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { cpf: cpf },
                ],
                NOT: {
                    id: id,
                }
            },
        })

        if ((user.email !== email && userExist) || (user.cpf !== cpf && userExist)) {
            res.status(422).json({ message: 'Email ou CPF já está em uso. Por favor, utilize outro.' })
            return
        }

        user.email = email

        user.cpf = cpf

        if (password !== confirmpassword) {
            res.status(422).json({ message: 'A senha e a confirmação precisam ser iguais.' })
            return
        } else if (password == confirmpassword && password != null) {

            //create password
            const salt = await bcrypt.genSalt(12)
            const passwordHash = await bcrypt.hash(password, salt)

            user.password = passwordHash

        }

        try {

            //return user updated data
            await prisma.user.update({
                where: {
                    id: id,
                },
                data: user
            })

            res.status(200).json({ message: 'Usuário atualizado com sucesso!' })

        } catch (err) {
            res.status(500).json({ message: err })
            return
        }

    }
}