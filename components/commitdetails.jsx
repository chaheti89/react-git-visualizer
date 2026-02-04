import React from 'react';

/**
 * CommitDetails Component - Shows detailed information about a selected commit
 */
export default function CommitDetails({ commit, onClose }) {
  if (!commit) {
    return (
      <div className="commit-details empty">
        <p>Select a commit to view details</p>
      </div>
    );
  }

  return (
    <div className="commit-details">
      <div className="commit-details-header">
        <h3>Commit Details</h3>
        {onClose && (
          <button className="close-btn" onClick={onClose}>×</button>
        )}
      </div>

      <div className="commit-details-content">
        {/* Hash */}
        <div className="detail-section">
          <label>Hash:</label>
          <code className="hash-code">{commit.hash}</code>
        </div>

        {/* Message */}
        <div className="detail-section">
          <label>Message:</label>
          <p className="commit-message">{commit.message}</p>
        </div>

        {/* Author */}
        <div className="detail-section">
          <label>Author:</label>
          <p>{commit.author}</p>
        </div>

        {/* Timestamp */}
        <div className="detail-section">
          <label>Date:</label>
          <p>{new Date(commit.timestamp).toLocaleString()}</p>
        </div>

        {/* Tree */}
        <div className="detail-section">
          <label>Tree:</label>
          <code className="hash-code">{commit.tree}</code>
        </div>

        {/* Parents */}
        {commit.parents && commit.parents.length > 0 && (
          <div className="detail-section">
            <label>Parent{commit.parents.length > 1 ? 's' : ''}:</label>
            <div className="parents-list">
              {commit.parents.map((parent, index) => (
                <code key={index} className="hash-code">{parent}</code>
              ))}
            </div>
          </div>
        )}

        {/* Tree Entries */}
        {commit.treeEntries && commit.treeEntries.length > 0 && (
          <div className="detail-section">
            <label>Files in this commit:</label>
            <div className="tree-entries">
              <table>
                <thead>
                  <tr>
                    <th>Mode</th>
                    <th>Type</th>
                    <th>Name</th>
                    <th>Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {commit.treeEntries.map((entry, index) => (
                    <tr key={index}>
                      <td><code>{entry.mode}</code></td>
                      <td><span className="entry-type">{entry.type}</span></td>
                      <td><strong>{entry.name}</strong></td>
                      <td><code className="hash-code-small">{entry.hash.slice(0, 7)}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Raw Object Data */}
        <div className="detail-section">
          <label>Raw Git Object:</label>
          <pre className="raw-object">{commit.toString()}</pre>
        </div>
      </div>
    </div>
  );
}