/**
 * Graph Layout Algorithms for Git Visualization
 * CS Concepts: Graph theory, topological sorting, force-directed layout
 */

/**
 * Topological Sort for Git Commit Graph
 * CS Concept: Kahn's Algorithm for topological sorting - O(V + E)
 * Used to determine the vertical order of commits
 */
export function topologicalSort(nodes, edges) {
  const graph = new Map();
  const inDegree = new Map();
  
  // Initialize
  nodes.forEach(node => {
    graph.set(node.id, []);
    inDegree.set(node.id, 0);
  });
  
  // Build adjacency list and calculate in-degrees
  edges.forEach(edge => {
    if (graph.has(edge.from) && graph.has(edge.to)) {
      graph.get(edge.from).push(edge.to);
      inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
    }
  });
  
  // Queue of nodes with no incoming edges
  const queue = [];
  inDegree.forEach((degree, node) => {
    if (degree === 0) queue.push(node);
  });
  
  const sorted = [];
  
  while (queue.length > 0) {
    const node = queue.shift();
    sorted.push(node);
    
    const neighbors = graph.get(node) || [];
    neighbors.forEach(neighbor => {
      inDegree.set(neighbor, inDegree.get(neighbor) - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    });
  }
  
  return sorted.reverse(); // Reverse to show newest commits first
}

/**
 * Layered Graph Layout (Sugiyama Framework)
 * CS Concept: Hierarchical graph drawing
 * Assigns X and Y coordinates to nodes for visualization
 */
export function calculateLayout(nodes, edges, options = {}) {
  const {
    nodeWidth = 120,
    nodeHeight = 60,
    horizontalGap = 150,
    verticalGap = 100
  } = options;

  if (nodes.length === 0) {
    return { nodes: [], edges: [] };
  }

  // Step 1: Topological sort to get layers
  const sorted = topologicalSort(nodes, edges);
  
  // Step 2: Assign layers (Y coordinates)
  const layers = new Map();
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  
  sorted.forEach((nodeId, index) => {
    layers.set(nodeId, sorted.length - index - 1);
  });
  
  // Step 3: Count nodes per layer
  const layerCounts = new Map();
  layers.forEach((layer, nodeId) => {
    layerCounts.set(layer, (layerCounts.get(layer) || 0) + 1);
  });
  
  // Step 4: Assign positions within layers
  const layerPositions = new Map();
  layers.forEach((layer, nodeId) => {
    if (!layerPositions.has(layer)) {
      layerPositions.set(layer, 0);
    }
    const position = layerPositions.get(layer);
    layerPositions.set(layer, position + 1);
    
    const node = nodeMap.get(nodeId);
    if (node) {
      const layerSize = layerCounts.get(layer);
      const totalWidth = layerSize * nodeWidth + (layerSize - 1) * horizontalGap;
      const startX = -totalWidth / 2;
      
      node.x = startX + position * (nodeWidth + horizontalGap) + nodeWidth / 2;
      node.y = layer * verticalGap + nodeHeight / 2;
    }
  });
  
  // Step 5: Calculate edge paths
  const edgesWithPaths = edges.map(edge => {
    const fromNode = nodeMap.get(edge.from);
    const toNode = nodeMap.get(edge.to);
    
    if (fromNode && toNode) {
      return {
        ...edge,
        x1: fromNode.x,
        y1: fromNode.y + nodeHeight / 2,
        x2: toNode.x,
        y2: toNode.y - nodeHeight / 2,
        controlX1: fromNode.x,
        controlY1: fromNode.y + (toNode.y - fromNode.y) / 2,
        controlX2: toNode.x,
        controlY2: fromNode.y + (toNode.y - fromNode.y) / 2
      };
    }
    return edge;
  });
  
  return {
    nodes: Array.from(nodeMap.values()),
    edges: edgesWithPaths
  };
}

/**
 * Find shortest path between two commits
 * CS Concept: Breadth-First Search (BFS) - O(V + E)
 */
export function findShortestPath(startId, endId, edges) {
  if (startId === endId) return [startId];
  
  const graph = new Map();
  edges.forEach(edge => {
    if (!graph.has(edge.from)) graph.set(edge.from, []);
    if (!graph.has(edge.to)) graph.set(edge.to, []);
    graph.get(edge.from).push(edge.to);
    graph.get(edge.to).push(edge.from); // Undirected for path finding
  });
  
  const queue = [[startId]];
  const visited = new Set([startId]);
  
  while (queue.length > 0) {
    const path = queue.shift();
    const node = path[path.length - 1];
    
    if (node === endId) {
      return path;
    }
    
    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }
  
  return null; // No path found
}

/**
 * Detect cycles in the graph (shouldn't exist in valid Git DAG)
 * CS Concept: Cycle detection using DFS - O(V + E)
 */
export function detectCycle(nodes, edges) {
  const graph = new Map();
  const visiting = new Set();
  const visited = new Set();
  
  nodes.forEach(node => graph.set(node.id, []));
  edges.forEach(edge => {
    if (graph.has(edge.from)) {
      graph.get(edge.from).push(edge.to);
    }
  });
  
  function dfs(nodeId) {
    visiting.add(nodeId);
    
    const neighbors = graph.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (visiting.has(neighbor)) {
        return true; // Cycle detected
      }
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      }
    }
    
    visiting.delete(nodeId);
    visited.add(nodeId);
    return false;
  }
  
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) return true;
    }
  }
  
  return false;
}

/**
 * Calculate graph metrics
 * CS Concepts: Graph analysis
 */
export function calculateGraphMetrics(nodes, edges) {
  const graph = new Map();
  nodes.forEach(node => graph.set(node.id, []));
  edges.forEach(edge => {
    if (graph.has(edge.from)) {
      graph.get(edge.from).push(edge.to);
    }
  });
  
  // Calculate in-degree and out-degree for each node
  const inDegree = new Map();
  const outDegree = new Map();
  
  nodes.forEach(node => {
    inDegree.set(node.id, 0);
    outDegree.set(node.id, 0);
  });
  
  edges.forEach(edge => {
    outDegree.set(edge.from, (outDegree.get(edge.from) || 0) + 1);
    inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
  });
  
  // Find root nodes (no parents)
  const roots = nodes.filter(node => inDegree.get(node.id) === 0);
  
  // Find leaf nodes (no children)
  const leaves = nodes.filter(node => outDegree.get(node.id) === 0);
  
  // Calculate longest path (for tree depth)
  let maxDepth = 0;
  
  function dfs(nodeId, depth) {
    maxDepth = Math.max(maxDepth, depth);
    const neighbors = graph.get(nodeId) || [];
    neighbors.forEach(neighbor => dfs(neighbor, depth + 1));
  }
  
  roots.forEach(root => dfs(root.id, 0));
  
  return {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    rootCount: roots.length,
    leafCount: leaves.length,
    maxDepth,
    avgInDegree: nodes.length > 0 ? edges.length / nodes.length : 0,
    avgOutDegree: nodes.length > 0 ? edges.length / nodes.length : 0
  };
}

/**
 * Group nodes by branch
 * CS Concept: Graph component analysis
 */
export function groupByBranch(nodes, edges, branches) {
  const branchNodes = {};
  
  Object.entries(branches).forEach(([branchName, headHash]) => {
    branchNodes[branchName] = new Set([headHash]);
    
    // Trace back through parents
    const visited = new Set();
    const stack = [headHash];
    
    while (stack.length > 0) {
      const current = stack.pop();
      if (visited.has(current)) continue;
      
      visited.add(current);
      branchNodes[branchName].add(current);
      
      // Add parent commits
      edges.forEach(edge => {
        if (edge.from === current) {
          stack.push(edge.to);
        }
      });
    }
  });
  
  return branchNodes;
}