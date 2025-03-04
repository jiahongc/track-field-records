'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Record } from '@/types/Record';
import { format, formatDistanceToNow, differenceInDays, differenceInSeconds } from 'date-fns';

interface RecordsTimelineProps {
  records: Record[];
  distance: string;
  gender: string;
  paceUnit: string;
}

const RecordsTimeline: React.FC<RecordsTimelineProps> = ({ records, distance, gender, paceUnit }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Helper function to calculate time improvement between records
  const calculateTimeImprovement = (currentTime: string, previousTime: string): string => {
    try {
      // Convert time strings to seconds
      const convertToSeconds = (timeStr: string): number => {
        // Handle different time formats (e.g., "9.58", "3:43.13", "2:01:39")
        const parts = timeStr.split(':');

        if (parts.length === 1) {
          // Format: "9.58" (seconds)
          return parseFloat(parts[0]);
        } else if (parts.length === 2) {
          // Format: "3:43.13" (minutes:seconds)
          return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
        } else if (parts.length === 3) {
          // Format: "2:01:39" (hours:minutes:seconds)
          return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
        }
        return 0;
      };

      const currentSeconds = convertToSeconds(currentTime);
      const previousSeconds = convertToSeconds(previousTime);

      if (currentSeconds === 0 || previousSeconds === 0) {
        return "N/A";
      }

      // Calculate improvement in seconds
      const improvementSeconds = previousSeconds - currentSeconds;

      // Format improvement
      if (improvementSeconds < 0) {
        // This shouldn't happen for records (they should always improve)
        return "N/A";
      }

      // Format based on magnitude
      if (improvementSeconds < 1) {
        // Less than a second, show in hundredths
        return `${(improvementSeconds).toFixed(2)}s`;
      } else if (improvementSeconds < 60) {
        // Less than a minute
        return `${improvementSeconds.toFixed(2)}s`;
      } else {
        // More than a minute
        const minutes = Math.floor(improvementSeconds / 60);
        const seconds = improvementSeconds % 60;
        return `${minutes}m ${seconds.toFixed(2)}s`;
      }
    } catch (error) {
      console.error('Error calculating time improvement:', error);
      return "N/A";
    }
  };

  // Helper function to calculate pace from record time and distance
  const calculatePace = (recordTime: string, distance: string): string => {
    try {
      // Convert time to seconds
      const timeInSeconds = (() => {
        const parts = recordTime.split(':');

        if (parts.length === 1) {
          // Format: "9.58" (seconds)
          return parseFloat(parts[0]);
        } else if (parts.length === 2) {
          // Format: "3:43.13" (minutes:seconds)
          return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
        } else if (parts.length === 3) {
          // Format: "2:01:39" (hours:minutes:seconds)
          return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
        }
        return 0;
      })();

      if (timeInSeconds === 0) return "N/A";

      // Get distance in meters or kilometers
      let distanceInMeters = 0;

      // Extract base distance without record type
      const baseDistance = distance.split(' ')[0];

      if (baseDistance === 'Marathon') {
        distanceInMeters = 42195;
      } else if (baseDistance === 'Half') {
        distanceInMeters = 21097.5;
      } else if (baseDistance === 'Half Marathon') {
        distanceInMeters = 21097.5;
      } else if (baseDistance === 'Mile') {
        distanceInMeters = 1609.34;
      } else if (baseDistance.endsWith('m')) {
        // Already in meters
        distanceInMeters = parseFloat(baseDistance.replace('m', ''));
      } else if (baseDistance.endsWith('k')) {
        // Convert km to meters
        distanceInMeters = parseFloat(baseDistance.replace('k', '')) * 1000;
      } else {
        console.log('Unknown distance format:', baseDistance);
        return "N/A";
      }

      console.log(`Calculating pace for ${recordTime} over ${distanceInMeters}m`);

      // Calculate pace
      let paceInSeconds;
      if (paceUnit === 'min/km') {
        // Calculate seconds per kilometer
        paceInSeconds = (timeInSeconds / distanceInMeters) * 1000;
      } else {
        // Calculate seconds per mile
        paceInSeconds = (timeInSeconds / distanceInMeters) * 1609.34;
      }

      // Format pace as mm:ss
      const paceMinutes = Math.floor(paceInSeconds / 60);
      const paceSeconds = Math.round(paceInSeconds % 60);

      // Format with leading zeros
      return `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Error calculating pace:', error);
      return "N/A";
    }
  };

  useEffect(() => {
    console.log('RecordsTimeline useEffect triggered');
    console.log(`Records received: ${records?.length || 0}`);
    console.log('Distance:', distance);
    console.log('Gender:', gender);
    console.log('Pace Unit:', paceUnit);

    if (!records || records.length === 0) {
      console.log('No records available to render');
      return;
    }

    // Ensure all records have valid Date objects
    const validRecords = records.map(record => {
      // Check if date is already a valid Date object
      if (record.date instanceof Date && !isNaN(record.date.getTime())) {
        return record;
      }

      console.log(`Converting date for record: ${record.athlete} - ${record.recordTime}`, record.date);
      try {
        // Try to convert string to Date
        const dateValue = new Date(record.date);
        if (!isNaN(dateValue.getTime())) {
          return {
            ...record,
            date: dateValue
          };
        } else {
          console.error(`Failed to convert date for record: ${record.athlete}`, record.date);
          return null;
        }
      } catch (error) {
        console.error(`Error converting date for record: ${record.athlete}`, error);
        return null;
      }
    }).filter((record): record is Record => record !== null);

    console.log(`Valid records after date check: ${validRecords.length} of ${records.length}`);

    if (validRecords.length === 0) {
      console.error('No valid records with proper dates to display');
      return;
    }

    // Sort records by date, most recent first
    let sortedRecords: Record[] = [];
    try {
      sortedRecords = [...validRecords].sort((a, b) => {
        // Additional safety check before sorting
        const aTime = a.date instanceof Date ? a.date.getTime() : 0;
        const bTime = b.date instanceof Date ? b.date.getTime() : 0;

        if (aTime === 0 || bTime === 0) {
          console.error('Invalid date objects found during sorting', {
            a: a.athlete,
            aDate: a.date,
            b: b.athlete,
            bDate: b.date
          });
        }

        return bTime - aTime;
      });
      console.log('Sorted records:', sortedRecords.length);
    } catch (error) {
      console.error('Error sorting dates:', error);
      sortedRecords = validRecords;
    }

    // Get the current world record (first in the sorted array)
    const currentRecord = sortedRecords[0];
    if (!currentRecord) {
      console.error('No current record found after sorting');
      return;
    }

    console.log('Current record:', currentRecord.athlete, currentRecord.recordTime);

    // Calculate time elapsed since the current record
    try {
      if (!(currentRecord.date instanceof Date)) {
        throw new Error('Current record date is not a valid Date object');
      }

      const daysSinceRecord = differenceInDays(new Date(), currentRecord.date);
      const yearsSinceRecord = (daysSinceRecord / 365).toFixed(1);
      console.log(`${distance} ${gender} World Record: ${currentRecord.recordTime}`);
      console.log(`Record has stood for ${yearsSinceRecord} years (since ${format(currentRecord.date, 'MMMM d, yyyy')})`);

      // Clear any existing SVG content
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();

      // Set up dimensions
      const margin = { top: 150, right: 200, bottom: 100, left: 200 };
      const width = 1000 - margin.left - margin.right;
      const heightPerEntry = 150; // Reduced height between entries
      const height = Math.max(600, sortedRecords.length * heightPerEntry) - margin.top - margin.bottom;

      // Create SVG
      const g = svg
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Format the record duration in years, months, days
      const formatRecordDuration = (daysSinceRecord: number): string => {
        const years = Math.floor(daysSinceRecord / 365);
        const remainingDaysAfterYears = daysSinceRecord % 365;
        const months = Math.floor(remainingDaysAfterYears / 30);
        const days = remainingDaysAfterYears % 30;

        let durationParts = [];
        if (years > 0) {
          durationParts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
        }
        if (months > 0) {
          durationParts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
        }
        if (days > 0 || (years === 0 && months === 0)) {
          durationParts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
        }

        return durationParts.join(', ');
      };

      // Extract record type from distance if present
      const distanceParts = distance.split(' ');
      const baseDistance = distanceParts[0];
      const recordTypeFromDistance = distanceParts.length > 1 ? distanceParts[1] : '';

      // Add time elapsed since current record at the top in a modern blue container
      // First add the container - moved even higher up
      g
        .append('rect')
        .attr('x', width / 2 - 300)
        .attr('y', -130) // Moved even higher up
        .attr('width', 600)
        .attr('height', 70)
        .attr('rx', 10)
        .attr('ry', 10)
        .attr('fill', '#eff6ff') // Light blue background
        .attr('stroke', '#dbeafe') // Lighter blue border
        .attr('stroke-width', 1);

      // Add record title with record type if available
      g
        .append('text')
        .attr('x', width / 2)
        .attr('y', -100) // Adjusted position
        .attr('text-anchor', 'middle')
        .style('font-size', '20px')
        .style('font-weight', 'bold')
        .style('fill', '#1e40af') // Darker blue text
        .text(`${baseDistance} ${gender} ${recordTypeFromDistance} World Record: ${currentRecord.recordTime}`);

      // Add record duration with years, months, days - with smaller font
      const formattedDuration = formatRecordDuration(daysSinceRecord);
      g
        .append('text')
        .attr('x', width / 2)
        .attr('y', -75) // Adjusted position
        .attr('text-anchor', 'middle')
        .style('font-size', '14px') // Smaller font size
        .style('fill', '#3b82f6') // Medium blue text
        .text(`Record has stood for ${formattedDuration} (since ${format(currentRecord.date, 'MMMM d, yyyy')})`);

      // Create a vertical scale for the timeline
      const yScale = d3
        .scaleLinear()
        .domain([0, sortedRecords.length - 1])
        .range([0, height]);

      // Draw the vertical timeline line
      g
        .append('line')
        .attr('x1', width / 2)
        .attr('y1', 0)
        .attr('x2', width / 2)
        .attr('y2', height)
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,4'); // Add dashed line style

      // Create timeline entries
      const timelineEntries = g
        .selectAll('.timeline-entry')
        .data(sortedRecords)
        .enter()
        .append('g')
        .attr('class', 'timeline-entry')
        .attr('transform', (d, i) => `translate(0, ${yScale(i)})`);

      // Add timeline nodes (circles)
      timelineEntries
        .append('circle')
        .attr('cx', width / 2)
        .attr('cy', 0)
        .attr('r', 6)
        .attr('fill', (d, i) => i === 0 ? '#3b82f6' : '#93c5fd') // Current record is darker blue
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .style('filter', (d, i) => i === 0 ? 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))' : 'none'); // Add subtle shadow to current record

      // Format the record time for display
      const formatRecordTime = (timeStr: string): string => {
        return timeStr;
      };

      // Calculate time between records and improvements
      const calculateTimeBetweenRecords = (currentIndex: number, records: Record[]): string => {
        if (currentIndex >= records.length - 1) return ""; // Last record

        const currentDate = records[currentIndex].date;
        const nextDate = records[currentIndex + 1].date;

        if (!(currentDate instanceof Date) || !(nextDate instanceof Date)) {
          return "";
        }

        const diffDays = differenceInDays(currentDate, nextDate);

        if (diffDays < 30) {
          return `${diffDays} days`;
        } else if (diffDays < 365) {
          return `${Math.round(diffDays / 30)} months`;
        } else {
          return `${(diffDays / 365).toFixed(1)} years`;
        }
      };

      // Add timeline cards
      timelineEntries.each(function (d, i) {
        const entry = d3.select(this);
        const isLeft = i % 2 === 0;
        const cardWidth = 280;
        const cardHeight = 120; // Increased height to accommodate pace
        const cardX = isLeft ? width / 2 - cardWidth - 30 : width / 2 + 30;
        const textAnchor = isLeft ? 'end' : 'start';
        const formattedDate = format(d.date, 'MMM d, yyyy');

        // Add card shadow first (for layering)
        entry
          .append('rect')
          .attr('x', cardX)
          .attr('y', -cardHeight / 2)
          .attr('width', cardWidth)
          .attr('height', cardHeight)
          .attr('rx', 8)
          .attr('ry', 8)
          .attr('fill', '#000')
          .attr('opacity', 0.03)
          .attr('transform', 'translate(3, 3)');

        // Add card background
        const card = entry
          .append('rect')
          .attr('x', cardX)
          .attr('y', -cardHeight / 2)
          .attr('width', cardWidth)
          .attr('height', cardHeight)
          .attr('rx', 8)
          .attr('ry', 8)
          .attr('fill', i === 0 ? 'url(#currentRecordGradient)' : 'white')
          .attr('stroke', i === 0 ? '#bfdbfe' : '#e5e7eb')
          .attr('stroke-width', 1);

        // Add connecting line from circle to card
        entry
          .append('line')
          .attr('x1', width / 2)
          .attr('y1', 0)
          .attr('x2', isLeft ? width / 2 - 30 : width / 2 + 30)
          .attr('y2', 0)
          .attr('stroke', '#e5e7eb')
          .attr('stroke-width', 1);

        // Add record time with date on the same line - Line 1
        entry
          .append('text')
          .attr('x', cardX + (isLeft ? cardWidth - 20 : 20))
          .attr('y', -cardHeight / 2 + 30)
          .attr('text-anchor', textAnchor)
          .style('font-weight', 'bold')
          .style('font-size', '18px')
          .style('fill', '#111827')
          .html(() => {
            return `${formatRecordTime(d.recordTime)} <tspan style="font-weight: normal; font-size: 14px; fill: #6b7280"> · ${formattedDate}</tspan>`;
          });

        // Calculate pace for this record
        const pace = calculatePace(d.recordTime, distance);

        // Add pace below the record time - Line 1.5
        entry
          .append('text')
          .attr('x', cardX + (isLeft ? cardWidth - 20 : 20))
          .attr('y', -cardHeight / 2 + 50)
          .attr('text-anchor', textAnchor)
          .style('font-size', '14px')
          .style('fill', '#4b5563')
          .text(`Pace: ${pace} ${paceUnit}`);

        // Get country code for flag (simplified version)
        const getCountryCode = (nationality: string): string => {
          const countryMap: {[key: string]: string} = {
            'United States': 'us', 'USA': 'us', 'Jamaica': 'jm', 'Kenya': 'ke',
            'Ethiopia': 'et', 'Great Britain': 'gb', 'United Kingdom': 'gb',
            'Canada': 'ca', 'Australia': 'au', 'Germany': 'de', 'East Germany': 'de',
            'West Germany': 'de', 'France': 'fr', 'Italy': 'it', 'Japan': 'jp',
            'China': 'cn', 'Russia': 'ru', 'Soviet Union': 'su', 'Brazil': 'br',
            'South Africa': 'za', 'Netherlands': 'nl', 'Norway': 'no', 'Finland': 'fi',
            'Sweden': 'se', 'Denmark': 'dk', 'Belgium': 'be', 'Switzerland': 'ch',
            'Spain': 'es', 'Portugal': 'pt', 'Poland': 'pl', 'Czech Republic': 'cz',
            'Czechoslovakia': 'cz', 'Hungary': 'hu', 'Romania': 'ro', 'Bulgaria': 'bg',
            'Greece': 'gr', 'Turkey': 'tr', 'Morocco': 'ma', 'Algeria': 'dz',
            'Tunisia': 'tn', 'Uganda': 'ug', 'Tanzania': 'tz', 'New Zealand': 'nz',
            'Mexico': 'mx', 'Cuba': 'cu', 'Eritrea': 'er', 'Bahrain': 'bh'
          };

          return countryMap[nationality] || 'unknown';
        };

        // Create Wikipedia URL for athlete
        const getWikipediaUrl = (athleteName: string): string => {
          // Replace spaces with underscores for Wikipedia URL format
          const formattedName = athleteName.replace(/\s+/g, '_');
          return `https://en.wikipedia.org/wiki/${formattedName}`;
        };

        // Add athlete name with Wikipedia link and nationality with flag - Line 2
        const flagEmoji = (() => {
          const countryCode = getCountryCode(d.nationality);
          return countryCode !== 'unknown'
            ? countryCode.toUpperCase().split('').map(char => String.fromCodePoint(char.charCodeAt(0) + 127397)).join('')
            : '';
        })();

        entry
          .append('text')
          .attr('x', cardX + (isLeft ? cardWidth - 20 : 20))
          .attr('y', -cardHeight / 2 + 75) // Adjusted position due to added pace line
          .attr('text-anchor', textAnchor)
          .style('font-weight', 'bold')
          .style('font-size', '16px')
          .style('fill', '#111827')
          .html(() => {
            const wikipediaUrl = getWikipediaUrl(d.athlete);
            return `<a href="${wikipediaUrl}" target="_blank" style="text-decoration: underline; cursor: pointer; fill: #2563eb;">${d.athlete}</a> <tspan style="font-weight: normal; font-size: 14px;">${flagEmoji} ${d.nationality}</tspan>`;
          });

        // Add improvement percentage if not the first record - Line 3
        if (i < sortedRecords.length - 1) {
          const improvement = calculateTimeImprovement(d.recordTime, sortedRecords[i + 1].recordTime);
          const timeBetweenRecords = calculateTimeBetweenRecords(i, sortedRecords);

          // Position the improvement text completely to the side of the timeline
          const improvementX = isLeft
            ? cardX - 20 // For left cards, position to the left of the card
            : cardX + cardWidth + 20; // For right cards, position to the right of the card

          entry
            .append('text')
            .attr('x', improvementX)
            .attr('y', -20) // Above the timeline node
            .attr('text-anchor', isLeft ? 'end' : 'start')
            .style('font-size', '12px')
            .style('fill', '#059669') // Green text for improvement
            .html(() => {
              return `<tspan style="font-weight: bold;">↑ ${improvement}</tspan>`;
            });

          // Add "stood for" text below the improvement
          entry
            .append('text')
            .attr('x', improvementX)
            .attr('y', 0) // At the timeline node level
            .attr('text-anchor', isLeft ? 'end' : 'start')
            .style('font-size', '11px')
            .style('fill', '#6b7280')
            .text(`Stood for ${timeBetweenRecords}`);
        }
      });

      // Add gradient definition for current record card
      const defs = svg.append('defs');
      const gradient = defs.append('linearGradient')
        .attr('id', 'currentRecordGradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '100%');

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#eff6ff');

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#dbeafe');

      console.log('Timeline rendering complete');
    } catch (error) {
      console.error('Error rendering timeline:', error);
    }
  }, [records, distance, gender, paceUnit]);

  return (
    <div className="overflow-x-auto">
      <svg ref={svgRef} className="mx-auto"></svg>
    </div>
  );
};

export default RecordsTimeline;