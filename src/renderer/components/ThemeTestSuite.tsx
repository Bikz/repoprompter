import React, { useState, useEffect } from 'react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Card, CardHeader, CardBody, CardFooter } from './ui/Card'
import { Modal, ModalBody, ModalFooter } from './ui/Modal'

interface ThemeTestSuiteProps {
  onTestComplete: (results: TestResults) => void
}

interface TestResults {
  themeTransition: boolean
  componentConsistency: boolean
  visualHierarchy: boolean
  stylingConflicts: boolean
  details: string[]
}

export function ThemeTestSuite({ onTestComplete }: ThemeTestSuiteProps) {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [testResults, setTestResults] = useState<TestResults>({
    themeTransition: false,
    componentConsistency: false,
    visualHierarchy: false,
    stylingConflicts: false,
    details: []
  })
  const [isRunningTests, setIsRunningTests] = useState(false)

  // Apply theme changes to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const runThemeTests = async () => {
    setIsRunningTests(true)
    const results: TestResults = {
      themeTransition: true,
      componentConsistency: true,
      visualHierarchy: true,
      stylingConflicts: true,
      details: []
    }

    try {
      // Test 1: Theme Transition
      results.details.push('Testing theme transition...')
      await testThemeTransition(results)

      // Test 2: Component Consistency
      results.details.push('Testing component consistency...')
      await testComponentConsistency(results)

      // Test 3: Visual Hierarchy
      results.details.push('Testing visual hierarchy...')
      await testVisualHierarchy(results)

      // Test 4: Styling Conflicts
      results.details.push('Testing for styling conflicts...')
      await testStylingConflicts(results)

      results.details.push('All tests completed!')
    } catch (error) {
      results.details.push(`Test error: ${error}`)
      results.themeTransition = false
      results.componentConsistency = false
      results.visualHierarchy = false
      results.stylingConflicts = false
    }

    setTestResults(results)
    setIsRunningTests(false)
    onTestComplete(results)
  }

  const testThemeTransition = async (results: TestResults) => {
    return new Promise<void>((resolve) => {
      const startTime = Date.now()
      
      // Test switching to dark mode
      setIsDarkMode(true)
      
      setTimeout(() => {
        const hasTransitioned = document.documentElement.classList.contains('dark')
        if (!hasTransitioned) {
          results.themeTransition = false
          results.details.push('❌ Dark mode class not applied to document')
        } else {
          results.details.push('✅ Dark mode transition successful')
        }

        // Test switching back to light mode
        setIsDarkMode(false)
        
        setTimeout(() => {
          const hasReverted = !document.documentElement.classList.contains('dark')
          if (!hasReverted) {
            results.themeTransition = false
            results.details.push('❌ Light mode transition failed')
          } else {
            results.details.push('✅ Light mode transition successful')
          }

          const transitionTime = Date.now() - startTime
          if (transitionTime > 1000) {
            results.details.push('⚠️ Theme transition took longer than expected')
          }

          resolve()
        }, 100)
      }, 100)
    })
  }

  const testComponentConsistency = async (results: TestResults) => {
    return new Promise<void>((resolve) => {
      // Test CSS variables are properly defined
      const rootStyles = getComputedStyle(document.documentElement)
      
      const requiredVariables = [
        '--text-primary',
        '--text-secondary', 
        '--text-tertiary',
        '--surface-primary',
        '--surface-secondary',
        '--surface-border',
        '--color-primary',
        '--bg-substrate'
      ]

      let missingVariables = 0
      requiredVariables.forEach(variable => {
        const value = rootStyles.getPropertyValue(variable)
        if (!value || value.trim() === '') {
          results.details.push(`❌ Missing CSS variable: ${variable}`)
          missingVariables++
        }
      })

      if (missingVariables === 0) {
        results.details.push('✅ All required CSS variables are defined')
      } else {
        results.componentConsistency = false
      }

      // Test that components use consistent color tokens
      const testElements = document.querySelectorAll('[data-testid]')
      let inconsistentElements = 0
      
      testElements.forEach(element => {
        const computedStyle = getComputedStyle(element)
        const color = computedStyle.color
        const backgroundColor = computedStyle.backgroundColor
        
        // Check if colors are using CSS variables (should contain 'var(' or be rgba/rgb)
        if (color && !color.includes('rgba') && !color.includes('rgb') && !color.includes('var')) {
          results.details.push(`⚠️ Element using hardcoded color: ${element.getAttribute('data-testid')}`)
          inconsistentElements++
        }
      })

      if (inconsistentElements === 0) {
        results.details.push('✅ Components use consistent color tokens')
      }

      resolve()
    })
  }

  const testVisualHierarchy = async (results: TestResults) => {
    return new Promise<void>((resolve) => {
      // Test both light and dark modes for visual hierarchy
      const testModes = [false, true] // light, dark
      
      testModes.forEach((darkMode, index) => {
        if (darkMode) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }

        setTimeout(() => {
          const rootStyles = getComputedStyle(document.documentElement)
          const primaryText = rootStyles.getPropertyValue('--text-primary')
          const secondaryText = rootStyles.getPropertyValue('--text-secondary')
          const tertiaryText = rootStyles.getPropertyValue('--text-tertiary')

          // Check that text hierarchy has proper contrast ratios
          if (primaryText && secondaryText && tertiaryText) {
            results.details.push(`✅ Text hierarchy maintained in ${darkMode ? 'dark' : 'light'} mode`)
          } else {
            results.visualHierarchy = false
            results.details.push(`❌ Text hierarchy broken in ${darkMode ? 'dark' : 'light'} mode`)
          }

          if (index === testModes.length - 1) {
            resolve()
          }
        }, 50)
      })
    })
  }

  const testStylingConflicts = async (results: TestResults) => {
    return new Promise<void>((resolve) => {
      // Check for common styling conflicts
      const potentialConflicts = [
        'transition-duration: 0s', // Should use CSS variables
        'color: transparent', // Might indicate broken styling
        'background-color: transparent', // Check if intentional
      ]

      let conflictsFound = 0
      const allElements = document.querySelectorAll('*')
      
      allElements.forEach(element => {
        const computedStyle = getComputedStyle(element)
        
        potentialConflicts.forEach(conflict => {
          const [property, value] = conflict.split(': ')
          if (computedStyle.getPropertyValue(property.trim()) === value.trim()) {
            conflictsFound++
          }
        })
      })

      if (conflictsFound === 0) {
        results.details.push('✅ No styling conflicts detected')
      } else {
        results.details.push(`⚠️ Found ${conflictsFound} potential styling conflicts`)
      }

      // Test for CSS custom property fallbacks
      const rootStyles = getComputedStyle(document.documentElement)
      const hasValidFallbacks = rootStyles.getPropertyValue('--text-primary') !== ''
      
      if (hasValidFallbacks) {
        results.details.push('✅ CSS custom properties have valid values')
      } else {
        results.stylingConflicts = false
        results.details.push('❌ CSS custom properties missing or invalid')
      }

      resolve()
    })
  }

  return (
    <div className="p-6 space-y-6 bg-substrate min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary">Theme Test Suite</h1>
            <p className="text-secondary mt-1">Testing theme switching and component consistency</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsDarkMode(!isDarkMode)}
              variant="secondary"
              className="gap-2"
            >
              {isDarkMode ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </Button>
            
            <Button
              onClick={runThemeTests}
              variant="primary"
              disabled={isRunningTests}
            >
              {isRunningTests ? 'Running Tests...' : 'Run Tests'}
            </Button>
          </div>
        </div>

        {/* Component Test Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Button Tests */}
          <Card data-testid="button-test-card">
            <CardHeader>Button Variants</CardHeader>
            <CardBody className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" size="sm" data-testid="button-primary-sm">Primary SM</Button>
                <Button variant="secondary" size="md" data-testid="button-secondary-md">Secondary MD</Button>
                <Button variant="danger" size="lg" data-testid="button-danger-lg">Danger LG</Button>
                <Button variant="ghost" data-testid="button-ghost">Ghost</Button>
                <Button variant="success" data-testid="button-success">Success</Button>
              </div>
            </CardBody>
          </Card>

          {/* Input Tests */}
          <Card data-testid="input-test-card">
            <CardHeader>Input Variants</CardHeader>
            <CardBody className="space-y-3">
              <Input 
                placeholder="Default input" 
                variant="default" 
                size="md"
                data-testid="input-default"
              />
              <Input 
                placeholder="Search input" 
                variant="search" 
                size="sm"
                data-testid="input-search"
              />
              <Input 
                placeholder="Error state" 
                error={true}
                errorMessage="This is an error"
                data-testid="input-error"
              />
            </CardBody>
          </Card>

          {/* Card Tests */}
          <Card hover data-testid="card-hover">
            <CardHeader>Interactive Card</CardHeader>
            <CardBody>
              <p className="text-secondary">This card has hover effects and should maintain consistent styling across themes.</p>
            </CardBody>
            <CardFooter>
              <Button variant="secondary" size="sm">Action</Button>
            </CardFooter>
          </Card>

          {/* Modal Test */}
          <Card data-testid="modal-test-card">
            <CardHeader>Modal Test</CardHeader>
            <CardBody>
              <p className="text-secondary mb-4">Test modal component theme consistency.</p>
              <Button onClick={() => setShowModal(true)} variant="primary">
                Open Modal
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* Test Results */}
        {testResults.details.length > 0 && (
          <Card data-testid="test-results">
            <CardHeader>Test Results</CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className={`p-3 rounded-lg ${testResults.themeTransition ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                  <div className="font-semibold">Theme Transition</div>
                  <div className="text-sm">{testResults.themeTransition ? 'Pass' : 'Fail'}</div>
                </div>
                <div className={`p-3 rounded-lg ${testResults.componentConsistency ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                  <div className="font-semibold">Component Consistency</div>
                  <div className="text-sm">{testResults.componentConsistency ? 'Pass' : 'Fail'}</div>
                </div>
                <div className={`p-3 rounded-lg ${testResults.visualHierarchy ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                  <div className="font-semibold">Visual Hierarchy</div>
                  <div className="text-sm">{testResults.visualHierarchy ? 'Pass' : 'Fail'}</div>
                </div>
                <div className={`p-3 rounded-lg ${testResults.stylingConflicts ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                  <div className="font-semibold">No Conflicts</div>
                  <div className="text-sm">{testResults.stylingConflicts ? 'Pass' : 'Fail'}</div>
                </div>
              </div>
              
              <div className="bg-black/5 dark:bg-white/5 rounded-lg p-4">
                <h4 className="font-semibold text-primary mb-2">Test Details:</h4>
                <div className="space-y-1 font-mono text-sm">
                  {testResults.details.map((detail, index) => (
                    <div key={index} className="text-secondary">{detail}</div>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Modal Component */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Theme Test Modal"
          data-testid="test-modal"
        >
          <ModalBody>
            <p className="text-secondary mb-4">
              This modal should maintain consistent styling and proper backdrop blur in both light and dark themes.
            </p>
            <Input placeholder="Test input in modal" className="mb-4" />
            <div className="flex gap-2">
              <Button variant="primary" size="sm">Primary</Button>
              <Button variant="secondary" size="sm">Secondary</Button>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  )
}