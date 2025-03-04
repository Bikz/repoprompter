import React, { useState, useMemo } from 'react'
import { useRepoContext } from '../hooks/useRepoContext'
import { FileTreeNode } from './FileTreeNode'

interface FileNode {
  name: string
  path: string
  children?: FileNode[]
}

/**
 * Convert an object-based tree into an array-based tree.
 */
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

/**
 * Build a file tree from a flat array of file paths, optionally wrapping them under a root node.
 */
function buildFileTree(files: string[], rootName?: string): FileNode[] {
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

  const fileTree = convertToArray(root)
  if (rootName && fileTree.length > 0) {
    return [
      {
        name: rootName,
        path: rootName,
        children: fileTree
      }
    ]
  }
  // If no rootName or no files, just return fileTree as-is
  return fileTree
}

export function FileList() {
  const { fileList, selectedFiles, toggleSelectedFile, baseDir } = useRepoContext()
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({})

  const selectedSet = useMemo(() => new Set(selectedFiles), [selectedFiles])
  const baseDirName = useMemo(() => {
    if (!baseDir) return ''
    const segments = baseDir.split(/[\\/]/)
    return segments[segments.length - 1] || baseDir
  }, [baseDir])

  const fileTree = useMemo(() => buildFileTree(fileList || [], baseDirName), [fileList, baseDirName])

  /**
   * Toggles selection for a folder or a single file.
   */
  const handleToggleSelected = (pathStr: string, isFolder: boolean) => {
    if (!isFolder) {
      toggleSelectedFile(pathStr)
      return
    }

    // If it's a folder, gather all descendants and toggle them collectively
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
    const folderNode = findNode(fileTree)
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
      // Unselect all in this folder
      for (const d of allDesc) {
        const idx = newSelected.indexOf(d)
        if (idx >= 0) {
          newSelected.splice(idx, 1)
        }
      }
    } else {
      // Select all in this folder
      for (const d of allDesc) {
        if (!newSelected.includes(d)) {
          newSelected.push(d)
        }
      }
    }

    // We need to figure out how to apply these changes properly:
    // We'll build two lists: toRemove, toAdd, and call toggleSelectedFile on each.
    const toRemove = selectedFiles.filter(sf => !newSelected.includes(sf))
    const toAdd = newSelected.filter(nf => !selectedFiles.includes(nf))

    toRemove.forEach(sf => toggleSelectedFile(sf))
    toAdd.forEach(nf => toggleSelectedFile(nf))
  }

  if (!fileList || fileList.length === 0) {
    return (
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded text-sm text-gray-500 dark:text-gray-300">
        No files. Please select a directory.
      </div>
    )
  }

  return (
    <div className="file-tree max-h-[70vh] overflow-y-auto text-sm">
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