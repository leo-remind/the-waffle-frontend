"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaChartLine, FaBrain, FaQuestion, FaComments, FaArrowRight } from "react-icons/fa6"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import RagQueryInterface from "@/components/ui/rag-interface"
import Link from "next/link"
import { FiUpload } from "react-icons/fi";
import { HumanQuery, LLMResponse } from "./chat-ui"

// Language translations
const translations = {
  english: {
    greeting: "Hello, User",
    uploadPrompt: "Upload a file to get started",
    recentChats: "Recent Chats",
    enterQuery: "Enter your query",
    language: "English"
  },
  hindi: {
    greeting: "नमस्ते, उपयोगकर्ता",
    uploadPrompt: "शुरू करने के लिए फ़ाइल अपलोड करें",
    recentChats: "हाल की चैट",
    enterQuery: "अपना प्रश्न दर्ज करें",
    language: "हिंदी"
  }
}

export interface ChatHistory {
  role : string;
  value : string;
}

export default function Home() {
  const [fileUploaded, setFileUploaded] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [fileName, setFileName] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [language, setLanguage] = useState<"english" | "hindi">("english")
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [chatHistory, setChatHistory] = useState([] as ChatHistory[]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name)
      setFileUploaded(true)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const isTagSelected = (tag: string) => selectedTags.includes(tag)

  const getTagColor = (tag: string) => {
    switch (tag) {
      case "Graphs":
        return "#E3513E"
      case "Explain":
        return "#07942D"
      case "Reason":
        return "#4B0794"
      default:
        return "#000000"
    }
  }

  const getTagIcon = (tag: string) => {
    switch (tag) {
      case "Graphs":
        return <FaChartLine className="mr-2" />
      case "Explain":
        return <FaBrain className="mr-2" />
      case "Reason":
        return <FaQuestion className="mr-2" />
      default:
        return null
    }
  }

  const resetUpload = () => {
    setFileUploaded(false)
    setFileName("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const toggleLanguageDropdown = () => {
    setIsLanguageDropdownOpen(!isLanguageDropdownOpen)
  }

  const changeLanguage = (lang: "english" | "hindi") => {
    setLanguage(lang)
    setIsLanguageDropdownOpen(false)
  }

  // Get current language text
  const t = translations[language]

  return (
    <div className="min-h-screen bg-background">
      <header className="p-5 flex justify-between items-center sticky top-0 ">
        <Link href="/">
        <div className="flex items-center gap-1">
          <span className="text-3xl font-dm-sans font-black text-text-primary">The</span>
          <span className="text-4xl font-dm-sans font-black text-primary">•</span>
          <span className="text-3xl font-dm-sans font-black text-text-primary">Waffle</span>
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
                    className={`w-full text-left px-4 py-3 text-sm text-text-primary ${language === "english" ? "bg-primary bg-opacity-10 rounded-2xl text-white" : "hover:bg-gray-100 rounded-2xl"}`}
                  >
                    English
                  </button>
                  <button 
                    onClick={() => changeLanguage("hindi")} 
                    className={`w-full text-left px-4 py-3 text-sm text-text-primary ${language === "hindi" ? "bg-primary bg-opacity-10 rounded-2xl text-white" : "hover:bg-gray-100 rounded-2xl"}`}
                  >
                    हिंदी
                  </button>
                </div>
              </motion.div>
            )}
          </div>
          <Button variant="outline" size="icon" className="rounded-full bg-primary text-secondary-foreground hover:bg-secondary h-12 w-12">
            <img src="/accessibility.png" alt="Accessibility" className="h-6 w-6" />
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
                  <img src="/arbaaz.png" alt="User profile" className="object-cover" />
                </div>
                <h1 className="text-3xl font-dm-sans font-semibold text-text-primary">{t.greeting}</h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`w-full border-4 border-dashed border-text-primary rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-[#1C80E320] transition-all group hover:border-primary hover:border-solid`}
                onClick={triggerFileInput}
              >
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                <div className="text-text-primary mb-4 group-hover:text-primary">
                  <FiUpload className="w-36 h-36"/>
                </div>
                <p className="text-2xl font-dm-sans text-text-primary group-hover:text-primary">{t.uploadPrompt}</p>
              </motion.div>
{/* 
              <div className="flex gap-2 mt-4 self-start">
                {["Graphs", "Explain", "Reason"].map((tag) => (
                  <Button
                    key={tag}
                    variant="outline"
                    className={`rounded-full font-dm-sans ${
                      isTagSelected(tag)
                        ? `bg-opacity-50 text-white border-[${getTagColor(tag)}] bg-[${getTagColor(tag)}]`
                        : `bg-background text-[${getTagColor(tag)}] border-[${getTagColor(tag)}]`
                    }`}
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
              </div> */}

              <div className="w-full mt-8">
                <h2 className="text-2xl font-dm-sans font-semibold text-text-primary mb-4">{t.recentChats}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-neutral rounded-3xl p-6 hover:bg-[#DADADA] border-transparent hover:border-text-secondary transition-colors duration-200 cursor-pointer" style={{ borderWidth: '3px' }}>
                      <div className="flex items-start mb-2">
                        <FaComments className="text-text-secondary mt-1 mr-2" />
                        <h3 className="font-dm-sans text-text-primary font-medium text-bold">How to do magic in english</h3>
                      </div>
                      <p className="text-base font-dm-sans text-text-secondary font-bold">1 DAY AGO</p>
                    </div>
                  ))}
                </div>
              </div>
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
              {
                chatHistory.map((historyItem) => historyItem.role == "llm" ? <LLMResponse value={historyItem.value}/> : <HumanQuery value={historyItem.value}/>)
              }
              </div>
              <div className="flex-grow" /> {/* This creates space above the interface */}
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
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}