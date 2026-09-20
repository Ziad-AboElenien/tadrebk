'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useChartWidth } from './useChartWidth';

export interface StackedBarDatum {
  label: string;
  values: Record<string, number>;
}

interface StackedBarChartProps {
  data: StackedBarDatum[];
  colors: Record<string, string>;
  height?: number;
}

export default function StackedBarChart({ data, colors, height = 224 }: StackedBarChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { ref: wrapRef, width } = useChartWidth();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const keys = Object.keys(data[0]?.values ?? {});
    const margin = { top: 8, right: 8, bottom: 24, left: 8 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, innerWidth])
      .padding(0.25);

    const y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(data, (d) => d3.sum(keys, (k) => d.values[k] ?? 0)) ?? 0,
      ])
      .range([innerHeight, 0])
      .nice();

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    data.forEach((d) => {
      let y0 = 0;
      keys.forEach((k) => {
        const v = d.values[k] ?? 0;
        const pyTop = y(y0 + v);
        const pyBottom = y(y0);
        g.append('rect')
          .attr('x', x(d.label) ?? 0)
          .attr('y', pyTop)
          .attr('width', x.bandwidth())
          .attr('height', pyBottom - pyTop)
          .attr('rx', 3)
          .attr('fill', colors[k] ?? '#10b981');
        y0 += v;
      });
    });

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
  }, [data, colors, height, width]);

  return (
    <div ref={wrapRef} className="w-full">
      <svg
        ref={svgRef}
        className="block w-full"
        style={{ height }}
        role="img"
        aria-label="Stacked bar chart"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
}