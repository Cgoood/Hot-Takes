const sauceModel = require("../models/sauce");
const fs = require("fs");

// Affichage de l'ensemble des sauces
exports.getSauces = async function (req, res, next) {
    try {
        const sauces = await sauceModel.find()
        res.status(200).send(sauces)
    } catch {
        res.status(500).json({
            error
        })
    }
};

// Affichage d'une sauce selon l'Id
exports.getSauceById = async function (req, res, next) {
    try {
        const id = req.params.id
        const sauce = await sauceModel.findOne({
            _id: id
        })
        res.send(sauce)
    } catch {
        res.status(404).json({
            error
        })
    }
}

// Création d'une sauce
exports.createSauce = async function (req, res) {
    try {
        const sauceDisplay = JSON.parse(req.body.sauce);
        const {
            userId,
            name,
            manufacturer,
            description,
            mainPepper,
            heat
        } = sauceDisplay
        delete sauceDisplay._id;
        console.log("sauce:", sauceDisplay);

        const sauce = new sauceModel({
            ...sauceDisplay,
            likes: 0,
            dislikes: 0,
            usersLiked: [],
            usersDisliked: [],
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        })

        console.log(sauce);
        await sauce.save()
        return res.status(201).send("ok")
    } catch {
        console.error();
        return res.status(500).send("Internal error");
    }
};

// Suppression d'une sauce
exports.deleteSauce = (req, res, next) => {
    sauceModel.findOne({
            _id: req.params.id
        })
        .then(sauceModel => {
            if (sauceModel.userId != req.auth.userId) {
                res.status(401).json({
                    message: "Non authorisé"
                });
            } else {
                const filename = sauceModel.imageUrl.split("/images/")[1];
                fs.unlink(`images/${filename}`, () => {
                    sauceModel.deleteOne({
                            _id: req.params.id
                        })
                        .then(() => {
                            res.status(200).json({
                                message: "Objet supprimé !"
                            })
                        })
                        .catch(error => res.status(401).json({
                            error
                        }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({
                error
            });
        });
};

// Modification de la sauce
exports.modifySauce = (req, res, next) => {
    // Suppression de l'ancienne image si une nouvelle est choisie
    if (req.file) {
        sauceModel.findOne({
                _id: req.params.id
            })
            .then(sauce => {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, (err) => {
                    if (err) throw err;
                });
            })
            .catch(error => res.status(400).json({
                error
            }));
    }

    // Mise à jour de l'image
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {
        ...req.body
    };

    // Enregistrement des modifications
    sauceModel.updateOne({
            _id: req.params.id
        }, {
            ...sauceObject,
            _id: req.params.id
        })
        .then(() => res.status(200).json({
            message: 'Sauce modifiée'
        }))
        .catch(error => res.status(400).json({
            error
        }));
}


// Gestion likes/dislikes
exports.likeSauce = (req, res, next) => {
    sauceModel.findOne({
            _id: req.params.id
        })
        // L'utilisateur n'a pas encore liké ou disliké
        .then(sauce => {
            if (sauce.usersDisliked.indexOf(req.body.userId) == -1 && sauce.usersLiked.indexOf(req.body.userId) == -1) {
                if (req.body.like == 1) { // L'utilisateur aime la sauce
                    sauce.usersLiked.push(req.body.userId);
                    sauce.likes += req.body.like;
                } else if (req.body.like == -1) { // L'utilisateur n'aime pas la sauce
                    sauce.usersDisliked.push(req.body.userId);
                    sauce.dislikes -= req.body.like;
                };
            };
            // Annulation du like
            if (sauce.usersLiked.indexOf(req.body.userId) != -1 && req.body.like == 0) {
                const likesUserIndex = sauce.usersLiked.findIndex(user => user === req.body.userId);
                sauce.usersLiked.splice(likesUserIndex, 1);
                sauce.likes -= 1;
            };
            // Annulation du dislike
            if (sauce.usersDisliked.indexOf(req.body.userId) != -1 && req.body.like == 0) {
                const likesUserIndex = sauce.usersDisliked.findIndex(user => user === req.body.userId);
                sauce.usersDisliked.splice(likesUserIndex, 1);
                sauce.dislikes -= 1;
            }
            sauce.save();
            res.status(201).json({
                message: 'Like / Dislike mis à jour'
            });
        })
        .catch(error => res.status(500).json({
            error
        }));
};
