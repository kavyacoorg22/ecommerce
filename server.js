require('dotenv').config();
const express = require('express');
const app = express();
const expressLayout = require('express-ejs-layouts');
const userRouter=require('./router/user')
const connectDB=require('./db/connectDB')
const bodyParser=require('body-parser')
const cors=require('cors')
const port = process.env.PORT || 3000;

// Static Files
app.use(cors({ origin: 'http://localhost:3001', credentials: true }))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

// Setting Views Folder and View Engine
app.set('views', './views');
app.use(expressLayout);
app.set('layout', './layout/user-layout.ejs'); // Default layout for all views
app.set('view engine', 'ejs');

// Routes
app.use('/user',userRouter)

// Start the Server
connectDB()
.then(()=>
{
  console.log("Database connection established succesfully")
  app.listen(port, () => console.log(`Server running properly on http://localhost:${port}`));
})
.catch(()=>{
  console.log('Database connection lost',err.message)
})

