import React, { useState } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from './Modal'
import { Button } from './Button'
import { Input } from './Input'

/**
 * Example usage of the unified Modal component
 * This demonstrates all the features and variants available
 */
export function ModalExamples() {
  const [basicModalOpen, setBasicModalOpen] = useState(false)
  const [largeModalOpen, setLargeModalOpen] = useState(false)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [name, setName] = useState('')

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-xl font-bold mb-4">Modal Component Examples</h2>
      
      {/* Basic Modal */}
      <Button onClick={() => setBasicModalOpen(true)}>
        Open Basic Modal
      </Button>
      
      <Modal
        isOpen={basicModalOpen}
        onClose={() => setBasicModalOpen(false)}
        title="Basic Modal"
        size="sm"
      >
        <ModalBody>
          <p className="text-gray-600 dark:text-gray-300">
            This is a basic modal with default settings. It includes a backdrop,
            escape key handling, and proper focus management.
          </p>
        </ModalBody>
        
        <ModalFooter>
          <Button 
            variant="secondary" 
            onClick={() => setBasicModalOpen(false)}
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Large Modal */}
      <Button onClick={() => setLargeModalOpen(true)}>
        Open Large Modal
      </Button>
      
      <Modal
        isOpen={largeModalOpen}
        onClose={() => setLargeModalOpen(false)}
        title="Large Modal"
        size="lg"
      >
        <ModalBody>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            This is a large modal that demonstrates the size variants available.
            The modal automatically handles responsive behavior and proper positioning.
          </p>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Features:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Proper backdrop with blur effect</li>
              <li>Escape key to close</li>
              <li>Click outside to close</li>
              <li>Focus management</li>
              <li>Responsive sizing</li>
              <li>Dark mode support</li>
            </ul>
          </div>
        </ModalBody>
        
        <ModalFooter>
          <Button 
            variant="secondary" 
            onClick={() => setLargeModalOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={() => setLargeModalOpen(false)}
          >
            Confirm
          </Button>
        </ModalFooter>
      </Modal>

      {/* Form Modal */}
      <Button onClick={() => setFormModalOpen(true)}>
        Open Form Modal
      </Button>
      
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title="Form Modal"
        size="md"
      >
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Name
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This modal demonstrates form integration with proper input handling.
            </p>
          </div>
        </ModalBody>
        
        <ModalFooter>
          <Button 
            variant="secondary" 
            onClick={() => {
              setFormModalOpen(false)
              setName('')
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              console.log('Submitted name:', name)
              setFormModalOpen(false)
              setName('')
            }}
          >
            Submit
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}