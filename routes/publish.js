const express = require('express')
const router = express.Router()
const mongoose = require("mongoose");
const cloudinary = require('cloudinary').v2;

const Offer = require("../modeles/Offer")
const fileUpload = require('express-fileupload')
const isAuthenticated = require('../middlewares/isAuthenticated');
const convertToBase64 = require("../utils/convertToBase64")






router.post('/offer/publish', isAuthenticated, fileUpload(), async (req, res) => { // Route pour publier une annonce
    try {

        // req.body contient mon body 
        // console.log(req.body)
        // req.files contient mon image
        //console.log(req.files)

        const transformedPicture = convertToBase64(req.files.picture);  // Convertion de mon buffer en base 64 àfin de l'upload sur cloudinary

        const { title, description, price, condition, city, brand, size, color, user } = req.body; // Destructuring alloue automatiquement les nom de variables à req.body.variable


        const result = await cloudinary.uploader.upload(transformedPicture); // Upload de l'image sur cloudinary

        const newOffer = new Offer({
            product_name: title,
            product_description: description,
            product_price: price,
            product_details: [
                {
                    MARQUE: brand
                },
                {
                    TAILLE: size
                },
                {
                    ÉTAT: condition
                },
                {
                    COULEUR: color
                },
                {
                    EMPLACEMENT: city
                }
            ],
            product_image: result, // On ajoute l'objet result qui contient la clef secure URL de l'image
            owner: req.body.user

        })

        await newOffer.save()


        res.status(200).json(newOffer)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})




router.get("/offers", async (req, res) => { // Route pour rechercher et trier les annonces

    try {
        // Destructuration
        const { title, priceMin, priceMax, sort, page } = req.query;

        // Je crée un objet que je donerai en argument au find
        const filter = {};

        // En fonction des queries que je reçois, je vais modifier mon objet filter
        if (title) {
            filter.product_name = new RegExp(title, "i");
        }

        if (priceMin) {
            filter.product_price = {
                $gte: priceMin,
            };
        }

        if (priceMax) {
            // Si la clef product_price existe déjà, je ne l'écrase pas, je lui rajoute juste une clef
            if (filter.product_price) {
                filter.product_price.$lte = priceMax;
            } else {
                filter.product_price = {
                    $lte: priceMax,
                };
            }
        }

        // Je crée un objet que je donerai en argument à sort
        const sortFilter = {};

        // En fonction des queries reçus, je construit mon objet
        if (sort === "price-desc") {
            sortFilter.product_price = "desc";
        } else if (sort === "price-asc") {
            sortFilter.product_price = "asc";
        }

        // 5 résultats par page : 1 skip = 0 ---- 2 skip = 5  ----- 3 skip = 10 ---- 4 skip = 15
        // 3 résultats par page : 1 skip = 0 ---- 2 skip = 3  ----- 3 skip = 6

        // skip = (n°page - 1) * nb de résultats par page

        let pageToSend = 1;
        if (page) {
            pageToSend = page;
        }

        // Je calcule skip en fonction du query page que j'ai reçu
        const skip = (pageToSend - 1) * 5; // 5 * pageToSend -5
        console.log(skip);

        // Je vais chercher mes offres
        const offers = await Offer.find(filter)
            .sort(sortFilter)
            .limit(5)
            .skip(skip)
            .select("product_name product_price");

        // Je regarde combien d'offres corespondent à mes recherches
        const numberOfOffers = await Offer.countDocuments(filter);

        res.json({ count: numberOfOffers, offers: offers });


    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})


router.get('/offer/:id', async (req, res) => { // Afficher une offre en utilisant son id
    try {
        const findAnnounce = await Offer.findById({ _id: req.params.id }).populate("owner", "account")


        res.status(400).json(findAnnounce);

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

module.exports = router