import React from 'react';
import { GitFork, GitPullRequest, Star } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full bg-[#161b22] border-b border-[#30363d] py-4">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-[#2ea043] w-10 h-10 rounded-md flex items-center justify-center">
              <GitPullRequest className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#f0f6fc]">
                Contribution Graph Generator
              </h1>
              <p className="text-sm text-[#8b949e]">
                Generate embeddable GitHub-style contribution graphs
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <a 
              href="https://github.com/your-username/contribution-graph-generator" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#8b949e] hover:text-[#f0f6fc] transition-colors"
            >
              <Star className="h-4 w-4" />
              <span>Star</span>
            </a>
            <a 
              href="https://github.com/your-username/contribution-graph-generator/fork" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#8b949e] hover:text-[#f0f6fc] transition-colors"
            >
              <GitFork className="h-4 w-4" />
              <span>Fork</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;