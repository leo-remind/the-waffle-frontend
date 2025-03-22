"use client";
import { FaCircleStop, FaMicrophone, FaMicrophoneSlash } from "react-icons/fa6";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

// Add type definitions for the Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: any) => void;
  onstart: (event: Event) => void;
  onend: (event: Event) => void;
}

// Declare global types for browser-specific implementations
declare global {
  interface Window {
    SpeechRecognition?: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition?: {
      new (): SpeechRecognition;
    };
  }
}

interface SpeechToTextProps {
  onTranscriptUpdate?: (transcript: string) => void;
  languageCode?: string; // New prop for language code
}

const SpeechToText: React.FC<SpeechToTextProps> = ({
  onTranscriptUpdate,
  languageCode = "en", // Default to English
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [error, setError] = useState<string>("");
  const recognizerRef = useRef<SpeechRecognition | null>(null);

  // Determine language based on language code
  const getLanguageLocale = () => {
    if (languageCode === "hi") {
      return "hi-IN"; // Hindi (India)
    } else {
      return "en-GB"; // English (UK) for all other cases
    }
  };

  // Initialize the speech recognition engine
  useEffect(() => {
    // Check if browser supports the Web Speech API
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      setError(
        "Your browser doesn't support speech recognition. Please try Chrome or Edge."
      );
      return;
    }

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    // Initialize recognizer
    const recognizer = new SpeechRecognitionAPI();
    recognizer.continuous = true;
    recognizer.interimResults = true;
    recognizer.lang = getLanguageLocale();

    recognizer.onresult = handleRecognitionResult;

    recognizer.onerror = (event: { error: string }) => {
      setError(`Recognition error: ${event.error}`);
    };

    // Store the recognizer in ref
    recognizerRef.current = recognizer;

    // Cleanup function
    return () => {
      if (recognizerRef.current) {
        try {
          recognizerRef.current.stop();
        } catch (e) {
          // Ignore errors when stopping
        }
      }
    };
  }, [languageCode]); // Re-initialize when language code changes

  // Function to handle recognition results
  const handleRecognitionResult = (event: SpeechRecognitionEvent) => {
    let interimTranscript = "";
    let finalTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;

      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    const currentTranscript = finalTranscript || interimTranscript;

    if (currentTranscript.trim() !== "") {
      setTranscript(currentTranscript);

      if (onTranscriptUpdate) {
        onTranscriptUpdate(currentTranscript);
      }
    }
  };

  // Function to toggle listening
  const toggleListening = () => {
    if (isListening) {
      if (recognizerRef.current) {
        try {
          recognizerRef.current.stop();
        } catch (e) {
          // Ignore errors when stopping
        }
      }
      setIsListening(false);
    } else {
      setError("");
      setTranscript("");

      // Start recognizer
      try {
        if (recognizerRef.current) {
          // Update language in case it changed
          recognizerRef.current.lang = getLanguageLocale();
          recognizerRef.current.start();
          setIsListening(true);
        }
      } catch (err) {
        setError("Error starting speech recognition. Try refreshing the page.");
      }
    }
  };

  // Get current language name for display
  const getCurrentLanguageName = () => {
    return languageCode === "hi" ? "Hindi" : "English (UK)";
  };

  return (
      <Button
      size="icon"
      className={`rounded-full ${
        isListening ? "bg-red-600 animate-pulse" : "bg-primary"
      } text-white h-10 w-10 flex items-center justify-center hover:bg-secondary flex-shrink-0`}
      onClick={toggleListening}
      >
        {isListening ? <FaCircleStop /> : <FaMicrophone />}
      </Button>
  );
};

export default SpeechToText;
