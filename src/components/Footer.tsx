import React from 'react';
import { Github, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#161b22] border-t border-[#30363d] py-6 mt-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-[#8b949e] text-sm mb-4 md:mb-0">
            <p>
              © {new Date().getFullYear()} Contribution Graph Generator. 
              Inspired by <a 
                href="https://contrib.rocks" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#58a6ff] hover:underline"
              >
                contrib.rocks
              </a>
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/your-username/contribution-graph-generator" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#8b949e] hover:text-[#f0f6fc] transition-colors"
            >
              <Github className="h-4 w-4" />
              <span>View on GitHub</span>
            </a>
            
            <div className="flex items-center text-[#8b949e]">
              <span className="mr-1">Made with</span>
              <Heart className="h-4 w-4 text-[#f85149] mx-1" />
              <span>and React</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;