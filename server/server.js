// server/server.js
const express = require('express');
const morgan = require("morgan");
const bodyparser = require("body-parser");
const dotenv = require("dotenv");
const session = require("express-session");
const path = require('path');
const cors = require('cors');
const app = express();
const MongoDBSessionStore = require('connect-mongodb-session')(session);


const envPath = path.join(__dirname, '', '.env');

const result = dotenv.config({path : envPath });
if (result.error) {
    throw result.error;
}

const PORT = process.env.PORT || 3000;
const connectDB = require('./db/db');

// middleware
app.use(cors());
app.use(morgan('dev'));
app.use(bodyparser.json());
app.use('/uploads', express.static('uploads'));


const store = new MongoDBSessionStore({
  uri: process.env.DB_URI,
  collection: 'sessions'
});


const oneDay = 24 * 60 * 60 * 1000;
//session
app.use(session({
  secret: process.env.Session_Key,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: oneDay,
    httpOnly: true,
    sameSite: 'strict',
    secure: true
  },
  store: store
}));

connectDB();

// API endpoint
app.use('/',require('./routes/routes'));

app.get('/api/test', (req, res) => {
  res.json({ message: 'Hello from the server!' });
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*',(req,res)=>{
  res.sendFile(path.join(__dirname,'../client/src', '../client/build', 'index.html'));
})

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});