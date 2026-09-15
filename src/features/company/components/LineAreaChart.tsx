'use client';

import { useEffect, useRef, useId } from 'react';
import * as d3 from 'd3';

export interface LineChartPoint {
  label: string;
  value: number;
}

interface LineAreaChartProps {
  data: LineChartPoint[];
  fill?: boolean;
  color?: string;
  height?: number;
}

export default function LineAreaChart({
  data,
  fill = false,
  color = '#10b981',
  height = 224,
}: LineAreaChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gradientId = useId().replace(/:/g, '');

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svg.node()?.clientWidth ?? 560;
    const margin = { top: 8, right: 8, bottom: 24, left: 8 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x = d3
      .scalePoint<number>()
      .domain(data.map((_, i) => i))
      .range([0, innerWidth])
      .padding(0);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) ?? 0])
      .range([innerHeight, 0])
      .nice();

    const line = d3
      .line<LineChartPoint>()
      .x((_, i) => x(i) ?? 0)
      .y((d) => y(d.value))
      .curve(d3.curveMonotoneX);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    if (fill) {
      const area = d3
        .area<LineChartPoint>()
        .x((_, i) => x(i) ?? 0)
        .y0(innerHeight)
        .y1((d) => y(d.value))
        .curve(d3.curveMonotoneX);

      const defs = g.append('defs');
      const grad = defs
        .append('linearGradient')
        .attr('id', gradientId)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      grad.append('stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', 0.25);
      grad.append('stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', 0);

      g.append('path')
        .datum(data)
        .attr('fill', `url(#${gradientId})`)
        .attr('d', area);
    }

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('d', line);

    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', innerHeight)
      .attr('y2', innerHeight)
      .attr('stroke', '#e2e8f0');

    g.selectAll('text')
      .data(data)
      .join('text')
      .attr('x', (_, i) => (x(i) ?? 0) + 0)
      .attr('y', innerHeight + 18)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', 11)
      .text((d) => d.label);
  }, [data, fill, color, height, gradientId]);

  return (
    <svg
      ref={svgRef}
      className="w-full"
      style={{ height }}
      role="img"
      aria-label="Line chart"
      viewBox={`0 0 560 ${height}`}
      preserveAspectRatio="xMidYMid meet"
    />
  );
}