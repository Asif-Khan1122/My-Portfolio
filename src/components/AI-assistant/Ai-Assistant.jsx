import { useState, useRef, useEffect } from "react";
import { FiCpu } from "react-icons/fi";

const AiAssistant = ({ isOpen, onClose }) => {
  console.log("API Key:", import.meta.env.VITE_GROQ_API_KEY);
  console.log("All env vars:", import.meta.env);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "Hello! I'm Asif's AI assistant. How can I help you today? You can ask me about skills, projects, experience, or anything about Asif!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to get AI response using Groq API
  const getAIResponse = async (userMessage, conversationHistory) => {
    const systemPrompt = `You are an AI assistant for Asif's portfolio website. You help visitors learn about Asif and his work.
 - Always vary your responses — never repeat the same phrasing;
 - Ask follow-up questions to keep the conversation engaging;
 - If asked the same thing twice, provide additional details;
 
  Key information about Asif:
  - Frontend web developer
  - Location: Islamabad, Pakistan
  - Skills: React, JavaScript, TypeScript, Node.js, Tailwind CSS, Next.js
  - Experience: 2+ years in full-stack web development
  - Services: Frontend development, responsive design, API integration, website optimization, code reviews, version control, deployment
  - Projects: E-commerce platforms, dashboards, responsive websites, real-time applications
  - Portfolio sections: Home, About, Skills, Projects, Services, Contact
  - Open to: Freelance projects, full-time positions, collaboration opportunities
  - Approach: Clean code, user-focused design, performance optimization
  
  Guidelines:
  - Be friendly, professional, and conversational
  - Keep responses concise (2-4 sentences when possible)
  - If asked about something not in your knowledge base, suggest checking the portfolio directly
  - Encourage visitors to explore different sections of the website
  - Use emojis occasionally to be friendly
  - If someone asks about hiring/contacting, guide them to the Contact section`;

    try {
      console.log("API Key exists:", !!import.meta.env.VITE_GROQ_API_KEY);
      console.log(
        "API Key starts with:",
        import.meta.env.VITE_GROQ_API_KEY?.substring(0, 10),
      );

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: systemPrompt },
              ...conversationHistory,
              { role: "user", content: userMessage },
            ],
            temperature: 0.7,
            max_tokens: 250,
            top_p: 1,
            stream: false,
          }),
        },
      );

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Groq API Error Details:", errorData);
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`,
        );
      }

      const data = await response.json();
      console.log("API Response:", data);
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Full error:", error);
      throw error;
    }
  };

  // ADD THESE TWO FUNCTIONS BACK:
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { type: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const conversationHistory = messages.slice(-10).map((msg) => ({
        role: msg.type === "user" ? "user" : "assistant",
        content: msg.text,
      }));

      const aiResponse = await getAIResponse(input, conversationHistory);
      const botMessage = { type: "bot", text: aiResponse };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        type: "bot",
        text: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment, or explore the website directly! 😊",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-x-4 bottom-20 sm:inset-x-auto sm:right-5 sm:left-auto z-50 transition-all duration-300 sm:max-w-96 w-auto'>
      <div
        className='bg-white w-full sm:w-96 rounded-2xl shadow-2xl flex flex-col overflow-hidden'
        style={{ maxHeight: "min(85vh, 600px)" }}
      >
        {/* Header */}
        <div className='bg-gradient-to-r from-purple-600 to-blue-500 p-3 sm:p-4 flex justify-between items-center shrink-0'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-white rounded-full flex items-center justify-center'>
              <FiCpu className='text-purple-600' />
            </div>
            <div>
              <h3 className='text-white font-semibold text-sm'>AI Assistant</h3>
              <p className='text-purple-100 text-xs'>
                Ask me anything about Asif
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='text-white hover:text-purple-200 transition-colors'
          >
            <svg
              className='w-5 h-5 cursor-pointer'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className='h-[85vh] sm:h-80 overflow-y-auto p-4 bg-gray-50'>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-3 flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] p-3 rounded-lg text-sm break-words ${
                  message.type === "user"
                    ? "bg-purple-600 text-white rounded-br-none"
                    : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className='flex justify-start mb-3'>
              <div className='bg-white border border-gray-200 p-3 rounded-lg rounded-bl-none'>
                <div className='flex gap-1'>
                  <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'></div>
                  <div
                    className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className='p-3 border-t border-gray-200 bg-white'>
          <div className='flex items-center gap-2'>
            <input
              type='text'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder='Ask about skills, projects...'
              className='flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-sm'
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className='bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 cursor-pointer'
            >
              <svg
                className='w-4 h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8'
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;
