const jwt = require('jsonwebtoken');

module.exports = async function isAuthenticated(req, res, next) {
  // const auth = req.headers["authorization"];
  // if(auth == undefined) {
  //   res.json({ message: "You do not have authorization"});
  // }
  // "Bearer <token>".split(" ")[1];
  // ["Bearer", "<token>"]
  // const token = auth.split(" ")[1];

  // jwt.verify(token, "secret", (err, user) => {
  //   if(err) {
  //     return res.json({ message: err })
  //   }else {
  //     req.user = user;
  //     next();
  //   }
  // })
  try {
    // const token = req.headers["authorization"].split(" ")[1];
    const token = req.headers.authorization.split(" ").pop();

    jwt.verify(token, "secret", (err, user) => {
      if(err) {
        return res.json({ message: err })
      }else {
        req.user = user;
        next();
      }
  })
  } catch (e) {
    console.log(e);
    res.status(409);
    res.send({ error: "Tu por aqui no pasas!" });
  }
}