const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const request = require("request");
exports.checkRole = (role) => (req, res, next) => {
  const user = req.user;
  if (user && user[process.env.AUTH0_NAMESPACE + "/roles"].includes(role)) {
    next();
  } else {
    return res
      .status(401)
      .send("You are not authorized to access this resource!");
  }
};
exports.checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 10,
    jwksUri: process.env.DOMAIN_AUTH0_JWT,
  }),
  audience: process.env.IDENTIFIER_AUTH0,
  issuer: process.env.DOMAIN_AUTH0,
  algorithms: ["RS256"],
});
exports.getAccessToken = () => {
  const options = {
    method: "POST",
    url: process.env.AUTH0_TOKEN_URL,
    headers: { "content-type": "application/json" },
    form: {
      grant_type: "client_credentials",
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      audience: process.env.IDENTIFIER_AUTH0,
    },
  };
  return new Promise((res, rej) => {
    request(options, (error, result, body) => {
      if (error) {
        rej(error);
      }
      res(body ? JSON.parse(body) : "");
    });
  });
};
exports.getAuth0User = (accessToken) => (userId) => {
  const options = {
    method: "GET",
    url: `${process.env.IDENTIFIER_AUTH0_GET_USER}/${userId}?fields=name,picture,user_id`,
    headers: { authorization: `Bearer ${accessToken}` },
  };
  return new Promise((res, rej) => {
    request(options, (error, result, body) => {
      if (error) {
        rej(error);
      }
      res(body ? JSON.parse(body) : "");
    });
  });
};
