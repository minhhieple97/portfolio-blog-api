const express = require("express");
const router = express.Router();
const {
  getPortfolios,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
} = require("../controllers/portfolios");
const { checkJwt, checkRole } = require("../middlewares/auth");
router.get("/", getPortfolios);
router.post("/", checkJwt, checkRole("admin"), createPortfolio);
router.patch("/:id", checkJwt, checkRole("admin"), updatePortfolio);
router.delete("/:id", checkJwt, checkRole("admin"), deletePortfolio);
router.get("/:id", getPortfolioById);
module.exports = router;
