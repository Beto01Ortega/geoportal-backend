const { decode } = require('jwt-simple');
const moment = require('moment');

const ensureAuth = (req, res, next) => {
    if(!req.headers.authorization)
        return res
                .status(401)
                .send('The request has no authentication header.');
    
    var token = req.headers.authorization.split(' ');    
    if(token.length > 1 && token[0] === 'Bearer'){
        token = token[1].replace(/['"]+/g, '');
    }else{
        return res.status(401).send("Invalid token...");
    }

    try {
        var payload = decode(token, process.env.TOKEN_SECRET);

        if (payload.exp <= moment().unix())
            return res.status(401).send("Expired Token..."); 
    } catch (error) {
        console.log("Error de Autorización => ", error);
        return res.status(401).send("Invalid token...");
    }

    req.user = payload;
    next();
};

module.exports = { ensureAuth };