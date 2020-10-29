const Portfolio = require("../db/models/portfolio");
exports.getPortfolios = async (req, res) => {
  const portfolios = await Portfolio.find({});
  return res.json(portfolios);
};
exports.createPortfolio = async (req, res) => {
  try {
    const portfolioData = req.body;
    const userId = req.user.sub;
    const portfolio = new Portfolio(portfolioData);
    portfolio.userId = userId;
    const result = await portfolio.save();
    return res.status(200).json({ result, message: "success" });
  } catch (error) {
    console.log("Error", error.message);
    return res.status(error.status || 400).send(error.message);
  }
};
exports.updatePortfolio = async (req, res) => {
  try {
    const {
      body: portfolioData,
      params: { id },
    } = req;
    const result = await Portfolio.findOneAndUpdate(
      { _id: id },
      portfolioData,
      {
        new: true,
        runValidators: true,
      }
    );
    return res.status(200).json({ result, message: "success" });
  } catch (error) {
    console.log("Error", error.message);
    return res.status(400).send(error.message);
  }
};
exports.getPortfolioById = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    return res.status(200).json(portfolio);
  } catch (error) {
    console.log("Error:", error.message);
    return res.status(422).send(error.message);
  }
};
exports.deletePortfolio = async (req, res) => {
  const portfolio = await Portfolio.findOneAndRemove({ _id: req.params.id });
  return res.status(200).json({ _id: portfolio.id });
};
