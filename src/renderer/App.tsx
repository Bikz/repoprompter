import React from 'react'

function App() {
  return (
    <div style={{
      padding: 20,
      fontFamily: 'sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333' }}>Hello from RepoPrompter</h1>
      <p style={{ color: '#666' }}>
        Edit <code>src/renderer/App.tsx</code> and save to reload.
      </p>
      <button
        onClick={() => window.api.sayHello()}
        style={{
          padding: '8px 16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test Preload API
      </button>
    </div>
  )
}

export default App