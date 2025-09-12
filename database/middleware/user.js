const { User, Course } = require("../db");

function userMiddleware(req, res, next) {
    // Implement user auth logic
    // You need to check the headers and validate the user from the user DB. Check readme for the exact headers to be expected
    const username = req.headers.username;
    const password = req.headers.password;
    //validate the user from the user db.
    const value = User.findOne({
      username: username,
      password: password,
    });
    if (value){
        next();
    }else{
        res.send(403).json({
            msg:'this user doesnt exist '
        })
    }
}

module.exports = userMiddleware;