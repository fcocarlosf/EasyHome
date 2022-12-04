const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')

module.exports = class RatingController {

    //Create a Rating
    static async create(req, res) {

        //get user
        const token = getToken(req)
        const user = await getUserByToken(token)
        const { note, professionalId } = req.body

        //validation
        if (!note) {
            res.status(422).json({ message: 'A nota é obrigatória' })
            return
        }

        if (!professionalId) {
            res.status(422).json({ message: 'O profissional é obrigatório' })
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

        if (!user.id) {
            res.status(422).json({ message: 'O usuário é obrigatório' })
            return
        }

        //Create a Rating
        try {
            const newRating = await prisma.rating.create({
                data: {
                    note: Number(note),
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

            res.status(200).json({ message: 'Avaliação cadastrada com sucesso!', newRating })

        } catch (error) {
            res.status(500).json({ message: error })
        }

    }

    static async getAll(req, res) {


        const ratings = await prisma.rating.findMany({
            orderBy: {
                id: 'asc' //Ordena do menor para o maior
            }
        })

        if (ratings) {
            res.status(200).json({
                ratings: ratings
            })
        } else {
            res.status(422).json({ message: 'Avaliações não encontrados!' })
        }

    }

    static async getById(req, res) {

        const id = Number(req.params.id)

        const getRating = await prisma.rating.findFirst({
            where: {
                id: id
            }

        })

        if (!getRating) {
            res.status(422).json({ message: 'Trabalho não encontrado!' })
            return
        } else {
            res.status(200).json({ getRating })
        }

    }

    static async editRating(req, res) {

        const token = getToken(req)
        const user = await getUserByToken(token)

        const { note } = req.body

        const id = Number(req.params.id)

        const editRating = await prisma.rating.findFirst({
            where: {
                id: id
            },
            select: {
                note: true,
                userId: true,
                professionalId: true,
            }
        })

        if (!editRating) {
            res.status(422).json({ message: 'Avaliação não encontrado!' })
            return
        }

        //validation
        if (!note) {
            res.status(422).json({ message: 'A nota é obrigatória!' })
            return
        }

        editRating.note = Number(note)

        if(editRating.userId !== user.id && editRating){
            res.status(422).json({message: 'Essa avaliação pertence a outro usuário.'})
            return
        }

        try {

            //return rating updated data
            await prisma.rating.update({
                where: {
                    id: id,
                },
                data: editRating
            })

            res.status(200).json({ message: 'Avaliação atualizada com sucesso!' })

        } catch (err) {
            res.status(500).json({ message: err })
            return
        }

    }

    static async removeRatingById(req, res) {

        const id = Number(req.params.id)

        const token = getToken(req)
        const user = await getUserByToken(token)

        const getRating = await prisma.Rating.findFirst({
            where: {
                id: id
            }

        })

        if (!getRating) {
            res.status(422).json({ message: 'Avaliação não encontrado!' })
            return
        }

        if (user.id !== getRating.userId && getRating) {
            res.status(422).json({ message: 'Avaliação não pertence ao usuário logado!' })
            return
        }

        try {

            //Remove student
            await prisma.rating.delete({
                where: {
                    id: id
                }
            })

            res.status(200).json({ message: 'Avaliação removida com sucesso!' })

        } catch (err) {
            res.status(500).json({ message: err })
            return
        }

    }


}