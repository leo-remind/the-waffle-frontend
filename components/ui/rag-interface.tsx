"use client"

import React, { useState, useRef, useEffect } from "react"
import { FaArrowRight, FaChartLine, FaBrain, FaQuestion } from "react-icons/fa6"
import { Button } from "@/components/ui/button"

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
  translations
}) => {
  const [query, setQuery] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");
  const [results, setResults] = useState<string[]>([]);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Get current language text
  const t = translations[language];

  // Clean up event source on component unmount and handle animation
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
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
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
          animation: floatUp 1.2s ease-out forwards;
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
          background-color: #718096;
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
          min-height: 60px;
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
          padding: 16px 0;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const performSearch = () => {
    if (!query.trim()) {
      // Show some kind of alert or validation message
      return;
    }

    // Clear previous results
    setResults([]);
    
    // Update status and disable search
    setStatus('Processing query...');
    setIsProcessing(true);
    
    // Close any existing EventSource
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    // For demo purposes we'll simulate the server response
    simulateServerEvents();
  };

  const simulateServerEvents = () => {
    // This is a simulation of SSE events for demonstration
    
    const mockResults = [
      "Retrieving relevant documents...",
      "Found 3 documents related to your query.",
      "Analyzing document content...",
      "Generating response based on retrieved information...",
      `Answer: Based on the analysis of ${fileName}, the information you requested shows that...`,
      "Processing complete."
    ];
    
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < mockResults.length) {
        // Set a key that will force React to create a new DOM element
        // instead of reusing the existing one
        setResults([mockResults[index]]);
        
        index++;
      } else {
        clearInterval(interval);
        setStatus('Query complete.');
        setIsProcessing(false);
      }
    }, 1500); // Increased time to allow animation to complete
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
                  <span className="loading-dot"></span>
                  <span className="loading-dot"></span>
                  <span className="loading-dot"></span>
                </>
              )}
            </div>
            
            {/* Floating text */}
            <div className="text-container">
              <div key={results[0]} className="animate-float text-base text-muted-foreground">
                {results[0]}
              </div>
            </div>
          </div>
        )}
      </div>
      
        <div className="bg-[#F5F5F5] flex items-center p-10 rounded-t-2xl w-[95%] mx-auto">
            <div className="bg-white px-4 py-4 rounded-2xl font-dm-sans text-base">{fileName}</div>
            <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-full ml-3 bg-[#333] text-white flex items-center justify-center"
            onClick={onReset}
            >
            <span className="text-sm">✕</span>
            </Button>
        </div>

      {/* Chat interface */}
      <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl border border-gray-300 overflow-hidden shadow-lg">
        
        <div>
          <input
            type="text"
            placeholder={t.enterQuery}
            className="w-full border-none outline-none font-dm-sans text-primary p-5 text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isProcessing && performSearch()}
            disabled={isProcessing}
          />
          
          <div className="flex justify-between items-center px-5 py-3 border-t border-gray-200">
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {["Graphs", "Explain", "Reason"].map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  className="rounded-full font-dm-sans transition-all duration-200 ease-in-out hover:shadow-md text-sm py-1 px-3 h-auto flex-shrink-0"
                  style={{
                    borderColor: getTagColor(tag),
                    color: isTagSelected(tag) ? "white" : getTagColor(tag),
                    backgroundColor: isTagSelected(tag) ? `${getTagColor(tag)}80` : "transparent",
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
                  <span className="bg-white"></span>
                </div> : 
                <FaArrowRight className="h-5 w-5" />
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RagQueryInterface;