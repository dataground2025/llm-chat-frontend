import React, { useEffect, useState, useCallback } from 'react';
import { Box, AppBar, Toolbar, Typography, Button, CircularProgress } from '@mui/material';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import FileUpload from './FileUpload';
import MapSidebar from './MapSidebar';
import MapDisplay from './MapDisplay';
import UrbanAreaCharts from './UrbanAreaCharts';
import UrbanAreaComprehensiveCharts from './UrbanAreaComprehensiveCharts';
import InfrastructureExposure from './InfrastructureExposure';
import TopicModeling from './TopicModeling';
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
  const [params, setParams] = useState(null);
  const [isSending, setIsSending] = useState(false);
  
  const handleAnalyze = (selectedParams) => {
    console.log('🔍 [ChatPage] handleAnalyze called with:', selectedParams);
    console.log('🔍 [ChatPage] Setting params to:', selectedParams);
    setParams(selectedParams);
    console.log('🔍 [ChatPage] Params state updated');
  };

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
    
    const fetchMessages = async () => {
      console.log('🔍 [fetchMessages] Fetching messages for chat:', selectedChatId);
      setLoadingMessages(true);
      try {
        const data = await getMessages(selectedChatId, token);
        setMessages(data);
      } finally {
        setLoadingMessages(false);
      }
    };
    
    fetchMessages();
  }, [selectedChatId, token]);

  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);
  };

  const handleCreateChat = async () => {
    console.log('🚀 [handleCreateChat] Starting new chat creation');
    setIsComposingNewChat(true);
    setSelectedChatId(null);
    setMessages([]);
    
    try {
      // Create empty chat first
      const title = 'New Chat';
      console.log('🚀 [handleCreateChat] Creating chat with title:', title);
      const { chat } = await createChatWithFirstMessage(title, '', token);
      console.log('✅ [handleCreateChat] Chat created:', chat.id);
      setChats(prev => [chat, ...prev]);
      setSelectedChatId(chat.id);
      setIsComposingNewChat(false);
      
      // Don't generate AI greeting here - let user send first message
      console.log('✅ [handleCreateChat] Chat created, waiting for user message');
    } catch (e) {
      console.error('❌ [handleCreateChat] Error creating chat:', e);
      setIsComposingNewChat(false);
    }
  };

  // Helper to truncate title
  const truncateTitle = (title, maxLen = 30) => {
    return title.length > maxLen ? title.slice(0, maxLen) + '...' : title;
  };

  // Simplified message sending logic
  const handleSendMessage = async (content, file) => {
    if (isSending) {
      console.log('Message already being sent, ignoring duplicate request');
      return;
    }
    
    setIsSending(true);
    
    if (!selectedChatId) {
      console.log('No selected chat, ignoring message');
      setIsSending(false);
      return;
    }
    
    // Handle file upload if present
    let fileInfo = null;
    if (file) {
      try {
        fileInfo = await uploadFile(file, token);
      } catch (e) {
        fileInfo = { filename: file.name, error: true };
      }
    }
    
    // Add user message to UI
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: content || (fileInfo ? `[File: ${fileInfo.filename}]` : ''),
      created_at: new Date().toISOString(),
      file: fileInfo,
    };
    setMessages(prev => [...prev, userMsg]);
    
    // Send message and get AI response
    setAiThinking(true);
    try {
      const aiMsg = await sendMessage(selectedChatId, content, token);
      console.log('🔍 [ChatPage] Full AI Message received:', aiMsg);
      console.log('🔍 [ChatPage] AI Message keys:', Object.keys(aiMsg));
      console.log('🔍 [ChatPage] dashboard_updates in AI message:', aiMsg.dashboard_updates);
      setMessages(prev => [...prev, aiMsg]);
      
      // Handle dashboard updates if present
      if (aiMsg.dashboard_updates && aiMsg.dashboard_updates.length > 0) {
        console.log('✅ Dashboard updates received:', aiMsg.dashboard_updates);
        console.log('🔍 [ChatPage] Calling handleAnalyze with:', {
          type: 'chat_triggered',
          updates: aiMsg.dashboard_updates,
          analysis_type: aiMsg.analysis_type || 'sea_level_rise'
        });
        handleAnalyze({
          type: 'chat_triggered',
          updates: aiMsg.dashboard_updates,
          analysis_type: aiMsg.analysis_type || 'sea_level_rise'
        });
        console.log('🔍 [ChatPage] handleAnalyze called, params should be updated');
      } else {
        console.log('❌ [ChatPage] No dashboard updates in AI message');
      }
    } catch (e) {
      console.error('Error sending message:', e);
      setMessages(prev => [...prev, { 
        id: `ai-error-${Date.now()}`, 
        sender: 'ai', 
        content: '[AI Error]', 
        created_at: new Date().toISOString() 
      }]);
    } finally {
      setAiThinking(false);
      setIsSending(false);
    }
  };

  return (
    <PanelGroup direction="horizontal" style={{ height: '100vh' }}>
      {/* Left: Analysis Sidebar */}
      <Panel defaultSize={25} minSize={20} maxSize={40}>
        <MapSidebar onAnalyze={handleAnalyze} />
      </Panel>
      
      <PanelResizeHandle className="resize-handle" />
      
      {/* Center: Chat Sidebar + Chat Window */}
      <Panel defaultSize={35} minSize={30} maxSize={50}>
        <Box display="flex" height="100%">
          <ChatSidebar
            chats={chats}
            selectedChatId={selectedChatId}
            onSelect={handleSelectChat}
            onCreate={handleCreateChat}
          />
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
      </Panel>
      
      <PanelResizeHandle className="resize-handle" />
      
      {/* Right: Visualization/Analytics */}
      <Panel defaultSize={40} minSize={30} maxSize={50}>
        <Box height="100%" bgcolor="#fafbfc" p={2} style={{ overflowY: 'auto', borderLeft: '1px solid #eee' }}>
          {/* Show analytics based on params */}
          {!params && <div style={{ color: '#888', textAlign: 'center', marginTop: 100 }}>Select analysis options and click "Analyze it" to view analytics.</div>}
          {params && (params.task === 'slr-risk' || params.analysis_type === 'sea_level_rise') && <MapDisplay params={params} />}
          {params && params.task === 'urban-area-comprehensive' && <><MapDisplay params={params} /><UrbanAreaComprehensiveCharts startYear={params.year1} endYear={params.year2} /></>}
          {params && params.task === 'infrastructure-exposure' && <InfrastructureExposure year={params.year1} threshold={params.threshold} city={params.city} />}
          {params && params.task === 'topic-modeling' && <TopicModeling params={params} />}
        </Box>
      </Panel>
    </PanelGroup>
  );
}

export default ChatPage;
