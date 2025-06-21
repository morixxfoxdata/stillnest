'use client'

import { useState } from 'react'

export type LayoutMode = 'single' | 'double'

interface LayoutToggleProps {
  initialMode?: LayoutMode
  onModeChange: (mode: LayoutMode) => void
  className?: string
}

export default function LayoutToggle({ 
  initialMode = 'double', 
  onModeChange,
  className = '' 
}: LayoutToggleProps) {
  const [mode, setMode] = useState<LayoutMode>(initialMode)

  const handleToggle = () => {
    const newMode = mode === 'single' ? 'double' : 'single'
    setMode(newMode)
    onModeChange(newMode)
  }

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-md hover:bg-muted transition-colors ${className}`}
      title={mode === 'single' ? 'Switch to 2 column layout' : 'Switch to 1 column layout'}
    >
      {mode === 'single' ? (
        // Single column icon - show one column
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="3" width="12" height="18" rx="2" strokeWidth="2" fill="none" />
        </svg>
      ) : (
        // Double column icon - show two columns
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="18" rx="2" strokeWidth="2" fill="none" />
          <rect x="14" y="3" width="7" height="18" rx="2" strokeWidth="2" fill="none" />
        </svg>
      )}
    </button>
  )
}