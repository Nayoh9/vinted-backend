const User = require("../modeles/User")

const isAuthenticated = async (req, res, next) => { // Ici on ajoute next car c'est un middleware et on veut qu'après son execution on passe à la fonction suivante

    try {
        if (!req.headers.authorization) {  // Si il n'y a pas de token entré 
            return res.status(400).json('Unthorized')
        }

        const token = req.headers.authorization.replace("Bearer ", "")

        const user = await User.findOne({ token: token }).select("account _id") // On va chercher un utilisateur dans notre modèle user dont la clefs token correspond à notre token reçu ET je vise les clefs que je veux recuperer sur user

        if (user) {
            req.body.user = user // Si je trouve un utilisateur alors je créer un clef user dans ma requete qui correspond à l'utilisateur trouvé
            next();

        } else
            res.status(400).json('Unthorized')

    } catch (error) {
        res.status(500).json({ message: error.message })
    }

}


module.exports = isAuthenticated

