/**
 * Git Data Structures Implementation
 * Covers: Hash Tables, Directed Acyclic Graphs (DAG), Trees
 */

/**
 * SHA-1 Hash Simulation (simplified for educational purposes)
 * In real Git, this would use actual SHA-1 cryptographic hashing
 */
export class GitHash {
  static generate(content) {
    let hash = 0;
    const str = JSON.stringify(content);
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(40, '0').slice(0, 40);
  }
}

/**
 * Git Blob - Represents file content
 * CS Concept: Content-addressable storage
 */
export class GitBlob {
  constructor(content) {
    this.type = 'blob';
    this.content = content;
    this.hash = GitHash.generate({ type: this.type, content });
  }

  toString() {
    return `blob ${this.content.length}\0${this.content}`;
  }
}

/**
 * Git Tree - Represents directory structure
 * CS Concept: Tree data structure
 */
export class GitTree {
  constructor(entries = []) {
    this.type = 'tree';
    this.entries = entries; // Array of { mode, name, hash, type }
    this.hash = GitHash.generate({ type: this.type, entries });
  }

  addEntry(mode, name, hash, type) {
    this.entries.push({ mode, name, hash, type });
    this.hash = GitHash.generate({ type: this.type, entries: this.entries });
  }

  toString() {
    return `tree\n${this.entries.map(e => 
      `${e.mode} ${e.type} ${e.hash}\t${e.name}`
    ).join('\n')}`;
  }
}

/**
 * Git Commit - Represents a snapshot in time
 * CS Concept: Node in a Directed Acyclic Graph (DAG)
 */
export class GitCommit {
  constructor(tree, parents = [], author, message, timestamp) {
    this.type = 'commit';
    this.tree = tree;
    this.parents = parents; // Array of parent commit hashes
    this.author = author;
    this.message = message;
    this.timestamp = timestamp || new Date().toISOString();
    this.hash = GitHash.generate({
      type: this.type,
      tree,
      parents,
      author,
      message,
      timestamp: this.timestamp
    });
  }

  toString() {
    const parentStr = this.parents.map(p => `parent ${p}`).join('\n');
    return `commit ${this.hash}
tree ${this.tree}
${parentStr}
author ${this.author}
date ${this.timestamp}

${this.message}`;
  }
}

/**
 * Git Repository - Main data structure
 * CS Concepts: 
 * - Hash Map for object storage
 * - Directed Acyclic Graph for commit history
 * - Tree traversal algorithms
 */
export class GitRepository {
  constructor() {
    this.objects = new Map(); // Hash -> Object mapping
    this.refs = new Map(); // Branch name -> Commit hash
    this.HEAD = 'main';
  }

  /**
   * Store an object in the repository
   * CS Concept: Hash table insertion - O(1) average case
   */
  storeObject(obj) {
    this.objects.set(obj.hash, obj);
    return obj.hash;
  }

  /**
   * Retrieve an object by hash
   * CS Concept: Hash table lookup - O(1) average case
   */
  getObject(hash) {
    return this.objects.get(hash);
  }

  /**
   * Create a new commit
   */
  commit(treeHash, message, author) {
    const parentHash = this.refs.get(this.HEAD);
    const parents = parentHash ? [parentHash] : [];
    
    const commit = new GitCommit(treeHash, parents, author, message);
    this.storeObject(commit);
    this.refs.set(this.HEAD, commit.hash);
    
    return commit;
  }

  /**
   * Create a new branch
   */
  createBranch(branchName, commitHash = null) {
    const hash = commitHash || this.refs.get(this.HEAD);
    if (hash) {
      this.refs.set(branchName, hash);
    }
  }

  /**
   * Checkout a branch
   */
  checkout(branchName) {
    if (this.refs.has(branchName)) {
      this.HEAD = branchName;
      return true;
    }
    return false;
  }

  /**
   * Get commit history using DFS
   * CS Concept: Depth-First Search on DAG - O(V + E)
   */
  getCommitHistory(startHash = null) {
    const hash = startHash || this.refs.get(this.HEAD);
    if (!hash) return [];

    const visited = new Set();
    const history = [];

    const dfs = (commitHash) => {
      if (!commitHash || visited.has(commitHash)) return;
      
      visited.add(commitHash);
      const commit = this.getObject(commitHash);
      
      if (commit && commit.type === 'commit') {
        history.push(commit);
        // Visit parents
        commit.parents.forEach(parentHash => dfs(parentHash));
      }
    };

    dfs(hash);
    return history;
  }

  /**
   * Find merge base of two branches
   * CS Concept: Lowest Common Ancestor in DAG
   */
  findMergeBase(branch1, branch2) {
    const hash1 = this.refs.get(branch1);
    const hash2 = this.refs.get(branch2);
    
    if (!hash1 || !hash2) return null;

    // Get all ancestors of first branch
    const ancestors1 = new Set();
    const traverse = (hash) => {
      if (!hash || ancestors1.has(hash)) return;
      ancestors1.add(hash);
      const commit = this.getObject(hash);
      if (commit && commit.type === 'commit') {
        commit.parents.forEach(traverse);
      }
    };
    traverse(hash1);

    // Find first common ancestor from second branch
    const findCommon = (hash) => {
      if (!hash) return null;
      if (ancestors1.has(hash)) return hash;
      
      const commit = this.getObject(hash);
      if (commit && commit.type === 'commit') {
        for (const parent of commit.parents) {
          const common = findCommon(parent);
          if (common) return common;
        }
      }
      return null;
    };

    return findCommon(hash2);
  }

  /**
   * Get graph representation for visualization
   */
  getCommitGraph() {
    const nodes = [];
    const edges = [];
    const branches = {};

    // Collect all commits from all branches
    const allCommits = new Set();
    this.refs.forEach((hash, branch) => {
      branches[branch] = hash;
      const history = this.getCommitHistory(hash);
      history.forEach(commit => allCommits.add(commit.hash));
    });

    // Build graph
    allCommits.forEach(hash => {
      const commit = this.getObject(hash);
      if (commit) {
        nodes.push({
          id: commit.hash,
          hash: commit.hash.slice(0, 7),
          message: commit.message,
          author: commit.author,
          timestamp: commit.timestamp,
          parents: commit.parents
        });

        // Create edges to parents
        commit.parents.forEach(parentHash => {
          edges.push({
            from: commit.hash,
            to: parentHash
          });
        });
      }
    });

    return { nodes, edges, branches, HEAD: this.HEAD };
  }

  /**
   * Calculate repository statistics
   */
  getStats() {
    return {
      totalObjects: this.objects.size,
      totalCommits: Array.from(this.objects.values()).filter(o => o.type === 'commit').length,
      totalTrees: Array.from(this.objects.values()).filter(o => o.type === 'tree').length,
      totalBlobs: Array.from(this.objects.values()).filter(o => o.type === 'blob').length,
      branches: this.refs.size,
      currentBranch: this.HEAD
    };
  }
}

/**
 * Example repository initialization with sample data
 */
export function createSampleRepository() {
  const repo = new GitRepository();

  // Create some blobs (files)
  const readme = new GitBlob('# My Project\nThis is a sample project.');
  const mainJs = new GitBlob('console.log("Hello, World!");');
  const packageJson = new GitBlob('{"name": "sample", "version": "1.0.0"}');

  repo.storeObject(readme);
  repo.storeObject(mainJs);
  repo.storeObject(packageJson);

  // Create a tree (directory structure)
  const tree1 = new GitTree();
  tree1.addEntry('100644', 'README.md', readme.hash, 'blob');
  tree1.addEntry('100644', 'index.js', mainJs.hash, 'blob');
  repo.storeObject(tree1);

  // Create initial commit
  const commit1 = repo.commit(tree1.hash, 'Initial commit', 'Alice <alice@example.com>');

  // Create second commit
  const updatedReadme = new GitBlob('# My Project\nThis is a sample project.\n\n## Features\n- Feature 1');
  repo.storeObject(updatedReadme);
  
  const tree2 = new GitTree();
  tree2.addEntry('100644', 'README.md', updatedReadme.hash, 'blob');
  tree2.addEntry('100644', 'index.js', mainJs.hash, 'blob');
  tree2.addEntry('100644', 'package.json', packageJson.hash, 'blob');
  repo.storeObject(tree2);

  const commit2 = repo.commit(tree2.hash, 'Add package.json and update README', 'Bob <bob@example.com>');

  // Create a branch
  repo.createBranch('feature-branch');
  repo.checkout('feature-branch');

  // Create commit on branch
  const featureJs = new GitBlob('export function newFeature() { return "cool"; }');
  repo.storeObject(featureJs);

  const tree3 = new GitTree();
  tree3.addEntry('100644', 'README.md', updatedReadme.hash, 'blob');
  tree3.addEntry('100644', 'index.js', mainJs.hash, 'blob');
  tree3.addEntry('100644', 'package.json', packageJson.hash, 'blob');
  tree3.addEntry('100644', 'feature.js', featureJs.hash, 'blob');
  repo.storeObject(tree3);

  const commit3 = repo.commit(tree3.hash, 'Add new feature', 'Alice <alice@example.com>');

  // Go back to main
  repo.checkout('main');

  // Create another commit on main
  const testJs = new GitBlob('describe("tests", () => { it("works", () => {}); });');
  repo.storeObject(testJs);

  const tree4 = new GitTree();
  tree4.addEntry('100644', 'README.md', updatedReadme.hash, 'blob');
  tree4.addEntry('100644', 'index.js', mainJs.hash, 'blob');
  tree4.addEntry('100644', 'package.json', packageJson.hash, 'blob');
  tree4.addEntry('100644', 'test.js', testJs.hash, 'blob');
  repo.storeObject(tree4);

  const commit4 = repo.commit(tree4.hash, 'Add tests', 'Bob <bob@example.com>');

  return repo;
}