import { Repository, Contributor, Contribution, ContributionData, GitHubCommit, GitHubContributor } from '../types';
import { supabase } from '../lib/supabaseClient';

const GITHUB_API_BASE_URL = 'https://api.github.com';

// Helper to make authenticated GitHub API requests
const githubFetch = async (url: string) => {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };

  const response = await fetch(url, {
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`GitHub API error: ${response.status} - ${errorData.message}`);
  }

  return response;
};

export const getRepository = async (repoUrl: string): Promise<Repository> => {
  const urlParts = repoUrl.split('/');
  const owner = urlParts[urlParts.length - 2];
  const repo = urlParts[urlParts.length - 1].replace('.git', '');
  const fullName = `${owner}/${repo}`;

  try {
    const response = await githubFetch(`${GITHUB_API_BASE_URL}/repos/${fullName}`);
    const data = await response.json();

    return {
      name: data.name,
      owner: data.owner.login,
      fullName: data.full_name,
      url: data.html_url,
      description: data.description,
      stars: data.stargazers_count,
      forks: data.forks_count
    };
  } catch (error) {
    console.error('Error fetching repository:', error);
    throw error;
  }
};

export const getContributors = async (repoFullName: string): Promise<Contributor[]> => {
  try {
    const response = await githubFetch(`${GITHUB_API_BASE_URL}/repos/${repoFullName}/contributors?per_page=100`);
    const data: GitHubContributor[] = await response.json();

    return data.map((c) => ({
      username: c.login,
      avatarUrl: c.avatar_url,
      contributions: c.contributions,
      url: c.html_url
    }));
  } catch (error) {
    console.error('Error fetching contributors:', error);
    return []; // Return empty array on error
  }
};

export const getContributions = async (repoFullName: string): Promise<ContributionData> => {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const sinceDate = oneYearAgo.toISOString();

  let allCommits: GitHubCommit[] = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    try {
      const response = await githubFetch(
        `${GITHUB_API_BASE_URL}/repos/${repoFullName}/commits?since=${sinceDate}&per_page=100&page=${page}`
      );
      const commits: GitHubCommit[] = await response.json();
      allCommits = allCommits.concat(commits);

      const linkHeader = response.headers.get('Link');
      if (linkHeader && linkHeader.includes('rel="next"')) {
        page++;
      } else {
        hasNextPage = false;
      }
    } catch (error) {
      console.error('Error fetching commits:', error);
      hasNextPage = false; // Stop fetching on error
    }
  }

  const contributionMap = new Map<string, number>();
  let totalContributions = 0;
  let maxContributions = 0;

  for (const commit of allCommits) {
    if (commit.commit.author && commit.commit.author.date) {
      const date = commit.commit.author.date.split('T')[0]; // YYYY-MM-DD
      const currentCount = (contributionMap.get(date) || 0) + 1;
      contributionMap.set(date, currentCount);
      totalContributions++;
      maxContributions = Math.max(maxContributions, currentCount);
    }
  }

  // Convert map to array and sort by date
  const contributions: Contribution[] = Array.from(contributionMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const firstContributionDate = contributions.length > 0 ? contributions[0].date : '-';
  const lastContributionDate = contributions.length > 0 ? contributions[contributions.length - 1].date : '-';

  return {
    contributions,
    totalContributions,
    maxContributions,
    firstContributionDate,
    lastContributionDate
  };
};

// Supabase Integration
export const saveOrUpdateContributionData = async (
  owner: string,
  repo: string,
  contributionYear: ContributionData // Using ContributionData as it contains all info needed
) => {
  const { error } = await supabase
    .from('contribution_graphs')
    .upsert(
      {
        id: `${owner}-${repo}`,
        owner,
        repo,
        contribution_data: contributionYear, // Store the entire object as JSON
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

  if (error) {
    console.error('Error saving contribution data to Supabase:', error);
    throw error;
  }
  console.log('Contribution data saved/updated successfully in Supabase.');
};

// Parse a GitHub URL to extract owner and repo
export const parseGitHubUrl = (url: string): { owner: string, repo: string } | null => {
  try {
    const githubUrl = new URL(url);
    
    if (!githubUrl.hostname.includes('github.com')) {
      return null;
    }
    
    const pathParts = githubUrl.pathname.split('/').filter(Boolean);
    
    if (pathParts.length < 2) {
      return null;
    }
    
    return {
      owner: pathParts[0],
      repo: pathParts[1].replace('.git', '')
    };
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Generate a shareable URL for the contribution graph (keeping for now, but might be removed)
export const generateShareableUrl = (repoFullName: string): string => {
  return `https://example.com/contribution-graph/${repoFullName}`;
};

// Generate a markdown snippet for embedding (keeping as is)
export const generateMarkdownSnippet = (repoFullName: string, imageUrl: string): string => {
  return `[![${repoFullName} GitHub Contribution Graph](${imageUrl})](https://github.com/${repoFullName})`;
};