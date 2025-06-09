export interface Repository {
  name: string;
  owner: string;
  fullName: string;
  url: string;
  stars: number;
  forks: number;
}

export interface Contributor {
  username: string;
  avatarUrl: string;
  contributions: number;
  url: string;
}

export interface Contribution {
  date: string;
  count: number;
}

export interface ContributionData {
  contributions: Contribution[];
  totalContributions: number;
  maxContributions: number;
  firstContributionDate: string;
  lastContributionDate: string;
}

export interface ContributionDay {
  date: string;
  count: number;
  intensity: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionWeek {
  days: ContributionDay[];
  weekNumber: number;
}

export interface ContributionYear {
  year: number;
  weeks: ContributionWeek[];
  totalContributions: number;
}