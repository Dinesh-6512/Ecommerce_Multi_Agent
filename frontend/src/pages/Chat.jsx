import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sendChatMessage } from '../api.js';

export default function Chat() {
  const token = localStorage.getItem('token');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: 'Hello! I am your Shop Assistant. Ask me about our products, checking your cart, adding items, or checking your order history.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage(trimmed);
      const assistantMessage = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: response && response.answer ? response.answer : "Sorry, I couldn't find any information for that.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: 'Sorry, something went wrong. Please try again later.',
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={styles.card}>
        <h2 style={styles.title}>Shop Assistant</h2>
        <div style={styles.loginPrompt}>
          <p style={styles.promptText}>Please log in to chat with the Shop Assistant.</p>
          <Link to="/login" style={styles.loginBtn}>
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <div style={styles.headerArea}>
        <h2 style={styles.title}>Shop Assistant</h2>
        <p style={styles.subtitle}>
          Get instant help with shop products, your cart, and past orders.
        </p>
      </div>

      <div style={styles.chatBox}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              ...styles.messageRow,
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                ...styles.bubble,
                ...(msg.sender === 'user' ? styles.userBubble : styles.assistantBubble),
                ...(msg.isError ? styles.errorBubble : {}),
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ ...styles.messageRow, justifyContent: 'flex-start' }}>
            <div style={{ ...styles.bubble, ...styles.assistantBubble, ...styles.loadingBubble }}>
              Assistant is thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} style={styles.inputArea}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about products, your cart, or orders..."
          style={styles.input}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            ...styles.sendBtn,
            opacity: loading || !input.trim() ? 0.6 : 1,
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    height: '650px',
    overflow: 'hidden',
  },
  headerArea: {
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0,
  },
  chatBox: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: '#ffffff',
  },
  messageRow: {
    display: 'flex',
    width: '100%',
  },
  bubble: {
    maxWidth: '75%',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  userBubble: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    borderBottomRightRadius: '2px',
  },
  assistantBubble: {
    backgroundColor: '#f3f4f6',
    color: '#1f2937',
    borderBottomLeftRadius: '2px',
    border: '1px solid #e5e7eb',
  },
  loadingBubble: {
    color: '#6b7280',
    fontStyle: 'italic',
  },
  errorBubble: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fecaca',
  },
  inputArea: {
    display: 'flex',
    gap: '10px',
    padding: '16px 20px',
    borderTop: '1px solid #e5e7eb',
    backgroundColor: '#ffffff',
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    outline: 'none',
  },
  sendBtn: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    padding: '10px 20px',
    borderRadius: '6px',
    border: 'none',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'background-color 0.2s',
  },
  loginPrompt: {
    padding: '40px 20px',
    textAlign: 'center',
  },
  promptText: {
    fontSize: '16px',
    color: '#4b5563',
    marginBottom: '20px',
  },
  loginBtn: {
    display: 'inline-block',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    textDecoration: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '14px',
  },
};

