'use client'
import { useState, useRef, useEffect } from 'react'

export default function ChatBox({ 
  onSendMessage, 
  isLoading = false,
  messages = [],
  placeholder = "Ask your AI professor anything..." 
}) {
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim() || isLoading) return

    const userMessage = message.trim()
    setMessage('')
    
    if (onSendMessage) {
      await onSendMessage(userMessage)
    }
  }

  return (
    <div className="flex flex-col h-96 bg-white rounded-lg shadow-lg border">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
        <h3 className="font-semibold flex items-center">
          <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
          AI Professor Chat
        </h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <div className="text-4xl mb-2">🎓</div>
            <p>Ask me anything about the lesson!</p>
            <p className="text-sm">I can explain concepts, provide examples, or help debug code.</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-lg ${
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {msg.sender === 'ai' && (
                  <div className="flex items-center mb-1">
                    <span className="text-xl mr-2">🤖</span>
                    <span className="text-xs font-semibold text-blue-600">AI Professor</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {msg.code && (
                  <div className="mt-2 p-3 bg-gray-900 text-green-400 rounded text-sm font-mono overflow-x-auto">
                    <pre>{msg.code}</pre>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg max-w-[80%]">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}