import React, { useState } from 'react'
import { ThemeTestSuite } from './components/ThemeTestSuite'

interface TestResults {
  themeTransition: boolean
  componentConsistency: boolean
  visualHierarchy: boolean
  stylingConflicts: boolean
  details: string[]
}

function AppThemeTest() {
  const [testResults, setTestResults] = useState<TestResults | null>(null)

  const handleTestComplete = (results: TestResults) => {
    setTestResults(results)
    console.log('Theme Test Results:', results)
  }

  return (
    <div className="min-h-screen">
      <ThemeTestSuite onTestComplete={handleTestComplete} />
    </div>
  )
}

export default AppThemeTest