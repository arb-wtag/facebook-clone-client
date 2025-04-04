import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from './AuthProvider'
import { toast } from 'react-toastify';
import axios from 'axios';

export default function Groups() {
  const { user } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupPosts, setGroupPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [groupMembers, setGroupMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchGroups = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/groups', { withCredentials: true });
      setGroups(response.data);
    }
    catch (error) {
      console.error('Failed to load groups');
    }
  };

  const fetchMyGroups = async () => {
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
    fetchGroupMembers(group.id);
    setModalOpen(true);
  };

  useEffect(() => {
    fetchGroups();
    if (user) fetchMyGroups();
  }, [user]);

  const handleCreateGroup = async (event) => {
    event.preventDefault();
    if (!name) return toast.error("Group name is required");
    try {
      setLoading(true);
      await axios.post('http://localhost:5000/api/groups', { name, description }, { withCredentials: true });
      toast.success("Group created!");
      setName("");
      setDescription("");
      fetchGroups();
      fetchMyGroups();
    }
    catch (error) {
      toast.error("Failed to create group");
    }
    finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await axios.post(`http://localhost:5000/api/groups/${groupId}/join`, {}, { withCredentials: true });
      toast.success("Joined group!");
      fetchGroups();
      fetchMyGroups();
    }
    catch (error) {
      toast.error("Failed to join group");
    }
  }

  const handleLeaveGroup = async (groupId) => {
    try {
      await axios.post(`http://localhost:5000/api/groups/${groupId}/leave`, {}, { withCredentials: true });
      toast.success("Left group!");
      fetchGroups();
      fetchMyGroups();
    }
    catch (error) {
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
    finally {
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

  const handleSearch = async () => {
    if (!searchTerm) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/inbox/search?username=${searchTerm}`, { withCredentials: true });
      //console.log(res.data);
      setSearchResults(res.data);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleInvite = async (userId) => {
    try {
      await axios.post(`http://localhost:5000/api/groups/${selectedGroup.id}/invite`, { receiverId: userId }, { withCredentials: true });
      toast.success("Invitation sent!");
    } catch (error) {
      toast.error("Failed to send invitation");
    }
  };

  const fetchInvitations = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/groups/invitations", { withCredentials: true });
      setInvitations(res.data);
    } catch (error) {
      toast.error("Failed to load invitations");
    }
  };

  const handleAcceptInvite = async (inviteId) => {
    try {
      await axios.post(`http://localhost:5000/api/groups/invitations/${inviteId}/accept`, {}, { withCredentials: true });
      toast.success("Joined the group!");
      fetchInvitations();
    } catch (error) {
      toast.error("Failed to accept invitation");
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

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

      <div className="mt-6">
        <h2 className="text-xl font-semibold">Pending Group Invitations</h2>
        {invitations.length > 0 ? (
          <ul className="space-y-2">
            {invitations.map(invite => (
              <li key={invite.id} className="flex justify-between items-center p-2 bg-gray-100 rounded-md">
                <p>Invited to <strong>{invite.group_name}</strong> by {invite.sender_name}</p>
                <button onClick={() => handleAcceptInvite(invite.id)} className="btn btn-success">Accept</button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No pending invitations</p>
        )}
      </div>

      {modalOpen && selectedGroup && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-5xl">
            <h2 className="text-2xl font-bold mb-4">{selectedGroup.name}</h2>
            <p className="text-gray-600 mb-4">{selectedGroup.description}</p>

            <div className="mt-6">
              <h2 className="text-2xl font-semibold mb-4">Posts in {selectedGroup.name}</h2>

              <form onSubmit={handleCreatePost} className="mb-4 space-y-3">
                <textarea placeholder="Write something..." className="textarea textarea-bordered w-full"
                  value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} />
                <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                  {loading ? "Posting..." : "Post"}
                </button>
              </form>
            </div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Invite Users</h2>
              <input
                type="text"
                placeholder="Search user by username"
                className="input input-bordered w-full mt-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button onClick={handleSearch} className="btn btn-primary mt-2">Search</button>

              {searchResults.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {searchResults.map(user => (
                    <li key={user.id} className="flex justify-between items-center p-2 bg-gray-100 rounded-md">
                      <div className="flex items-center gap-2">
                        <img src={user.photo} alt={user.username} className="w-8 h-8 rounded-full" />
                        <p>{user.username}</p>
                      </div>
                      <button onClick={() => handleInvite(user.id)} className="btn btn-success">Invite</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-semibold">Posts</h3>
              {groupPosts.length > 0 ? (
                <ul className="space-y-3">
                  {groupPosts.map((post) => (
                    <li key={post.id} className="p-3 bg-gray-100 rounded-md">
                      <p>{post.content}</p>
                      <p className="text-sm text-gray-500">By {post.username}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No posts in this group yet.</p>
              )}
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-semibold">Members</h3>
              {loading ? (
                <p className="text-gray-500">Loading members...</p>
              ) : (
                <ul className="space-y-3">
                  {groupMembers.map((member) => (
                    <li key={member.id} className="flex justify-between items-center p-3 bg-gray-100 rounded-md">
                      <p>{member.username}</p>
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
                  ))}
                </ul>
              )}
            </div>

            <div className="modal-action">
              <button onClick={() => setModalOpen(false)} className="btn btn-error">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
