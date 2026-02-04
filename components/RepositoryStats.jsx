import React from 'react';
import { calculateGraphMetrics } from '../utils/graphAlgorithms';

/**
 * RepositoryStats Component - Displays repository statistics and metrics
 */
export default function RepositoryStats({ stats, graphData }) {
  if (!stats) {
    return <div className="repo-stats">Loading statistics...</div>;
  }

  // Calculate graph-specific metrics
  const graphMetrics = graphData.nodes.length > 0 
    ? calculateGraphMetrics(graphData.nodes, graphData.edges)
    : null;

  return (
    <div className="repo-stats">
      <h3>Repository Statistics</h3>
      
      <div className="stats-grid">
        {/* Object Statistics */}
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalObjects}</div>
            <div className="stat-label">Total Objects</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalCommits}</div>
            <div className="stat-label">Commits</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌳</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalTrees}</div>
            <div className="stat-label">Trees</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalBlobs}</div>
            <div className="stat-label">Blobs</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌿</div>
          <div className="stat-content">
            <div className="stat-value">{stats.branches}</div>
            <div className="stat-label">Branches</div>
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-icon">→</div>
          <div className="stat-content">
            <div className="stat-value">{stats.currentBranch}</div>
            <div className="stat-label">Current Branch</div>
          </div>
        </div>
      </div>

      {/* Graph Metrics */}
      {graphMetrics && (
        <>
          <h4>Graph Analysis</h4>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🔗</div>
              <div className="stat-content">
                <div className="stat-value">{graphMetrics.edgeCount}</div>
                <div className="stat-label">Connections</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-value">{graphMetrics.maxDepth}</div>
                <div className="stat-label">Max Depth</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🌱</div>
              <div className="stat-content">
                <div className="stat-value">{graphMetrics.rootCount}</div>
                <div className="stat-label">Root Commits</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🍃</div>
              <div className="stat-content">
                <div className="stat-value">{graphMetrics.leafCount}</div>
                <div className="stat-label">Leaf Commits</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⬇️</div>
              <div className="stat-content">
                <div className="stat-value">{graphMetrics.avgInDegree.toFixed(2)}</div>
                <div className="stat-label">Avg In-Degree</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⬆️</div>
              <div className="stat-content">
                <div className="stat-value">{graphMetrics.avgOutDegree.toFixed(2)}</div>
                <div className="stat-label">Avg Out-Degree</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* CS Concepts Explanation */}
      <div className="concepts-explanation">
        <h4>📚 Computer Science Concepts Used</h4>
        <ul>
          <li><strong>Hash Tables:</strong> Git objects are stored using SHA-1 hashes as keys</li>
          <li><strong>Directed Acyclic Graph (DAG):</strong> Commit history forms a DAG structure</li>
          <li><strong>Trees:</strong> Directory structures are represented as tree data structures</li>
          <li><strong>Topological Sort:</strong> Used to order commits chronologically</li>
          <li><strong>BFS/DFS:</strong> Graph traversal algorithms for finding paths and history</li>
          <li><strong>Content-Addressable Storage:</strong> Objects identified by their content hash</li>
        </ul>
      </div>
    </div>
  );
}