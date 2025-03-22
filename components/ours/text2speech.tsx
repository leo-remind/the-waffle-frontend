import React, { useState, useRef, useEffect } from 'react';

interface TextToSpeechProps {
  text: string;
  languageCode: string;
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({ text, languageCode }) => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [rate, setRate] = useState<number>(1); // Default speed rate
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const textToSpeakRef = useRef<string>(text);
  const charIndexRef = useRef<number>(0);
  
  // Update the text reference when prop changes
  useEffect(() => {
    textToSpeakRef.current = text;
  }, [text]);
  
  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  
  // Function to toggle between play and pause
  const togglePlayPause = () => {
    if (!isActive) {
      startSpeech();
    } else if (isPaused) {
      resumeSpeech();
    } else {
      pauseSpeech();
    }
  };
  
  // Function to start speech from the beginning
  const startSpeech = () => {
    if (!textToSpeakRef.current || textToSpeakRef.current.trim() === '') {
      alert('Please provide text to speak');
      return;
    }
    
    // Cancel any existing speech first
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // Ignore errors
    }
    
    try {
      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(textToSpeakRef.current);
      
      // Set language based on the provided language code
      utterance.lang = languageCode === 'hi' ? 'hi-IN' : 'en-GB';
      
      // Set the speech rate
      utterance.rate = rate;
      
      // Event listeners for speech synthesis
      utterance.onstart = () => {
        setIsActive(true);
        setIsPaused(false);
      };
      
      utterance.onend = () => {
        setIsActive(false);
        setIsPaused(false);
      };
      
      // Safe error handler
      utterance.onerror = () => {
        setIsActive(false);
        setIsPaused(false);
      };
      
      // Store the utterance reference
      speechSynthRef.current = utterance;
      
      // Start speaking
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      setIsActive(false);
      setIsPaused(false);
    }
  };
  
  // Function to restart speech from the beginning
  const restartSpeech = () => {
    try {
      window.speechSynthesis.cancel();
      
      // Short delay to ensure previous speech is properly canceled
      setTimeout(() => {
        startSpeech();
      }, 50);
    } catch (error) {
      setIsActive(false);
      setIsPaused(false);
    }
  };
  
  // Function to pause speech
  const pauseSpeech = () => {
    try {
      if (window.speechSynthesis && isActive) {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    } catch (error) {
      setIsActive(false);
      setIsPaused(false);
    }
  };
  
  // Function to resume speech
  const resumeSpeech = () => {
    try {
      if (window.speechSynthesis && isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      }
    } catch (error) {
      setIsActive(false);
      setIsPaused(false);
    }
  };
  
  // Function to handle rate change
  const handleRateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRate = parseFloat(e.target.value);
    
    // Update the rate state immediately
    setRate(newRate);
    
    // If currently speaking, we need to restart with the new rate
    if (isActive) {
      // Store information about current state
      const wasPlaying = !isPaused;
      
      // Cancel the current speech
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // Ignore errors on cancel
      }
      
      // Short delay to ensure previous speech is properly canceled
      setTimeout(() => {
        try {
          // Create a new utterance with the new rate
          const utterance = new SpeechSynthesisUtterance(textToSpeakRef.current);
          utterance.lang = languageCode === 'hi' ? 'hi-IN' : 'en-GB';
          utterance.rate = newRate;
          
          utterance.onstart = () => {
            setIsActive(true);
            setIsPaused(false);
          };
          
          utterance.onend = () => {
            setIsActive(false);
            setIsPaused(false);
          };
          
          utterance.onerror = () => {
            setIsActive(false);
            setIsPaused(false);
          };
          
          // Store the new utterance reference
          speechSynthRef.current = utterance;
          
          // Start speaking with the new rate
          window.speechSynthesis.speak(utterance);
          
          // If it was paused before, pause it again
          if (!wasPlaying) {
            setTimeout(() => {
              try {
                window.speechSynthesis.pause();
                setIsPaused(true);
              } catch (e) {
                // Ignore pause errors
              }
            }, 50);
          }
        } catch (error) {
          setIsActive(false);
          setIsPaused(false);
        }
      }, 50);
    }
  };
  
  return (
    <div className="text-to-speech-controls mt-4">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        {/* Speed selector */}
        <select
          value={rate}
          onChange={handleRateChange}
          className="p-1 border border-gray-300 rounded"
        >
          <option value="0.5">{languageCode === 'hi' ? 'धीमी गति' : 'Slow'}</option>
          <option value="1">{languageCode === 'hi' ? 'सामान्य' : 'Normal'}</option>
          <option value="1.5">{languageCode === 'hi' ? 'तेज़' : 'Fast'}</option>
        </select>
        
        {/* Play/Pause Toggle Button */}
        <button
          onClick={togglePlayPause}
          className={`px-4 py-1 rounded-md text-white font-medium ${
            isActive && !isPaused 
              ? "bg-blue-700 hover:bg-blue-800" 
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {!isActive 
            ? (languageCode === 'hi' ? 'बोलो' : 'Play') 
            : isPaused 
              ? (languageCode === 'hi' ? 'जारी रखें' : 'Resume') 
              : (languageCode === 'hi' ? 'रोकें' : 'Pause')
          } 
          <span className="ml-1">
            {!isActive 
              ? '▶️' 
              : isPaused 
                ? '▶️' 
                : '⏸️'
            }
          </span>
        </button>
        
        {/* Restart Button - only show when active or paused */}
        {isActive && (
          <button
            onClick={restartSpeech}
            className="px-4 py-1 rounded-md bg-green-600 hover:bg-green-700 text-white font-medium"
          >
            {languageCode === 'hi' ? 'फिर से शुरू करें' : 'Restart'} 
            <span className="ml-1">🔄</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default TextToSpeech;