import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bot, FileText, Loader2, Send, Sparkles, UserRound } from "lucide-react";
import { sendChatMessage } from "./api/chat";

const exampleQuestions = [
  "What is Node.js used for?",
  "Explain the event loop from the PDF.",
  "Which page should I read for modules?"
];

function createMessageId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function SourceList({ sources }) {
  if (!sources.length) {
    return null;
  }

  return (
    <div className="sources" aria-label="Sources">
      {sources.slice(0, 4).map((source, index) => {
        const page = source.page || source.page_number || source.page_label;
        const content = source.content || source.page_content || source.text || source.snippet;

        return (
          <div className="source" key={`${page || "source"}-${index}`}>
            <FileText size={16} aria-hidden="true" />
            <div>
              <strong>{page ? `Page ${page}` : `Source ${index + 1}`}</strong>
              {content ? <p>{content}</p> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Message({ message }) {
  const isUser = message.role === "user";
  const Icon = isUser ? UserRound : Bot;

  return (
    <article className={`message ${isUser ? "message-user" : "message-assistant"}`}>
      <div className="avatar" aria-hidden="true">
        <Icon size={18} />
      </div>
      <div className="message-body">
        <p>{message.content}</p>
        <SourceList sources={message.sources || []} />
      </div>
    </article>
  );
}

export default function App() {
  const [messages, setMessages] = useState([
    {
      id: createMessageId(),
      role: "assistant",
      content: "Ask a question from your PDF and I will answer with the most relevant context."
    }
  ]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const canSubmit = useMemo(() => question.trim().length > 0 && !isLoading, [question, isLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isLoading) {
      return;
    }

    const userMessage = {
      id: createMessageId(),
      role: "user",
      content: trimmedQuestion
    };

    setMessages((current) => [...current, userMessage]);
    setQuestion("");
    setIsLoading(true);

    try {
      const result = await sendChatMessage(trimmedQuestion);
      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: "assistant",
          content: result.answer,
          sources: result.sources
        }
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: "assistant",
          content: error.message || "Something went wrong while calling the backend."
        }
      ]);
    } finally {
      setIsLoading(false);
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }

  function useExample(value) {
    setQuestion(value);
    inputRef.current?.focus();
  }

  return (
    <main className="app-shell">
      <section className="chat-layout" aria-label="PDF chat">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true">
              <Sparkles size={20} />
            </div>
            <div>
              <h1>PDF RAG Chatboat</h1>
              <p>Learning-Node.pdf</p>
            </div>
          </div>

          <div className="status-panel">
            <span className="status-dot" aria-hidden="true" />
            <div>
              <strong>Backend API</strong>
              <p>{import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}</p>
            </div>
          </div>

          <div className="examples" aria-label="Example questions">
            {exampleQuestions.map((example) => (
              <button type="button" key={example} onClick={() => useExample(example)}>
                {example}
              </button>
            ))}
          </div>
        </aside>

        <section className="chat-panel">
          <div className="messages" aria-live="polite">
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}

            {isLoading ? (
              <article className="message message-assistant">
                <div className="avatar" aria-hidden="true">
                  <Bot size={18} />
                </div>
                <div className="message-body loading-row">
                  <Loader2 size={18} className="spin" aria-hidden="true" />
                  <span>Searching the PDF...</span>
                </div>
              </article>
            ) : null}
            <div ref={messagesEndRef} className="messages-end" aria-hidden="true" />
          </div>

          <form className="composer" onSubmit={handleSubmit}>
            <label htmlFor="question">Question</label>
            <div className="composer-row">
              <textarea
                ref={inputRef}
                id="question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    handleSubmit(event);
                  }
                }}
                placeholder="Ask something from the PDF..."
                rows={1}
              />
              <button type="submit" disabled={!canSubmit} aria-label="Send question">
                {isLoading ? <Loader2 size={20} className="spin" /> : <Send size={20} />}
              </button>
            </div>
          </form>
        </section>
      </section>
    </main>
  );
}
