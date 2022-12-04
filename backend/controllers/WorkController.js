const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const getToken = require('../helpers/get-token')
const getProfessionalByToken = require('../helpers/get-professional-by-token')  

module.exports = class WorkController {

    //Create a Work
    static async create(req, res) {

        const { description } = req.body
        
        //get user
        const token = getToken(req)
        const professional = await getProfessionalByToken(token)
        if (!professional) {
            res.status(422).json({ message: 'Apenas profissionais podem criar trabalhos!' })
            return
        }

        let workImage

        //image upload
        if (req.file) {

            workImage = req.file.filename
        }

        //validation
        if (!description) {
            res.status(422).json({ message: 'A descrição é obrigatória' })
            return
        }

        //Create a work
        try {
            const newWork = await prisma.work.create({
                data: {
                    professional: {
                        connect: {
                            id: Number(professional.id),
                        }
                    },
                    description: description,
                    image: workImage
                },
            })

            res.status(200).json({ message: 'Trabalho cadastrado com sucesso!', newWork })

        } catch (error) {
            res.status(500).json({ message: error })
        }

    }

    static async getAll(req, res) {


        const works = await prisma.work.findMany({
            orderBy: {
                id: 'asc' //Ordena do menor para o maior
            }
        })

        if (works) {
            res.status(200).json({
                works: works
            })
        } else {
            res.status(422).json({ message: 'Trabalhos não encontrados!' })
        }

    }

    static async getById(req, res) {

        const id = Number(req.params.id)

        const work = await prisma.work.findFirst({
            where: {
                id: id
            }

        })

        if (!work) {
            res.status(422).json({ message: 'Trabalho não encontrado!' })
            return
        } else {
            res.status(200).json({ work })
        }

    }

    static async editWork(req, res) {

        const { description } = req.body

        const id = Number(req.params.id)

        const token = getToken(req)
        const professional = await getProfessionalByToken(token)
        if (!professional) {
            res.status(422).json({ message: 'Apenas profissionais podem editar os trabalhos!' })
            return
        }

        const editWork = await prisma.work.findFirst({
            where: {
                id: id
            },
            select: {
                professionalId: true,
                description: true,
                image: true,
            }
        })

        if (!editWork) {
            res.status(422).json({ message: 'Trabalho não encontrado!' })
            return
        }

        //validation
        if (editWork.professionalId !== professional.id) {
            res.status(422).json({ message: 'Sem autorização para editar esse trabalho.' })
            return
        }

        if (!description) {
            res.status(422).json({ message: 'A descrição é obrigatória!' })
            return
        }

        editWork.description = description

        //image upload
        if (req.file) {

            editWork.image = req.file.filename
        }

        try {

            //return work updated data
            await prisma.work.update({
                where: {
                    id: id,
                },
                data: editWork
            })

            res.status(200).json({ message: 'Trabalho atualizado com sucesso!' })

        } catch (err) {
            res.status(500).json({ message: err })
            return
        }

    }

    static async removeWorkById(req, res) {

        const id = Number(req.params.id)

        const token = getToken(req)
        const professional = await getProfessionalByToken(token)
        if (!professional) {
            res.status(422).json({ message: 'Apenas profissionais podem editar os trabalhos!' })
            return
        }

        const getWork = await prisma.work.findFirst({
            where: {
                id: id
            }

        })

        if (!getWork) {
            res.status(422).json({ message: 'Trabalho não encontrado!' })
            return
        }

        if (getWork.professionalId !== professional.id) {
            res.status(422).json({ message: 'Sem permissão para deletar trabalhos de outros profissionais!' })
            return
        }

        try {

            //Remove work
            await prisma.work.delete({
                where: {
                    id: id
                }
            })

            res.status(200).json({ message: 'Trabalho removido com sucesso!' })

        } catch (err) {
            res.status(500).json({ message: err })
            return
        }

    }


}