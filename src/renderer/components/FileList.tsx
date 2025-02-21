/**
 * File: FileList.tsx
 * Description: Displays the user’s repo files in a tree structure with tri-state checkbox selection.
 * Allows toggling entire folder vs single file selection.
 */

import React, { useState, useMemo } from 'react'
import { useRepoContext } from '../hooks/useRepoContext'

interface FileNode {
  name: string
  path: string
  children?: FileNode[]
}

function buildFileTree(files: string[]): FileNode[] {
  const root: Record<string, FileNode> = {}

  for (const file of files) {
    const parts = file.split(/[/\\]/)
    let currentLevel = root
    let cumulativePath = ''

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      cumulativePath = cumulativePath ? `${cumulativePath}/${part}` : part

      if (!currentLevel[part]) {
        currentLevel[part] = { name: part, path: cumulativePath, children: {} }
      }
      if (i === parts.length - 1) {
        currentLevel[part].children = undefined
      } else {
        if (!currentLevel[part].children) {
          currentLevel[part].children = {}
        }
      }
      if (currentLevel[part].children) {
        currentLevel = currentLevel[part].children as Record<string, FileNode>
      }
    }
  }

  function convertToArray(obj: Record<string, FileNode>): FileNode[] {
    return Object.values(obj).map(node => {
      if (node.children) {
        return {
          name: node.name,
          path: node.path,
          children: convertToArray(node.children as Record<string, FileNode>)
        }
      } else {
        return { name: node.name, path: node.path }
      }
    })
  }

  return convertToArray(root)
}

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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    toggleSelected(node.path, isFolder)
  }

  const handleToggleFolder = () => {
    if (!isFolder) return
    setExpandedMap(prev => ({ ...prev, [node.path]: !prev[node.path] }))
  }

  return (
    <div className="ml-4">
      <div
        className={"flex items-center " + (isFolder ? "cursor-pointer" : "")}
        onClick={isFolder ? handleToggleFolder : undefined}
      >
        <input
          type="checkbox"
          className="mr-1"
          checked={checkboxState === 'checked'}
          ref={el => {
            if (el) {
              el.indeterminate = (checkboxState === 'partial')
            }
          }}
          onChange={handleCheckboxChange}
          onClick={e => e.stopPropagation()}
        />
        {isFolder ? (
          <span className="mr-2">
            {isExpanded ? '📂' : '📁'}
          </span>
        ) : (
          <span className="mr-2">📄</span>
        )}
        <span className="text-sm text-gray-700 select-none">{node.name}</span>
      </div>

      {isFolder && isExpanded && node.children && (
        <div className="mt-1">
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

  const handleToggleSelected = (pathStr: string, isFolder: boolean) => {
    if (!isFolder) {
      toggleSelectedFile(pathStr)
      return
    }

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
    const allSelected = allDesc.every(d => selectedSet.has(d))

    const newSelected = [...selectedFiles]
    if (allSelected) {
      for (const d of allDesc) {
        const idx = newSelected.indexOf(d)
        if (idx >= 0) {
          newSelected.splice(idx, 1)
        }
      }
    } else {
      for (const d of allDesc) {
        if (!newSelected.includes(d)) {
          newSelected.push(d)
        }
      }
    }

    function setSelectedFilesDirect(newList: string[]) {
      selectedFiles.forEach(sf => toggleSelectedFile(sf))
      newList.forEach(nf => toggleSelectedFile(nf))
    }
    setSelectedFilesDirect(newSelected)
  }

  if (!fileList || fileList.length === 0) {
    return (
      <div className="p-4 bg-gray-100 rounded text-sm text-gray-500">
        No files. Please select a directory.
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded p-2 text-sm overflow-auto">
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