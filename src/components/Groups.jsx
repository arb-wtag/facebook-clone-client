import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from './AuthProvider'
import { toast } from 'react-toastify';
import axios from 'axios';

export default function Groups() {
    const { user }=useContext(AuthContext);
    const [groups,setGroups]=useState([]);
    const [myGroups, setMyGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groupPosts, setGroupPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState("");
    const [name,setName]=useState("");
    const [description,setDescription]=useState("");
    const [groupMembers, setGroupMembers] = useState([]);
    const [loading,setLoading]=useState(false);

    const fetchGroups=async ()=>{
        try{
            const response=await axios.get('http://localhost:5000/api/groups',{withCredentials:true});
            setGroups(response.data);
        }
        catch(error){
            console.error('Failed to load groups');
        }
    };

    const fetchMyGroups = async ()=>{
        try {
          const response = await axios.get("http://localhost:5000/api/groups/my-groups", { withCredentials: true });
          setMyGroups(response.data);
        } catch (error) {
          console.error("Failed to load user groups");
        }
    };

    const fetchGroupPosts = async (groupId) => {
      try {
        const res = await axios.get(`http://localhost:5000/api/groups/${groupId}/posts`, { withCredentials: true });
        //console.log(res.data);
        setGroupPosts(res.data);
      } catch (error) {
      toast.error("Failed to load group posts");
      }
    };

    const handleCreatePost = async (event) => {
      event.preventDefault();
      if (!newPostContent) return toast.error("Post content cannot be empty");
      if (!selectedGroup) return toast.error("Select a group first");

      try {
        setLoading(true);
        await axios.post(`http://localhost:5000/api/groups/${selectedGroup.id}/posts`, { content: newPostContent }, { withCredentials: true });
        toast.success("Post created!");
        setNewPostContent("");
        fetchGroupPosts(selectedGroup.id);
      } catch (error) {
        toast.error("Failed to create post");
      } finally {
        setLoading(false);
      }
    };

    const handleDeletePost = async (postId) => {
      try {
        await axios.delete(`http://localhost:5000/api/groups/${selectedGroup.id}/posts/${postId}`, { withCredentials: true });
        toast.success("Post deleted!");
        fetchGroupPosts(selectedGroup.id);
      } catch (error) {
        toast.error("Failed to delete post");
      }
    };

    const handleSelectGroup = (group) => {
      setSelectedGroup(group);
      fetchGroupPosts(group.id);
    };

    useEffect(()=>{
        fetchGroups();
        if (user) fetchMyGroups();
    },[user]);

    const handleCreateGroup=async (event)=>{
        event.preventDefault();
        if(!name) return toast.error("Group name is required");
        try{
            setLoading(true);
            await axios.post('http://localhost:5000/api/groups',{ name,description },{ withCredentials:true });
            toast.success("Group created!");
            setName("");
            setDescription("");
            fetchGroups();
            fetchMyGroups();
        }
        catch(error)
        {
            toast.error("Failed to create group");
        }
        finally {
            setLoading(false);
        }
    };

    const handleJoinGroup=async (groupId)=>{
        try{
            await axios.post(`http://localhost:5000/api/groups/${groupId}/join`,{},{withCredentials:true});
            toast.success("Joined group!");
            fetchGroups();
            fetchMyGroups();
        }
        catch(error){
            toast.error("Failed to join group");
        }
    }

    const handleLeaveGroup=async (groupId)=>{
        try{
            await axios.post(`http://localhost:5000/api/groups/${groupId}/leave`,{},{withCredentials:true});
            toast.success("Left group!");
            fetchGroups();
            fetchMyGroups();
        }
        catch(error){
            toast.error("Failed to leave group");
        }
    }

    const fetchGroupMembers = async (groupId) => {
      try {
          setLoading(true);
          const res = await axios.get(`http://localhost:5000/api/groups/${groupId}/members`, { withCredentials: true });
          setGroupMembers(res.data);
      } 
      catch (error) {
          toast.error("Failed to load group members");
      }
      finally{
        setLoading(false);
      }
    };
  
    const changeUserRole = async (groupId, userId, newRole) => {
      try {
          await axios.put(`http://localhost:5000/api/groups/${groupId}/role/${userId}`, { role: newRole }, { withCredentials: true });
          toast.success("User role updated");
          fetchGroupMembers(groupId);
      } 
      catch (error) {
          toast.error("Failed to update user role");
      }
    };  

    const handleDeleteGroup = async (groupId) => {
        try {
          await axios.delete(`http://localhost:5000/api/groups/${groupId}`, { withCredentials: true });
          toast.success("Group deleted!");
          fetchGroups();
          fetchMyGroups();
        } catch (error) {
          toast.error("Failed to delete group");
        }
    };

    useEffect(() => {
      if (selectedGroup) fetchGroupMembers(selectedGroup.id);
    }, [selectedGroup]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Groups</h1>

      {user && (
        <div className="card bg-base-100 shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create a Group</h2>
          <form onSubmit={handleCreateGroup} className="space-y-3">
            <input type="text" placeholder="Group Name" className="input input-bordered w-full"
              value={name} onChange={(e) => setName(e.target.value)} />
            <textarea placeholder="Group Description" className="textarea textarea-bordered w-full"
              value={description} onChange={(e) => setDescription(e.target.value)} />
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Group"}
            </button>
          </form>
        </div>
      )}

<h2 className="text-2xl font-semibold mb-4">All Groups</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <div key={group.id} className="card bg-base-100 shadow-md p-4">
            <h3 className="text-xl font-semibold">{group.name}</h3>
            <p className="text-gray-600">{group.description}</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => handleJoinGroup(group.id)} className="btn btn-success">Join</button>
              {user?.id === group.admin_id && (
                <button onClick={() => handleDeleteGroup(group.id)} className="btn btn-warning">Delete</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {user && myGroups.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">My Groups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myGroups.map((group) => (
              <div key={group.id} className="card bg-base-100 shadow-md p-4">
                <h3 className="text-xl font-semibold">{group.name}</h3>
                <p className="text-gray-600">{group.description}</p>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => handleSelectGroup(group)} className="btn btn-info">View Posts</button>
                  {/* <button onClick={() => fetchGroupPosts(group.id)} className="btn btn-primary">Refresh</button> */}
                  <button onClick={() => handleLeaveGroup(group.id)} className="btn btn-primary">Leave</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedGroup && (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">Posts in {selectedGroup.name}</h2>

          <form onSubmit={handleCreatePost} className="mb-4 space-y-3">
            <textarea placeholder="Write something..." className="textarea textarea-bordered w-full"
              value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} />
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? "Posting..." : "Post"}
            </button>
          </form>

          {groupPosts.length > 0 ? (
            <div className="space-y-4">
              {groupPosts.map((post) => (
                <div key={post.id} className="card bg-base-100 shadow-md p-4">
                  <p className="text-gray-800">{post.content}</p>
                  <p className="text-sm text-gray-500">By {post.username} | {new Date(post.created_at).toLocaleString()}</p>
                  {/* {console.log(user,selectedGroup)} */}
                  {(post.user_id === user.id || user.id === selectedGroup.admin_id) && (
                    <button onClick={() => handleDeletePost(post.id)} className="btn btn-error mt-2">Delete</button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No posts in this group yet.</p>
          )}
        </div>
      )}
      <div className="bg-white shadow-md rounded-lg p-4 w-full">
            <h2 className="text-xl font-semibold mb-4">Group Members</h2>

            {loading ? (
                <div className="text-center text-gray-500">Loading members...</div>
            ) : (
                <ul className="space-y-3">
                    {groupMembers.length === 0 ? (
                        <p className="text-gray-500">No members in this group.</p>
                    ) : (
                        groupMembers.map((member) => (
                            <li key={member.id} className="flex justify-between items-center p-3 bg-gray-100 rounded-md">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={member.photo}
                                        alt={member.username}
                                        className="w-10 h-10 rounded-full"
                                    />
                                    <div>
                                        <p className="font-medium">{member.username}</p>
                                        <p className="text-sm text-gray-600">{member.role}</p>
                                    </div>
                                </div>

                                
                                {selectedGroup.admin_id === member.id ? (
                                    <span className="text-green-600 font-semibold">Admin</span>
                                ) : (
                                    <select
                                        className="border p-2 rounded-md"
                                        value={member.role}
                                        onChange={(e) => changeUserRole(selectedGroup.id, member.id, e.target.value)}
                                    >
                                        <option value="member">Member</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                )}
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    </div>
  )
}
