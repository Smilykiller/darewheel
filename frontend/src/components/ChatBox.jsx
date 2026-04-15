import React, { useState, useEffect, useRef } from 'react';
import { Send, Image as ImageIcon, Video, X, MessageSquare } from 'lucide-react';
import socket from '../socket';

const ChatBox = ({ roomCode, username }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);

  // Listen for incoming messages
  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });
    return () => socket.off('receive_message');
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Handle Text Sending
  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const messageData = {
      id: Date.now(),
      roomCode,
      username,
      text: inputText,
      mediaUrl: null,
      mediaType: null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    socket.emit('send_message', messageData);
    setInputText('');
  };

  // Handle Media Upload & 10-Second Validation
  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Validate Video Duration (Max 10 seconds)
    if (file.type.startsWith('video/')) {
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';
      videoElement.onloadedmetadata = async () => {
        window.URL.revokeObjectURL(videoElement.src);
        if (videoElement.duration > 11) { // 11 to give a 1-sec grace period
          alert("Videos must be 10 seconds or less to prove the dare!");
          return;
        }
        await uploadToCloud(file);
      };
      videoElement.src = URL.createObjectURL(file);
    } else {
      // It's an image, upload directly
      await uploadToCloud(file);
    }
  };

  // The actual upload function (Placeholder for your Cloud Storage)
  const uploadToCloud = async (file) => {
    setIsUploading(true);
    
    // 1. Your Cloudinary Credentials
    const cloudName = 'dhrbposqw'; // Put your actual Cloud Name here
    const uploadPreset = 'darewheel_media'; // The Unsigned preset you just created

    // 2. Cloudinary has different endpoints for images vs videos
    const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    // 3. Package the file for upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      // 4. Send directly to Cloudinary
      const response = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error.message);

      // 5. Success! data.secure_url is the permanent, live link.
      // Now we push THAT through the WebSocket to everyone else.
      const messageData = {
        id: Date.now(),
        roomCode,
        username,
        text: resourceType === 'video' ? "🎥 Uploaded Video Proof" : "📸 Uploaded Photo Proof",
        mediaUrl: data.secure_url, 
        mediaType: resourceType,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      socket.emit('send_message', messageData);

    } catch (error) {
      console.error("Cloudinary Upload Failed:", error);
      alert("Failed to upload media. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-4 bg-zentry-copper text-black rounded-full shadow-[0_0_20px_rgba(196,132,70,0.5)] hover:scale-110 transition-transform z-50"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Slide-out Chat Panel */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-black/90 backdrop-blur-xl border-l border-white/10 z-40 transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-white/5">
          <h3 className="font-black tracking-widest text-zentry-copper">PARTY CHAT</h3>
          <p className="text-xs font-mono text-gray-500 uppercase">Room: {roomCode}</p>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.username === username ? 'items-end' : 'items-start'}`}>
              <span className="text-xs font-mono text-gray-500 mb-1">{msg.username} • {msg.timestamp}</span>
              <div className={`p-3 rounded-lg max-w-[85%] ${msg.username === username ? 'bg-zentry-copper text-black rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'}`}>
                
                {/* Text Payload */}
                {msg.text && <p className={msg.mediaUrl ? "mb-2 font-bold text-sm" : ""}>{msg.text}</p>}
                
                {/* Media Payload */}
                {msg.mediaType === 'image' && <img src={msg.mediaUrl} alt="Dare proof" className="rounded-md max-h-48 object-cover" />}
                {msg.mediaType === 'video' && <video src={msg.mediaUrl} controls className="rounded-md max-h-48 object-cover" />}
              
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={sendMessage} className="p-4 bg-white/5 border-t border-white/10 flex gap-2 items-center">
          
          {/* Hidden File Input */}
          <input type="file" id="media-upload" accept="image/*,video/*" className="hidden" onChange={handleMediaUpload} disabled={isUploading} />
          
          <label htmlFor="media-upload" className="p-2 text-gray-400 hover:text-white cursor-pointer transition-colors">
            {isUploading ? <span className="animate-pulse">...</span> : <ImageIcon size={20} />}
          </label>

          <input 
            type="text" 
            value={inputText} 
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or upload proof..." 
            className="flex-1 bg-black border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-zentry-copper text-white"
          />
          
          <button type="submit" disabled={!inputText.trim()} className="p-2 bg-zentry-copper text-black rounded-md disabled:opacity-50">
            <Send size={18} />
          </button>
        </form>
      </div>
    </>
  );
};

export default ChatBox;