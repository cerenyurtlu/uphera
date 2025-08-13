/**
 * WebSocket Service for Real-time Features
 * - Chat
 * - Notifications  
 * - Live updates
 */

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface ConnectionConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

class WebSocketManager {
  private connections: Map<string, WebSocket> = new Map();
  private reconnectTimers: Map<string, any> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  private messageHandlers: Map<string, Set<(message: WebSocketMessage) => void>> = new Map();

  constructor() {
    // Auto-reconnect on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.reconnectAll();
      }
    });
  }

  connect(connectionId: string, config: ConnectionConfig): void {
    this.disconnect(connectionId); // Close existing connection

    const ws = new WebSocket(config.url);
    this.connections.set(connectionId, ws);
    this.reconnectAttempts.set(connectionId, 0);

    ws.onopen = () => {
      console.log(`🔗 WebSocket connected: ${connectionId}`);
      this.reconnectAttempts.set(connectionId, 0);
      config.onOpen?.();
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        // Global message handler
        config.onMessage?.(message);
        
        // Registered handlers for this connection
        const handlers = this.messageHandlers.get(connectionId);
        if (handlers) {
          handlers.forEach(handler => handler(message));
        }
        
        console.log(`📨 WebSocket message received on ${connectionId}:`, message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = (event) => {
      console.log(`🔌 WebSocket disconnected: ${connectionId}`, event.code);
      config.onClose?.();
      
      // Auto-reconnect if not intentionally closed
      if (event.code !== 1000 && event.code !== 1001) {
        this.scheduleReconnect(connectionId, config);
      }
    };

    ws.onerror = (error) => {
      console.error(`❌ WebSocket error on ${connectionId}:`, error);
      config.onError?.(error);
    };
  }

  disconnect(connectionId: string): void {
    const ws = this.connections.get(connectionId);
    if (ws) {
      ws.close(1000, 'Intentional disconnect');
      this.connections.delete(connectionId);
    }

    // Clear reconnect timer
    const timer = this.reconnectTimers.get(connectionId);
    if (timer) {
      clearTimeout(timer);
      this.reconnectTimers.delete(connectionId);
    }

    this.reconnectAttempts.delete(connectionId);
    this.messageHandlers.delete(connectionId);
  }

  send(connectionId: string, message: WebSocketMessage): boolean {
    const ws = this.connections.get(connectionId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      return true;
    }
    console.warn(`Cannot send message - WebSocket ${connectionId} not connected`);
    return false;
  }

  addMessageHandler(connectionId: string, handler: (message: WebSocketMessage) => void): void {
    if (!this.messageHandlers.has(connectionId)) {
      this.messageHandlers.set(connectionId, new Set());
    }
    this.messageHandlers.get(connectionId)!.add(handler);
  }

  removeMessageHandler(connectionId: string, handler: (message: WebSocketMessage) => void): void {
    const handlers = this.messageHandlers.get(connectionId);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  private scheduleReconnect(connectionId: string, config: ConnectionConfig): void {
    const maxAttempts = config.maxReconnectAttempts || 5;
    const interval = config.reconnectInterval || 3000;
    
    const attempts = this.reconnectAttempts.get(connectionId) || 0;
    
    if (attempts >= maxAttempts) {
      console.error(`❌ Max reconnection attempts reached for ${connectionId}`);
      return;
    }

    const delay = Math.min(interval * Math.pow(2, attempts), 30000); // Exponential backoff, max 30s
    
    const timer = setTimeout(() => {
      console.log(`🔄 Attempting to reconnect ${connectionId} (attempt ${attempts + 1})`);
      this.reconnectAttempts.set(connectionId, attempts + 1);
      this.connect(connectionId, config);
    }, delay);

    this.reconnectTimers.set(connectionId, timer);
  }

  private reconnectAll(): void {
    // Reconnect all disconnected connections
    this.connections.forEach((ws, connectionId) => {
      if (ws.readyState !== WebSocket.OPEN) {
        // Re-establish connection (config should be stored for this to work)
        console.log(`🔄 Reconnecting ${connectionId} due to visibility change`);
      }
    });
  }

  getConnectionStatus(connectionId: string): string {
    const ws = this.connections.get(connectionId);
    if (!ws) return 'disconnected';
    
    switch (ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'disconnected';
      default: return 'unknown';
    }
  }

  disconnectAll(): void {
    this.connections.forEach((_, connectionId) => {
      this.disconnect(connectionId);
    });
  }
}

// Global WebSocket manager
export const wsManager = new WebSocketManager();

// Specific WebSocket services
export class UpHeraWebSocketService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = (import.meta as any).env?.VITE_WS_URL || 'ws://localhost:8000';
  }

  setAuthToken(token: string): void {
    this.token = token;
  }

  connectGeneral(userId: string, onMessage?: (message: WebSocketMessage) => void): void {
    const url = `${this.baseUrl}/ws/general/${userId}`;
    
    wsManager.connect('general', {
      url,
      onMessage,
      onOpen: () => console.log('🌐 General WebSocket connected'),
      onError: (error) => console.error('General WebSocket error:', error),
      maxReconnectAttempts: 5,
      reconnectInterval: 3000
    });
  }

  connectChat(userId: string, onMessage?: (message: WebSocketMessage) => void): void {
    const url = `${this.baseUrl}/ws/chat/${userId}`;
    
    wsManager.connect('chat', {
      url,
      onMessage,
      onOpen: () => {
        console.log('💬 Chat WebSocket connected');
        // Join general chat room
        this.joinRoom('general_chat');
      },
      onError: (error) => console.error('Chat WebSocket error:', error),
      maxReconnectAttempts: 5,
      reconnectInterval: 3000
    });
  }

  connectNotifications(userId: string, onMessage?: (message: WebSocketMessage) => void): void {
    const url = `${this.baseUrl}/ws/notifications/${userId}`;
    
    wsManager.connect('notifications', {
      url,
      onMessage,
      onOpen: () => console.log('🔔 Notifications WebSocket connected'),
      onError: (error) => console.error('Notifications WebSocket error:', error),
      maxReconnectAttempts: 5,
      reconnectInterval: 3000
    });
  }

  // Chat methods
  sendChatMessage(roomId: string, content: string): boolean {
    return wsManager.send('chat', {
      type: 'chat_message',
      room_id: roomId,
      content
    });
  }

  joinRoom(roomId: string): boolean {
    return wsManager.send('chat', {
      type: 'join_room',
      room_id: roomId
    });
  }

  leaveRoom(roomId: string): boolean {
    return wsManager.send('chat', {
      type: 'leave_room',
      room_id: roomId
    });
  }

  // General methods
  getOnlineUsers(): boolean {
    return wsManager.send('general', {
      type: 'get_online_users'
    });
  }

  // Utility methods
  addChatHandler(handler: (message: WebSocketMessage) => void): void {
    wsManager.addMessageHandler('chat', handler);
  }

  addNotificationHandler(handler: (message: WebSocketMessage) => void): void {
    wsManager.addMessageHandler('notifications', handler);
  }

  addGeneralHandler(handler: (message: WebSocketMessage) => void): void {
    wsManager.addMessageHandler('general', handler);
  }

  disconnect(): void {
    wsManager.disconnectAll();
  }

  getStatus(connectionType: 'general' | 'chat' | 'notifications'): string {
    return wsManager.getConnectionStatus(connectionType);
  }
}

// Global service instance
export const upHeraWS = new UpHeraWebSocketService();

// React hook for WebSocket
import { useState, useEffect } from 'react';

export function useWebSocket(connectionType: 'general' | 'chat' | 'notifications', userId?: string) {
  const [status, setStatus] = useState<string>('disconnected');
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);

  useEffect(() => {
    if (!userId) return;

    const handleMessage = (message: WebSocketMessage) => {
      setMessages(prev => [...prev, message]);
    };

    // Connect based on type
    if (connectionType === 'general') {
      upHeraWS.connectGeneral(userId, handleMessage);
      upHeraWS.addGeneralHandler(handleMessage);
    } else if (connectionType === 'chat') {
      upHeraWS.connectChat(userId, handleMessage);
      upHeraWS.addChatHandler(handleMessage);
    } else if (connectionType === 'notifications') {
      upHeraWS.connectNotifications(userId, handleMessage);
      upHeraWS.addNotificationHandler(handleMessage);
    }

    // Status monitoring
    const statusInterval = setInterval(() => {
      setStatus(upHeraWS.getStatus(connectionType));
    }, 1000);

    return () => {
      clearInterval(statusInterval);
      // Don't disconnect here as other components might be using it
    };
  }, [connectionType, userId]);

  return {
    status,
    messages,
    send: (message: WebSocketMessage) => wsManager.send(connectionType, message),
    clearMessages: () => setMessages([])
  };
}

export default upHeraWS;
