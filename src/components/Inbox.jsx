import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthProvider";
import { io } from "socket.io-client";

export default function Inbox() {
    const { user } = useContext(AuthContext);
    const [conversations, setConversations] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    const socket = io("http://localhost:5000", { withCredentials: true });

    // Fetch user's conversations
    useEffect(() => {
        if (user?.id) {
            fetchConversations();
        }
    }, [user]);

    const fetchConversations = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/inbox/conversation", { withCredentials: true });
            setConversations(res.data);
        } catch (error) {
            console.error("Error fetching conversations", error);
        }
    };

    // Fetch messages when a conversation is selected
    const fetchMessages = async (receiverId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/inbox/conversation/${receiverId}`, { withCredentials: true });
            setMessages(res.data);
            setSelectedChat(receiverId);
        } catch (error) {
            console.error("Error fetching messages", error);
        }
    };

    // Send a message
    const sendMessage = async () => {
        if (!newMessage.trim()) return;
        try {
            const res = await axios.post(
                `http://localhost:5000/api/inbox/send`,
                { content: newMessage, receiver_id: selectedChat },
                { withCredentials: true }
            );
            socket.emit("sendMessage", res.data);
            setMessages([...messages, res.data]);
            setNewMessage("");
        } catch (error) {
            console.error("Error sending message", error);
        }
    };

    // Listen for new messages via socket
    useEffect(() => {
        socket.on("receiveMessage", (message) => {
            if (message.sender_id === selectedChat || message.receiver_id === selectedChat) {
                setMessages((prev) => [...prev, message]);
            }
        });

        return () => socket.off("receiveMessage");
    }, [socket, selectedChat]);

    // Search users by username
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

    // Start a new chat when clicking on a searched user
    const startNewChat = async (receiverId) => {
        try {
            const res = await axios.post(
                `http://localhost:5000/api/inbox/conversation/${receiverId}`,
                { senderId: user.id, receiverId },
                { withCredentials: true }
            );
            fetchConversations();
            setSelectedChat(receiverId);
            setSearchResults([]);
            setSearchTerm("");
        } catch (error) {
            console.error("Error starting conversation", error);
        }
    };

    return (
        <div className="flex">
            <div className="w-1/3 border-r p-4">
                <h2 className="text-lg font-bold">Inbox</h2>

                <div className="my-2">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border p-2 w-full rounded"
                    />
                    <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded mt-2 w-full">
                        Search
                    </button>
                </div>

                <ul className="mt-2">
                    {searchResults.map((user) => (
                        <li key={user.id} onClick={() => startNewChat(user.id)} className="cursor-pointer p-2 hover:bg-gray-200 rounded">
                            {user.username}
                        </li>
                    ))}
                </ul>

                <ul className="mt-4">
                    {console.log(conversations)}
                    {conversations.map((chat) => (
                        <li key={chat.id} onClick={() => fetchMessages(chat.id)} className="cursor-pointer p-2 hover:bg-gray-200 rounded">
                            <img src={chat.photo} alt="Profile" className="w-8 h-8 rounded-full inline-block mr-2" />
                            {chat.username}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="w-2/3 p-4">
                {selectedChat ? (
                    <>
                        <div className="border p-4 h-96 overflow-y-auto">
                            {/* {console.log(messages)} */}
                            {messages.map((msg) =>{
                                let sender = conversations.find(c => c.id === msg.sender_id);
                                console.log(sender);
                                if(!sender)
                                {
                                    sender=user;
                                }
                            return (
                                <div key={msg.id} className={`p-2 my-1 rounded ${msg.sender_id === user.id ? "bg-blue-200" : "bg-gray-200"}`}>
                                    <strong className={`${msg.sender_id === user.id ? "text-red-500" : "text-blue-500"}`}>{sender?.username} : </strong>{msg.content}
                                </div>
                            );
                            })}
                        </div>
                        <div className="mt-2 flex">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="border p-2 w-full rounded"
                                placeholder="Type a message..."
                            />
                            <button onClick={sendMessage} className="bg-green-500 text-white px-4 py-2 rounded ml-2">
                                Send
                            </button>
                        </div>
                    </>
                ) : (
                    <p>Select a conversation to start chatting</p>
                )}
            </div>
        </div>
    );
}
