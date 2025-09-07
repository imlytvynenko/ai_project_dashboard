import { AnalyticsResponse } from "../types/analytics";

export class WebSocketService {
  private ws: WebSocket | null = null;
  private sessionId: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  public onMessage: ((response: AnalyticsResponse) => void) | null = null;
  public onStatusChange: ((status: "connecting" | "connected" | "disconnected") => void) | null = null;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  connect() {
    if (this.onStatusChange) {
      this.onStatusChange("connecting");
    }

    try {
      this.ws = new WebSocket("ws://localhost:8000/ws");

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        
        if (this.onStatusChange) {
          this.onStatusChange("connected");
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const response: AnalyticsResponse = JSON.parse(event.data);
          console.log("Received content:", response);
          
          if (this.onMessage) {
            this.onMessage(response);
          }
        } catch (error) {
          console.error("Error parsing WebSocket content:", error);
        }
      };

      this.ws.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        
        if (this.onStatusChange) {
          this.onStatusChange("disconnected");
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        
        if (this.onStatusChange) {
          this.onStatusChange("disconnected");
        }
      };

    } catch (error) {
      console.error("Error creating WebSocket connection:", error);
      
      if (this.onStatusChange) {
        this.onStatusChange("disconnected");
      }
    }
  }

  sendQuery(query: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected");
      
      if (this.onMessage) {
        this.onMessage({
          type: "error",
          content: "Connection lost. Please refresh the page to reconnect."
        });
      }
      return;
    }

    const message = {
      type: "query",
      session_id: this.sessionId,
      query: query
    };

    try {
      this.ws.send(JSON.stringify(message));
      console.log("Sent query:", message);
    } catch (error) {
      console.error("Error sending content:", error);
      
      if (this.onMessage) {
        this.onMessage({
          type: "error",
          content: "Failed to send message. Please try again."
        });
      }
    }
  }

  disconnect() {
    if (this.ws) {
      this.maxReconnectAttempts = 0;
      this.ws.close(1000, "User disconnected");
      this.ws = null;
    }
  }
}
export {};
