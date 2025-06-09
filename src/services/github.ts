import { Repository, Contributor, Contribution, ContributionData } from '../types';

// Simulation of GitHub API responses for development purposes
const MOCK_REPOSITORIES: Record<string, Repository> = {
  'facebook/react': {
    name: 'react',
    owner: 'facebook',
    fullName: 'facebook/react',
    url: 'https://github.com/facebook/react',
    stars: 213000,
    forks: 44700
  },
  'vercel/next.js': {
    name: 'next.js',
    owner: 'vercel',
    fullName: 'vercel/next.js',
    url: 'https://github.com/vercel/next.js',
    stars: 112000,
    forks: 24800
  }
};

const MOCK_CONTRIBUTORS: Record<string, Contributor[]> = {
  'facebook/react': [
    {
      username: 'gaearon',
      avatarUrl: 'https://avatars.githubusercontent.com/u/810438?v=4',
      contributions: 2500,
      url: 'https://github.com/gaearon'
    },
    {
      username: 'acdlite',
      avatarUrl: 'https://avatars.githubusercontent.com/u/3624098?v=4',
      contributions: 1800,
      url: 'https://github.com/acdlite'
    }
  ]
};

// Generate mock contribution data for development
const generateMockContributions = (): ContributionData => {
  const contributions: Contribution[] = [];
  const end = new Date();
  const start = new Date();
  start.setFullYear(end.getFullYear() - 1); // Set to exactly one year ago
  
  let maxContributions = 0;
  let totalContributions = 0;
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    // Generate random contribution count with some patterns
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Fewer contributions on weekends
    const baseCount = isWeekend ? 
      Math.floor(Math.random() * 5) : 
      Math.floor(Math.random() * 15);
    
    // Add some zeros and spikes for realism
    const randomFactor = Math.random();
    let count = 0;
    
    if (randomFactor > 0.8) {
      count = Math.floor(baseCount * 2.5); // Occasional spikes
    } else if (randomFactor > 0.2) {
      count = baseCount;
    } // else count remains 0
    
    const dateString = d.toISOString().split('T')[0];
    contributions.push({
      date: dateString,
      count
    });
    
    totalContributions += count;
    maxContributions = Math.max(maxContributions, count);
  }
  
  return {
    contributions,
    totalContributions,
    maxContributions,
    firstContributionDate: contributions[0].date,
    lastContributionDate: contributions[contributions.length - 1].date
  };
};

// In a real application, these functions would make actual API calls to GitHub
export const getRepository = async (repoUrl: string): Promise<Repository> => {
  // Extract owner/repo from the URL
  const urlParts = repoUrl.split('/');
  const owner = urlParts[urlParts.length - 2];
  const repo = urlParts[urlParts.length - 1].replace('.git', '');
  const fullName = `${owner}/${repo}`;
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check mock data or return a generated response
  if (MOCK_REPOSITORIES[fullName]) {
    return MOCK_REPOSITORIES[fullName];
  }
  
  // Generate a mock repository if not in our predefined list
  return {
    name: repo,
    owner,
    fullName,
    url: repoUrl,
    stars: Math.floor(Math.random() * 1000),
    forks: Math.floor(Math.random() * 500)
  };
};

export const getContributors = async (repoFullName: string): Promise<Contributor[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Check mock data or return generated data
  if (MOCK_CONTRIBUTORS[repoFullName]) {
    return MOCK_CONTRIBUTORS[repoFullName];
  }
  
  // Generate mock contributors
  const numContributors = 3 + Math.floor(Math.random() * 5);
  const contributors: Contributor[] = [];
  
  for (let i = 0; i < numContributors; i++) {
    contributors.push({
      username: `user${i + 1}`,
      avatarUrl: `https://randomuser.me/api/portraits/men/${i + 1}.jpg`,
      contributions: 50 + Math.floor(Math.random() * 1000),
      url: `https://github.com/user${i + 1}`
    });
  }
  
  return contributors;
};

export const getContributions = async (repoFullName: string): Promise<ContributionData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate mock contribution data for exactly one year
  return generateMockContributions();
};

// Parse a GitHub URL to extract owner and repo
export const parseGitHubUrl = (url: string): { owner: string, repo: string } | null => {
  try {
    const githubUrl = new URL(url);
    
    // Validate it's a GitHub URL
    if (!githubUrl.hostname.includes('github.com')) {
      return null;
    }
    
    const pathParts = githubUrl.pathname.split('/').filter(Boolean);
    
    // A valid GitHub repo URL should have at least owner and repo
    if (pathParts.length < 2) {
      return null;
    }
    
    return {
      owner: pathParts[0],
      repo: pathParts[1].replace('.git', '')
    };
  } catch (error) {
    // Invalid URL format
    console.log(error);
    return null;
  }
};

// Generate a shareable URL for the contribution graph
export const generateShareableUrl = (repoFullName: string): string => {
  // In a real application, this would create a persistent URL
  // For now, we'll return a mock URL
  return `https://example.com/contribution-graph/${repoFullName}`;
};

// Generate a markdown snippet for embedding
export const generateMarkdownSnippet = (repoFullName: string, imageUrl: string): string => {
  return `[![${repoFullName} GitHub Contribution Graph](${imageUrl})](https://github.com/${repoFullName})`;
};