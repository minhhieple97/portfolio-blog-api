const Blog = require("../db/models/blog");
const uniqueSlug = require("unique-slug");
const slugify = require("slugify");
const { getAccessToken, getAuth0User } = require("../middlewares/auth");
const { getUniqueList } = require("../utils");
exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: "published" }).sort({
      createdAt: -1,
    });
    const { access_token } = await getAccessToken();
    const blogsGetUniqueByUserId = getUniqueList(blogs, "userId");
    const authorsRaw = await Promise.all(
      blogsGetUniqueByUserId.map((blog) => {
        return getAuth0User(access_token)(blog.userId);
      })
    );
    const authors = authorsRaw.filter((author) => {
      return author.user_id;
    });
    const transferAuthorsObject = authors.reduce((result, author) => {
      result[author.user_id] = { ...author };
      return result;
    }, {});
    const blogsWithAuthor = blogs.map((blog) => {
      if (transferAuthorsObject[blog.userId]) {
        blog = {
          ...blog._doc,
          author: transferAuthorsObject[blog.userId],
        };
      }
      return blog;
    });
    return res.json(blogsWithAuthor);
  } catch (error) {
    console.log(error.message);
    return res.status(422).send(error.message);
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findOne({
      _id: req.params.id,
      status: { $in: ["published", "draft"] },
    });
    return res.json(blog);
  } catch (error) {
    return res.status(422).send(error.message);
  }
};

exports.getBlogBySlug = async (req, res) => {
  try {
    const { access_token } = await getAccessToken();

    const blog = await Blog.findOne({
      slug: req.params.slug,
      status: { $in: ["published", "draft"] },
    });
    const author = await getAuth0User(access_token)(blog.userId);
    return res.json({ blog, author });
  } catch (error) {
    return res.status(422).send(error.message);
  }
};
exports.createBlog = async (req, res) => {
  const blogData = req.body;
  blogData.userId = req.user.sub;
  const blog = new Blog(blogData);

  try {
    const createdBlog = await blog.save();
    return res.json(createdBlog);
  } catch (e) {
    return res.status(422).send(e.message);
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const {
      body,
      params: { id },
    } = req;
    const blog = await Blog.findById(id);
    if (!blog) throw new Error("Blog does not exits!");
    if (body.status && body.status === "published" && !blog.slug) {
      blog.slug = slugify(blog.title, {
        replacement: "-",
        lower: true,
      });
    }
    blog.set(body);
    blog.updateAt = new Date();
    const updatedBlog = await _saveBlog(blog);
    return res.json(updatedBlog);
  } catch (error) {
    console.log(error.message);
    return res.status(422).send(error.message);
  }
};
exports.getBlogByUser = async (req, res) => {
  try {
    const userId = req.user.sub;
    const blogs = await Blog.find({
      userId,
      status: { $in: ["published", "draft"] },
    });
    return res.json(blogs);
  } catch (error) {
    console.log(error.message);
    return res.status(422).send(error.message);
  }
};
const _saveBlog = async (blog) => {
  try {
    const createdBlog = await blog.save();
    return createdBlog;
  } catch (e) {
    if (e.code === 11000 && e.keyPattern && e.keyPattern.slug) {
      blog.slug += `-${uniqueSlug()}`;
      return _saveBlog(blog);
    }
    throw e;
  }
};
