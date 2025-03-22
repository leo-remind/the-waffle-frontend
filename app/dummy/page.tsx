"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
// import TableRenderer from "@/components/TableRenderer";
import SpeechToText from "@/components/ours/speech2text";
// import TextToSpeech from "@/components/ours/text2speech";

interface UploadStatus {
  success: boolean;
  message: string;
  data?: any;
}

export default function Home() {
  const [jsonData, setJsonData] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);
  const [languageCode, setLanguageCode] = useState<string>("en"); // Default to English
  const [responseText, setResponseText] = useState<string>(""); // Add state for response text

  useEffect(() => {
    fetch("/ee.json")
      .then((response) => response.json())
      .then((data) => {
        setJsonData(data);
        // For demo purposes, let's set some sample response text
        if (data && data.length > 0) {
          setResponseText("My name is Eesha. I live in a small village near the mountains. My chocolate has 250 calories and 57% fat. Title: how does a lady gain weight and never works out. I hope you enjoy reading my story.");
        }
      })
      .catch((error) => {
        console.error("Error fetching JSON:", error);
        setResponseText("Error fetching data. Please try again later.");
      });
  }, []);

  // Handle file selection
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0] && files[0].type === "application/pdf") {
      setSelectedFile(files[0]);
      setUploadStatus(null);
    } else {
      setSelectedFile(null);
      setUploadStatus({
        success: false,
        message: "Please select a valid PDF file"
      });
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus({
        success: false,
        message: "Please select a PDF file first"
      });
      return;
    }

    setUploading(true);
    
    // Create form data object
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // Replace with your actual API endpoint
      const response = await fetch("http://localhost:8000/upload/pdf", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok) {
        const successMessage = `File ${result.filename} uploaded successfully!`;
        setUploadStatus({
          success: true,
          message: successMessage,
          data: result
        });
        setResponseText(successMessage); // Set response text for TTS
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById("file-upload") as HTMLInputElement;
        if (fileInput) {
          fileInput.value = "";
        }
      } else {
        const errorMessage = result.detail || "Upload failed";
        setUploadStatus({
          success: false,
          message: errorMessage
        });
        setResponseText(errorMessage); // Set response text for TTS
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      const errorMessage = "Error connecting to server";
      setUploadStatus({
        success: false,
        message: errorMessage
      });
      setResponseText(errorMessage); // Set response text for TTS
    } finally {
      setUploading(false);
    }
  };

  // Handle language selection change
  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setLanguageCode(event.target.value);
  };

  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center gap-8">
      <h1 className="text-2xl font-bold">PDF Upload & Table Viewer</h1>
      
      {/* Language Selector */}
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Language Settings</h2>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="language-select">
            Select Language
          </label>
          <select
            id="language-select"
            value={languageCode}
            onChange={handleLanguageChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="en">English (UK)</option>
            <option value="hi">Hindi</option>
          </select>
        </div>
      </div>
      
      {/* Speech to Text Component - Pass languageCode as prop */}
      <SpeechToText languageCode={languageCode} />
      
      {/* PDF Upload Section */}
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Upload PDF</h2>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file-upload">
            Select PDF File
          </label>
          <input
            id="file-upload"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        
        {selectedFile && (
          <p className="text-sm text-gray-600 mb-4">
            Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
          </p>
        )}
        
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            !selectedFile || uploading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {uploading ? "Uploading..." : "Upload PDF"}
        </button>
        
        {uploadStatus && (
          <div className={`mt-4 p-3 rounded-md ${
            uploadStatus.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}>
            {uploadStatus.message}
            
            {/* Text to Speech for response message */}
            <TextToSpeech 
              text={uploadStatus.message} 
              languageCode={languageCode} 
            />
          </div>
        )}
      </div>
      
      {/* Response Section with Text-to-Speech */}
      {responseText && (
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Output</h2>
          <div className="p-3 bg-gray-50 rounded-md">
            <p>{responseText}</p>
            
            {/* Text to Speech for main response */}
            <TextToSpeech 
              text={responseText} 
              languageCode={languageCode} 
            />
          </div>
        </div>
      )}
      
      {/* Table Section */}
      <TableRenderer jsonData={jsonData} />
    </div>
  );
}