import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from 'react-toastify';

const Friend = () => {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    async function fetchData() {
        await fetchFriends();
        await fetchPendingRequests();   
    }
    fetchData();
  }, []);

  const fetchFriends = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/friends/my-friends", {withCredentials:true});
      setFriends(res.data);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/friends/pending", {withCredentials:true});
      setPendingRequests(res.data);
      console.log(pendingRequests);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    }
  };

  const sendFriendRequest = async (friendId) => {
    try {
      await axios.post(`http://localhost:5000/api/friends/request/${friendId}`, {}, {withCredentials:true});
      fetchPendingRequests();
      toast.success('Friend Request Sent');
    } 
    catch (error) 
    {
      toast.error("Error sending friend request");
    }
  };

  const acceptFriendRequest = async (friendId) => {
    try {
      await axios.put(`http://localhost:5000/api/friends/accept/${friendId}`, {}, {
        withCredentials:true
      });
      setPendingRequests((prev) => prev.filter((req) => req.id !== friendId));
      const acceptedFriend = pendingRequests.find((req) => req.id === friendId);
      if (acceptedFriend) {
          setFriends((prev) => [...prev, acceptedFriend]);
        }
      await fetchFriends();
      await fetchPendingRequests();
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const declineFriendRequest = async (friendId) => {
    try {
      await axios.put(`http://localhost:5000/api/friends/decline/${friendId}`, {}, {withCredentials:true});
      setPendingRequests((prev) => prev.filter((req) => req.id !== friendId));
      await fetchPendingRequests();
    } catch (error) {
      console.error("Error declining friend request:", error);
    }
  };

  const removeFriend = async (friendId) => {
    try {
      await axios.delete(`http://localhost:5000/api/friends/remove/${friendId}`, {withCredentials:true});
      await fetchFriends();
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
        const res = await axios.get(`http://localhost:5000/api/inbox/search?username=${searchQuery}`, { withCredentials: true });
        //console.log(res.data);
        setSearchResults(res.data);
    } catch (error) {
        console.error("Error searching users:", error);
    }
};

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="mb-4">
        <input
          type="text"
          placeholder="Search for users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded-lg"
        />
        <button
          onClick={handleSearch}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          Search
        </button>
      </div>

      {searchResults.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2">Search Results</h2>
          <ul>
            {searchResults.map((user) => (
              <li key={user.id} className="flex justify-between items-center p-2 border-b">
                <div className="flex items-center">
                  <img src={user.photo} alt={user.username} className="w-10 h-10 rounded-full mr-2" />
                  <span>{user.username}</span>
                </div>
                <button
                  onClick={() => sendFriendRequest(user.id)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Add Friend
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <h2 className="text-xl font-bold mb-4">Friends List</h2>
      <ul>
        {friends.map((friend) => (
          <li key={friend.id} className="flex justify-between items-center p-2 border-b">
            <div className="flex items-center">
              <img src={friend.photo} alt={friend.username} className="w-10 h-10 rounded-full mr-2" />
              <span>{friend.username}</span>
            </div>
            <button
              onClick={() => removeFriend(friend.id)}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-bold mt-6 mb-4">Pending Requests</h2>
      <ul>
        {pendingRequests.map((request) => (
          <li key={request.id} className="flex justify-between items-center p-2 border-b">
            <div className="flex items-center">
              <img src={request.photo} alt={request.username} className="w-10 h-10 rounded-full mr-2" />
              <span>{request.username}</span>
            </div>
            <div>
              <button
                onClick={() => acceptFriendRequest(request.id)}
                className="bg-green-500 text-white px-3 py-1 rounded mr-2"
              >
                Accept
              </button>
              <button
                onClick={() => declineFriendRequest(request.id)}
                className="bg-gray-500 text-white px-3 py-1 rounded"
              >
                Decline
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Friend;
