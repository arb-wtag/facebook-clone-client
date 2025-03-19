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
        <div className="bg-white shadow-md rounded-lg p-4 w-full">
            <h2 className="text-xl font-semibold mb-4">Home</h2>
            {posts.length === 0 ? (
                <p className="text-gray-500">No posts available</p>
            ) : (
                posts.map((post) => (
                    <div key={post.id} className="border p-4 rounded-md shadow-md mb-4">
                        <p className="text-sm text-gray-500">By {post.username} | {new Date(post.created_at).toLocaleString()}</p>
                        <p className="text-gray-800">{post.content}</p>
                        {post.image && <img src={`http://localhost:5000${post.image}`} alt="Post" className="w-full object-cover rounded-md mt-2" />}
                        <div className="flex justify-between mt-3">
                            {!userLiked[post.id] ? (
                                <button onClick={() => handleLike(post.id)} className="text-blue-500">👍 Like {likes[post.id] || 0}</button>
                            ) : (
                                <button onClick={() => handleUnlike(post.id)} className="text-red-500">👎 Unlike {likes[post.id] || 0}</button>
                            )}
                        </div>
                        <div className="mt-3">
                            <input type="text" placeholder="Write a comment..." value={newComment[post.id] || ""} onChange={(e) => handleCommentChange(post.id, e.target.value)} className="border rounded p-2 w-full" />
                            <button onClick={() => handleComment(post.id)} className="bg-blue-500 text-white px-3 py-1 mt-2 rounded">Comment</button>
                        </div>
                        <ul className="space-y-2 mt-3">
                            {comments[post.id]?.length > 0 ? (
                                comments[post.id].map((comment) => (
                                    <li key={comment.id} className="p-2 bg-white border rounded">
                                        <span className="font-semibold">{comment.username}: </span>{comment.content}
                                    </li>
                                ))
                            ) : (
                                <p className="text-gray-500">No comments yet.</p>
                            )}
                        </ul>
                    </div>
                ))
            )}
        </div>
    );
}
