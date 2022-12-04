const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')


module.exports = class UserFavoriteController {

    //Create a UserFavorite
    static async create(req, res) {

        //get user
        const token = getToken(req)
        const user = await getUserByToken(token)

        const { professionalId } = req.body

        //validation
        if (!user) {
            res.status(422).json({ message: 'O usuário precisa estar logado.' })
            return
        }

        if (!professionalId) {
            res.status(422).json({ message: 'O profissional precisa ser enviado.' })
            return
        }


        //Check favorite
        const userFavoriteExist = await prisma.user_favorite.findFirst({
            where: {
                userId: Number(user.id),
                professionalId: Number(professionalId),
            },
        })

        if (userFavoriteExist) {
            res.status(422).json({ message: 'Profissional já favoritado.' })
            return
        }

        const profissionalExist = await prisma.professional.findFirst({
            where: {
                id: Number(professionalId)
            },
        })

        if (!profissionalExist) {
            res.status(422).json({ message: 'Profissional não existe.' })
            return
        }
        
        //Create a UserFavorite
        try {
            const newUserFavorite = await prisma.user_favorite.create({
                data: {
                    user: {
                        connect: {
                            id: Number(user.id),
                        }
                    },
                    professional: {
                        connect: {
                            id: Number(professionalId),
                        }
                    }
                },
            })

            res.status(200).json({ message: 'Favorito cadastrado com sucesso!', newUserFavorite })

        } catch (error) {
            res.status(500).json({ message: error })
        }

    }

    static async getAll(req, res) {

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
                id: 'asc' //Ordena do menor para o maior
            }
        })

        if (userFavorites) {
            res.status(200).json({
                userFavorites: userFavorites
            })
        } else {
            res.status(422).json({ message: 'Favoritos não encontrados!' })
        }

    }

    static async getById(req, res) {

        const id = Number(req.params.id)

        //get user
        const token = getToken(req)
        const user = await getUserByToken(token)

        //validation
        if (!user) {
            res.status(422).json({ message: 'Profissionais não possuem favoritos.' })
            return
        }

        const getUserFavorite = await prisma.user_favorite.findFirst({
            where: {
                id: id,
                userId: user.id
            }

        })

        if (!getUserFavorite) {
            res.status(422).json({ message: 'Favorito não encontrado!' })
            return
        } else {
            res.status(200).json({ getUserFavorite })
        }

    }

    static async removeUserFavoriteById(req, res) {

        const id = Number(req.params.id)

        //get user
        const token = getToken(req)
        const user = await getUserByToken(token)

        //validation
        if (!user) {
            res.status(422).json({ message: 'Profissionais não possuem favoritos.' })
            return
        }

        const getUserFavorite = await prisma.user_favorite.findFirst({
            where: {
                id: id,
                userId: user.id
            }

        })

        if (!getUserFavorite) {
            res.status(422).json({ message: 'Favorito não encontrado!' })
            return
        }

        try {

            //Remove student
            await prisma.user_favorite.delete({
                where: {
                    id: id
                }
            })

            res.status(200).json({ message: 'Favorito removido com sucesso!' })

        } catch (err) {
            res.status(500).json({ message: err })
            return
        }

    }


}