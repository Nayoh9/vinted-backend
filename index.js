const express = require('express')
const mongoose = require("mongoose");

const userRoute = require('./routes/user')
const publishRoute = require('./routes/publish')
const dotenv = require('dotenv').config();

const fileUpload = require('express-fileupload'); // Import de fileupload qui sert à récuperer les fichiers images dans une requete client et lire les form data
const cloudinary = require('cloudinary').v2 // Import de cloudinary qui nous sert à herberger nos fichiers image (ne pas oublier de mettre V2)

mongoose.connect(process.env.MONGODB_URI);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true                        // Pour connecter mon serveur à cloudinary
});

const app = express()
app.use(express.json());


app.use(userRoute);
app.use(publishRoute);

app.all("*", (req, res) => {
    res.status(404).json("this route does not exist")
})


app.listen(process.env.PORT)