const { Admin } = require("../db");

// Middleware for handling auth
async function adminMiddleware(req, res, next) {
  // Implement admin auth logic
  const username = req.headers.username;
  const password = req.headers.password;
  //validate the admin from the admin db.
  const value = await Admin.findOne({
    username: username,
    password: password,
  });
  if (value){
    next();
  }else{
    res.status(403).json({
        msg: 'user doesnt exist'    
    })
  }
}

module.exports = adminMiddleware;
