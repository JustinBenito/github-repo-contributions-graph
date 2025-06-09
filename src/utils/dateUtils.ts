import { Contribution, ContributionDay, ContributionWeek, ContributionYear } from '../types';
import { getContributionIntensity } from './colors';

// Get array of dates between start and end
export const getDatesBetween = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  let currentDate = new Date(startDate);
  const end = new Date(endDate);
  
  while (currentDate <= end) {
    dates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};

// Format date to display format
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Get the day of week (0-6, where 0 is Sunday)
export const getDayOfWeek = (dateString: string): number => {
  const date = new Date(dateString);
  return date.getDay();
};

// Get month name from date
export const getMonthName = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short' });
};

// Get year from date
export const getYear = (dateString: string): number => {
  const date = new Date(dateString);
  return date.getFullYear();
};

// Format contributions into weeks for rendering
export const organizeContributionsIntoYear = (
  contributions: Contribution[],
  maxContributions: number
): ContributionYear => {
  // Create a map for quick lookup
  const contributionMap = new Map<string, number>();
  contributions.forEach(contribution => {
    contributionMap.set(contribution.date, contribution.count);
  });

  // Get the date range
  const sortedDates = contributions
    .map(c => c.date)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  let startDate = sortedDates[0];
  const endDate = sortedDates[sortedDates.length - 1];

  // Get the first Sunday before or on the start date
  const startDay = getDayOfWeek(startDate);
  if (startDay !== 0) {
    const date = new Date(startDate);
    date.setDate(date.getDate() - startDay);
    startDate = date.toISOString().split('T')[0];
  }

  // Generate all dates
  const allDates = getDatesBetween(startDate, endDate);

  // Organize into weeks
  const weeks: ContributionWeek[] = [];
  let currentWeek: ContributionDay[] = [];
  let weekNumber = 0;

  allDates.forEach((date, index) => {
    const count = contributionMap.get(date) || 0;
    const intensity = getContributionIntensity(count, maxContributions);

    currentWeek.push({
      date,
      count,
      intensity
    });

    // Check if we completed a week or reached the end
    if (getDayOfWeek(date) === 6 || index === allDates.length - 1) {
      // If it's not a full week at the start, pad with empty days
      while (currentWeek.length < 7) {
        currentWeek.unshift({
          date: '', // Empty date for padding
          count: 0,
          intensity: 0
        });
      }

      weeks.push({
        days: currentWeek,
        weekNumber: weekNumber++
      });
      currentWeek = [];
    }
  });

  // Calculate total contributions
  const totalContributions = contributions.reduce((sum, contrib) => sum + contrib.count, 0);

  return {
    year: getYear(endDate),
    weeks,
    totalContributions
  };
};

// Extract month labels for the graph
export const getMonthLabels = (weeks: ContributionWeek[]): { label: string, weekIndex: number }[] => {
  const monthLabels: { label: string, weekIndex: number }[] = [];
  const processedMonths = new Set<string>();

  weeks.forEach((week, weekIndex) => {
    // Skip empty weeks or use the first valid day
    const validDay = week.days.find(day => day.date !== '');
    if (!validDay) return;

    const monthName = getMonthName(validDay.date);
    // Only add each month once
    if (!processedMonths.has(monthName)) {
      processedMonths.add(monthName);
      monthLabels.push({ label: monthName, weekIndex });
    }
  });

  return monthLabels;
};