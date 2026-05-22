import ForumPost from "../model/ForumPost.js";

// @route POST /api/forum
export const createPost = async (req, res, next) => {
  try {
    const { title, content, category, tags } = req.body;

    const post = await ForumPost.create({
      author: req.user._id,
      title,
      content,
      category,
      tags,
    });

    const populated = await ForumPost.findById(post._id).populate(
      "author",
      "name profilePic role"
    );

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/forum
// Get all posts with optional tag filter + pagination
export const getAllPosts = async (req, res, next) => {
  try {
    const { tag, category, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (tag) filter.tags = { $in: [tag] };
    if (category && category !== "All") filter.category = category;

    const posts = await ForumPost.find(filter)
      .populate("author", "name profilePic role")
      .sort({ createdAt: -1 });

    // Returning array directly for frontend compatibility
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/forum/:id
export const getPostById = async (req, res, next) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate("author", "name profilePic role")
      .populate("comments.user", "name profilePic role");

    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    res.json(post);
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/forum/:id/like
export const toggleLike = async (req, res, next) => {
  try {
    const post = await ForumPost.findById(req.params.id).populate("author", "name profilePic role");
    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    const alreadyLiked = post.likes.includes(req.user._id);

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();
    res.json(post); // Return whole post for easier frontend update
  } catch (error) {
    next(error);
  }
};

// @route POST /api/forum/:id/comment
export const addComment = async (req, res, next) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    post.comments.push({
      user: req.user._id,
      text: req.body.text,
    });

    await post.save();

    const updated = await ForumPost.findById(req.params.id).populate(
      "comments.user",
      "name profilePic role",
    );

    res.status(201).json(updated.comments);
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/forum/:id
export const deletePost = async (req, res, next) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    if (
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      res.status(403);
      throw new Error("Not authorized to delete this post");
    }

    await post.deleteOne();
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    next(error);
  }
};
