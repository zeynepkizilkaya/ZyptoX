import React, { useState, useEffect, useRef } from 'react';
import { mockApi } from '../services/mockApi';
import { Button, ChatSkeleton, Spinner } from '../components/UI';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        sender: 'ai',
        text: `### ZyptoX AI Financial Assistant

Hello! I am your ZyptoX AI financial advisor. You can ask me to analyze your portfolio, review your recent transactions, or check the technical outlook for any major crypto assets. Feel free to type your question directly or use the quick access buttons below.`,
        timestamp: new Date(),
      },
    ]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setLoading(true);

    try {
      const response = await mockApi.queryAI(textToSend);
      const aiMsg: Message = {
        sender: 'ai',
        text: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: Message = {
        sender: 'ai',
        text: "Sorry, an error occurred while connecting to the AI service.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, idx) => {
      let trimmed = line.trim();

      if (trimmed.startsWith('###')) {
        return (
          <h3 key={idx} className="text-base font-bold text-ink dark:text-on-dark mt-4 mb-2 first:mt-0 select-text">
            {trimmed.replace(/^###\s+/, '')}
          </h3>
        );
      }
      if (trimmed.startsWith('####')) {
        return (
          <h4 key={idx} className="text-sm font-bold text-ink dark:text-on-dark mt-3 mb-1 first:mt-0 select-text">
            {trimmed.replace(/^####\s+/, '')}
          </h4>
        );
      }

      if (trimmed.startsWith('>')) {
        return (
          <blockquote key={idx} className="border-l-4 border-primary pl-3 py-1 my-2 bg-white dark:bg-canvas-dark/30 text-xs italic text-muted select-text">
            {trimmed.replace(/^>\s+/, '')}
          </blockquote>
        );
      }

      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        const itemContent = trimmed.replace(/^[-*]\s+/, '');
        return (
          <ul key={idx} className="list-disc list-inside ml-2 my-1 text-xs select-text">
            <li className="inline">{parseInlineStyles(itemContent)}</li>
          </ul>
        );
      }

      if (trimmed === '') {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="text-xs leading-relaxed my-1 select-text">
          {parseInlineStyles(line)}
        </p>
      );
    });
  };

  const parseInlineStyles = (line: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    
    const boldRegex = /\*\*(.*?)\*\*/g;
    const codeRegex = /`(.*?)`/g;
    
    const tempText = line;
    
    let match;
    let boldMatches: { start: number, end: number, content: string }[] = [];
    
    while ((match = boldRegex.exec(tempText)) !== null) {
      boldMatches.push({
        start: match.index,
        end: boldRegex.lastIndex,
        content: match[1]
      });
    }

    let lastIndex = 0;
    boldMatches.forEach((m, idx) => {
      if (m.start > lastIndex) {
        parts.push(tempText.substring(lastIndex, m.start));
      }
      parts.push(
        <strong key={`b-${idx}`} className="font-bold text-ink dark:text-on-dark">
          {m.content}
        </strong>
      );
      lastIndex = m.end;
    });

    if (lastIndex < tempText.length) {
      parts.push(tempText.substring(lastIndex));
    }

    const finalParts: React.ReactNode[] = [];
    parts.forEach((part, partIdx) => {
      if (typeof part === 'string') {
        const subParts: React.ReactNode[] = [];
        let subMatch;
        let codeMatches: { start: number, end: number, content: string }[] = [];
        codeRegex.lastIndex = 0;
        
        while ((subMatch = codeRegex.exec(part)) !== null) {
          codeMatches.push({
            start: subMatch.index,
            end: codeRegex.lastIndex,
            content: subMatch[1]
          });
        }
        
        let subLastIndex = 0;
        codeMatches.forEach((cm, cIdx) => {
          if (cm.start > subLastIndex) {
            subParts.push(part.substring(subLastIndex, cm.start));
          }
          subParts.push(
            <code key={`code-${cIdx}`} className="bg-white dark:bg-canvas-dark border border-hairline-light dark:border-hairline-dark px-1.5 py-0.5 rounded text-trading-up font-mono text-[11px]">
              {cm.content}
            </code>
          );
          subLastIndex = cm.end;
        });
        
        if (subLastIndex < part.length) {
          subParts.push(part.substring(subLastIndex));
        }
        
        finalParts.push(...subParts.map((sp, spIdx) => <React.Fragment key={`sp-${partIdx}-${spIdx}`}>{sp}</React.Fragment>));
      } else {
        finalParts.push(part);
      }
    });

    return finalParts.length > 0 ? finalParts : [line];
  };

  return (
    <div className="max-w-[1200px] w-full mx-auto py-6 px-4 flex-1 flex flex-col gap-4 font-sans text-left">
      
      <div className="flex items-center gap-3 pb-4 border-b border-hairline-light dark:border-hairline-dark">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary-active dark:text-primary select-none">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="5" y="5" width="14" height="14" rx="2" />
            <rect x="9" y="9" width="6" height="6" rx="1" />
            <path d="M9 1v4M12 1v4M15 1v4" strokeLinecap="round" />
            <path d="M9 19v4M12 19v4M15 19v4" strokeLinecap="round" />
            <path d="M1 9h4M1 12h4M1 15h4" strokeLinecap="round" />
            <path d="M19 9h4M19 12h4M19 15h4" strokeLinecap="round" />
          </svg>
        </div>
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-ink dark:text-on-dark">AI Financial Advisor</h2>
          <span className="text-[10px] text-muted">Powered by Gemini & Portfolio Analysis Module</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 flex-1 min-h-[450px]">
        <div className="hidden lg:flex flex-col gap-5 p-5 bg-white dark:bg-surface-card-dark border border-hairline-light dark:border-hairline-dark rounded-2xl shadow-sm overflow-y-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-muted">AI Portfolio Analysis</span>

          <div className="flex flex-col items-center justify-center py-4 border-b border-hairline-light/50 dark:border-hairline-dark/30">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex flex-col items-center justify-center text-white shadow-md select-none animate-pulse">
              <span className="text-xl font-extrabold font-mono">88</span>
              <span className="text-[8px] font-black uppercase tracking-wide opacity-85">Score</span>
            </div>
            <span className="text-xs font-bold text-ink dark:text-on-dark mt-3">Moderate Risk Profile</span>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[9px] text-muted font-bold uppercase tracking-wider">Quick Suggestions</span>
            
            <div className="p-3 bg-canvas-light dark:bg-canvas-dark rounded-xl border border-hairline-light dark:border-hairline-dark/60 text-xs">
              <p className="font-bold text-amber-600 dark:text-primary mb-1">Strong Core Bedrock</p>
              <p className="text-muted leading-relaxed text-[10px]">
                Your portfolio holds substantial BTC and ETH, providing good long-term stability and liquidity.
              </p>
            </div>

            <div className="p-3 bg-canvas-light dark:bg-canvas-dark rounded-xl border border-hairline-light dark:border-hairline-dark/60 text-xs">
              <p className="font-bold text-amber-600 dark:text-amber-400 mb-1">Liquidity Suggestion</p>
              <p className="text-muted leading-relaxed text-[10px]">
                Cash balance is 0 USD. Keeping a small percentage of USDC is recommended to capitalize on sudden market dips.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col h-full bg-[#fafafa] dark:bg-surface-card-dark border border-hairline-light dark:border-hairline-dark rounded-2xl p-5 shadow-sm min-w-0">
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 scrollbar-thin mb-4">
            {messages.map((msg, idx) => {
              const isAI = msg.sender === 'ai';
              return (
                <div
                  key={idx}
                  className={`flex gap-3 max-w-[85%] items-start text-left ${
                    isAI ? 'self-start' : 'self-end flex-row-reverse'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center select-none flex-shrink-0 ${
                    isAI ? 'bg-primary/20 text-primary-active dark:text-primary' : 'bg-muted/20 text-ink dark:text-on-dark'
                  }`}>
                    {isAI ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="5" y="5" width="14" height="14" rx="2" />
                        <rect x="9" y="9" width="6" height="6" rx="1" />
                        <path d="M9 1v4M12 1v4M15 1v4" strokeLinecap="round" />
                        <path d="M9 19v4M12 19v4M15 19v4" strokeLinecap="round" />
                        <path d="M1 9h4M1 12h4M1 15h4" strokeLinecap="round" />
                        <path d="M19 9h4M19 12h4M19 15h4" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    )}
                  </div>
                  
                  <div className={`flex flex-col gap-1.5 ${!isAI ? 'items-end' : ''}`}>
                    <div className={`p-4 rounded-xl shadow-sm text-xs leading-relaxed ${
                      isAI 
                        ? 'bg-white dark:bg-surface-elevated-dark border border-hairline-light dark:border-hairline-dark text-ink dark:text-on-dark rounded-tl-none' 
                        : 'bg-primary text-on-primary font-semibold rounded-tr-none'
                    }`}>
                      {isAI ? renderMarkdown(msg.text) : msg.text}
                    </div>
                    <span className="text-[9px] text-muted font-mono px-1">
                      {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="self-start max-w-[85%]">
                <ChatSkeleton />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex flex-wrap gap-2 my-2 select-none justify-start">
            <button
              type="button"
              onClick={() => handleSend('Analyze my portfolio')}
              className="text-[10px] font-bold px-3.5 py-1.5 rounded-full border border-hairline-light dark:border-hairline-dark bg-[#fafafa] dark:bg-canvas-dark text-muted hover:text-ink dark:hover:text-on-dark active:scale-95 transition-all duration-100 flex items-center gap-1.5 shadow-sm"
            >
              <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
              </svg>
              Portfolio Analysis
            </button>
            <button
              type="button"
              onClick={() => handleSend('What is the technical outlook for BTC?')}
              className="text-[10px] font-bold px-3.5 py-1.5 rounded-full border border-hairline-light dark:border-hairline-dark bg-[#fafafa] dark:bg-canvas-dark text-muted hover:text-ink dark:hover:text-on-dark active:scale-95 transition-all duration-100 flex items-center gap-1.5 shadow-sm"
            >
              <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.281m5.94 2.28l-2.28 5.941" />
              </svg>
              BTC Analysis
            </button>
            <button
              type="button"
              onClick={() => handleSend('List my recent transactions')}
              className="text-[10px] font-bold px-3.5 py-1.5 rounded-full border border-hairline-light dark:border-hairline-dark bg-[#fafafa] dark:bg-canvas-dark text-muted hover:text-ink dark:hover:text-on-dark active:scale-95 transition-all duration-100 flex items-center gap-1.5 shadow-sm"
            >
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Recent Transactions
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(inputVal)}
              placeholder="Ask ZyptoX AI... (e.g. 'analyze my portfolio')"
              disabled={loading}
              className="flex-1 h-11 px-4 text-xs font-sans rounded-xl border bg-[#fafafa] dark:bg-canvas-dark border-hairline-light dark:border-hairline-dark focus:outline-none focus:ring-2 focus:ring-primary/40 text-ink dark:text-on-dark"
            />
            <Button
              variant="primary"
              onClick={() => handleSend(inputVal)}
              disabled={loading || !inputVal.trim()}
              className="h-11 px-6 font-bold rounded-xl flex items-center justify-center gap-2"
            >
              {loading && <Spinner size="sm" className="text-white" />}
              Ask
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
};
