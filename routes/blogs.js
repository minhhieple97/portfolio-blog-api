const express = require("express");
const router = express.Router();
const {
  getBlogs,
  getBlogById,
  getBlogBySlug,
  createBlog,
  updateBlog,
  getBlogByUser,
} = require("../controllers/blogs");
const { checkJwt, checkRole } = require("../middlewares/auth");
router.get("", getBlogs);
router.get("/me", checkJwt, getBlogByUser);
router.get("/:id", getBlogById);
router.get("/s/:slug", getBlogBySlug);
router.post("/", checkJwt, checkRole("admin"), createBlog);
router.patch("/:id", checkJwt, checkRole("admin"), updateBlog);
module.exports = router;
