"use client"

import React, { useState, useRef, useEffect } from "react"
import { FaArrowUp, FaChartLine, FaBrain, FaQuestion } from "react-icons/fa6"
import { Button } from "@/components/ui/button"
import { ChatHistory } from "@/app/page";

interface RagQueryProps {
  fileName: string;
  onReset: () => void;
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  getTagColor: (tag: string) => string;
  getTagIcon: (tag: string) => React.ReactNode;
  isTagSelected: (tag: string) => boolean;
  language: "english" | "hindi";
  translations: {
    english: {
      enterQuery: string;
      [key: string]: string;
    };
    hindi: {
      enterQuery: string;
      [key: string]: string;
    };
  };
  setChatHistory: (arg: ChatHistory[]) => void
  chatHistory: ChatHistory[],
  setTables: (arg: any[]) => void
}

const RagQueryInterface: React.FC<RagQueryProps> = ({
  fileName,
  onReset,
  selectedTags,
  toggleTag,
  getTagColor,
  getTagIcon,
  isTagSelected,
  language,
  translations,
  setChatHistory,
  chatHistory,
  setTables
}) => {
  const [query, setQuery] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");
  const [results, setResults] = useState<string[]>([]);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const websocketRef = useRef<WebSocket | null>(null);

  // Get current language text
  const t = translations[language];

  // Clean up WebSocket connection on component unmount and handle animation
  useEffect(() => {
    // Create a pulse animation for the submission button when processing
    if (!document.getElementById('pulse-animation') && isProcessing) {
      const pulseStyle = document.createElement('style');
      pulseStyle.id = 'pulse-animation';
      pulseStyle.innerHTML = `
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .animate-pulse {
          animation: pulse 2s infinite ease-in-out;
        }
      `;
      document.head.appendChild(pulseStyle);
    }

    return () => {
      if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
        websocketRef.current.close();
      }
    };
  }, [isProcessing]);

  // Add CSS animation for float-up effect and loading dots
  useEffect(() => {
    // Add a style tag if it doesn't exist
    if (!document.getElementById('custom-animations')) {
      const style = document.createElement('style');
      style.id = 'custom-animations';
      style.innerHTML = `
        @keyframes floatUp {
          0% { opacity: 0; transform: translateY(20px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
        .animate-float {
          animation: floatUp 5s ease-out forwards;
        }
        
        @keyframes loadingDot {
          0%, 80%, 100% { transform: scale(0); opacity: 0; }
          40% { transform: scale(1); opacity: 1; }
        }
        .loading-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          margin: 0 2px;
        }
        .loading-dot:nth-child(1) {
          animation: loadingDot 1.2s infinite ease-in-out;
          animation-delay: 0s;
        }
        .loading-dot:nth-child(2) {
          animation: loadingDot 1.2s infinite ease-in-out;
          animation-delay: 0.2s;
        }
        .loading-dot:nth-child(3) {
          animation: loadingDot 1.2s infinite ease-in-out;
          animation-delay: 0.4s;
        }
        
        .message-container {
          position: relative;
          min-height: 2rem;
          padding-left: 50px;
          display: flex;
          align-items: flex-start;
        }
        
        .dots-container {
          position: absolute;
          left: 10px;
          top: 22px;
          display: flex;
        }
        
        .text-container {
          flex-grow: 1;
          padding: 1rem 0;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);
  
  // Auto-resize textarea based on content
  useEffect(() => {
    const handleResize = () => {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        // Save scroll position
        const scrollTop = textarea.scrollTop;
        
        // Reset height to recalculate
        textarea.style.height = 'auto';
        
        // Set new height with max limit
        const newHeight = Math.min(textarea.scrollHeight, 150);
        textarea.style.height = `${newHeight}px`;
        
        // Enable scrolling when content exceeds max height
        if (textarea.scrollHeight > 150) {
          textarea.style.overflowY = 'scroll';
        } else {
          textarea.style.overflowY = 'hidden';
        }
        
        // Restore scroll position
        textarea.scrollTop = scrollTop;
      }
    };
    
    handleResize();
    // Also resize on window resize
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [query]);

  const performSearch = () => {
    if (!query.trim()) {
      // Show some kind of alert or validation message
      return;
    }

    // Store the current query to use in chat history
    const currentQuery = query;
    
    // Immediately add user's message to chat history
    setChatHistory([
      ...chatHistory,
      {
        role: "human",
        value: currentQuery
      } as ChatHistory
    ]);
    
    // Clear the input field immediately
    setQuery("");
    
    // Clear previous results
    setResults([]);

    // Update status and disable search
    setStatus('Processing query...');
    setIsProcessing(true);

    // Close any existing WebSocket
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      websocketRef.current.close();
    }

    // Create new WebSocket connection
    connectWebSocket(currentQuery);
  };

  const connectWebSocket = (queryText: string) => {
    // Determine if we need to include graph parameter based on tag selection
    const graphParam = isTagSelected("Graphs");
    const verboseParam = isTagSelected("Explain");

    // Create a new WebSocket connection
    const socket = new WebSocket(`ws://10.1.147.58:8000/query/ws`);

    // Prepare data constant to be sent
    const data = {
      query: queryText,
      graph: graphParam,
      verbose: verboseParam,
      pdf_name: fileName
    };

    websocketRef.current = socket;

    // Handle WebSocket events
    socket.onopen = () => {
      console.log('WebSocket connection established');

      // Send data immediately after connection is established
      socket.send(JSON.stringify(data));
    };

    socket.onmessage = (event) => {
      const messageStr = event.data;
      const message = JSON.parse(messageStr)
      console.log("recieved message ", message)

      if (message["isStreaming"]) {
        setResults([message["message"]].concat(results))
        if (message["tables"] && message["tables"].length > 0) {
          setTables(message["tables"].map((table: string) => JSON.parse(table)));
        }
      }
      else {
        // Only add the AI response to chat history (user message was already added)
        setChatHistory([
          ...chatHistory,
          {
            role: "human",
            value: queryText
          } as ChatHistory,
          {
            role: "llm",
            value: message["message"]
          } as ChatHistory
        ])
        setStatus('Query complete.');
        setIsProcessing(false);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setResults(["Error connecting to server. Please try again."]);
      setStatus('Error occurred.');
      setIsProcessing(false);
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
      // Only set processing to false if it's not already set by the final message
      if (isProcessing) {
        setStatus('Connection closed.');
        setIsProcessing(false);
      }
    };
  };

  return (
    <div className="w-full flex flex-col">
      {/* Message area with dots and text side by side */}
      <div className="w-full mb-4">
        {results.length > 0 && (
          <div className="message-container">
            {/* Loading dots - positioned absolutely */}
            <div className="dots-container">
              {isProcessing && (
                <>
                  <span className="loading-dot bg-primary"></span>
                  <span className="loading-dot bg-primary"></span>
                  <span className="loading-dot bg-primary"></span>
                </>
              )}
            </div>

            {/* Floating text */}
            <div className="text-container">
              <div key={results[0]} className="animate-float text-base text-primary font-bold font-dm-sans text-md">
                {results[0]}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-[#F5F5F5] flex items-center p-6 rounded-t-2xl w-[95%] mx-auto">
        <div className="w-fit h-fit">
          <div className="bg-white px-4 py-4 rounded-2xl font-dm-sans text-base">{fileName}</div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full ml-3 bg-[#333] text-white flex items-center justify-center absolute left-6 bottom-52 hover:bg-primary"
            onClick={onReset}
          >
            <span className="text-sm">✕</span>
          </Button>
        </div>
      </div>

      {/* Chat interface */}
      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl border border-gray-300 overflow-hidden shadow-lg">

        <div>
          <textarea
            placeholder={t.enterQuery}
            className="w-full border-none outline-none font-dm-sans text-black p-5 text-lg resize-none min-h-[60px] max-h-[150px]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !isProcessing) {
                e.preventDefault();
                performSearch();
              }
            }}
            disabled={isProcessing}
            rows={1}
            style={{ 
              height: 'auto', 
              overflowY: query && query.split('\n').length > 3 ? 'scroll' : 'hidden'
            }}
            ref={(textarea) => {
              if (textarea) {
                textarea.style.height = 'auto';
                const newHeight = Math.min(textarea.scrollHeight, 150);
                textarea.style.height = `${newHeight}px`;
                
                // Enable scrolling when content exceeds max height
                if (textarea.scrollHeight > 150) {
                  textarea.style.overflowY = 'scroll';
                }
              }
            }}
          />

          <div className="flex justify-between items-center px-5 py-3">
            <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {["Graphs", "Explain"].map((tag) => (
                <Button
                  key={tag}
                  className="rounded-full border-2 font-dm-sans transition-all font-semibold duration-200 ease-in-out hover:shadow-md text-sm py-2 px-3 h-auto flex-shrink-0 text-md"
                  style={{
                    borderColor: isTagSelected(tag) ? `${getTagColor(tag)}40` : "#999",
                    color: isTagSelected(tag) ? getTagColor(tag) : "#999",
                    backgroundColor: isTagSelected(tag) ? `${getTagColor(tag)}40` : "transparent",
                  }}
                  onClick={() => toggleTag(tag)}
                >
                  {getTagIcon(tag)} {tag}
                </Button>
              ))}
            </div>
            <Button
              size="icon"
              className={`rounded-full ${isProcessing ? 'bg-secondary animate-pulse' : 'bg-primary'} text-white h-10 w-10 flex items-center justify-center hover:bg-secondary flex-shrink-0`}
              onClick={performSearch}
              disabled={isProcessing}
            >
              {isProcessing ?
                <div className="flex items-center justify-center">
                  <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                  </svg>
                </div> :
                <FaArrowUp className="h-5 w-5" />
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RagQueryInterface;