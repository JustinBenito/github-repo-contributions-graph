import React, { useState } from 'react';
import { parseGitHubUrl } from '../services/github';
import { Github, Search, AlertCircle } from 'lucide-react';

interface RepoFormProps {
  onSubmit: (owner: string, repo: string) => void;
  isLoading: boolean;
}

const RepoForm: React.FC<RepoFormProps> = ({ onSubmit, isLoading }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous errors
    setError(null);
    
    // Validate URL
    const parsed = parseGitHubUrl(repoUrl);
    
    if (!parsed) {
      setError('Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)');
      return;
    }
    
    // Call the parent's onSubmit with the parsed owner and repo
    onSubmit(parsed.owner, parsed.repo);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form 
        onSubmit={handleSubmit}
        className="p-6 bg-[#161b22] border border-[#30363d] rounded-lg shadow-lg transition-all"
      >
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Github className="h-5 w-5 text-[#8b949e]" />
            </div>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              className="block w-full pl-10 pr-3 py-2 border border-[#30363d] rounded-md bg-[#0d1117] text-[#f0f6fc] placeholder-[#6e7681] focus:outline-none focus:ring-2 focus:ring-[#2ea043] focus:border-transparent transition-all"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-[#2ea043] hover:bg-[#3fb950] text-white font-medium rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Loading...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Generate</span>
              </>
            )}
          </button>
        </div>
        
        {error && (
          <div className="mt-3 flex items-start gap-2 text-[#f85149] text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        <div className="mt-4 text-[#8b949e] text-sm">
          <p>Enter a GitHub repository URL to generate a contribution graph image you can embed in your README.md</p>
        </div>
      </form>
    </div>
  );
};

export default RepoForm;