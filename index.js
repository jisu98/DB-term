const express = require('express')
const path = require('path')
const session = require('express-session')
const router = require('./router')
const PORT = process.env.PORT || 3000

const app = express()

app.use(express.static(__dirname + 'public'));
app.use("/public", express.static(__dirname + "/public"))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.json());
app.use(express.urlencoded({ exteneded: false }));


app.use(session({
  secret: 'KWEB-WEEK7QhEhQhEh123-09ikskjf',
  resave: false,
  saveUninitialized: true
}));

app.use('/', router);

app.get('/', (req, res) => res.render('home'))
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

module.exports = app;