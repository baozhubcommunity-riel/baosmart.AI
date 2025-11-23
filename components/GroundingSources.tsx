import React from 'react';
import { GroundingMetadata } from '../types';
import { ExternalLink, Globe } from 'lucide-react';

interface GroundingSourcesProps {
  metadata: GroundingMetadata;
}

const GroundingSources: React.FC<GroundingSourcesProps> = ({ metadata }) => {
  // Helper to extract unique sources
  const getUniqueSources = () => {
    if (!metadata.groundingChunks) return [];
    
    const uniqueMap = new Map();
    metadata.groundingChunks.forEach(chunk => {
      if (chunk.web?.uri) {
        // Use URI as key to deduplicate
        if (!uniqueMap.has(chunk.web.uri)) {
          uniqueMap.set(chunk.web.uri, chunk.web);
        }
      }
    });
    return Array.from(uniqueMap.values());
  };

  const sources = getUniqueSources();
  const hasSearchEntryPoint = !!metadata.searchEntryPoint?.renderedContent;

  if (sources.length === 0 && !hasSearchEntryPoint) return null;

  // Helper to extract domain name for display
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch (e) {
      return 'External Source';
    }
  };

  return (
    <div className="mt-4 pt-3 border-t border-slate-100">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
        <Globe className="w-3.5 h-3.5 text-indigo-500" />
        <span>Sources & Web References</span>
      </div>
      
      {/* Sources Grid */}
      {sources.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          {sources.map((source, index) => (
            <a
              key={index}
              href={source.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md hover:bg-indigo-50/30 transition-all duration-200 group text-left relative overflow-hidden"
            >
              {/* Hover decoration */}
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-start justify-between gap-2 w-full">
                <span className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug group-hover:text-indigo-700 mb-1">
                  {source.title || "Web Result"}
                </span>
                <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-indigo-500 flex-shrink-0 mt-0.5 transition-colors" />
              </div>
              
              <div className="mt-auto pt-1">
                 <span className="text-[10px] text-slate-400 font-mono truncate block group-hover:text-indigo-400">
                  {getDomain(source.uri)}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Google Search Entry Point (Rendered HTML) */}
      {hasSearchEntryPoint && (
        <div 
          className="grounding-entry-point text-xs mt-2"
          dangerouslySetInnerHTML={{ __html: metadata.searchEntryPoint!.renderedContent }} 
        />
      )}
    </div>
  );
};

export default GroundingSources;