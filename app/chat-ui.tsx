import { useState, useEffect } from 'react';
import { remark } from 'remark';
import html from 'remark-html';
import './markdown-styles.css'; // Import custom CSS for markdown styling

export function LLMResponse({
    value
} : {
    value : string
}) {
    const [processedContent, setProcessedContent] = useState('');
    
    useEffect(() => {
        const processMarkdown = async () => {
            const result = await remark()
                .use(html)
                .process(value);
            
            setProcessedContent(result.toString());
        };
        
        processMarkdown();
    }, [value]);
    
    return (
        <div className="p-4 bg-transparent rounded-[16px] my-4 w-full text-left">
            <div 
                className="markdown-content llm-markdown text-lg font-medium font-dm-sans"
                dangerouslySetInnerHTML={{ __html: processedContent }}
            />
        </div>
    );
}

export function HumanQuery({
    value
} : {
    value : string
}) {
    const [processedContent, setProcessedContent] = useState('');
    
    useEffect(() => {
        const processMarkdown = async () => {
            const result = await remark()
                .use(html)
                .process(value);
            
            setProcessedContent(result.toString());
        };
        
        processMarkdown();
    }, [value]);
    
    return (
        <div className="p-4 bg-primary rounded-[16px] max-w-1/2 w-fit my-4">
            <div 
                className="markdown-content human-markdown text-lg font-medium text-white font-dm-sans"
                dangerouslySetInnerHTML={{ __html: processedContent }}
            />
        </div>
    );
}