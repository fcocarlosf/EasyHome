const bcrypt = require('bcrypt')
const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')

//Helpers
const createProfessionalToken = require('../helpers/create-professional-token')
const getToken = require('../helpers/get-token')
const getProfessionalByToken = require('../helpers/get-professional-by-token')

const prisma = new PrismaClient()

module.exports = class ProfessionalControllers {

    static async register(req, res) {
        const { name, cpf, email, phone, whatsapp, brief_description, serviceId, password, confirmpassword } = req.body
        
        //Validations
        if (!name) {
            res.status(422).json({ message: 'O nome é obrigatório' })
            return
        }

        if (!cpf) {
            res.status(422).json({ message: 'O cpf é obrigatório' })
            return
        }

        if (!email) {
            res.status(422).json({ message: 'O e-mail é obrigatório' })
            return
        }

        if (!brief_description) {
            res.status(422).json({ message: 'A descrição é obrigatória' })
            return
        }

        if (!serviceId) {
            res.status(422).json({ message: 'O serviço é obrigatório' })
            return
        }

        if (!password) {
            res.status(422).json({ message: 'A senha é obrigatória' })
            return
        }

        if (!confirmpassword) {
            res.status(422).json({ message: 'A confirmação de senha é obrigatório ' })
            return
        }

        if (password !== confirmpassword) {
            res.status(422).json({ message: 'A senha e a confirmação precisam ser iguais.' })
            return
        }

        //Check professional exist
        const professionalExist = await prisma.professional.findFirst({
            where: {
                OR: [{ cpf: cpf },
                { email: email },
                ]
            },
        })

        if (professionalExist) {
            res.status(422).json({ message: 'Email ou cpf já cadastrado. Por favor, utilize outro email/cpf.' })
            return
        }

        //Check service exist
        const serviceExist = await prisma.service.findFirst({
            where: {
                id: Number(serviceId)
            },
        })

        if (!serviceExist) {
            res.status(422).json({ message: 'Serviço não encontrado.' })
            return
        }

        //Create a password
        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(password, salt)

        //Create a Professional
        try {
            const newProfessional = await prisma.professional.create({
                data: {
                    name: name,
                    cpf: cpf,
                    email: email,
                    phone: phone,
                    whatsapp: whatsapp,
                    brief_description: brief_description,
                    password: passwordHash,
                    service: {
                        connect: {
                            id: Number(serviceId),
                        }
                    }
                },
            })

            await createProfessionalToken(newProfessional, req, res)

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

        //Check Professional exist
        const professional = await prisma.professional.findFirst({
            where: { email: email }
        })

        if (!professional) {
            res.status(422).json({ message: 'Não há usuário cadastrado com este e-mail!' })
            return
        }

        //Check if password match wiuth db password
        const checkPassword = await bcrypt.compare(password, professional.password)

        if (!checkPassword) {
            res.status(422).json({ message: 'Senha inválida!' })
            return
        }

        await createProfessionalToken(professional, req, res)

    }

    static async checkProfessional(req, res) {

        let currentProfessional

        if (req.headers.authorization) {

            const token = getToken(req)
            const decoded = jwt.verify(token, 'osecret')

            currentProfessional = await prisma.professional.findFirst({
                where: { id: Number(decoded.id) }
            })



            currentProfessional.password = undefined

        } else {
            currentProfessional = null
        }

        res.status(200).send(currentProfessional)

    }

    static async getAll(req, res) {

        const professionals = await prisma.professional.findMany({
            orderBy: {
                id: 'asc' //Ordena do menor para o maior
            }
        })
        if (!professionals.length) {
            res.status(422).json({ message: 'Nenhum profissional cadastrado !' })
            return
        } else {
            res.status(200).json({
                professionals: professionals
            })
        }

    }

    static async getProfessionalById(req, res) {

        const id = req.params.id

        const professional = await prisma.professional.findFirst({
            where: { id: Number(id) },
        })

        if (!professional) {
            res.status(422).json({ message: 'Usuário não encontrado!' })
            return
        } else {
            res.status(200).json({ professional })
        }

    }

    static async getProfessionalWorks(req, res) {

        //get professional
        const token = getToken(req)
        const professional = await getProfessionalByToken(token)

        const works = await prisma.work.findMany({
            where: { professionalId: Number(professional.id) },
            // select: {
            //     id: true,
            //     image: true,
            //     description: true,
            // }
        })

        if (!works) {
            res.status(422).json({ message: 'Trabalhos não encontrados!' })
            return
        } else {
            res.status(200).json({ works })
        }

    }

    static async getProfessionalWorksById(req, res) {

        const id = req.params.id

        const works = await prisma.work.findMany({
            where: { professionalId: Number(id) },
        })

        if (!works) {
            res.status(422).json({ message: 'Trabalhos não encontrados!' })
            return
        } else {
            res.status(200).json({ works })
        }

    }

    static async getProfessionalByServiceId(req, res) {

        const id = Number(req.params.id)

        const professionals = await prisma.professional.findMany({
            where: { serviceId: Number(id) },
            // select: {
            //     id: true,
            //     image: true,
            //     description: true,
            // }
        })

        if (!professionals) {
            res.status(422).json({ message: 'Trabalhos não encontrados!' })
            return
        } else {
            res.status(200).json({ professionals })
        }

    }

    static async editProfessional(req, res) {

        const id = Number(req.params.id)

        
        //get professional
        const token = getToken(req)
        const professional = await getProfessionalByToken(token)

        if (id !== professional.id) {
            res.status(422).json({message: 'Sem autorização para alterar esse usuário!'})
            return
        }

        const { name, cpf, email, phone, whatsapp, password, confirmpassword } = req.body

        if (req.file) {
            professional.image = req.file.filename
        }

        //Validations
        if (!name) {
            res.status(422).json({ message: 'O nome é obrigatório ' })
            return
        }

        professional.name = name

        if (!cpf) {
            res.status(422).json({ message: 'O cpf é obrigatório ' })
            return
        }

        if (!email) {
            res.status(422).json({ message: 'O e-mail é obrigatório ' })
            return
        }

        //check if email has already taken
        const professionalExist = await prisma.professional.findFirst({
            where: {
                OR: [
                    { email: email },
                    { cpf: cpf },
                ],
                NOT: {
                    id: id,
                },
            },
        })

        if ((professional.email !== email && professionalExist) || (professional.cpf !== cpf && professionalExist)) {
            res.status(422).json({ message: 'Email ou CPF já está em uso. Por favor, utilize outro.' })
            return
        }

        professional.email = email

        professional.cpf = cpf

        professional.phone = phone

        professional.whatsapp = whatsapp

        if (password !== confirmpassword) {
            res.status(422).json({ message: 'A senha e a confirmação precisam ser iguais.' })
            return
        } else if (password == confirmpassword && password != null) {

            //create password
            const salt = await bcrypt.genSalt(12)
            const passwordHash = await bcrypt.hash(password, salt)

            professional.password = passwordHash

        }

        try {

            //return professional updated data
            await prisma.professional.update({
                where: {
                    id: id,
                },
                data: professional
            })

            res.status(200).json({ message: 'Usuário atualizado com sucesso!' })

        } catch (err) {
            res.status(500).json({ message: err })
            return
        }

    }
}