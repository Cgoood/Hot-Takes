const express = require("express")
const app = express();
const port = 3000
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const userRoutes = require("./routes/user");
const sauceRoutes = require("./routes/sauces");
const path = require("path");


mongoose.connect('mongodb+srv://cedricgoudou:Cgood2015*@cluster0.bfjdjuh.mongodb.net/?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.info('Connexion à MongoDB réussie !'))
    .catch((err) => console.error('Connexion à MongoDB échouée !', err));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

app.use(express.json());


app.listen(port, () => console.log("listening on port " + port));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/auth", userRoutes);
app.use("/api/sauces", sauceRoutes);



