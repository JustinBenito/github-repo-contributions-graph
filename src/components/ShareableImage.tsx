import React, { useRef, useState, useEffect } from 'react';
import { ContributionYear, Repository } from '../types';
import ContributionGraph from './ContributionGraph';
import { Copy, Check, Download, Link } from 'lucide-react';

interface ShareableImageProps {
  repository: Repository;
  contributionYear: ContributionYear;
  imageUrl: string;
}

const ShareableImage: React.FC<ShareableImageProps> = ({ 
  repository, 
  contributionYear,
  imageUrl
}) => {
  const [copied, setCopied] = useState(false);
  const [markdownCopied, setMarkdownCopied] = useState(false);
  const markdownRef = useRef<HTMLTextAreaElement>(null);
  
  const markdownText = `[![${repository.fullName} GitHub Contribution Graph](${imageUrl})](https://github.com/${repository.fullName})`;
  
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(imageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleCopyMarkdown = () => {
    if (markdownRef.current) {
      markdownRef.current.select();
      navigator.clipboard.writeText(markdownText);
      setMarkdownCopied(true);
      setTimeout(() => setMarkdownCopied(false), 2000);
    }
  };
  
  const handleDownload = () => {
    if (!imageUrl) {
      console.error('No image URL available');
      return;
    }

    try {
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `${repository.fullName.replace('/', '-')}-contributions.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  // Clear the copy states when the image URL changes
  useEffect(() => {
    setCopied(false);
    setMarkdownCopied(false);
  }, [imageUrl]);

  if (!imageUrl) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 bg-[#161b22] border border-[#30363d] rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-bold text-[#f0f6fc] mb-2">
          {repository.fullName}
        </h2>
        
        <div className="rounded-lg">
          <ContributionGraph 
            contributionYear={contributionYear} 
            isGeneratingImage={true}
          />
        </div>
        
        <div className="mt-6 space-y-4 w-full">
          <div>
            <h3 className="text-[#f0f6fc] text-lg font-medium mb-2">Image URL</h3>
            <div className="flex">
              <input
                type="text"
                value={imageUrl}
                readOnly
                className="flex-grow px-3 py-2 bg-[#0d1117] text-[#f0f6fc] border border-[#30363d] rounded-l-md focus:outline-none focus:ring-1 focus:ring-[#2ea043]"
              />
              <button
                onClick={handleCopyUrl}
                className="px-4 py-2 bg-[#21262d] text-[#f0f6fc] border border-[#30363d] border-l-0 rounded-r-md hover:bg-[#30363d] transition-colors"
                title="Copy URL"
              >
                {copied ? <Check className="h-5 w-5 text-[#2ea043]" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="text-[#f0f6fc] text-lg font-medium mb-2">Markdown</h3>
            <div className="relative">
              <textarea
                ref={markdownRef}
                value={markdownText}
                readOnly
                rows={2}
                className="w-full px-3 py-2 bg-[#0d1117] text-[#f0f6fc] border border-[#30363d] rounded-md focus:outline-none focus:ring-1 focus:ring-[#2ea043]"
              />
              <button
                onClick={handleCopyMarkdown}
                className="absolute right-2 top-2 p-1 rounded-md hover:bg-[#30363d] transition-colors"
                title="Copy Markdown"
              >
                {markdownCopied ? <Check className="h-5 w-5 text-[#2ea043]" /> : <Copy className="h-5 w-5 text-[#8b949e]" />}
              </button>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-[#21262d] text-[#f0f6fc] border border-[#30363d] rounded-md hover:bg-[#30363d] transition-colors"
              disabled={!imageUrl}
            >
              <Download className="h-4 w-4" />
              <span>Download Image</span>
            </button>
            
            <a
              href={`https://github.com/${repository.fullName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#21262d] text-[#f0f6fc] border border-[#30363d] rounded-md hover:bg-[#30363d] transition-colors"
            >
              <Link className="h-4 w-4" />
              <span>View Repository</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareableImage;