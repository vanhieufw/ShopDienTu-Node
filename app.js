const express = require('express');
const path = require('path');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const methodOverride = require('method-override');
require('dotenv').config();

const app = express();
const pool = require('./models/db');
const sessionStore = new MySQLStore({}, pool);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  key: 'shopdientu_session',
  secret: process.env.SESSION_SECRET || 'secret',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user_name = req.session.user_name || null;
  res.locals.user_id = req.session.user_id || null;
  res.locals.RoleUser = req.session.RoleUser || 0;
  next();
});

app.use('/', require('./routes/user'));
app.use('/admin', require('./routes/admin'));

app.use((req, res) => res.status(404).send('Không tìm thấy trang'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`MySQL: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
});
