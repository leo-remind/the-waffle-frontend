"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaChartLine, FaBrain, FaQuestion, FaComments, FaArrowRight } from "react-icons/fa6"
import { Button } from "@/components/ui/button"
import Image from "next/image"

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

export default function Home() {
  const [fileUploaded, setFileUploaded] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [fileName, setFileName] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [language, setLanguage] = useState<"english" | "hindi">("english")
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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
      <header className="p-5 flex justify-between items-center">
        <div className="flex items-center gap-1">
          <span className="text-3xl font-dm-sans font-black text-text-primary">The</span>
          <span className="text-3xl font-dm-sans font-bold text-primary">•</span>
          <span className="text-3xl font-dm-sans font-black text-text-primary">Waffle</span>
        </div>
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

      <main className="max-w-3xl mx-auto p-5 flex flex-col items-center">
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
                className="w-full border-4 border-dashed border-text-primary rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer"
                onClick={triggerFileInput}
              >
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                <div className="text-text-primary mb-4">
                  <svg width="72" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 16V8M12 8L8 12M12 8L16 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 15V16C3 18.2091 4.79086 20 7 20H17C19.2091 20 21 18.2091 21 16V15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="text-2xl font-dm-sans text-text-primary">{t.uploadPrompt}</p>
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
                      <p className="text-base font-dm-sans text-text-secondary">1 DAY AGO</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col items-center justify-center min-h-[70vh]"
            >
              <div className="w-full max-w-2xl bg-[#F5F5F5] rounded-lg border border-neutral overflow-hidden">
                <div className="bg-white p-2 flex items-center justify-between">
                  <div className="bg-white px-5 py-2 rounded-full font-dm-sans">{fileName}</div>
                  <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={resetUpload}>
                    <FaArrowRight className="h-5 w-5" />
                  </Button>
                </div>
                <div className="p-4">
                  <div className="border border-neutral rounded-lg p-6 bg-white">
                    <input
                      type="text"
                      placeholder="Enter your query"
                      className="w-full border-none outline-none font-dm-sans text-primary"
                    />
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex gap-2">
                        {selectedTags.map((tag) => (
                          <div
                            key={tag}
                            className="rounded-full px-3 py-1 flex items-center font-dm-sans text-white"
                            style={{
                              backgroundColor: getTagColor(tag),
                            }}
                          >
                            {getTagIcon(tag)} {tag}
                          </div>
                        ))}
                      </div>
                      <Button size="icon" className="rounded-full bg-secondary text-white h-10 w-10">
                        <FaArrowRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

