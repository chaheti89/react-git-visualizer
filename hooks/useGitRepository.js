import { useState, useEffect, useCallback } from 'react';
import { GitRepository, createSampleRepository } from '../utils/gitStructures';

/**
 * Custom React Hook for Git Repository State Management
 * Demonstrates React hooks and state management patterns
 */
export function useGitRepository() {
  const [repository, setRepository] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [], branches: {}, HEAD: '' });
  const [stats, setStats] = useState(null);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [commitHistory, setCommitHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize repository on mount
  useEffect(() => {
    const repo = createSampleRepository();
    setRepository(repo);
    updateGraphData(repo);
    setIsLoading(false);
  }, []);

  // Update graph data from repository
  const updateGraphData = useCallback((repo) => {
    if (!repo) return;
    
    const graph = repo.getCommitGraph();
    setGraphData(graph);
    setStats(repo.getStats());
    
    const history = repo.getCommitHistory();
    setCommitHistory(history);
  }, []);

  // Create a new commit
  const createCommit = useCallback((message, author, files) => {
    if (!repository) return;

    try {
      // Import necessary classes
      const { GitBlob, GitTree } = require('../utils/gitStructures');
      
      // Create blobs for files
      const blobs = files.map(file => {
        const blob = new GitBlob(file.content);
        repository.storeObject(blob);
        return { name: file.name, hash: blob.hash };
      });

      // Create tree
      const tree = new GitTree();
      blobs.forEach(blob => {
        tree.addEntry('100644', blob.name, blob.hash, 'blob');
      });
      repository.storeObject(tree);

      // Create commit
      const commit = repository.commit(tree.hash, message, author);
      
      updateGraphData(repository);
      setSelectedCommit(commit);
      
      return commit;
    } catch (error) {
      console.error('Error creating commit:', error);
      return null;
    }
  }, [repository, updateGraphData]);

  // Create a new branch
  const createBranch = useCallback((branchName, commitHash = null) => {
    if (!repository) return false;

    try {
      repository.createBranch(branchName, commitHash);
      updateGraphData(repository);
      return true;
    } catch (error) {
      console.error('Error creating branch:', error);
      return false;
    }
  }, [repository, updateGraphData]);

  // Checkout a branch
  const checkoutBranch = useCallback((branchName) => {
    if (!repository) return false;

    const success = repository.checkout(branchName);
    if (success) {
      updateGraphData(repository);
    }
    return success;
  }, [repository, updateGraphData]);

  // Get commit details by hash
  const getCommitDetails = useCallback((commitHash) => {
    if (!repository) return null;
    
    const commit = repository.getObject(commitHash);
    if (!commit || commit.type !== 'commit') return null;

    // Get tree details
    const tree = repository.getObject(commit.tree);
    const treeEntries = tree ? tree.entries : [];

    // Get parent commits
    const parents = commit.parents.map(hash => repository.getObject(hash));

    return {
      ...commit,
      treeEntries,
      parents
    };
  }, [repository]);

  // Find merge base between two branches
  const findMergeBase = useCallback((branch1, branch2) => {
    if (!repository) return null;
    
    const mergeBase = repository.findMergeBase(branch1, branch2);
    if (mergeBase) {
      return repository.getObject(mergeBase);
    }
    return null;
  }, [repository]);

  // Reset repository to initial state
  const resetRepository = useCallback(() => {
    const repo = createSampleRepository();
    setRepository(repo);
    updateGraphData(repo);
    setSelectedCommit(null);
  }, [updateGraphData]);

  return {
    repository,
    graphData,
    stats,
    selectedCommit,
    commitHistory,
    isLoading,
    setSelectedCommit,
    createCommit,
    createBranch,
    checkoutBranch,
    getCommitDetails,
    findMergeBase,
    resetRepository,
    updateGraphData: () => updateGraphData(repository)
  };
}

/**
 * Custom hook for graph interaction state
 */
export function useGraphInteraction() {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedPath, setSelectedPath] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const zoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.1, 3));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  }, []);

  const resetView = useCallback(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const handlePan = useCallback((deltaX, deltaY) => {
    setPanOffset(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
  }, []);

  return {
    hoveredNode,
    setHoveredNode,
    selectedPath,
    setSelectedPath,
    zoomLevel,
    panOffset,
    isDragging,
    setIsDragging,
    zoomIn,
    zoomOut,
    resetView,
    handlePan
  };
}