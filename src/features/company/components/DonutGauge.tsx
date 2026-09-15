'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface DonutGaugeProps {
  value: number;
  size?: number;
  thickness?: number;
  color?: string;
  trackColor?: string;
  showLabel?: boolean;
}

export default function DonutGauge({
  value,
  size = 160,
  thickness = 12,
  color = '#10b981',
  trackColor = '#f1f5f9',
  showLabel = true,
}: DonutGaugeProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const radius = (size - thickness) / 2;
    const center = size / 2;

    const arc = d3
      .arc()
      .innerRadius(radius - thickness / 2)
      .outerRadius(radius + thickness / 2)
      .cornerRadius(4)
      .startAngle(-Math.PI / 2);

    const clamp = Math.max(0, Math.min(100, value));

    svg
      .append('path')
      .attr('transform', `translate(${center},${center})`)
      .attr('fill', trackColor)
      .attr(
        'd',
        arc({
          innerRadius: radius - thickness / 2,
          outerRadius: radius + thickness / 2,
          startAngle: -Math.PI / 2,
          endAngle: -Math.PI / 2 + 2 * Math.PI,
        }),
      );

    svg
      .append('path')
      .attr('transform', `translate(${center},${center})`)
      .attr('fill', color)
      .attr(
        'd',
        arc({
          innerRadius: radius - thickness / 2,
          outerRadius: radius + thickness / 2,
          startAngle: -Math.PI / 2,
          endAngle: -Math.PI / 2 + (2 * Math.PI * clamp) / 100,
        }),
      );

    if (showLabel) {
      svg
        .append('text')
        .attr('x', center)
        .attr('y', center + 6)
        .attr('text-anchor', 'middle')
        .attr('fill', '#0f172a')
        .attr('font-size', 22)
        .attr('font-weight', 700)
        .text(`${clamp}%`);
    }
  }, [value, size, thickness, color, trackColor, showLabel]);

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      role="img"
      aria-label={`Progress: ${value}%`}
    />
  );
}