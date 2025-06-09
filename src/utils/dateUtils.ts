import { Contribution, ContributionDay, ContributionWeek, ContributionYear } from '../types';
import { getContributionIntensity } from './colors';

// Get array of dates between start and end
export const getDatesBetween = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  // eslint-disable-next-line prefer-const
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
  const contributionMap = new Map<string, number>();
  contributions.forEach(c => {
    contributionMap.set(c.date, c.count);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day

  // Calculate the true start of the graph: first Sunday on or before one year ago from today
  const tempStartDate = new Date(today);
  tempStartDate.setFullYear(tempStartDate.getFullYear() - 1);
  tempStartDate.setDate(tempStartDate.getDate() + 1); // Start exactly one year ago + 1 day for 365 days

  // eslint-disable-next-line prefer-const
  let graphStartDate = new Date(tempStartDate);
  const startDayOfWeek = graphStartDate.getDay(); // 0 for Sunday
  if (startDayOfWeek !== 0) {
    graphStartDate.setDate(graphStartDate.getDate() - startDayOfWeek);
  }
  graphStartDate.setHours(0, 0, 0, 0);

  // Calculate the true end of the graph: Saturday on or after today's date
  // eslint-disable-next-line prefer-const
  let graphEndDate = new Date(today);
  const endDayOfWeek = graphEndDate.getDay(); // 6 for Saturday
  if (endDayOfWeek !== 6) {
    graphEndDate.setDate(graphEndDate.getDate() + (6 - endDayOfWeek));
  }
  graphEndDate.setHours(0, 0, 0, 0);

  // Generate all dates within this *exact* fixed period, ensuring it spans a full year + padding
  const allDates = getDatesBetween(graphStartDate.toISOString().split('T')[0], graphEndDate.toISOString().split('T')[0]);

  const weeks: ContributionWeek[] = [];
  let currentWeekDays: ContributionDay[] = [];

  allDates.forEach((dateString, index) => {
    const count = contributionMap.get(dateString) || 0;
    const intensity = getContributionIntensity(count, maxContributions);

    currentWeekDays.push({
      date: dateString,
      count,
      intensity
    });

    const currentDate = new Date(dateString);

    // If it's Saturday OR the last day in the full date range, complete the week
    if (currentDate.getDay() === 6 || index === allDates.length - 1) {
      // Pad the start of the first week if necessary (should be handled by graphStartDate logic, but as a safeguard)
      while (currentWeekDays.length < 7) {
        currentWeekDays.unshift({
          date: '',
          count: 0,
          intensity: 0
        });
      }

      weeks.push({
        days: [...currentWeekDays],
        weekNumber: weeks.length
      });
      currentWeekDays = [];
    }
  });

  const totalContributionsFinal = contributions.reduce((sum, contrib) => sum + contrib.count, 0);

  return {
    year: today.getFullYear(),
    weeks,
    totalContributions: totalContributionsFinal,
  };
};

// Extract month labels for the graph, ensuring all 12 months are represented
export const getMonthLabels = (weeks: ContributionWeek[]): { label: string, columnPosition: number }[] => {
  const monthLabels: { label: string, columnPosition: number }[] = [];
  if (weeks.length === 0) return [];

  // Get the overall start and end dates from the weeks array to define the graph span
  // This ensures we cover the full year, including padded days if necessary
  const firstValidDayOfGraph = weeks[0].days.find((d: ContributionDay) => d.date !== '');
  
  let lastValidDayOfGraph: ContributionDay | undefined;
  // Manually find the last valid day of the graph to avoid findLast compatibility issues
  for (let i = weeks.length - 1; i >= 0; i--) {
    const week = weeks[i];
    for (let j = week.days.length - 1; j >= 0; j--) {
      const day = week.days[j];
      if (day.date !== '') {
        lastValidDayOfGraph = day;
        break; // Found the last valid day, exit inner loop
      }
    }
    if (lastValidDayOfGraph) break; // Found the last valid day, exit outer loop
  }

  if (!firstValidDayOfGraph || !lastValidDayOfGraph) {
    console.error("Invalid graph start or end date due to missing valid days in weeks array.");
    return [];
  }

  const graphStartDate = new Date(firstValidDayOfGraph.date);
  const graphEndDate = new Date(lastValidDayOfGraph.date);

  if (isNaN(graphStartDate.getTime()) || isNaN(graphEndDate.getTime())) {
    console.error("Invalid graph start or end date after initial check:", firstValidDayOfGraph.date, lastValidDayOfGraph.date);
    return [];
  }
  console.log("Month Labels - Graph Start Date:", graphStartDate.toISOString());
  console.log("Month Labels - Graph End Date:", graphEndDate.toISOString());

  // eslint-disable-next-line prefer-const
  let currentMonthIterator = new Date(graphStartDate.getFullYear(), graphStartDate.getMonth(), 1);

  // Iterate through each month from the start of the graph to its end
  while (currentMonthIterator <= graphEndDate || 
         (currentMonthIterator.getFullYear() === graphEndDate.getFullYear() && currentMonthIterator.getMonth() === graphEndDate.getMonth())) {

    const monthName = currentMonthIterator.toLocaleDateString('en-US', { month: 'short' });
    let columnPositionForMonth = -1;

    // Find the column position for the first day of this month within the entire grid
    // We need to iterate through all days in all weeks to find the exact position.
    let dayCount = 0;
    for (let weekIndex = 0; weekIndex < weeks.length; weekIndex++) {
      const week = weeks[weekIndex];
      for (let dayIndex = 0; dayIndex < week.days.length; dayIndex++) {
        const day = week.days[dayIndex];
        
        // Log the date string to debug "Dedan" or empty string issues
        console.log(`Processing day.date: ${day.date}`);

        if (day.date) { // Only consider non-empty dates for actual month comparison
          const d = new Date(day.date);
          if (isNaN(d.getTime())) {
            console.error("Invalid date encountered while finding month position (inside loop):", day.date);
            // Even if invalid, still count position to maintain grid alignment
            dayCount++;
            continue;
          }

          if (d.getFullYear() === currentMonthIterator.getFullYear() &&
              d.getMonth() === currentMonthIterator.getMonth()) {
            columnPositionForMonth = dayCount; // This is the exact column position
            break; // Found the first day of this month, move to next month iteration
          }
        }
        dayCount++; // IMPORTANT: Increment dayCount for every day in the grid, including padding days
      }
      if (columnPositionForMonth !== -1) break; // Break outer loop if month found
    }

    if (columnPositionForMonth !== -1) {
      // Add the month label if it hasn't been added already for this month name
      // Since we're iterating month by month, each month name should ideally be unique for the year.
      const existingLabel = monthLabels.find(ml => ml.label === monthName);
      if (!existingLabel) {
        monthLabels.push({ label: monthName, columnPosition: columnPositionForMonth });
        console.log(`Added label: ${monthName} at columnPosition: ${columnPositionForMonth}`);
      }
    } else {
        console.log(`Could not find column position for month: ${monthName} (${currentMonthIterator.toISOString()})`);
    }

    // Move to the next month for iteration
    currentMonthIterator.setMonth(currentMonthIterator.getMonth() + 1);
  }

  // Sort the month labels by their column position to ensure chronological order
  monthLabels.sort((a, b) => a.columnPosition - b.columnPosition);

  console.log("Final month labels:", monthLabels);

  return monthLabels;
};