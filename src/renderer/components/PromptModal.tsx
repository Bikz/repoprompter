import React, { useState, useEffect, useRef } from 'react'
import { Modal, ModalBody, ModalFooter } from './ui/Modal'
import { Input } from './ui/Input'
import { Button } from './ui/Button'

interface PromptModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (value: string) => void
  title: string
  defaultValue: string
  anchorElement?: HTMLElement | null
}

export function PromptModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  defaultValue, 
  anchorElement 
}: PromptModalProps) {
  const [value, setValue] = useState(defaultValue)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Handle Enter key to confirm
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && isOpen) {
        handleConfirm()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, value])

  // Reset value when modal opens
  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue)
    }
  }, [isOpen, defaultValue])

  const handleConfirm = () => {
    if (value.trim()) {
      onConfirm(value)
    }
  }

  // For anchor-positioned modals, we'll use a custom positioned modal
  if (anchorElement) {
    return (
      <AnchoredModal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        anchorElement={anchorElement}
      >
        <ModalBody>
          <Input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            size="sm"
            placeholder="Enter a name"
            className="w-full"
          />
        </ModalBody>
        
        <ModalFooter>
          <Button 
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            variant="primary"
            size="sm"
            onClick={handleConfirm}
          >
            Confirm
          </Button>
        </ModalFooter>
      </AnchoredModal>
    )
  }

  // Standard centered modal
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
    >
      <ModalBody>
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          size="sm"
          placeholder="Enter a name"
          className="w-full"
        />
      </ModalBody>
      
      <ModalFooter>
        <Button 
          variant="secondary"
          size="sm"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button 
          variant="primary"
          size="sm"
          onClick={handleConfirm}
        >
          Confirm
        </Button>
      </ModalFooter>
    </Modal>
  )
}

// Specialized anchored modal for positioning relative to elements
interface AnchoredModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  anchorElement: HTMLElement
}

function AnchoredModal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  anchorElement 
}: AnchoredModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Position modal relative to anchor element
  useEffect(() => {
    if (isOpen && anchorElement && modalRef.current) {
      try {
        const anchorRect = anchorElement.getBoundingClientRect()
        const modalRect = modalRef.current.getBoundingClientRect()
        
        // Validate that we have valid rects
        if (anchorRect.width === 0 && anchorRect.height === 0) {
          console.warn('Anchor element has no dimensions, falling back to centered modal')
          return
        }
        
        // Position to the right of the button with spacing
        const left = anchorRect.right + 16
        // Align vertically centered with the button
        const top = anchorRect.top - (modalRect.height / 2) + (anchorRect.height / 2) - 20
        
        // Ensure modal stays within viewport
        const maxRight = window.innerWidth - 20
        const adjustedLeft = left + modalRect.width > maxRight 
          ? anchorRect.left - modalRect.width - 16  // Position to the left instead
          : left
        
        const adjustedTop = Math.max(20, top)
        const maxBottom = window.innerHeight - 20
        const adjustedBottom = adjustedTop + modalRect.height
        const finalTop = adjustedBottom > maxBottom 
          ? maxBottom - modalRect.height 
          : adjustedTop
        
        modalRef.current.style.position = 'fixed'
        modalRef.current.style.left = `${Math.max(20, adjustedLeft)}px`
        modalRef.current.style.top = `${finalTop}px`
        modalRef.current.style.transform = 'none'
        modalRef.current.style.zIndex = '50'
      } catch (error) {
        console.warn('Error positioning modal:', error)
      }
    }
  }, [isOpen, anchorElement])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-40" 
      onClick={onClose}
      style={{ background: 'rgba(0, 0, 0, 0.1)' }}
    >
      <div 
        ref={modalRef}
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
        style={{ width: "280px" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="anchored-modal-title"
      >
        {/* Header */}
        <div className="p-4 pb-2">
          <h2 
            id="anchored-modal-title"
            className="text-sm font-semibold text-gray-900 dark:text-white"
          >
            {title}
          </h2>
        </div>

        {/* Content */}
        <div className="px-4 pb-4">
          {children}
        </div>
      </div>
    </div>
  )
}