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
    const [newPostImages, setNewPostImages] = useState([]);
    const [likes, setLikes] = useState({});
    const [userLiked, setUserLiked] = useState({});
    const [comments, setComments] = useState({});
    const [newComment, setNewComment] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);

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
            setIsModalOpen(false);
        } catch (error) {
            toast.error("Failed to update profile");
        }
    };

    const fetchUserPosts = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/posts/user/${userId}`, { withCredentials: true });
            const personalPosts = res.data.filter(post => !post.group_id);
            //console.log(personalPosts);
            setUserPosts(personalPosts);
            //console.log(res.data);
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
        if(newPostContent.length>500) return toast.error("Post content cannot exceed 500 characters");
        if (newPostImages.length > 5) return toast.error("You can upload up to 5 images only");

        const formData = new FormData();
        formData.append("content", newPostContent);
        if (newPostImages.length) {
            Array.from(newPostImages).forEach((image) => {
                formData.append("images", image); 
            });
        }

        try {
            await axios.post("http://localhost:5000/api/posts", formData, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success("Post created!");
            setNewPostContent("");
            setNewPostImages([]);
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
            <h2 className="text-3xl font-semibold mb-4 text-center">Profile</h2>

            {loading ? (
                <p className="text-gray-500">Loading profile...</p>
            ) : (
                <div className="space-y-4">
                    {/* {console.log(profile)} */}
                    <img src={profile.photo} alt="Profile" className="w-24 h-24 rounded-full mx-auto" />
                    <div className="flex flex-col items-center">
                        <p>Bio: {bio}</p>
                        <p className="font-bold text-2xl">Username: {username}</p>
                        <p>Email: {profile.email}</p>
                        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
                            Edit Profile
                        </button>
                    </div>

                    {/* <div className="flex flex-col gap-2">
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
                    </button> */}
                </div>
            )}

{isModalOpen && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Edit Profile</h3>
                        <div className="mt-4 space-y-3">
                            <label className="block font-medium">Username:</label>
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="input input-bordered w-full" />

                            <label className="block font-medium">Bio:</label>
                            <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="textarea textarea-bordered w-full"></textarea>

                            <label className="block font-medium">Change Profile Picture:</label>
                            <input type="file" accept="image/*" onChange={handleFileChange} className="file-input file-input-bordered w-full" />
                        </div>

                        <div className="modal-action">
                            <button onClick={handleUpdateProfile} className="btn btn-success">Save Changes</button>
                            <button onClick={() => setIsModalOpen(false)} className="btn">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

<h2 className="text-3xl font-bold mt-6 text-center text-primary">Create Post</h2>
<form onSubmit={handleCreatePost} className="card bg-base-100 shadow-xl p-6 mt-4">
    <div className="form-control">
        <textarea
            value={newPostContent}
            onChange={(e) => {
                if (e.target.value.length <= 500) {
                    setNewPostContent(e.target.value);
                }
            }}
            maxLength={500}
            className="textarea textarea-bordered h-24 w-full"
            placeholder="What's on your mind?"
        ></textarea>
        <p className="text-right text-sm text-gray-500 mt-2">
            {500 - newPostContent.length} characters remaining
        </p>
    </div>
    <div className="form-control mt-3">
        <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setNewPostImages(e.target.files)}
            className="file-input file-input-bordered w-full"
        />
    </div>
    <div className="mt-4">
        <button type="submit" className="btn btn-primary w-full">
            Post
        </button>
    </div>
</form>

<h2 className="text-2xl font-bold mt-6 text-primary">Your Posts</h2>
<div className="space-y-4 mt-4">
    {userPosts.length === 0 ? (
        <p className="text-gray-500 text-center">No posts yet</p>
    ) : (
        userPosts.map((post) => (
            <div key={post.id} className="card bg-base-100 shadow-xl p-6">
                <div className="card-body">
                    <p className="text-sm text-gray-500">
                        By <span className="font-semibold">{post.username}</span> | {new Date(post.created_at).toLocaleString()}
                    </p>

                    {/*post.group_id && (
                        <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md">
                            <p className="font-bold">Group Post</p>
                            <p>Group Name: {post.group_name}</p>
                        </div>
                    )*/}

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

                    <div className="card-actions justify-between mt-3">
                        {!userLiked[post.id] ? (
                            <button
                                onClick={() => handleLike(post.id)}
                                className="btn btn-outline btn-primary"
                            >
                                👍 Like {likes[post.id] || 0}
                            </button>
                        ) : (
                            <button
                                onClick={() => handleUnlike(post.id)}
                                className="btn btn-outline btn-error"
                            >
                                👎 Unlike {likes[post.id] || 0}
                            </button>
                        )}
                        <button
                            onClick={() => handleDeletePost(post.id)}
                            className="btn btn-error"
                        >
                            Delete
                        </button>
                    </div>

                    <div className="mt-3">
                        <input
                            type="text"
                            placeholder="Write a comment..."
                            value={newComment[post.id] || ""}
                            onChange={(e) => handleCommentChange(post.id, e.target.value)}
                            className="input input-bordered w-full"
                        />
                        <button
                            onClick={() => handleComment(post.id)}
                            className="btn btn-primary mt-2 w-full"
                        >
                            Comment
                        </button>
                    </div>

                    <ul className="space-y-2 mt-3">
                        {comments[post.id]?.length > 0 ? (
                            comments[post.id].map((comment) => (
                                <li key={comment.id} className="p-2 bg-base-200 border rounded flex justify-between items-center">
                                    <span>
                                        <span className="font-semibold">{comment.username}: </span>
                                        {comment.content}
                                    </span>
                                    {comment.user_id === userId && (
                                        <button
                                            onClick={() => handleDeleteComment(comment.id, post.id)}
                                            className="btn btn-sm btn-error"
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

    </div>
  )
}
