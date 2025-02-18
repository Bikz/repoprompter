import React, { useState, useMemo } from 'react'
import { useRepoContext } from '../hooks/useRepoContext'

// We'll define a lightweight interface for a file/folder node.
interface FileNode {
  name: string
  path: string
  children?: FileNode[]
}

/**
 * Build a tree from a list of paths by splitting on both forward and backslashes.
 */
function buildFileTree(files: string[]): FileNode[] {
  const root: Record<string, FileNode> = {}

  for (const file of files) {
    // Split on either slash or backslash
    const parts = file.split(/[/\\]/)
    let currentLevel = root
    let cumulativePath = ''

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      // Accumulate the path using forward slash
      cumulativePath = cumulativePath ? `${cumulativePath}/${part}` : part

      if (!currentLevel[part]) {
        currentLevel[part] = {
          name: part,
          path: cumulativePath,
          children: {}
        }
      }
      if (i === parts.length - 1) {
        // It's a file => no children
        currentLevel[part].children = undefined
      } else {
        // Ensure children object
        if (!currentLevel[part].children) {
          currentLevel[part].children = {}
        }
      }
      // Move deeper
      if (currentLevel[part].children) {
        currentLevel = currentLevel[part].children as Record<string, FileNode>
      }
    }
  }

  // Convert the nested objects to arrays
  function convertToArray(obj: Record<string, FileNode>): FileNode[] {
    return Object.values(obj).map(node => {
      if (node.children) {
        return {
          name: node.name,
          path: node.path,
          children: convertToArray(node.children as Record<string, FileNode>)
        }
      } else {
        return {
          name: node.name,
          path: node.path
        }
      }
    })
  }

  return convertToArray(root)
}

/**
 * Tri-state (checked, partial, unchecked) for folders based on children states
 */
function getCheckboxState(node: FileNode, selected: Set<string>): 'checked' | 'partial' | 'unchecked' {
  if (!node.children) {
    return selected.has(node.path) ? 'checked' : 'unchecked'
  }
  const children = node.children
  if (!children || children.length === 0) {
    return 'unchecked'
  }

  let allChecked = true
  let anyChecked = false

  for (const child of children) {
    const childState = getCheckboxState(child, selected)
    if (childState !== 'checked') {
      allChecked = false
    }
    if (childState !== 'unchecked') {
      anyChecked = true
    }
  }

  if (allChecked) return 'checked'
  if (anyChecked) return 'partial'
  return 'unchecked'
}

function FileTreeNode({
  node,
  selectedSet,
  toggleSelected,
  expandedMap,
  setExpandedMap
}: {
  node: FileNode
  selectedSet: Set<string>
  toggleSelected: (pathStr: string, isFolder: boolean) => void
  expandedMap: Record<string, boolean>
  setExpandedMap: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
}) {
  const checkboxState = getCheckboxState(node, selectedSet)
  const isFolder = !!node.children
  const isExpanded = expandedMap[node.path] || false

  const handleCheckboxChange = () => {
    toggleSelected(node.path, isFolder)
  }

  const handleToggleFolder = () => {
    if (!isFolder) return
    setExpandedMap(prev => ({ ...prev, [node.path]: !prev[node.path] }))
  }

  // Folder arrow icons
  const arrowIcon = isFolder ? (isExpanded ? '▼' : '▶') : ''
  // Folder or file icon
  const mainIcon = isFolder ? '📁' : '📃'

  return (
    <div style={{ marginLeft: 16, marginTop: 4 }}>
      {/* Checkbox + arrow icon + folder/file icon + name row */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <input
          type="checkbox"
          checked={checkboxState === 'checked'}
          ref={el => {
            if (el) {
              el.indeterminate = (checkboxState === 'partial')
            }
          }}
          onChange={handleCheckboxChange}
          onClick={e => e.stopPropagation()}
        />
        {/* Arrow icon for folders only; click to expand/collapse */}
        {isFolder && (
          <span
            style={{ margin: '0 4px', cursor: 'pointer' }}
            onClick={handleToggleFolder}
          >
            {arrowIcon}
          </span>
        )}
        {/* Folder/file icon */}
        <span style={{ marginRight: 4 }}>
          {mainIcon}
        </span>
        {/* Folder/file name (clicking it toggles folder if folder) */}
        <span
          onClick={isFolder ? handleToggleFolder : undefined}
          style={{ userSelect: 'none', cursor: isFolder ? 'pointer' : 'default' }}
        >
          {node.name}
        </span>
      </div>

      {/* If folder is expanded, render children */}
      {isFolder && isExpanded && node.children && (
        <div style={{ marginTop: 4 }}>
          {node.children.map(child => (
            <FileTreeNode
              key={child.path}
              node={child}
              selectedSet={selectedSet}
              toggleSelected={toggleSelected}
              expandedMap={expandedMap}
              setExpandedMap={setExpandedMap}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function FileList() {
  const { fileList, selectedFiles, toggleSelectedFile } = useRepoContext()
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({})

  const selectedSet = useMemo(() => new Set(selectedFiles), [selectedFiles])
  const fileTree = useMemo(() => buildFileTree(fileList || []), [fileList])

  /**
   * Toggling a folder selects or unselects all its descendants.
   */
  const handleToggleSelected = (pathStr: string, isFolder: boolean) => {
    if (!isFolder) {
      // Single file
      toggleSelectedFile(pathStr)
      return
    }

    // 1) find the folder node
    let folderNode: FileNode | null = null
    function findNode(list: FileNode[]): FileNode | null {
      for (const item of list) {
        if (item.path === pathStr) return item
        if (item.children) {
          const found = findNode(item.children)
          if (found) return found
        }
      }
      return null
    }
    folderNode = findNode(fileTree)
    if (!folderNode) return

    // 2) gather all descendants
    function gatherAllDescendants(node: FileNode): string[] {
      if (!node.children) return [node.path]
      let result: string[] = []
      for (const child of node.children) {
        if (!child.children) {
          result.push(child.path)
        } else {
          result = result.concat(gatherAllDescendants(child))
        }
      }
      return result
    }
    const allDesc = gatherAllDescendants(folderNode)

    // 3) check if they are all selected
    const allSelected = allDesc.every(d => selectedSet.has(d))

    // 4) build new selection list
    const newSelected = [...selectedFiles]
    if (allSelected) {
      // unselect all
      for (const d of allDesc) {
        const idx = newSelected.indexOf(d)
        if (idx >= 0) {
          newSelected.splice(idx, 1)
        }
      }
    } else {
      // select all
      for (const d of allDesc) {
        if (!newSelected.includes(d)) {
          newSelected.push(d)
        }
      }
    }

    // 5) We only have toggleSelectedFile (which toggles one at a time).
    // We'll forcibly re-sync the entire selection with a small hack:
    //   1) unselect all current
    //   2) select everything in newSelected.
    function setSelectedFilesDirect(newList: string[]) {
      // Clear existing
      selectedFiles.forEach(sf => toggleSelectedFile(sf))
      // Then add the new set
      newList.forEach(nf => toggleSelectedFile(nf))
    }

    setSelectedFilesDirect(newSelected)
  }

  // If no files
  if (!fileList || fileList.length === 0) {
    return (
      <div style={{
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        color: '#6c757d',
        flex: 1,
        overflow: 'auto'
      }}>
        No files. Please select a directory.
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#fff',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      flex: 1,
      overflowY: 'auto',
      padding: 8
    }}>
      {fileTree.map(node => (
        <FileTreeNode
          key={node.path}
          node={node}
          selectedSet={selectedSet}
          toggleSelected={handleToggleSelected}
          expandedMap={expandedMap}
          setExpandedMap={setExpandedMap}
        />
      ))}
    </div>
  )
}