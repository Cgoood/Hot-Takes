require("dotenv").config();
const jwt = require("jsonwebtoken");
 
module.exports = (req, res, next) => {
   try {
       const token = req.headers.authorization.split(" ")[1];
       if(!token){
        return res.status(403).send("Token missing in Authorization header")
       }
       const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");
       const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };
    next();
   } catch(error) {
       res.status(401).send("Internal error");
   }
}