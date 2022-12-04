const express = require('express')
const cors = require('cors')

const app = express()

//Config JSON Response

app.use(express.json())

//Solve CORS
app.use(cors({credentials: true, origin: 'http://localhost:3000'})) //Acessando API no mesmo domínio

//Public folder for images
app.use(express.static('public'))
//Middleware
const verifyToken = require('./helpers/verify-token')

//Routes
const UserRoutes = require('./routes/UserRoutes')
const ProfessionalRoutes = require('./routes/ProfessionalRoutes')
const WorkRoutes = require('./routes/WorkRoutes')
const ServiceRoutes = require('./routes/ServiceRoutes')
const UserFavoriteRoutes = require('./routes/UserFavoriteRoutes')
const RatingRoutes = require('./routes/RatingRoutes')
// const ReportRoutes = require('./routes/ReportRoutes')

app.use('/users', UserRoutes)
app.use('/professionals', ProfessionalRoutes)
app.use('/works', WorkRoutes)
app.use('/services', verifyToken, ServiceRoutes)
app.use('/user_favorite', verifyToken, UserFavoriteRoutes)
app.use('/rating', RatingRoutes)
// app.use('/reports', verifyToken, ReportRoutes)



//TODO: Verificar a ligação do Prisma com Node
app.listen(5000)