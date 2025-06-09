// Color theme inspired by GitHub's contribution graph
export const colors = {
  background: {
    primary: '#0d1117',
    secondary: '#161b22',
    tertiary: '#21262d',
  },
  text: {
    primary: '#f0f6fc',
    secondary: '#8b949e',
    tertiary: '#6e7681',
  },
  border: {
    primary: '#30363d',
    secondary: '#21262d',
  },
  contribution: {
    level0: '#161b22', // Empty
    level1: '#0e4429', // Low
    level2: '#006d32', // Medium
    level3: '#26a641', // High
    level4: '#39d353', // Very high
  },
  brand: {
    primary: '#2ea043',
    hover: '#3fb950',
  },
  error: '#f85149',
};

// Function to determine color based on contribution count
export const getContributionColor = (count: number, max: number): string => {
  if (count === 0) return colors.contribution.level0;
  
  const percentage = count / max;
  
  if (percentage <= 0.25) return colors.contribution.level1;
  if (percentage <= 0.5) return colors.contribution.level2;
  if (percentage <= 0.75) return colors.contribution.level3;
  return colors.contribution.level4;
};

export const getContributionIntensity = (count: number, max: number): 0 | 1 | 2 | 3 | 4 => {
  if (count === 0) return 0;
  
  const percentage = count / max;
  
  if (percentage <= 0.25) return 1;
  if (percentage <= 0.5) return 2;
  if (percentage <= 0.75) return 3;
  return 4;
};