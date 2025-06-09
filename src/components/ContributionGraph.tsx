import React from 'react';
import { ContributionYear } from '../types';
import { formatDate, getMonthLabels } from '../utils/dateUtils';
import { colors } from '../utils/colors';
import { Download } from 'lucide-react';

interface ContributionGraphProps {
  contributionYear: ContributionYear;
  isGeneratingImage?: boolean;
  onDownload?: () => void;
}

const ContributionGraph: React.FC<ContributionGraphProps> = ({
  contributionYear,
  isGeneratingImage = false,
  onDownload
}) => {
  const { weeks, totalContributions } = contributionYear;
  const monthLabels = getMonthLabels(weeks);
  
  // Day labels (Sun, Mon, Tue, etc.)
  const dayLabels = ['Sun', '', 'Tue', '', 'Thu', '', 'Sat'];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        {onDownload && !isGeneratingImage && (
          <button
            onClick={onDownload}
            className="flex items-center gap-2 px-3 py-2 bg-[#2ea043] text-white rounded-md hover:bg-[#2c974b] transition-colors whitespace-nowrap md:hidden"
          >
            <Download className="h-4 w-4" />
          </button>
        )}
        <h3 className="text-[#f0f6fc] text-lg font-semibold flex-grow mr-2 md:mr-0 max-w-[calc(100%-60px)] truncate md:max-w-none">
          {totalContributions.toLocaleString()} contributions in the last year
        </h3>
        {onDownload && !isGeneratingImage && (
          <button
            onClick={onDownload}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#2ea043] text-white rounded-md hover:bg-[#2c974b] transition-colors whitespace-nowrap"
          >
            <Download className="h-4 w-4" />
            <span>Download Graph</span>
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <div
          className={`contribution-graph p-4 bg-[#0d1117] rounded-lg border border-[#30363d] ${isGeneratingImage ? 'shadow-none' : 'shadow-lg'}`}
          style={{
            width: 'fit-content',
            minWidth: '800px',
            position: 'relative',
            display: 'block',
            visibility: 'visible',
            opacity: 1,
            transform: 'none'
          }}
        >
          <div className="flex flex-col">
            {/* Month labels */}
            <div className="flex">
              <div className="w-8" /> {/* Spacer for day labels */}
              <div className="flex-grow relative">
                {monthLabels.map((month, i) => (
                  <span
                    key={i}
                    className="absolute text-xs text-[#8b949e]"
                    style={{
                      left: `${(month.weekIndex / weeks.length) * 100}%`,
                      transform: i === 0 ? 'translateX(0)' : 'translateX(-50%)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {month.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex mt-6">
              {/* Day labels */}
              <div className="w-8 flex flex-col justify-between text-xs text-[#8b949e]">
                {dayLabels.map((day, i) => (
                  <span key={i} className="h-[11px] flex items-center">
                    {day}
                  </span>
                ))}
              </div>

              {/* Contribution cells */}
              <div className="flex-grow flex gap-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.days.map((day, dayIndex) => {
                      if (!day.date) {
                        // Empty cell for padding
                        return <div key={`${weekIndex}-${dayIndex}-empty`} className="w-[11px] h-[11px]" />;
                      }
                      
                      const levelColor = colors.contribution[`level${day.intensity}` as keyof typeof colors.contribution];
                      
                      return (
                        <div
                          key={`${weekIndex}-${dayIndex}`}
                          className="w-[11px] h-[11px] rounded-sm cursor-pointer transition-transform hover:scale-125"
                          style={{
                            backgroundColor: levelColor,
                            display: 'block',
                            visibility: 'visible',
                            opacity: 1
                          }}
                          title={`${day.count} contributions on ${formatDate(day.date)}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end mt-4 text-xs text-[#8b949e]">
              <span className="mr-2">Less</span>
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className="w-[11px] h-[11px] rounded-sm mx-[2px]"
                  style={{
                    backgroundColor: colors.contribution[`level${level}` as keyof typeof colors.contribution],
                    display: 'block',
                    visibility: 'visible',
                    opacity: 1
                  }}
                />
              ))}
              <span className="ml-2">More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributionGraph;