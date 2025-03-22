import { useState, useEffect, useRef } from 'react';
import { remark } from 'remark';
import html from 'remark-html';
import { FaChartLine, FaTable } from 'react-icons/fa6';
import { FaTimes } from 'react-icons/fa';
import './markdown-styles.css'; // Import custom CSS for markdown styling
import TableRenderer from '@/components/ui/table-renderer';

export function LLMResponse({
    value,
    tables
}: {
    value: string,
    tables: any[]
}) {
    const [processedContent, setProcessedContent] = useState('');
    const [showVisualization, setShowVisualization] = useState(false);
    const [activeTab, setActiveTab] = useState<'table' | 'chart'>('table');
    const responseRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const processMarkdown = async () => {
            const result = await remark()
                .use(html)
                .process(value);

            setProcessedContent(result.toString());
        };

        processMarkdown();

        // Add the split layout styles if they don't exist
        if (!document.getElementById('split-layout-styles')) {
            const style = document.createElement('style');
            style.id = 'split-layout-styles';
            style.innerHTML = `
                .app-container {
                    display: flex;
                    width: 100%;
                    height: 100vh;
                    overflow: hidden;
                }
                
                .visualization-panel {
                    width: 50%;
                    height: 100vh;
                    border-left: 1px solid #e5e7eb;
                    background-color: white;
                    position: fixed;
                    top: 0;
                    right: 0;
                    z-index: 40;
                    overflow-y: auto;
                    transform: translateX(100%);
                    transition: transform 0.3s ease-in-out;
                }
                
                .visualization-panel.open {
                    transform: translateX(0);
                }
                
                .chat-container {
                    flex: 1;
                    overflow-y: auto;
                    transition: margin-right 0.3s ease-in-out;
                }
                
                .chat-container.shifted {
                    margin-right: 50%;
                }
                
                .visualization-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem;
                    border-bottom: 1px solid #e5e7eb;
                }
                
                .visualization-content {
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;
                    height: calc(100vh - 60px);
                }
                
                .tab-container {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                }
                
                .tab {
                    flex: 1;
                    padding: 0.5rem;
                    text-align: center;
                    border-radius: 0.25rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }
                
                .tab.active {
                    background-color: hsl(var(--primary));
                    color: white;
                }
                
                .tab-panel {
                    flex-grow: 1;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.5rem;
                    padding: 1rem;
                    overflow-y: auto;
                }
                
                body.visualization-open {
                    overflow: hidden;
                }
            `;
            document.head.appendChild(style);
        }
    }, []);

    let sampleTableData: any[]= []
    useEffect(() => {
        // Adjust the body class when visualization is shown/hidden
        if (showVisualization) {
            document.body.classList.add('visualization-open');

            // Add event listener to handle escape key
            const handleEscape = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    setShowVisualization(false);
                }
            };

            document.addEventListener('keydown', handleEscape);
            return () => {
                document.removeEventListener('keydown', handleEscape);
            };
        } else {
            document.body.classList.remove('visualization-open');
        }
    }, [showVisualization]);

    const handleVisualize = () => {
        setShowVisualization(true);
    };

    const closeVisualization = () => {
        setShowVisualization(false);
    };

    // Adding the app wrapper to manage layout
    useEffect(() => {
        // Check if we need to wrap the app
        const appContainer = document.querySelector('.app-container');
        if (!appContainer && document.body.firstChild) {
            // Create wrapper
            const wrapper = document.createElement('div');
            wrapper.className = 'app-container';

            // Create chat container
            const chatContainer = document.createElement('div');
            chatContainer.className = 'chat-container';

            // Move all existing body children to the chat container
            while (document.body.firstChild) {
                chatContainer.appendChild(document.body.firstChild);
            }

            // Append containers to the DOM
            wrapper.appendChild(chatContainer);
            document.body.appendChild(wrapper);
        }
    }, []);


    return (
        <>
            <div
                className="relative p-4 pb-14 bg-transparent rounded-[16px] my-4 w-full text-left"
                ref={responseRef}
            >
                <div
                    className="absolute bottom-2 left-2 z-10"
                >
                    <button
                        onClick={handleVisualize}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white text-primary border border-primary rounded-full shadow-sm hover:bg-primary hover:text-white transition-colors duration-200"
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

            {/* Visualization panel */}
            <div className={`visualization-panel ${showVisualization ? 'open' : ''}`}>
                <div className="visualization-header">
                    <h2 className="text-xl font-bold font-dm-sans">Visualization</h2>
                    <button
                        onClick={closeVisualization}
                        className="p-1 rounded-full hover:bg-gray-100"
                    >
                        <FaTimes className="h-5 w-5" />
                    </button>
                </div>

                <div className="visualization-content">
                    <div className="tab-container">
                        <div
                            className={`tab font-dm-sans ${activeTab === 'table' ? 'active' : ''}`}
                            onClick={() => setActiveTab('table')}
                        >
                            <FaTable className="h-4 w-4" />
                            <span>Table View</span>
                        </div>
                        <div
                            className={`tab font-dm-sans ${activeTab === 'chart' ? 'active' : ''}`}
                            onClick={() => setActiveTab('chart')}
                        >
                            <FaChartLine className="h-4 w-4" />
                            <span>Chart View</span>
                        </div>
                    </div>

                    <div className="tab-panel">
                        {activeTab === 'table' ? (
                            <div className="overflow-x-auto">
                                <TableRenderer jsonData={tables} />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className="mb-2">Sample Chart View</div>
                                    <div className="flex items-end justify-center h-40 gap-4">
                                        {sampleTableData.map(item => (
                                            <div key={item.id} className="flex flex-col items-center">
                                                <div
                                                    className="w-16 bg-primary"
                                                    style={{ height: `${item.value / 2}px` }}
                                                ></div>
                                                <div className="mt-2">{item.name}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add script to manipulate DOM structure */}
            {showVisualization && (
                <script dangerouslySetInnerHTML={{
                    __html: `
                    (function() {
                        const chatContainer = document.querySelector('.chat-container');
                        if (chatContainer) {
                            chatContainer.classList.add('shifted');
                        }
                    })();
                `}} />
            )}

            {!showVisualization && (
                <script dangerouslySetInnerHTML={{
                    __html: `
                    (function() {
                        const chatContainer = document.querySelector('.chat-container');
                        if (chatContainer) {
                            chatContainer.classList.remove('shifted');
                        }
                    })();
                `}} />
            )}
        </>
    );
};


export function HumanQuery({
    value
}: {
    value: string
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
