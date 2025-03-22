import { useState, useEffect, useRef } from 'react';
import { remark } from 'remark';
import html from 'remark-html';
import './markdown-styles.css'; // Import custom CSS for markdown styling
import { FaChartLine } from 'react-icons/fa';

export function LLMResponse({
    value
} : {
    value : string
}) {
    const [processedContent, setProcessedContent] = useState('');
    const responseRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const processMarkdown = async () => {
            const result = await remark()
                .use(html)
                .process(value);
            
            setProcessedContent(result.toString());
        };
        
        processMarkdown();
    }, [value]);

    const handleVisualize = () => {
        // Implement your visualization logic here
        console.log("Visualizing content with tables and charts");
        // This would connect to your visualization system
    };
    
    return (
        <div 
            className="relative p-4 pb-14 bg-transparent rounded-[16px] my-4 w-full text-left"
            ref={responseRef}
        >
            <div 
                className="absolute bottom-2 left-2 z-10"
            >
                <button
                    onClick={handleVisualize}
                    className="flex items-center gap-2 px-3 py-2 bg-white text-primary border border-primary rounded-full shadow-md hover:bg-primary hover:text-white transition-colors duration-200"
                >
                    <FaChartLine className="h-4 w-4" />
                    <span className="text-sm font-medium font-dm-sans">Visualize with table and charts</span>
                </button>
            </div>
            
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