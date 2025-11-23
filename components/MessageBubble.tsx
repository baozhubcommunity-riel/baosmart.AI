import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import GroundingSources from './GroundingSources';
import { Bot, User, BookmarkPlus, FileText, Download, Copy, Check, FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface MessageBubbleProps {
  message: Message;
  onSaveToNote?: (text: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onSaveToNote }) => {
  const isModel = message.role === 'model';
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownloadCode = (code: string, language: string = 'txt') => {
    // Map common languages to extensions
    const extensionMap: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      lua: 'lua',
      luau: 'luau',
      html: 'html',
      css: 'css',
      json: 'json',
      markdown: 'md',
      text: 'txt',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      csharp: 'cs',
      go: 'go',
      rust: 'rs',
      sql: 'sql',
      php: 'php',
      ruby: 'rb',
      shell: 'sh',
      bash: 'sh',
      csv: 'csv'
    };

    // Clean language string (remove extra spaces/chars)
    const cleanLang = language.toLowerCase().trim();
    const ext = extensionMap[cleanLang] || cleanLang || 'txt';
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `baosmart_download.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Basic text cleanup for PDF
      // Note: jsPDF text support is basic. For full markdown support we'd need html2canvas or complex parsing.
      // We will dump the raw text content for now, stripping some markdown symbols if possible, 
      // or just keeping it as raw text which is useful for notes.
      
      const splitText = doc.splitTextToSize(message.text, 180);
      
      doc.setFontSize(12);
      doc.text(splitText, 15, 15);
      doc.save(`baosmart_notes_${Date.now()}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF", error);
      alert("Could not generate PDF. Please try copying the text instead.");
    }
  };

  return (
    <div className={`flex w-full ${isModel ? 'justify-start' : 'justify-end'} mb-6 animate-fade-in-up group`}>
      <div className={`flex max-w-[90%] md:max-w-[80%] gap-3 ${isModel ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm mt-1 ${
          isModel ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
        }`}>
          {isModel ? <Bot size={18} /> : <User size={18} />}
        </div>

        {/* Bubble Content */}
        <div className={`flex flex-col ${isModel ? 'items-start' : 'items-end'} min-w-0 w-full`}>
          <div className={`flex items-center gap-2 mb-1 px-1 ${isModel ? 'flex-row' : 'flex-row-reverse'}`}>
            <span className="text-xs font-semibold text-slate-500">
              {isModel ? 'Baosmart' : 'You'}
            </span>
            <span className="text-[10px] text-slate-400">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className={`relative rounded-2xl px-5 py-4 shadow-sm text-sm md:text-base leading-relaxed overflow-hidden w-full ${
            isModel 
              ? 'bg-white text-slate-800 border border-slate-100 rounded-tl-none' 
              : 'bg-indigo-600 text-white rounded-tr-none'
          }`}>
            
            {/* Attachment Display */}
            {message.attachments && message.attachments.length > 0 && (
              <div className={`flex flex-wrap gap-2 mb-3 ${isModel ? 'justify-start' : 'justify-end'}`}>
                {message.attachments.map((att) => (
                  <div key={att.id} className="relative group/att overflow-hidden rounded-lg border border-white/20 bg-black/10">
                    {att.mimeType.startsWith('image/') ? (
                      <img 
                        src={`data:${att.mimeType};base64,${att.data}`} 
                        alt={att.fileName}
                        className="h-32 w-auto object-cover rounded-lg"
                      />
                    ) : (
                      <div className={`flex items-center gap-2 p-3 min-w-[140px] backdrop-blur-sm rounded-lg ${
                        isModel 
                          ? 'bg-slate-100 border border-slate-200' 
                          : 'bg-white/10 border border-white/10'
                      }`}>
                        <div className={`p-2 rounded-lg ${att.mimeType.includes('pdf') ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}>
                           <FileText size={20} />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                           <span className={`text-xs font-medium truncate max-w-[120px] ${isModel ? 'text-slate-700' : 'text-white'}`}>
                             {att.fileName}
                           </span>
                           <span className={`text-[10px] uppercase ${isModel ? 'text-slate-400' : 'text-indigo-200'}`}>
                             {att.mimeType.split('/')[1] || 'FILE'}
                           </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className={`markdown-content ${isModel ? 'prose prose-sm prose-indigo max-w-none' : 'prose prose-invert prose-sm max-w-none'}`}>
              <ReactMarkdown
                components={{
                   a: ({node, ...props}) => <a target="_blank" rel="noopener noreferrer" className={isModel ? "text-indigo-600 underline decoration-indigo-300 hover:decoration-indigo-600" : "text-white underline decoration-white/50 hover:decoration-white"} {...props} />,
                   strong: ({node, ...props}) => <span className="bg-yellow-200/80 text-slate-900 px-1 py-0.5 rounded-md font-bold shadow-[0_1px_1px_rgba(0,0,0,0.1)] mx-0.5 box-decoration-clone" {...props} />,
                   table: ({node, ...props}) => <div className="overflow-x-auto my-4 rounded-lg border border-slate-200"><table className="min-w-full divide-y divide-slate-200" {...props} /></div>,
                   thead: ({node, ...props}) => <thead className="bg-slate-50" {...props} />,
                   th: ({node, ...props}) => <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider" {...props} />,
                   td: ({node, ...props}) => <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-600 border-t border-slate-100" {...props} />,
                   code: ({node, className, children, ...props}) => {
                     const match = /language-(\w+)/.exec(className || '');
                     const isInline = !match;
                     const language = match ? match[1] : '';
                     const codeString = String(children).replace(/\n$/, '');

                     if (isInline) {
                       return <code className="bg-black/10 px-1 py-0.5 rounded text-[0.9em] font-mono" {...props}>{children}</code>;
                     }

                     return (
                       <div className="my-4 rounded-lg overflow-hidden border border-slate-200 bg-slate-800 shadow-sm">
                         {/* Code Block Header */}
                         <div className="flex items-center justify-between px-3 py-2 bg-slate-900 text-slate-400 border-b border-slate-700">
                           <div className="flex items-center gap-2">
                             <span className="text-xs font-bold uppercase tracking-wider text-slate-300">{language || 'CODE'}</span>
                           </div>
                           <div className="flex items-center gap-1">
                             <button 
                               onClick={() => handleCopyCode(codeString)}
                               className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                               title="Copy code"
                             >
                               {copiedCode === codeString ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                             </button>
                             <button 
                               onClick={() => handleDownloadCode(codeString, language)}
                               className="flex items-center gap-1.5 px-2 py-1 hover:bg-indigo-600 bg-slate-700 text-white rounded text-xs font-medium transition-colors"
                               title="Download as file"
                             >
                               <Download size={14} />
                               <span>Download</span>
                             </button>
                           </div>
                         </div>
                         {/* Code Content */}
                         <div className="p-4 overflow-x-auto bg-[#0d1117] text-slate-200 text-sm font-mono leading-relaxed">
                           <code {...props}>{children}</code>
                         </div>
                       </div>
                     );
                   }
                }}
              >
                {message.text}
              </ReactMarkdown>
            </div>

            {/* Grounding Sources Display (Only for Model) */}
            {isModel && message.groundingMetadata && (
              <GroundingSources metadata={message.groundingMetadata} />
            )}

            {/* Action Buttons for Model Messages */}
            {isModel && (
               <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                 <button 
                   onClick={handleExportPDF}
                   className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors"
                   title="Export as PDF"
                 >
                   <FileDown size={14} />
                   <span>Export PDF</span>
                 </button>
                 
                 {onSaveToNote && (
                  <button 
                    onClick={() => onSaveToNote(message.text)}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors"
                    title="Save to Notebook"
                  >
                    <BookmarkPlus size={14} />
                    <span>Save to Notes</span>
                  </button>
                 )}
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;