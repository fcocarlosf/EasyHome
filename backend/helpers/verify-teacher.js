const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const verifyTeacher = async (req, res, next) => {

    //get user
    const token = getToken(req)
    const user = await getUserByToken(token)

    if (user.admin) {
        res.locals.admin = true
    } else {
        res.locals.admin = false
    }
        const examIdByTeacher = await prisma.discipline.findMany({
            where: {
                teacherId: Number(user.id)
            },
            select: {
                id: true,
                classId: true,                
                exam: {
                    select: {
                        id: true,
                    }
                }
            }
        })

        var resultWithEmpty = examIdByTeacher.map(element => element.exam)

        const removeEmpty = element => {
            if (element.length) {
                return true
            }
        }

        var pushId = element => {
            element.forEach(e => examIdList.push(e.id))
        }

        var resultWithoutEmpty = resultWithEmpty.filter(removeEmpty)
        const examIdList = []
        resultWithoutEmpty.forEach(pushId)


        res.locals.examIdList = examIdList

        const disciplineIdList = examIdByTeacher.map(element => element.id)
        res.locals.disciplineIdList = disciplineIdList

        const classIdList = examIdByTeacher.map(classId => classId.classId)
        res.locals.classIdList = classIdList

    

    next()

}

module.exports = verifyTeacher