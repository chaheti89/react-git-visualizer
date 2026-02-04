# React Git Visualizer

React Git Visualizer is a small but fairly deep project that helps **visualize how Git works internally**.  
Instead of treating Git as a black box, this project models commits, branches, and repository structure in code and then renders them visually using React.

I built this to better understand Git internals myself and to make those concepts easier to explain and explore.

---

## What this project does

- Shows an interactive **commit graph** similar to what you see in Git tools
- Simulates core Git objects like:
  - blobs
  - trees
  - commits
  - a repository state
- Lets you **create commits and branches** and see how the graph changes
- Visualizes common **graph algorithms** used behind the scenes

Everything is handled in-memory, so you can experiment freely without touching a real Git repo.

---

## Tech stack

- React (with Vite)
- Plain CSS for styling
- SVG for rendering graphs
- Custom hooks for state management
- Hand-written implementations of Git data structures and graph algorithms

Most logic is implemented from scratch.

---

## Project structure

