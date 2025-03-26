import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "./AuthProvider";

export default function Home() {
    const { user } = useContext(AuthContext);
    const userId = user?.id;
    const [posts, setPosts] = useState([]);
    const [likes, setLikes] = useState({});
    const [userLiked, setUserLiked] = useState({});
    const [comments, setComments] = useState({});
    const [newComment, setNewComment] = useState({});

    const fetchPosts = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/posts", { withCredentials: true });
            setPosts(res.data);
        } catch (error) {
            toast.error("Failed to load posts");
        }
    };

    const fetchLikes = async (postId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/likes/${postId}`, { withCredentials: true });
            setLikes((prev) => ({ ...prev, [postId]: res.data.likes }));
            setUserLiked((prev) => ({ ...prev, [postId]: res.data.userLiked }));
        } catch (error) {
            toast.error("Failed to load likes");
        }
    };

    const fetchComments = async (postId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/comments/${postId}`);
            setComments((prev) => ({ ...prev, [postId]: res.data }));
        } catch (error) {
            toast.error("Failed to load comments");
        }
    };

    const handleLike = async (postId) => {
        try {
            await axios.post(`http://localhost:5000/api/likes/${postId}`, {}, { withCredentials: true });
            fetchLikes(postId);
        } catch (error) {
            toast.error("Failed to like post");
        }
    };

    const handleUnlike = async (postId) => {
        try {
            await axios.delete(`http://localhost:5000/api/likes/${postId}`, { withCredentials: true });
            fetchLikes(postId);
        } catch (error) {
            toast.error("Failed to unlike post");
        }
    };

    const handleCommentChange = (postId, text) => {
        setNewComment((prev) => ({ ...prev, [postId]: text }));
    };

    const handleComment = async (postId) => {
        if (!newComment[postId]) return toast.error("Comment cannot be empty");

        try {
            await axios.post(`http://localhost:5000/api/comments/${postId}`, { content: newComment[postId] }, { withCredentials: true });
            fetchComments(postId);
            setNewComment((prev) => ({ ...prev, [postId]: "" }));
            toast.success("Comment added!");
        } catch (error) {
            toast.error("Failed to add comment");
        }
    };

    const handleDeleteComment = async (commentId, postId) => {
        try {
            await axios.delete(`http://localhost:5000/api/comments/${commentId}`, { withCredentials: true });
            toast.success("Comment deleted!");
            fetchComments(postId); 
        } catch (error) {
            toast.error("Failed to delete comment");
        }
    };
    

    useEffect(() => {
        fetchPosts();
    }, []);

    useEffect(() => {
        posts.forEach((post) => {
            fetchLikes(post.id);
            fetchComments(post.id);
        });
    }, [posts]);

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-6">Home</h2>

            {posts.length === 0 ? (
                <p className="text-gray-500 text-center">No posts available</p>
            ) : (
                posts.map((post) => (
                    <div key={post.id} className="card bg-base-100 shadow-xl mb-6">
                        <div className="card-body">
                            <p className="text-sm text-gray-500">
                                <span className="font-semibold">{post.username}</span> • {new Date(post.created_at).toLocaleString()}
                            </p>
                            <p className="text-gray-800">{post.content}</p>
                            {post.image && post.image.length > 0 && (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {post.image.map((single, index) => (
            <figure key={index} className="relative overflow-hidden rounded-md shadow-md">
                <img
                    src={single}
                    alt={`Post image ${index + 1}`}
                    className="w-full h-full object-cover"
                />
            </figure>
        ))}
    </div>
)}

                            {/* Like & Comment Buttons */}
                            <div className="flex justify-between mt-3">
                                {!userLiked[post.id] ? (
                                    <button onClick={() => handleLike(post.id)} className="btn btn-outline btn-primary">
                                        👍 Like {likes[post.id] || 0}
                                    </button>
                                ) : (
                                    <button onClick={() => handleUnlike(post.id)} className="btn btn-outline btn-error">
                                        👎 Unlike {likes[post.id] || 0}
                                    </button>
                                )}
                            </div>

                            {/* Comment Input */}
                            <div className="mt-3">
                                <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    value={newComment[post.id] || ""}
                                    onChange={(e) => handleCommentChange(post.id, e.target.value)}
                                    className="input input-bordered w-full"
                                />
                                <button onClick={() => handleComment(post.id)} className="btn btn-primary w-full mt-2">
                                    Comment
                                </button>
                            </div>

                            {/* Comments Section */}
                            <ul className="space-y-2 mt-3">
                                {comments[post.id]?.length > 0 ? (
                                    comments[post.id].map((comment) => (
                                        <li key={comment.id} className="p-2 bg-gray-100 rounded flex justify-between items-center">
                                            <span>
                                                <span className="font-semibold">{comment.username}: </span>
                                                {comment.content}
                                            </span>
                                            {comment.user_id === userId && (
                                                <button
                                                    onClick={() => handleDeleteComment(comment.id, post.id)}
                                                    className="btn btn-xs btn-error ml-2"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No comments yet.</p>
                                )}
                            </ul>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
