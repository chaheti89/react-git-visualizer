import React, { useEffect, useRef, useState } from 'react';
import { calculateLayout } from '../utils/graphAlgorithms';

/**
 * CommitGraph Component - Visualizes Git commit graph
 * Demonstrates: SVG rendering, graph visualization, event handling
 */
export default function CommitGraph({ 
  graphData, 
  selectedCommit, 
  onCommitClick,
  hoveredNode,
  onNodeHover,
  zoomLevel = 1,
  panOffset = { x: 0, y: 0 }
}) {
  const svgRef = useRef(null);
  const [layout, setLayout] = useState({ nodes: [], edges: [] });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Calculate layout when graph data changes
  useEffect(() => {
    if (graphData.nodes.length > 0) {
      const layoutData = calculateLayout(
        [...graphData.nodes],
        [...graphData.edges],
        {
          nodeWidth: 120,
          nodeHeight: 60,
          horizontalGap: 150,
          verticalGap: 100
        }
      );
      setLayout(layoutData);
    }
  }, [graphData]);

  // Update dimensions on window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const parent = svgRef.current.parentElement;
        setDimensions({
          width: parent.clientWidth,
          height: parent.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Calculate viewBox to center the graph
  const viewBox = () => {
    if (layout.nodes.length === 0) return '0 0 800 600';
    
    const padding = 100;
    const minX = Math.min(...layout.nodes.map(n => n.x)) - padding;
    const maxX = Math.max(...layout.nodes.map(n => n.x)) + padding;
    const minY = Math.min(...layout.nodes.map(n => n.y)) - padding;
    const maxY = Math.max(...layout.nodes.map(n => n.y)) + padding;
    
    const width = maxX - minX;
    const height = maxY - minY;
    
    return `${minX - panOffset.x / zoomLevel} ${minY - panOffset.y / zoomLevel} ${width / zoomLevel} ${height / zoomLevel}`;
  };

  // Get branch color
  const getBranchColor = (nodeId) => {
    const colors = {
      main: '#4CAF50',
      'feature-branch': '#2196F3',
      default: '#9C27B0'
    };

    for (const [branch, hash] of Object.entries(graphData.branches)) {
      if (hash === nodeId) {
        return colors[branch] || colors.default;
      }
    }
    return '#757575';
  };

  // Render edge (connection between commits)
  const renderEdge = (edge, index) => {
    if (!edge.x1 || !edge.y1 || !edge.x2 || !edge.y2) return null;

    // Use cubic Bezier curve for smooth connections
    const path = `M ${edge.x1},${edge.y1} C ${edge.controlX1},${edge.controlY1} ${edge.controlX2},${edge.controlY2} ${edge.x2},${edge.y2}`;

    return (
      <path
        key={`edge-${index}`}
        d={path}
        stroke="#666"
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)"
        opacity="0.6"
      />
    );
  };

  // Render commit node
  const renderNode = (node) => {
    const isSelected = selectedCommit?.hash === node.id;
    const isHovered = hoveredNode === node.id;
    const color = getBranchColor(node.id);

    return (
      <g
        key={node.id}
        transform={`translate(${node.x}, ${node.y})`}
        onClick={() => onCommitClick && onCommitClick(node.id)}
        onMouseEnter={() => onNodeHover && onNodeHover(node.id)}
        onMouseLeave={() => onNodeHover && onNodeHover(null)}
        style={{ cursor: 'pointer' }}
      >
        {/* Node background */}
        <rect
          x={-60}
          y={-30}
          width={120}
          height={60}
          rx={8}
          fill={isSelected ? color : isHovered ? '#f5f5f5' : 'white'}
          stroke={color}
          strokeWidth={isSelected ? 3 : isHovered ? 2 : 1.5}
          filter={isHovered ? 'url(#shadow)' : ''}
        />
        
        {/* Commit hash */}
        <text
          x={0}
          y={-10}
          textAnchor="middle"
          fontSize={12}
          fontFamily="monospace"
          fontWeight="bold"
          fill={isSelected ? 'white' : color}
        >
          {node.hash}
        </text>
        
        {/* Commit message */}
        <text
          x={0}
          y={10}
          textAnchor="middle"
          fontSize={10}
          fill={isSelected ? 'white' : '#333'}
        >
          {node.message.length > 15 ? node.message.slice(0, 15) + '...' : node.message}
        </text>
        
        {/* Author */}
        <text
          x={0}
          y={25}
          textAnchor="middle"
          fontSize={8}
          fill={isSelected ? 'white' : '#666'}
        >
          {node.author.split('<')[0].trim()}
        </text>
      </g>
    );
  };

  // Render branch labels
  const renderBranchLabels = () => {
    return Object.entries(graphData.branches).map(([branchName, commitHash]) => {
      const node = layout.nodes.find(n => n.id === commitHash);
      if (!node) return null;

      const isCurrent = graphData.HEAD === branchName;
      const color = getBranchColor(commitHash);

      return (
        <g key={`branch-${branchName}`} transform={`translate(${node.x + 70}, ${node.y - 30})`}>
          <rect
            x={0}
            y={0}
            width={branchName.length * 7 + 20}
            height={20}
            rx={10}
            fill={color}
            opacity={0.9}
          />
          <text
            x={10}
            y={14}
            fontSize={11}
            fontWeight="bold"
            fill="white"
          >
            {isCurrent && '→ '}{branchName}
          </text>
        </g>
      );
    });
  };

  if (layout.nodes.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <p>No commits to display</p>
      </div>
    );
  }

  return (
    <svg
      ref={svgRef}
      width={dimensions.width}
      height={dimensions.height}
      viewBox={viewBox()}
      style={{ background: '#fafafa', border: '1px solid #ddd' }}
    >
      {/* Definitions for reusable elements */}
      <defs>
        {/* Arrow marker for edges */}
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 10 3, 0 6" fill="#666" />
        </marker>
        
        {/* Shadow filter */}
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dx="2" dy="2" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Render edges first (so they appear below nodes) */}
      <g id="edges">
        {layout.edges.map((edge, index) => renderEdge(edge, index))}
      </g>

      {/* Render nodes */}
      <g id="nodes">
        {layout.nodes.map(node => renderNode(node))}
      </g>

      {/* Render branch labels */}
      <g id="branches">
        {renderBranchLabels()}
      </g>
    </svg>
  );
}