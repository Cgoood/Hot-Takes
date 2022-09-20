const bcrypt = require("bcrypt");
const userModel = require("../models/user");
const jwt = require("jsonwebtoken");

// Inscription d'un nouvel utilisateur
exports.signup = async function (req, res) {
    try {
        bcrypt.hash(req.body.password, 10)
            .then(hash => {
                const user = new userModel({
                    email: req.body.email,
                    password: hash
                });
                user.save()
                    .then(() => res.status(201).json({
                        message: "Utilisateur créé"
                    }))
                    .catch(error => res.status(400).json({
                        error
                    }));
            })
    } catch {
        console.error(err);
        return res.status(500).send("Internal error");
    }
};

// Connexion d'un utilisateur existant
exports.login = async function (req, res, next) {
    try {
        userModel.findOne({
                email: req.body.email
            })
            .then(user => {
                if (!user) {
                    return res.status(401).json({
                        message: "Utilisateur inconnu"
                    });
                }
                bcrypt.compare(req.body.password, user.password)
                    .then(valid => {
                        if (!valid) {
                            return res.status(401).json({
                                message: "Paire login/mot de passe incorrecte"
                            });
                        }
                        res.status(200).json({
                            userId: user._id,
                            token: jwt.sign({
                                    userId: user._id
                                },
                                "RANDOM_TOKEN_SECRET",
                                // clé secrete d'encodage
                                {
                                    expiresIn: "24h"
                                }
                            )
                        });
                    })
                    .catch(error => res.status(500).json({
                        error
                    }));
            })
    } catch {
        console.error();
        return res.status(500).send("Internal error");
    }
};