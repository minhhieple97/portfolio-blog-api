const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
require("dotenv").config();
app.use(express.json());
app.get("/test", (req, res) => {
  return res.json({ message: "test is working!" });
});
app.use(function (err, req, res, next) {
  res
    .status(err.status || 400)
    .send(err.message || "Sorry something went wrong!");
});
async function runServer() {
  await require("./db").connect();
  app.use("/api/v1/portfolios", require("./routes/portfolios"));
  app.use("/api/v1/blogs", require("./routes/blogs"));
  app.use("/", (req, res) => {
    return res.status(200).json({ message: "OK" });
  });
  const server = app.listen(PORT, (err) => {
    if (err) console.error(err.message);
    console.log("Server ready on port:", PORT);
  });
  app.use(function (err, req, res, next) {
    console.error(err.message);
    res.status(500).send("Something broke!");
  });
  // Graceful shutdown of server
  process.on("SIGINT", () => {
    console.log("\n[server] Shutting down...");
    server.close();
    process.exit();
  });

  process.on("SIGTERM", () => {
    console.log("\n[server] Shutting down...");
    server.close();
    process.exit();
  });

  process.on("uncaughtException", () => {
    console.log("\n[server] Shutting down...");
    server.close();
    process.exit();
  });
}
runServer();
