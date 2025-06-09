import React from 'react';
import { Repository, ContributionYear } from '../types';
import { Star, GitFork, GitCommit, Users } from 'lucide-react';

interface StatsProps {
  repository: Repository;
  contributionYear: ContributionYear;
  contributorsCount?: number;
}

const Stats: React.FC<StatsProps> = ({ 
  repository, 
  contributionYear,
  contributorsCount = 0
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex items-center">
        <div className="mr-4 bg-[#0d1117] p-2 rounded-md">
          <Star className="h-6 w-6 text-[#f0f6fc]" />
        </div>
        <div>
          <p className="text-[#8b949e] text-sm">Stars</p>
          <p className="text-[#f0f6fc] text-xl font-semibold">
            {repository.stars.toLocaleString()}
          </p>
        </div>
      </div>
      
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex items-center">
        <div className="mr-4 bg-[#0d1117] p-2 rounded-md">
          <GitFork className="h-6 w-6 text-[#f0f6fc]" />
        </div>
        <div>
          <p className="text-[#8b949e] text-sm">Forks</p>
          <p className="text-[#f0f6fc] text-xl font-semibold">
            {repository.forks.toLocaleString()}
          </p>
        </div>
      </div>
      
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex items-center">
        <div className="mr-4 bg-[#0d1117] p-2 rounded-md">
          <GitCommit className="h-6 w-6 text-[#f0f6fc]" />
        </div>
        <div>
          <p className="text-[#8b949e] text-sm">Contributions</p>
          <p className="text-[#f0f6fc] text-xl font-semibold">
            {contributionYear.totalContributions.toLocaleString()}
          </p>
        </div>
      </div>
      
      {contributorsCount > 0 && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex items-center">
          <div className="mr-4 bg-[#0d1117] p-2 rounded-md">
            <Users className="h-6 w-6 text-[#f0f6fc]" />
          </div>
          <div>
            <p className="text-[#8b949e] text-sm">Contributors</p>
            <p className="text-[#f0f6fc] text-xl font-semibold">
              {contributorsCount.toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stats;