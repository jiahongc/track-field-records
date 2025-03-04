import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Record } from '@/types/records';

interface RecordChartProps {
  records: Record[];
  event: string;
}

const RecordChart = ({ records, event }: RecordChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!records.length || !svgRef.current) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Set up dimensions
    const margin = { top: 40, right: 30, bottom: 60, left: 60 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = svgRef.current.clientHeight - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Parse dates and times
    const parseTime = (timeStr: string) => {
      const [mins, secs] = timeStr.split(':').map(Number);
      return mins ? mins * 60 + (secs || 0) : secs || 0;
    };

    // Create scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(records, d => new Date(d.date)) as [Date, Date])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(records, d => parseTime(d.mark)) as number * 0.95,
        d3.max(records, d => parseTime(d.mark)) as number * 1.05
      ])
      .range([height, 0]);

    // Create line generator
    const line = d3
      .line<Record>()
      .x(d => xScale(new Date(d.date)))
      .y(d => yScale(parseTime(d.mark)));

    // Add the line path
    svg
      .append('path')
      .datum(records)
      .attr('fill', 'none')
      .attr('stroke', '#2563eb')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add dots for each record
    svg
      .selectAll('.dot')
      .data(records)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(new Date(d.date)))
      .attr('cy', d => yScale(parseTime(d.mark)))
      .attr('r', 5)
      .attr('fill', '#2563eb')
      .append('title')
      .text(d => `${d.athlete} (${d.nationality})\n${d.mark}\n${new Date(d.date).toLocaleDateString()}`);

    // Add axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale).tickFormat(d => {
      const minutes = Math.floor(+d / 60);
      const seconds = (+d % 60).toFixed(2);
      return minutes ? `${minutes}:${seconds.padStart(5, '0')}` : seconds;
    });

    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis);

    svg
      .append('g')
      .call(yAxis);

    // Add labels
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 10)
      .attr('text-anchor', 'middle')
      .text('Year');

    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -margin.left + 15)
      .attr('text-anchor', 'middle')
      .text('Time (MM:SS)');

    // Add title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-xl font-bold')
      .text(`${event} World Record Progression`);

  }, [records, event]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full"
      style={{ minHeight: '500px' }}
    />
  );
};

export default RecordChart; 