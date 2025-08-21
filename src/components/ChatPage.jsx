import React, { useEffect, useState } from 'react';
import { Box, AppBar, Toolbar, Typography, Button, CircularProgress } from '@mui/material';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import FileUpload from './FileUpload';
import { getChats, createChat, getMessages, sendMessage, uploadFile, getMe, updateChatTitle, createChatWithFirstMessage, generateAIResponse } from '../api';

function ChatPage({ token, onLogout }) {
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [user, setUser] = useState(null);
  const [isComposingNewChat, setIsComposingNewChat] = useState(false);
  const [justCreatedChatId, setJustCreatedChatId] = useState(null);
  const [skipNextFetch, setSkipNextFetch] = useState(false);

  useEffect(() => {
    const fetchChats = async () => {
      setLoadingChats(true);
      const data = await getChats(token);
      setChats(data);
      // Do NOT auto-select any chat after login
      setLoadingChats(false);
    };
    const fetchUser = async () => {
      try {
        const userData = await getMe(token);
        setUser(userData);
      } catch {}
    };
    fetchChats();
    fetchUser();
  }, [token]);

  useEffect(() => {
    if (!selectedChatId) return;
    if (skipNextFetch) {
      setSkipNextFetch(false);
      return;
    }
    const fetchMessages = async () => {
      setLoadingMessages(true);
      const data = await getMessages(selectedChatId, token);
      setMessages(data);
      setLoadingMessages(false);
    };
    fetchMessages();
  }, [selectedChatId, token, skipNextFetch]);

  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);
  };

  const handleCreateChat = () => {
    setIsComposingNewChat(true);
    setSelectedChatId(null);
    setMessages([]);
  };

  // Helper to truncate title
  const truncateTitle = (title, maxLen = 30) => {
    return title.length > maxLen ? title.slice(0, maxLen) + '...' : title;
  };

  // New logic for sending message
  const handleSendMessage = async (content, file) => {
    if (isComposingNewChat) {
      // Create chat with first message as title
      const title = truncateTitle(content || 'New Chat');
      const { chat } = await createChatWithFirstMessage(title, content, token);
      setChats(prev => [chat, ...prev]);
      setIsComposingNewChat(false);
      setSelectedChatId(chat.id); // Set selected chat before fetching
      // Now send file if present (optional, not attached to first message)
      if (file) {
        await uploadFile(file, token);
      }
      setAiThinking(true);
      try {
        await generateAIResponse(chat.id, token); // Generate AI response for the first message
      } catch (e) {
        // Optionally handle error
      }
      // Fetch all messages from backend (user + AI)
      const data = await getMessages(chat.id, token);
      setMessages(data);
      setAiThinking(false);
      setSkipNextFetch(true); // Skip the next fetch
      return;
    }
    if (!selectedChatId) return;
    let fileInfo = null;
    if (file) {
      try {
        fileInfo = await uploadFile(file, token);
      } catch (e) {
        fileInfo = { filename: file.name, error: true };
      }
    }
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: content || (fileInfo ? `[File: ${fileInfo.filename}]` : ''),
      created_at: new Date().toISOString(),
      file: fileInfo,
    };
    setMessages(prev => [...prev, userMsg]);
    setAiThinking(true);
    try {
      const aiMsg = await sendMessage(selectedChatId, content, token);
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      setMessages(prev => [...prev, { id: `ai-error-${Date.now()}`, sender: 'ai', content: '[AI Error]', created_at: new Date().toISOString() }]);
    }
    setAiThinking(false);
  };

  return (
    <Box display="flex" height="100vh">
      <ChatSidebar
        chats={chats}
        selectedChatId={selectedChatId}
        onSelect={handleSelectChat}
        onCreate={handleCreateChat}
      />
      <Box flex={1} display="flex" flexDirection="column">
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <Typography variant="h6" sx={{ flex: 1 }}>LLM Chat</Typography>
            {user && <Typography variant="body1" sx={{ mr: 2 }}>{user.user_name}</Typography>}
            <Button color="inherit" onClick={onLogout}>Logout</Button>
          </Toolbar>
        </AppBar>
        <Box flex={1} display="flex" flexDirection="column" minHeight={0}>
          {loadingChats ? (
            <Box flex={1} display="flex" alignItems="center" justifyContent="center"><CircularProgress /></Box>
          ) : isComposingNewChat ? (
            <ChatWindow messages={[]} onSend={handleSendMessage} loading={aiThinking} />
          ) : selectedChatId ? (
            <ChatWindow messages={messages} onSend={handleSendMessage} loading={aiThinking} />
          ) : (
            <Box flex={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center" bgcolor="#f7f8fa">
              <Box textAlign="center">
                <Typography variant="h4" fontWeight={700} mb={2}>
                  Welcome to AI Assistant
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" mb={4}>
                  Start a new conversation to get help with your questions, analyze documents, or just chat!
                </Typography>
                <Button variant="contained" size="large" onClick={handleCreateChat} sx={{ fontWeight: 600, fontSize: 18, px: 4, py: 1.5 }}>
                  Start New Chat
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default ChatPage;
