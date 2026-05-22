import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  MessageSquare,
  ThumbsUp,
  Plus,
  Search,
  User as UserIcon,
  Clock,
  MoreVertical,
  Send,
  Loader2,
  X,
  Trash2,
  AlertCircle,
  MessageCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Forum = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const renderRoleBadge = (role) => {
    if (!role) return null;
    const roleLower = role.toLowerCase();
    let badgeStyle = "";
    let displayRole = "";
    
    if (roleLower === 'founder') {
      badgeStyle = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      displayRole = "Founder";
    } else if (roleLower === 'expert' || roleLower === 'mentor') {
      badgeStyle = "bg-teal-500/10 text-teal-400 border-teal-500/20";
      displayRole = "Expert";
    } else if (roleLower === 'investor') {
      badgeStyle = "bg-amber-500/10 text-amber-400 border-amber-500/20";
      displayRole = "Investor";
    } else {
      badgeStyle = "bg-slate-500/10 text-slate-400 border-slate-500/20";
      displayRole = role.charAt(0).toUpperCase() + role.slice(1);
    }

    return (
      <span className={`badge text-[9px] py-0.5 px-2 font-bold rounded uppercase tracking-wider border ${badgeStyle} ml-1.5`}>
        {displayRole}
      </span>
    );
  };
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "General",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentTexts, setCommentTexts] = useState({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data } = await api.get("/forum");
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching posts", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/forum", newPost);
      setPosts([data, ...posts]);
      setShowCreate(false);
      setNewPost({ title: "", content: "", category: "General" });
    } catch (err) {
      console.error("Error creating post", err);
    }
  };

  const toggleLike = async (postId) => {
    try {
      const { data } = await api.put(`/forum/${postId}/like`);
      setPosts(posts.map(p => p._id === postId ? { ...p, likes: data.likes } : p));
    } catch (err) {
      console.error("Error liking post", err);
    }
  };

  const handleAddComment = async (postId) => {
    const text = commentTexts[postId];
    if (!text?.trim()) return;

    try {
      const { data } = await api.post(`/forum/${postId}/comment`, { text });
      setPosts(posts.map(p => p._id === postId ? { ...p, comments: data } : p));
      setCommentTexts({ ...commentTexts, [postId]: "" });
    } catch (err) {
      console.error("Error adding comment", err);
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments({
      ...expandedComments,
      [postId]: !expandedComments[postId]
    });
  };

  const handleDeletePost = (postId) => {
    setPostToDelete(postId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/forum/${postToDelete}`);
      setPosts(posts.filter((p) => p._id !== postToDelete));
      setShowDeleteConfirm(false);
      setPostToDelete(null);
    } catch (err) {
      console.error("Error deleting post", err);
    }
  };

  const handleContactUser = async (targetUserId) => {
    if (targetUserId === user?._id) return; // Can't chat with self
    try {
      const { data } = await api.get(`/messages/start/${targetUserId}`);
      if (data.conversation) {
        navigate(`/messages/${data.conversation._id}`);
      } else {
        const res = await api.post('/messages/send', { 
          receiverId: targetUserId, 
          text: `Hi! I saw your post on the Forum and wanted to reach out.` 
        });
        navigate(`/messages/${res.data.conversationId}`);
      }
    } catch (err) {
      console.error("Error starting conversation", err);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <header className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="mb-2 text-5xl font-bold text-white md:text-6xl">
            Community Forum
          </h1>
          <p className="text-lg text-sensai-muted">
            Discuss ideas, share insights, and grow with fellow founders.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={20} /> Create Post
        </button>
      </header>

      {/* Search Bar */}
      <div className="glass mb-10 flex items-center gap-4 p-4 pr-6">
        <Search size={22} className="text-sensai-muted shrink-0" />
        <input
          className="w-full border-none bg-transparent text-lg text-white outline-none placeholder:text-sensai-muted"
          placeholder="Search by title, content, or founder..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm("")}
            className="text-sensai-muted hover:text-white transition-colors"
            title="Clear search"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Posts List */}
        <section className="lg:col-span-2">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-sensai-primary" size={32} />
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {(() => {
                const filtered = posts.filter((p) => {
                  const term = searchTerm.toLowerCase();
                  return (
                    p.title.toLowerCase().includes(term) ||
                    p.content.toLowerCase().includes(term) ||
                    p.author?.name?.toLowerCase().includes(term)
                  );
                });

                if (filtered.length === 0) {
                  return (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="glass flex flex-col items-center justify-center py-20 text-center"
                    >
                      <Search size={48} className="mb-4 text-sensai-muted opacity-20" />
                      <h3 className="text-xl font-bold text-white mb-2">No discussions found</h3>
                      <p className="text-sensai-muted">We couldn't find any results for "{searchTerm}"</p>
                    </motion.div>
                  );
                }

                return filtered.map((post, i) => (
                    <motion.div
                      key={post._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass p-8"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <span className="badge bg-sensai-secondary/10 text-sensai-secondary border border-sensai-secondary/20">
                          {post.category}
                        </span>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sensai-muted">
                          <Clock size={14} />
                          {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <h3 className="mb-4 text-2xl font-bold text-white">
                        {post.title}
                      </h3>
                      <p className="mb-6 leading-relaxed text-sensai-muted">
                        {post.content}
                      </p>

                      <div className="flex items-center justify-between border-t border-glass pt-6">
                        <div 
                          className="flex items-center gap-3 cursor-pointer group/author"
                          onClick={() => handleContactUser(post.author?._id)}
                          title="Send direct message"
                        >
                          {post.author?.profilePic ? (
                            <img src={post.author.profilePic} className="h-9 w-9 rounded-full object-cover shrink-0" alt="" />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sensai-primary/20 to-sensai-secondary/20 font-bold text-white text-xs shrink-0 border border-white/5">
                              {post.author?.name?.charAt(0) || "F"}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-white group-hover/author:text-sensai-primary transition-colors">
                                {post.author?.name || "Founder"}
                              </span>
                              {renderRoleBadge(post.author?.role)}
                            </div>
                            <span className="text-[10px] text-sensai-muted flex items-center gap-1 opacity-0 group-hover/author:opacity-100 transition-opacity">
                              <MessageCircle size={10} /> Click to chat
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-6">
                          <button
                            onClick={() => toggleLike(post._id)}
                            className={`flex items-center gap-2 bg-none border-none cursor-pointer transition-colors
                          ${Array.isArray(post.likes) && post.likes.includes(user?._id) ? "text-sensai-primary" : "text-sensai-muted hover:text-white"}`}
                          >
                            <ThumbsUp
                              size={18}
                              className={
                                Array.isArray(post.likes) &&
                                post.likes.includes(user?._id)
                                  ? "fill-sensai-primary"
                                  : ""
                              }
                            />
                            <span className="text-sm font-bold">
                              {post.likes?.length || 0}
                            </span>
                          </button>

                          <button 
                            onClick={() => toggleComments(post._id)}
                            className={`flex items-center gap-2 bg-none border-none cursor-pointer transition-colors
                            ${expandedComments[post._id] ? "text-sensai-secondary" : "text-sensai-muted hover:text-white"}`}
                          >
                            <MessageSquare size={18} />
                            <span className="text-sm font-bold">
                              {post.comments?.length || 0}
                            </span>
                          </button>

                          {user?._id === post.author?._id && (
                            <button
                              onClick={() => handleDeletePost(post._id)}
                              className="flex items-center gap-2 bg-none border-none cursor-pointer text-sensai-muted transition-colors hover:text-red-400"
                              title="Delete Post"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Comments Section */}
                      <AnimatePresence>
                        {expandedComments[post._id] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-6 space-y-4 border-t border-glass pt-6">
                              {/* Comment Input */}
                              <div className="flex gap-4">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sensai-primary/10 text-sensai-primary">
                                  <UserIcon size={14} />
                                </div>
                                <div className="relative flex-1">
                                  <input 
                                    className="w-full rounded-xl bg-white/5 border border-glass p-3 pr-12 text-sm text-white outline-none focus:border-sensai-primary/30 transition-colors"
                                    placeholder="Write a comment..."
                                    value={commentTexts[post._id] || ""}
                                    onChange={(e) => setCommentTexts({ ...commentTexts, [post._id]: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                                  />
                                  <button 
                                    onClick={() => handleAddComment(post._id)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-sensai-primary hover:text-sensai-primary/80 transition-colors"
                                  >
                                    <Send size={16} />
                                  </button>
                                </div>
                              </div>

                              {/* Comment List */}
                              <div className="max-h-[300px] space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                                {post.comments?.length > 0 ? (
                                  post.comments.map((comment) => (
                                    <div key={comment._id} className="flex gap-4 group">
                                      {comment.user?.profilePic ? (
                                        <img src={comment.user.profilePic} className="h-8 w-8 rounded-full object-cover shrink-0" alt="" />
                                      ) : (
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sensai-primary/20 to-sensai-secondary/20 font-bold text-white text-[10px] shrink-0 border border-white/5">
                                          {comment.user?.name?.charAt(0) || "C"}
                                        </div>
                                      )}
                                      <div className="flex-1 rounded-2xl bg-white/5 p-4 group-hover:bg-white/[0.08] transition-colors">
                                        <div 
                                          className="mb-1 flex items-center justify-between cursor-pointer group/comment-author"
                                          onClick={() => handleContactUser(comment.user?._id)}
                                          title="Send direct message"
                                        >
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-xs font-bold text-white group-hover/comment-author:text-sensai-primary transition-colors">
                                              {comment.user?.name || "Founder"}
                                            </span>
                                            {renderRoleBadge(comment.user?.role)}
                                            <MessageCircle size={10} className="text-sensai-primary opacity-0 group-hover/comment-author:opacity-100 transition-opacity" />
                                          </div>
                                          <span className="text-[10px] text-sensai-muted">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                          </span>
                                        </div>
                                        <p className="text-sm leading-relaxed text-sensai-muted">
                                          {comment.text}
                                        </p>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="py-6 text-center">
                                    <p className="text-sm text-sensai-muted italic">No comments yet. Start the conversation!</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ));
              })()}
            </div>
          )}
        </section>

        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="glass sticky top-40 p-8">
            <h3 className="mb-6 text-xl font-bold text-white uppercase tracking-widest">
              Trending Topics
            </h3>
            <div className="flex flex-col gap-4">
              {[
                "#Bootstrapping",
                "#OpenAI",
                "#MarketValidation",
                "#Funding2024",
                "#SaaSMetrics",
              ].map((tag) => (
                <a
                  key={tag}
                  href="#"
                  className="text-[0.95rem] font-medium text-sensai-secondary no-underline transition-opacity hover:opacity-80"
                >
                  {tag}
                </a>
              ))}
            </div>

            <div className="mt-10 rounded-2xl bg-sensai-primary/10 p-6 border border-sensai-primary/20">
              <h4 className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-sensai-primary">
                Sensai Challenge
              </h4>
              <p className="text-sm leading-relaxed text-sensai-muted">
                "Post your 30-second elevator pitch and get feedback from 3
                verified mentors this week."
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass relative w-full max-w-[600px] p-8 md:p-12"
            >
              <button
                onClick={() => setShowCreate(false)}
                className="absolute right-6 top-6 border-none bg-transparent text-sensai-muted transition-colors hover:text-white"
              >
                <X size={24} />
              </button>

              <h2 className="mb-8 text-3xl font-bold text-white">
                Create Discussion
              </h2>

              <form onSubmit={handleCreatePost} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold uppercase tracking-widest text-sensai-muted">
                    Topic Title
                  </label>
                  <input
                    className="input-field"
                    placeholder="What's on your mind?"
                    value={newPost.title}
                    onChange={(e) =>
                      setNewPost({ ...newPost, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold uppercase tracking-widest text-sensai-muted">
                    Category
                  </label>
                  <select
                    className="input-field cursor-pointer pr-10"
                    value={newPost.category}
                    onChange={(e) =>
                      setNewPost({ ...newPost, category: e.target.value })
                    }
                  >
                    <option>General</option>
                    <option>Idea Validation</option>
                    <option>Tech Stack</option>
                    <option>Funding</option>
                    <option>Market Entry</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold uppercase tracking-widest text-sensai-muted">
                    Content
                  </label>
                  <textarea
                    className="input-field min-h-[150px] resize-none"
                    placeholder="Share your thoughts with the community..."
                    value={newPost.content}
                    onChange={(e) =>
                      setNewPost({ ...newPost, content: e.target.value })
                    }
                    required
                  />
                </div>

                <button type="submit" className="btn-primary mt-4">
                  Post Discussion <Send size={18} className="ml-2" />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/80 p-6 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass relative w-full max-w-[400px] border-red-500/20 p-8 text-center"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500 ring-8 ring-red-500/5">
                <AlertCircle size={32} />
              </div>

              <h3 className="mb-2 text-2xl font-bold text-white">
                Delete Post?
              </h3>
              <p className="mb-8 text-sensai-muted">
                This action cannot be undone. Are you sure you want to remove
                this discussion?
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="glass flex-1 border-none py-3 font-bold text-white transition-opacity hover:opacity-80"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 rounded-xl bg-red-500 py-3 font-bold text-white transition-all hover:bg-red-600 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Forum;
