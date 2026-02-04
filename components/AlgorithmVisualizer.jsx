import React, { useState } from 'react';
import { findShortestPath, detectCycle } from '../utils/graphAlgorithms';

/**
 * AlgorithmVisualizer Component - Demonstrates graph algorithms
 */
export default function AlgorithmVisualizer({ graphData, onPathHighlight }) {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('');
  const [startNode, setStartNode] = useState('');
  const [endNode, setEndNode] = useState('');
  const [result, setResult] = useState(null);

  const runBFS = () => {
    if (!startNode || !endNode) {
      setResult({ error: 'Please select both start and end commits' });
      return;
    }

    const path = findShortestPath(startNode, endNode, graphData.edges);
    
    if (path) {
      setResult({
        algorithm: 'Breadth-First Search (BFS)',
        description: 'Finds the shortest path between two commits',
        complexity: 'Time: O(V + E), Space: O(V)',
        path: path,
        pathLength: path.length - 1
      });
      onPathHighlight && onPathHighlight(path);
    } else {
      setResult({
        error: 'No path found between the selected commits'
      });
    }
  };

  const runCycleDetection = () => {
    const hasCycle = detectCycle(graphData.nodes, graphData.edges);
    
    setResult({
      algorithm: 'Cycle Detection (DFS)',
      description: 'Detects if there are any cycles in the commit graph',
      complexity: 'Time: O(V + E), Space: O(V)',
      hasCycle: hasCycle,
      message: hasCycle 
        ? '⚠️ Cycle detected! This should not happen in a valid Git repository.'
        : '✅ No cycles detected. This is a valid Directed Acyclic Graph (DAG).'
    });
  };

  const runDFS = () => {
    if (!startNode) {
      setResult({ error: 'Please select a start commit' });
      return;
    }

    // Simple DFS traversal from start node
    const visited = [];
    const stack = [startNode];
    const visitedSet = new Set();

    while (stack.length > 0) {
      const current = stack.pop();
      if (visitedSet.has(current)) continue;
      
      visitedSet.add(current);
      visited.push(current);

      // Add children to stack
      graphData.edges.forEach(edge => {
        if (edge.from === current && !visitedSet.has(edge.to)) {
          stack.push(edge.to);
        }
      });
    }

    setResult({
      algorithm: 'Depth-First Search (DFS)',
      description: 'Traverses the commit graph in depth-first order',
      complexity: 'Time: O(V + E), Space: O(V)',
      visited: visited,
      visitedCount: visited.length
    });
    onPathHighlight && onPathHighlight(visited);
  };

  const clearResults = () => {
    setResult(null);
    setSelectedAlgorithm('');
    setStartNode('');
    setEndNode('');
    onPathHighlight && onPathHighlight([]);
  };

  return (
    <div className="algorithm-visualizer">
      <h3>🧮 Algorithm Visualizer</h3>
      
      {/* Algorithm Selection */}
      <div className="algorithm-selector">
        <label>Select Algorithm:</label>
        <div className="algorithm-buttons">
          <button
            className={`btn-algorithm ${selectedAlgorithm === 'bfs' ? 'active' : ''}`}
            onClick={() => setSelectedAlgorithm('bfs')}
          >
            BFS (Shortest Path)
          </button>
          <button
            className={`btn-algorithm ${selectedAlgorithm === 'dfs' ? 'active' : ''}`}
            onClick={() => setSelectedAlgorithm('dfs')}
          >
            DFS (Traversal)
          </button>
          <button
            className={`btn-algorithm ${selectedAlgorithm === 'cycle' ? 'active' : ''}`}
            onClick={() => setSelectedAlgorithm('cycle')}
          >
            Cycle Detection
          </button>
        </div>
      </div>

      {/* Algorithm Parameters */}
      {selectedAlgorithm && selectedAlgorithm !== 'cycle' && (
        <div className="algorithm-params">
          <div className="param-group">
            <label>Start Commit:</label>
            <select 
              value={startNode} 
              onChange={(e) => setStartNode(e.target.value)}
            >
              <option value="">Select commit...</option>
              {graphData.nodes.map(node => (
                <option key={node.id} value={node.id}>
                  {node.hash} - {node.message}
                </option>
              ))}
            </select>
          </div>

          {selectedAlgorithm === 'bfs' && (
            <div className="param-group">
              <label>End Commit:</label>
              <select 
                value={endNode} 
                onChange={(e) => setEndNode(e.target.value)}
              >
                <option value="">Select commit...</option>
                {graphData.nodes.map(node => (
                  <option key={node.id} value={node.id}>
                    {node.hash} - {node.message}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Run Button */}
      {selectedAlgorithm && (
        <div className="algorithm-actions">
          <button 
            className="btn-success"
            onClick={() => {
              if (selectedAlgorithm === 'bfs') runBFS();
              else if (selectedAlgorithm === 'dfs') runDFS();
              else if (selectedAlgorithm === 'cycle') runCycleDetection();
            }}
          >
            Run Algorithm
          </button>
          {result && (
            <button className="btn-secondary" onClick={clearResults}>
              Clear
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="algorithm-results">
          {result.error ? (
            <div className="error-message">{result.error}</div>
          ) : (
            <>
              <h4>{result.algorithm}</h4>
              <p className="algorithm-description">{result.description}</p>
              <p className="algorithm-complexity">
                <strong>Complexity:</strong> {result.complexity}
              </p>

              {/* BFS Results */}
              {result.path && (
                <div className="result-section">
                  <strong>Path found:</strong>
                  <div className="path-display">
                    {result.path.map((nodeId, index) => {
                      const node = graphData.nodes.find(n => n.id === nodeId);
                      return (
                        <React.Fragment key={nodeId}>
                          <span className="path-node">
                            {node ? node.hash : nodeId.slice(0, 7)}
                          </span>
                          {index < result.path.length - 1 && (
                            <span className="path-arrow"> → </span>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                  <p><strong>Path length:</strong> {result.pathLength} edge(s)</p>
                </div>
              )}

              {/* DFS Results */}
              {result.visited && (
                <div className="result-section">
                  <strong>Visited {result.visitedCount} commits:</strong>
                  <div className="visited-display">
                    {result.visited.map((nodeId, index) => {
                      const node = graphData.nodes.find(n => n.id === nodeId);
                      return (
                        <span key={nodeId} className="visited-node">
                          {node ? node.hash : nodeId.slice(0, 7)}
                          {index < result.visited.length - 1 && ', '}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Cycle Detection Results */}
              {result.message && (
                <div className={`result-section ${result.hasCycle ? 'warning' : 'success'}`}>
                  <p>{result.message}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Algorithm Explanations */}
      <div className="algorithm-explanations">
        <h4>📖 Algorithm Explanations</h4>
        <div className="explanation-item">
          <strong>BFS (Breadth-First Search):</strong>
          <p>Explores commits level by level, guaranteeing the shortest path between two commits. Uses a queue data structure.</p>
        </div>
        <div className="explanation-item">
          <strong>DFS (Depth-First Search):</strong>
          <p>Explores as far as possible along each branch before backtracking. Uses a stack data structure (or recursion).</p>
        </div>
        <div className="explanation-item">
          <strong>Cycle Detection:</strong>
          <p>Uses DFS with color marking to detect cycles. Git commit graphs should always be acyclic (DAG - Directed Acyclic Graph).</p>
        </div>
      </div>
    </div>
  );
}