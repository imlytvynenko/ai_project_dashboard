import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, AnalyticsResponse } from '../types/analytics';
import { WebSocketService } from '../services/WebSocketService';
import { ChartRenderer } from './ChartRenderer';

interface ChatInterfaceProps {
  sessionId: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ sessionId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsService = useRef<WebSocketService | null>(null);

  useEffect(() => {
    // Initialize WebSocket service
    wsService.current = new WebSocketService(sessionId);
    
    wsService.current.onMessage = (response: AnalyticsResponse) => {
      setIsLoading(false);
      
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        content: response.content || '',
        timestamp: new Date(),
        sender: 'assistant',
        type: response.type,
        data: response.data,
        chart_config: response.chart_config
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    };

    wsService.current.onStatusChange = (status) => {
      setConnectionStatus(status);
      setIsConnected(status === 'connected');
    };

    // Connect to WebSocket
    wsService.current.connect();

    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      content: 'Welcome to AI Analytics! Ask me any question about your business data.',
      timestamp: new Date(),
      sender: 'assistant',
      type: 'message'
    };
    setMessages([welcomeMessage]);

    return () => {
      if (wsService.current) {
        wsService.current.disconnect();
      }
    };
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || !isConnected || isLoading) {
      return;
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      timestamp: new Date(),
      sender: 'user',
      type: 'message'
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Send query via WebSocket
    if (wsService.current) {
      wsService.current.sendQuery(inputValue.trim());
      setIsLoading(true);
    }
    
    setInputValue('');
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return '#10b981'; // green
      case 'connecting':
        return '#f59e0b'; // yellow
      case 'disconnected':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">
          AI Analytics Chat
        </h2>
        <div className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: getConnectionStatusColor() }}
          />
          <span className="text-sm text-gray-600 capitalize">
            {connectionStatus}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-3xl rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="text-sm mb-1">
                {message.content}
              </div>
              
              {/* Chart Rendering */}
              {message.sender === 'assistant' && message.data && message.chart_config && (
                <div className="mt-3">
                  <ChartRenderer 
                    data={message.data} 
                    config={message.chart_config}
                  />
                </div>
              )}
              
              <div className="text-xs opacity-70 mt-1">
                {formatTimestamp(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm text-gray-600">Analyzing your question...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              isConnected 
                ? "Ask about your business data..." 
                : "Connecting..."
            }
            disabled={!isConnected || isLoading}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!isConnected || !inputValue.trim() || isLoading}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
        
        <div className="mt-2 text-xs text-gray-500">
          Try asking: "Show me top 10 merchants by volume this month" or "What are the recent transaction trends?"
        </div>
      </div>
    </div>
  );
};
