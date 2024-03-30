const express = require('express')
const app = express()

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.route('/')
.get((req, res, next) => {
    res.render('main.ejs')
})

app.route('/reservations')
.get((req, res, next) => {
    res.render('reservations.ejs')
})

app.listen(3000, (req, res, next) => {
    console.log('Server running...')
})