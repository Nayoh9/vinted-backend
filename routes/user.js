const express = require("express")
const router = express.Router()

const User = require("../modeles/User")

const uid2 = require('uid2'); // Sert à créer des strings aléatoire
const SHA256 = require("crypto-js/sha256"); // Sert à encripter une string
const encBase64 = require("crypto-js/enc-base64"); // Sert à transformer l'encryptage en string




router.post("/user/signup", async (req, res) => {   // ROUTE INSCRIPTION

    try {
        const userExistInDb = await User.findOne({ email: req.body.email })

        if (userExistInDb) {
            return res.status(400).json("this email already exist")
        }

        if (req.body.password === "" || !req.body.password) {
            return res.status(400).json("Please define a password")
        }

        const salt = uid2(16) // generation du salt, pour l'ajouter au bout de notre mot de passe qu'il ne soit pas retrouvable dans un dictionnaire

        const hash = SHA256(req.body.password + salt).toString(encBase64); // Encryptage de la string que l'on retransforme ensuite en string

        const token = uid2(64)    // Génération du token automatiquement

        const user = new User({
            account: {
                username: req.body.account.username
            },
            email: req.body.email,
            newsletter: req.body.newsletter,
            salt: salt,
            hash: hash,
            token: token
        })          // On enregistre tout en BDD sauf le mot de passe

        await user.save()

        res.status(201).json({
            _id: user._id,
            token: token,
            account: {
                username: user.username,
            }
        })

    } catch (error) {
        res.status(500).json({ message: error.message })
        console.log(error)
    }

})


router.post('/user/login', async (req, res) => { // ROUTE LOGIN

    try {
        const password = req.body.password

        const userExistInDb = await User.findOne({ email: req.body.email }) // Verification de l'existence de l'utilisateur via son email

        if (!userExistInDb) {
            return res.status(400).json("Wrong email or password")
        }

        const hash2 = SHA256(password + userExistInDb.salt).toString(encBase64);    // Réencodage sur les memes base du mot de passe 

        if (hash2 !== userExistInDb.hash) {
            return res.status(400).json("Wrong email or password")               // Comparaison des deux passwords sur le meme encodage 
        } else {
            return res.status(200).json({
                _id: userExistInDb._id,
                token: userExistInDb.token,
                account: userExistInDb.username,
            })
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }

})

module.exports = router