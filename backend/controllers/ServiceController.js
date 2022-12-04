const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

module.exports = class ServiceController {

    //Create a Service
    static async create(req, res) {

        const { name, description } = req.body

        //validation
        if (!description) {
            res.status(422).json({ message: 'A descrição é obrigatória' })
            return
        }

        if (!name) {
            res.status(422).json({ message: 'O nome é obrigatório' })
            return
        }

        //Create a Service
        try {
            const newService = await prisma.service.create({
                data: {
                    name: name,
                    description: description,
                },
            })

            res.status(200).json({ message: 'Serviço cadastrado com sucesso!', newService })

        } catch (error) {
            res.status(500).json({ message: error })
        }

    }

    static async getAll(req, res) {


        const services = await prisma.service.findMany({
            orderBy: {
                id: 'asc' //Ordena do menor para o maior
            }
        })

        if (services) {
            res.status(200).json({
                services: services
            })
        } else {
            res.status(422).json({ message: 'Serviços não encontrados!' })
        }

    }

    static async getById(req, res) {

        const id = Number(req.params.id)

        const getService = await prisma.service.findFirst({
            where: {
                id: id
            }

        })

        if (!getService) {
            res.status(422).json({ message: 'Serviço não encontrado!' })
            return
        } else {
            res.status(200).json({ getService })
        }

    }

    static async editService(req, res) {

        const { name, description } = req.body

        const id = Number(req.params.id)

        const editService = await prisma.service.findFirst({
            where: {
                id: id
            },
            select: {
                name: true,
                description: true,
            }
        })

        if (!editService) {
            res.status(422).json({ message: 'Serviço não encontrado!' })
            return
        }

        //validation
        if (!name) {
            res.status(422).json({ message: 'O nome é obrigatório!' })
            return
        }

        editService.name = name

        if (!description) {
            res.status(422).json({ message: 'A descrição é obrigatória!' })
            return
        }

        editService.description = description

        try {

            //return service updated data
            await prisma.service.update({
                where: {
                    id: id,
                },
                data: editService
            })

            res.status(200).json({ message: 'Serviço atualizado com sucesso!' })

        } catch (err) {
            res.status(500).json({ message: err })
            return
        }

    }

    static async removeServiceById(req, res) {

        const id = Number(req.params.id)

        const getService = await prisma.service.findFirst({
            where: {
                id: id
            }

        })

        if (!getService) {
            res.status(422).json({ message: 'Trabalho não encontrado!' })
            return
        }

        try {

            //Remove service
            await prisma.service.delete({
                where: {
                    id: id
                }
            })

            res.status(200).json({ message: 'Serviço removido com sucesso!' })

        } catch (err) {
            res.status(500).json({ message: err })
            return
        }

    }


}