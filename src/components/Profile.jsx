import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "./AuthProvider";

export default function Profile() {
    const { user }=useContext(AuthContext);
    //console.log(user);
    const userId=user?.id;
    const [profile, setProfile] = useState({});
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState("");
    const [newPostImage, setNewPostImage] = useState(null);
    const [likes, setLikes] = useState({});
    const [userLiked, setUserLiked] = useState({});
    const [comments, setComments] = useState({});
    const [newComment, setNewComment] = useState({});

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };
    
    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:5000/api/users/${userId}`, { withCredentials: true });
            setProfile(res.data);
            setUsername(res.data.username);
            setBio(res.data.bio);
        } catch (error) {
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            const formData = new FormData();
            formData.append("username", username);
            formData.append("bio", bio);
            if (selectedFile) formData.append("photo", selectedFile);
            await axios.put(`http://localhost:5000/api/users/${userId}`, formData, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success("Profile updated");
            fetchProfile();
        } catch (error) {
            toast.error("Failed to update profile");
        }
    };

    const fetchUserPosts = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/posts/user/${userId}`, { withCredentials: true });
            setUserPosts(res.data);
            console.log(res.data);
        } catch (error) {
            toast.error("Failed to load posts");
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            await axios.delete(`http://localhost:5000/api/posts/${postId}`, { withCredentials: true });
            toast.success("Post deleted!");
            fetchUserPosts();
        } catch (error) {
            toast.error("Failed to delete post");
        }
    };

    const handleCreatePost = async (event) => {
        event.preventDefault();
        if (!newPostContent) return toast.error("Post content cannot be empty");

        const formData = new FormData();
        formData.append("content", newPostContent);
        if (newPostImage) {
            formData.append("image", newPostImage);
        }

        try {
            await axios.post("http://localhost:5000/api/posts", formData, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success("Post created!");
            setNewPostContent("");
            setNewPostImage(null);
            fetchUserPosts();
        } catch (error) {
            toast.error("Failed to create post");
        }
    };

    const fetchLikes = async (postId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/likes/${postId}`,{withCredentials:true});
            setLikes(prevLikes => ({
                ...prevLikes,
                [postId]: res.data.likes
            }));
            setUserLiked(prevUserLiked => ({
                ...prevUserLiked,
                [postId]: res.data.userLiked 
            }));
        } catch (error) {
            toast.error("Failed to load likes");
        }
    };

    const fetchComments = async (postId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/comments/${postId}`);
            setComments(prevComments => ({
                ...prevComments,
                [postId]: res.data
            }));
        } catch (error) {
            toast.error("Failed to load comments");
        }
    };

    const handleUnlike=async (postId)=>{
        try{
            const isLiked = userLiked[postId];
            await axios.delete(`http://localhost:5000/api/likes/${postId}`, { withCredentials: true });
            setLikes(prevLikes => ({
                ...prevLikes,
                [postId]: prevLikes[postId] - 1
            }));
            setUserLiked(prevUserLiked => ({
                ...prevUserLiked,
                [postId]: !isLiked
            }));
        }
        catch(error)
        {
            toast.error("Failed to unlike post");
        }
    }

    const handleLike = async (postId) => {
        try {
            const isLiked = userLiked[postId];
            await axios.post(`http://localhost:5000/api/likes/${postId}`, {}, { withCredentials: true });
            //await axios.post(`http://localhost:5000/api/likes/${postId}`, {}, { withCredentials: true });
            setLikes(prevLikes => ({
                ...prevLikes,
                [postId]: (prevLikes[postId] || 0) + 1
            }));
            fetchLikes(postId);
            setUserLiked(prevUserLiked => ({
                ...prevUserLiked,
                [postId]: !isLiked
            }));
            //toast.success("Liked!");
        } catch (error) {
            toast.error("Failed to like post");
        }
    };

    const handleCommentChange = (postId, text) => {
        setNewComment(prevNewComment => ({
            ...prevNewComment,
            [postId]: text
        }));
    };

    const handleComment = async (postId) => {
        if (!newComment[postId]) return toast.error("Comment cannot be empty");

        try {
            await axios.post(`http://localhost:5000/api/comments/${postId}`, { content: newComment[postId] }, { withCredentials: true });
            fetchComments(postId);
            setNewComment(prevNewComment => ({
                ...prevNewComment,
                [postId]: ""
            }));
            toast.success("Comment added!");
        } catch (error) {
            toast.error("Failed to add comment");
        }
    };

    useEffect(() => {
        userPosts.forEach((post) => {
            fetchLikes(post.id);
            fetchComments(post.id);
        });
    }, [userPosts]);

    useEffect(() => {
        if(userId)
        {
            fetchProfile();
            fetchUserPosts();
        }
    }, [userId]);  
  return (
    <div className="bg-white shadow-md rounded-lg p-4 w-full">
            <h2 className="text-xl font-semibold mb-4">Profile</h2>

            {loading ? (
                <p className="text-gray-500">Loading profile...</p>
            ) : (
                <div className="space-y-4">
                    {console.log(profile)}
                    <img src={profile.photo} alt="Profile" className="w-24 h-24 rounded-full mx-auto" />
                    <div>
                        <p>Username: {username}</p>
                        <p>Email: {profile.email}</p>
                        <p>Bio: {bio}</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-medium">Username:</label>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="border p-2 rounded-md w-full" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-medium">Bio:</label>
                        <textarea value={bio || ''} onChange={(e) => setBio(e.target.value)} className="border p-2 rounded-md w-full"></textarea>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-medium">Change Profile Picture:</label>
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            className="border p-2 rounded-md w-full"
                        />
                    </div>

                    <button onClick={handleUpdateProfile} className="bg-blue-500 text-white px-4 py-2 rounded-md w-full">
                        Save Changes
                    </button>
                </div>
            )}

            <h2 className="text-xl font-semibold mt-6">Create Post</h2>
            <form onSubmit={handleCreatePost} className="space-y-4 mt-4 border p-4 rounded-md shadow-md">
                <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="border p-2 rounded-md w-full"
                    placeholder="Write something..."
                ></textarea>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewPostImage(e.target.files[0])}
                    className="border p-2 rounded-md w-full"
                />
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-md w-full">
                    Post
                </button>
            </form>

            <h2 className="text-xl font-semibold mt-6">Your Posts</h2>
            <div className="space-y-4 mt-4">
                {userPosts.length === 0 ? (
                    <p className="text-gray-500">No posts yet</p>
                ) : (
                    userPosts.map((post) => (
                        <div key={post.id} className="border p-4 rounded-md shadow-md">
                            {
                                post.group_id && (
                                    <div>
                                        <p className="font-bold">Group Post</p>
                                        <p>Group Name: {post.group_name}</p>
                                    </div>
                                )
                            }
                            <p className="text-gray-800">{post.content}</p>
                            {post.image && (
                                <img src={`http://localhost:5000${post.image}`} alt="Post" className="w-full object-cover rounded-md mt-2" />
                            )}
                            <div className="flex justify-between mt-3">
                                {/* <button onClick={()=>handleLike(post.id)} className="text-blue-500">👍 {likes[post.id] || 0} Likes</button> */}
                                {!userLiked[post.id] ? (
                                     <button 
                                        onClick={() => handleLike(post.id)} 
                                        className="text-blue-500">
                                            👍 Like {likes[post.id] || 0}
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleUnlike(post.id)} 
                                        className="text-red-500">
                                            👎 Unlike {likes[post.id] || 0}
                                        </button>
                                )}
                                <button onClick={() => handleDeletePost(post.id)} className="bg-red-500 text-white px-3 py-1 rounded-md mt-2">
                                    Delete
                                </button>
                            </div>
                            <div className="mt-3">
                                <input 
                                    type="text" 
                                    placeholder="Write a comment..." 
                                    value={newComment[post.id] || ""} 
                                    onChange={(e) => handleCommentChange(post.id, e.target.value)} 
                                    className="border rounded p-2 w-full"
                                />
                                <button onClick={()=>handleComment(post.id)} className="bg-blue-500 text-white px-3 py-1 mt-2 rounded">Comment</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
    </div>
  )
}
