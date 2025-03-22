"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChartLine,
  FaBrain,
  FaQuestion,
  FaComments,
  FaArrowRight,
} from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import RagQueryInterface from "@/components/ui/rag-interface";
import Link from "next/link";
import { FiUpload } from "react-icons/fi";
import { HumanQuery, LLMResponse } from "./chat-ui";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import TableRenderer from "@/components/ui/table-renderer";

dayjs.extend(relativeTime);

// Language translations
const translations = {
  english: {
    greeting: "Hello, User",
    uploadPrompt: "Upload a file to get started",
    recentChats: "Recent Chats",
    enterQuery: "Enter your query",
    language: "English",
    uploadError: "Error uploading file. Please try again.",
    uploadingFile: "Uploading & processing file...",
    pdfOnly: "Only PDF files are allowed",
  },
  hindi: {
    greeting: "नमस्ते, उपयोगकर्ता",
    uploadPrompt: "शुरू करने के लिए फ़ाइल अपलोड करें",
    recentChats: "हाल की चैट",
    enterQuery: "अपना प्रश्न दर्ज करें",
    language: "हिंदी",
    uploadError: "फ़ाइल अपलोड करने में त्रुटि। कृपया पुन: प्रयास करें।",
    uploadingFile: "फ़ाइल अपलोड और संसाधित की जा रही है...",
    pdfOnly: "केवल पीडीएफ फाइलें अनुमत हैं",
  },
};

export interface ChatHistory {
  role: string;
  value: string;
}

// upload PDF to backend
const uploadPdfToBackend = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("http://localhost:8000/upload/pdf", {
      method: "POST",
      body: formData,
      // Remove credentials setting completely
    });

    console.log("Response status:", response.status);

    const result = await response.json();
    console.log("Response data:", result);

    if (response.ok) {
      return {
        success: true,
        message: "Upload successful",
        filename: file.name,
      };
    } else {
      return {
        success: false,
        message: "Upload failed",
        filename: file.name,
      };
    }
  } catch (error) {
    console.error("Error:", error);
    return {
      success: false,
      message: "Connection error",
      filename: file.name,
    };
  }
};
function timeAgo(timestamp: any) {
  return dayjs(timestamp).fromNow();
}

const RecentChatsSkeleton = () => {
  return (
    <div className="w-full mt-8">
      <div className="h-8 w-48 bg-neutral rounded-lg animate-pulse mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className="bg-neutral rounded-3xl p-6 border-transparent transition-colors duration-200"
            style={{ borderWidth: '3px' }}
          >
            <div className="flex items-start mb-2">
              <div className="w-5 h-5 mt-1 mr-2 bg-gray-300 rounded-md animate-pulse"></div>
              <div className="h-5 bg-gray-300 rounded-md animate-pulse w-3/4"></div>
            </div>
            <div className="w-1/3 h-4 mt-2 bg-gray-300 rounded-md animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Home() {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [language, setLanguage] = useState<"english" | "hindi">("english");
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [chatHistory, setChatHistory] = useState([] as ChatHistory[]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [posts, setPosts] = useState([]);
  const [tables, setTables] = useState([] as any[]);
  const [isLoadingChats, setIsLoadingChats] = useState<boolean>(true);


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (file.type !== "application/pdf") {
        setUploadError(translations[language].pdfOnly);
        return;
      }

      setIsUploading(true);
      setUploadError(null);

      try {
        const result = await uploadPdfToBackend(file);

        if (result.success) {
          setFileName(result.filename);
          setFileUploaded(true);
          setUploadError(null);
        } else {
          setUploadError(result.message);
        }
      } catch (error) {
        console.error("Error during upload:", error);
        setUploadError(translations[language].uploadError);
      } finally {
        setIsUploading(false);
      }
    }
  };

  useEffect(() => {
    // MODIFIED: Added loading state handling
    setIsLoadingChats(true);
    try {
      fetch("http://localhost:8000/available-pdfs")
        .then((res) => res.json())
        .then((data) => {
          setPosts(data.files);
          // ADDED: Set loading to false when data is fetched
          setIsLoadingChats(false);
        })
        .catch((error) => {
          console.error("Error fetching PDFs:", error);
          setIsLoadingChats(false);
        });
    } catch (e) {
      console.error(e);
      setIsLoadingChats(false);
    }
  }, []);

  console.log(posts);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const isTagSelected = (tag: string) => selectedTags.includes(tag);

  const getTagColor = (tag: string) => {
    switch (tag) {
      case "Graphs":
        return "#E3513E";
      case "Explain":
        return "#07942D";
      default:
        return "#000000";
    }
  };

  const getTagIcon = (tag: string) => {
    switch (tag) {
      case "Graphs":
        return <FaChartLine className="mr-2" />;
      case "Explain":
        return <FaBrain className="mr-2" />;
      default:
        return null;
    }
  };

  const resetUpload = () => {
    setFileUploaded(false);
    setFileName("");
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const toggleLanguageDropdown = () => {
    setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
  };

  const changeLanguage = (lang: "english" | "hindi") => {
    setLanguage(lang);
    setIsLanguageDropdownOpen(false);
  };

  // Get current language text
  const t = translations[language];

  // Get currently available pdfs
  // const pdfsJson = await getPdfs();

  return (
    <div className="min-h-screen bg-background">
      <header className="p-5 flex justify-between items-center sticky top-0 ">
        <Link href="/">
          <div className="flex items-center gap-1">
            <span className="text-3xl font-dm-sans font-black text-text-primary">
              The
            </span>
            <span className="text-4xl font-dm-sans font-black text-primary">
              •
            </span>
            <span className="text-3xl font-dm-sans font-black text-text-primary">
              Waffle
            </span>
          </div>
        </Link>
        <div className="flex gap-2">
          <div ref={dropdownRef} className="relative">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-primary text-primary-foreground hover:bg-secondary h-12 w-12"
              onClick={toggleLanguageDropdown}
            >
              <img src="/language.png" alt="Translate" className="h-6 w-6" />
            </Button>

            {isLanguageDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-lg z-10"
              >
                <div className="py-1">
                  <button
                    onClick={() => changeLanguage("english")}
                    className={`w-full text-left px-4 py-3 text-sm text-text-primary ${language === "english"
                      ? "bg-primary bg-opacity-10 rounded-2xl text-white"
                      : "hover:bg-gray-100 rounded-2xl"
                      }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => changeLanguage("hindi")}
                    className={`w-full text-left px-4 py-3 text-sm text-text-primary ${language === "hindi"
                      ? "bg-primary bg-opacity-10 rounded-2xl text-white"
                      : "hover:bg-gray-100 rounded-2xl"
                      }`}
                  >
                    हिंदी
                  </button>
                </div>
              </motion.div>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-primary text-secondary-foreground hover:bg-secondary h-12 w-12"
          >
            <img
              src="/accessibility.png"
              alt="Accessibility"
              className="h-6 w-6"
            />
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-5 flex flex-col items-center">
        <AnimatePresence>
          {!fileUploaded ? (
            <>
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col items-center mt-8 mb-10"
              >
                <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4">
                  <img
                    src="/arbaaz.png"
                    alt="User profile"
                    className="object-cover"
                  />
                </div>
                <h1 className="text-3xl font-dm-sans font-semibold text-text-primary">
                  {t.greeting}
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`w-full border-4 border-dashed ${uploadError ? "border-red-500" : "border-text-primary"
                  } rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-[#1C80E320] transition-all group ${!isUploading ? "hover:border-primary hover:border-solid" : ""
                  }`}
                onClick={!isUploading ? triggerFileInput : undefined}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="application/pdf"
                />

                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <div className="text-primary mb-4">
                      <svg
                        className="animate-spin h-16 w-16"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    </div>
                    <p className="text-2xl font-dm-sans text-primary">
                      {t.uploadingFile}
                    </p>
                  </div>
                ) : (
                  <>
                    <div
                      className={`text-text-primary mb-4 group-hover:text-primary ${uploadError ? "text-red-500" : ""
                        }`}
                    >
                      <FiUpload className="w-36 h-36" />
                    </div>
                    <p
                      className={`text-2xl font-dm-sans ${uploadError
                        ? "text-red-500"
                        : "text-text-primary group-hover:text-primary"
                        }`}
                    >
                      {uploadError || t.uploadPrompt}
                    </p>
                  </>
                )}
              </motion.div>

              {isLoadingChats ? (
                <RecentChatsSkeleton />
              ) : (
                <div className="w-full mt-8">
                  <h2 className="text-2xl font-dm-sans font-semibold text-text-primary mb-4">
                    {t.recentChats}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Array.isArray(posts) && posts.length > 0 ? (
                      posts.map((data: any, i) => (
                        <button key={i}
                          onClick={() => (
                            setFileUploaded(true), setFileName(data.name)
                          )}
                          className="w-full"
                        >
                          <div
                            className="bg-neutral rounded-3xl p-6 hover:bg-[#DADADA] border-transparent hover:border-text-secondary transition-colors duration-200 cursor-pointer text-ellipsis text-left"
                            style={{ borderWidth: "3px" }}
                          >
                            <div className="flex items-start mb-2">
                              <FaComments className="text-text-secondary mt-1 mr-2" />
                              <h3 className="font-dm-sans text-text-primary font-medium text-bold">
                                Chat with {data.name}
                              </h3>
                            </div>
                            <p className="text-base font-dm-sans text-text-secondary font-bold">
                              {timeAgo(data.created_at)}
                            </p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="text-text-secondary col-span-3 text-center py-8">No recent chats</p>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <motion.div
              key="rag-interface"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-grow flex flex-col h-full overflow-auto mb-96"
            >
              <div className="flex flex-col items-end">
                {chatHistory.map((historyItem, index) =>
                  historyItem.role === "llm" ? (
                    <LLMResponse
                      key={`response-${index}`}
                      value={historyItem.value}
                      tables={tables}
                    />
                  ) : (
                    <HumanQuery
                      key={`query-${index}`}
                      value={historyItem.value}
                    />
                  )
                )}
              </div>
              <div className="flex-grow" />{" "}
              {/* This creates space above the interface */}
              <div className="fixed bottom-0 left-0 right-0 mb-6 mx-auto max-w-3xl w-11/12">
                <RagQueryInterface
                  fileName={fileName}
                  onReset={resetUpload}
                  selectedTags={selectedTags}
                  toggleTag={toggleTag}
                  getTagColor={getTagColor}
                  getTagIcon={getTagIcon}
                  isTagSelected={isTagSelected}
                  language={language}
                  translations={translations}
                  setChatHistory={setChatHistory}
                  chatHistory={chatHistory}
                  setTables={setTables}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
