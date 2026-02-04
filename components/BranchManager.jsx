import React, { useState } from 'react';

/**
 * BranchManager Component - Manage Git branches
 */
export default function BranchManager({ 
  branches, 
  currentBranch, 
  onCheckout, 
  onCreateBranch 
}) {
  const [newBranchName, setNewBranchName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState('');

  const handleCreateBranch = (e) => {
    e.preventDefault();
    setError('');

    if (!newBranchName.trim()) {
      setError('Branch name cannot be empty');
      return;
    }

    if (branches[newBranchName]) {
      setError('Branch already exists');
      return;
    }

    // Validate branch name (simplified Git rules)
    if (!/^[a-zA-Z0-9_-]+$/.test(newBranchName)) {
      setError('Branch name can only contain letters, numbers, hyphens, and underscores');
      return;
    }

    const success = onCreateBranch(newBranchName);
    if (success) {
      setNewBranchName('');
      setShowCreateForm(false);
    } else {
      setError('Failed to create branch');
    }
  };

  const handleCheckout = (branchName) => {
    if (branchName === currentBranch) {
      return; // Already on this branch
    }
    
    const success = onCheckout(branchName);
    if (!success) {
      setError(`Failed to checkout branch: ${branchName}`);
    }
  };

  return (
    <div className="branch-manager">
      <div className="branch-header">
        <h3>Branches</h3>
        <button 
          className="btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ New Branch'}
        </button>
      </div>

      {/* Create Branch Form */}
      {showCreateForm && (
        <form className="create-branch-form" onSubmit={handleCreateBranch}>
          <input
            type="text"
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value)}
            placeholder="Enter branch name..."
            autoFocus
          />
          <button type="submit" className="btn-success">Create</button>
          {error && <div className="error-message">{error}</div>}
        </form>
      )}

      {/* Branch List */}
      <div className="branch-list">
        {Object.keys(branches).length === 0 ? (
          <p className="empty-message">No branches yet</p>
        ) : (
          Object.entries(branches).map(([branchName, commitHash]) => (
            <div
              key={branchName}
              className={`branch-item ${branchName === currentBranch ? 'active' : ''}`}
              onClick={() => handleCheckout(branchName)}
            >
              <div className="branch-info">
                <div className="branch-name">
                  {branchName === currentBranch && <span className="current-indicator">→ </span>}
                  <strong>{branchName}</strong>
                </div>
                <code className="branch-commit">{commitHash.slice(0, 7)}</code>
              </div>
              {branchName === currentBranch && (
                <span className="badge badge-primary">HEAD</span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Branch Operations Info */}
      <div className="branch-info-box">
        <h4>💡 Branch Operations</h4>
        <ul>
          <li>Click on a branch to <strong>checkout</strong></li>
          <li>Create new branches from current HEAD</li>
          <li>Branches are pointers to commits</li>
        </ul>
      </div>
    </div>
  );
}