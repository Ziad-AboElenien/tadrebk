'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useChartWidth } from './useChartWidth';

export interface PerformancePoint {
  label: string;
  value: number;
}

interface PerformanceChartProps {
  data: PerformancePoint[];
  activeColor?: string;
  completedColor?: string;
}

export default function PerformanceChart({
  data,
  activeColor = '#34d399',
  completedColor = '#1e293b',
}: PerformanceChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { ref: wrapRef, width } = useChartWidth();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const height = 240;
    const margin = { top: 8, right: 8, bottom: 24, left: 8 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, innerWidth])
      .padding(0.25);

    const peak = d3.max(data, (d) => d.value) ?? 0;
    const y = d3
      .scaleLinear()
      // Never a degenerate [0,0] domain on empty/all-zero data.
      .domain([0, Math.max(1, peak)])
      .range([innerHeight, 0])
      .nice();

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    g.selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', (d) => x(d.label) ?? 0)
      .attr('y', (d) => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', (d) => innerHeight - y(d.value))
      .attr('rx', 4)
      .attr('fill', 'url(#perfGradient)');

    const defs = svg.append('defs');
    defs
      .append('linearGradient')
      .attr('id', 'perfGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%')
      .selectAll('stop')
      .data([
        { offset: '0%', color: activeColor },
        { offset: '100%', color: completedColor },
      ])
      .join('stop')
      .attr('offset', (d) => d.offset)
      .attr('stop-color', (d) => d.color);

    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', innerHeight)
      .attr('y2', innerHeight)
      .attr('stroke', '#e2e8f0');

    g.selectAll('text')
      .data(data)
      .join('text')
      .attr('x', (d) => (x(d.label) ?? 0) + x.bandwidth() / 2)
      .attr('y', innerHeight + 18)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', 11)
      .text((d) => d.label);
  }, [data, activeColor, completedColor, width]);

  return (
    <div ref={wrapRef} className="w-full">
      <svg
        ref={svgRef}
        className="block h-60 w-full"
        role="img"
        aria-label="Internship performance bar chart"
        viewBox={`0 0 ${width} ${240}`}
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
}