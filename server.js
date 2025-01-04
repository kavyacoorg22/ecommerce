require('dotenv').config();
const express = require('express');
const app = express();
const expressLayout = require('express-ejs-layouts');
const userRouter=require('./router/user')
const connectDB=require('./db/connectDB')
const cookieParser=require('cookie-parser')
const cors=require('cors')
const session=require('express-session')
const MongoStore = require('connect-mongo');
const path=require('path')


const port = process.env.PORT || 3000;

// Static Files
app.use(cors({ origin: 'http://localhost:3001', credentials: true }))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use(express.static('public'));

app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));

app.use('/fonts', express.static(path.join(__dirname, 'public/fonts')));

// Setting Views Folder and View Engine
app.set('views', './views');
app.use(expressLayout);
app.set('layout', './layout/user-layout.ejs'); // Default layout for all views
app.set('view engine', 'ejs');

//session
app.use(session({
  store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/your-db',
      ttl: 24 * 60 * 60 // Session TTL in seconds
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
  }
}));


// Routes

app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  next();
});
app.use('/user',userRouter)

// Start the Server
connectDB()
.then(()=>
{
  console.log("Database connection established succesfully")
  app.listen(port, () => console.log("Server running properly on http://localhost:${port}"));
})
.catch(()=>{
  console.log('Database connection lost',err.message)
})