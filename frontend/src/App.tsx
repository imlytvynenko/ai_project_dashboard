import React, { useState, useRef, useEffect } from "react";

const App: React.FC = () => {
  // Generate a unique session ID for this session
  const sessionId = React.useMemo(
    () =>
      "session-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
    []
  );

  // State for chat functionality
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(`ws://localhost:8000/ws/${sessionId}`);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log("WebSocket connected");
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log("Received:", data);

          let content = "";
          if (data.type === "result" && data.data) {
            // Handle analytical results
            if (data.data.response) {
              content = data.data.response;
            } else if (data.data.data && Array.isArray(data.data.data)) {
              // Format the data nicely
              content = `Query Results:\n${JSON.stringify(data.data.data, null, 2)}`;
            } else {
              content = JSON.stringify(data.data, null, 2);
            }
          } else if (data.type === "status") {
            content = data.message || "Processing...";
          } else if (data.type === "error") {
            content = `Error: ${data.message}`;
          } else {
            content = data.message || data.content || JSON.stringify(data);
          }

          const newMessage = {
            id: Date.now().toString(),
            content: content,
            timestamp: new Date(),
            sender: "assistant",
            type: data.type || "message",
            rawData: data, // Store raw data for debugging
          };

          setMessages((prev) => [...prev, newMessage]);
          setIsLoading(false);
        };
        ws.onclose = () => {
          console.log("WebSocket disconnected");
          setIsConnected(false);
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          setIsConnected(false);
          setIsLoading(false);
        };
      } catch (error) {
        console.error("WebSocket connection failed:", error);
        setIsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [sessionId]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Submit clicked! Input value:", inputValue);
    console.log("Connected:", isConnected);
    console.log("Loading:", isLoading);

    if (!inputValue.trim()) {
      console.log("Input is empty");
      return;
    }

    if (!isConnected) {
      console.log("WebSocket not connected");
      return;
    }

    if (isLoading) {
      console.log("Already processing");
      return;
    }

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      content: inputValue,
      timestamp: new Date(),
      sender: "user",
      type: "message",
    };

    console.log("Adding user message:", userMessage);
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Send to WebSocket
    if (wsRef.current) {
      const message = {
        type: "query",
        query: inputValue,
      };
      console.log("Sending WebSocket message:", message);
      wsRef.current.send(JSON.stringify(message));
    }

    setInputValue("");
  };

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#f9fafb",
      fontFamily: "system-ui, -apple-system, sans-serif",
    },
    header: {
      backgroundColor: "white",
      borderBottom: "1px solid #e5e7eb",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
    headerContent: {
      maxWidth: "1280px",
      margin: "0 auto",
      padding: "1rem 2rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    title: {
      fontSize: "1.5rem",
      fontWeight: "bold",
      color: "#111827",
      margin: 0,
    },
    badge: {
      marginLeft: "0.75rem",
      padding: "0.25rem 0.5rem",
      fontSize: "0.75rem",
      fontWeight: "500",
      backgroundColor: "#dbeafe",
      color: "#1d4ed8",
      borderRadius: "9999px",
    },
    missionControl: {
      maxWidth: "1280px",
      margin: "0 auto",
      padding: "1rem 2rem",
    },
    infoPanel: {
      background: "linear-gradient(to right, #f0f9ff, #eff6ff)",
      border: "1px solid #dbeafe",
      borderRadius: "0.5rem",
      padding: "1.5rem",
      marginBottom: "1rem",
    },
    infoTitle: {
      fontSize: "1.25rem",
      fontWeight: "bold",
      color: "#111827",
      marginBottom: "1rem",
    },
    chatContainer: {
      maxWidth: "1280px",
      margin: "0 auto",
      padding: "0 2rem 2rem",
      backgroundColor: "white",
      borderRadius: "0.5rem",
      boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)",
      minHeight: "400px",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center" as const,
    },
    inputArea: {
      width: "100%",
      maxWidth: "600px",
      display: "flex",
      gap: "0.5rem",
      marginTop: "1rem",
    },
    input: {
      flex: 1,
      padding: "0.75rem",
      border: "1px solid #d1d5db",
      borderRadius: "0.5rem",
      fontSize: "1rem",
      outline: "none",
    },
    button: {
      padding: "0.75rem 1.5rem",
      backgroundColor: "#3b82f6",
      color: "white",
      border: "none",
      borderRadius: "0.5rem",
      fontSize: "1rem",
      cursor: "pointer",
      fontWeight: "500",
    },
    examples: {
      marginTop: "1rem",
      fontSize: "0.875rem",
      color: "#6b7280",
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <h1 style={styles.title}>RewardOps Mission Control</h1>
            <span style={styles.badge}>LIVE DATA</span>
          </div>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            Admin Session: {sessionId.split("-")[1]}
          </div>
        </div>
      </header>

      {/* Mission Control Description */}
      <div style={styles.missionControl}>
        <div style={styles.infoPanel}>
          <h2 style={styles.infoTitle}>
            🚀 Business Intelligence Mission Control
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1rem",
              fontSize: "0.875rem",
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "1rem",
                borderRadius: "0.375rem",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontWeight: "600",
                  color: "#059669",
                  marginBottom: "0.5rem",
                }}
              >
                🎯 Real-Time Insights
              </div>
              <div style={{ color: "#6b7280" }}>
                Ask questions about merchants, redemptions, transactions, and
                revenue in plain English
              </div>
            </div>
            <div
              style={{
                backgroundColor: "white",
                padding: "1rem",
                borderRadius: "0.375rem",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontWeight: "600",
                  color: "#2563eb",
                  marginBottom: "0.5rem",
                }}
              >
                ⚡ No Engineering Dependency
              </div>
              <div style={{ color: "#6b7280" }}>
                Generate custom reports instantly without waiting for
                development resources
              </div>
            </div>
            <div
              style={{
                backgroundColor: "white",
                padding: "1rem",
                borderRadius: "0.375rem",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontWeight: "600",
                  color: "#7c3aed",
                  marginBottom: "0.5rem",
                }}
              >
                📊 Dynamic Visualizations
              </div>
              <div style={{ color: "#6b7280" }}>
                Get interactive charts and data tables automatically generated
                from your queries
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <main style={styles.chatContainer}>
        {/* Connection Status */}
        <div
          style={{
            marginBottom: "1rem",
            fontSize: "0.875rem",
            color: isConnected ? "#059669" : "#dc2626",
          }}
        >
          {isConnected
            ? "🟢 Connected to Analytics Engine"
            : "🔴 Connecting..."}
        </div>

        {/* Debug Info */}
        <div
          style={{
            marginBottom: "1rem",
            fontSize: "0.75rem",
            color: "#6b7280",
          }}
        >
          Debug: Connected={isConnected.toString()}, Loading=
          {isLoading.toString()}, Messages={messages.length}
        </div>

        {/* Messages Display */}
        {messages.length > 0 ? (
          <div
            style={{ width: "100%", maxWidth: "800px", marginBottom: "1rem" }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  marginBottom: "1rem",
                  padding: "1rem",
                  borderRadius: "0.5rem",
                  backgroundColor:
                    message.sender === "user" ? "#f3f4f6" : "#eff6ff",
                  border:
                    "1px solid " +
                    (message.sender === "user" ? "#d1d5db" : "#dbeafe"),
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#6b7280",
                    marginBottom: "0.5rem",
                  }}
                >
                  {message.sender === "user" ? "You" : "AI Assistant"} •{" "}
                  {message.timestamp.toLocaleTimeString()}
                </div>
                <div style={{ whiteSpace: "pre-wrap" }}>{message.content}</div>
                {/* Show raw data for debugging */}
                {message.rawData && (
                  <details style={{ marginTop: "0.5rem" }}>
                    <summary
                      style={{
                        fontSize: "0.75rem",
                        color: "#6b7280",
                        cursor: "pointer",
                      }}
                    >
                      🔍 Raw Data (Debug)
                    </summary>
                    <pre
                      style={{
                        fontSize: "0.75rem",
                        color: "#374151",
                        backgroundColor: "#f9fafb",
                        padding: "0.5rem",
                        borderRadius: "0.25rem",
                        marginTop: "0.5rem",
                        overflow: "auto",
                      }}
                    >
                      {JSON.stringify(message.rawData, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
            {isLoading && (
              <div
                style={{
                  textAlign: "center",
                  color: "#6b7280",
                  fontStyle: "italic",
                }}
              >
                🤔 Analyzing your query...
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>💬</div>
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: "600",
                color: "#111827",
                marginBottom: "0.5rem",
              }}
            >
              Ask Your Business Questions
            </h3>
            <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
              Type your questions in plain English about your RewardOps platform
              data
            </p>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} style={styles.inputArea}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g., Show me top 10 merchants by redemption volume this month"
            style={styles.input}
            disabled={!isConnected || isLoading}
          />
          <button
            type="submit"
            style={{
              ...styles.button,
              backgroundColor:
                !isConnected || isLoading || !inputValue.trim()
                  ? "#9ca3af"
                  : "#3b82f6",
              cursor:
                !isConnected || isLoading || !inputValue.trim()
                  ? "not-allowed"
                  : "pointer",
            }}
            disabled={!isConnected || isLoading || !inputValue.trim()}
            onClick={(e) => {
              console.log("Button clicked!", e);
            }}
          >
            {isLoading ? "Processing..." : "Ask AI"}
          </button>
        </form>

        {messages.length === 0 && (
          <div style={styles.examples}>
            Try: "What are recent transaction trends?" • "Show revenue breakdown
            by category" • "List top performing merchants"
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: "white",
          borderTop: "1px solid #e5e7eb",
          marginTop: "2rem",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "1rem 2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.875rem",
            color: "#6b7280",
          }}
        >
          <div>
            🎯 Transform static admin pages into dynamic business intelligence •
            Real-time data exploration • Zero engineering bottlenecks
          </div>
          <div>Powered by ReAct Agent & PostgreSQL MCP</div>
        </div>
      </footer>
    </div>
  );
};

export default App;
