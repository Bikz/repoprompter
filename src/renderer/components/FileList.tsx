import React, { useState, useMemo } from 'react'
import { useRepoContext } from '../hooks/useRepoContext'
import { FileTreeNode } from './FileTreeNode'

interface FileNode {
  name: string
  path: string
  children?: FileNode[]
}

/**
 * Recursively convert an object-based tree to an array-based tree.
 */
function convertToArray(obj: Record<string, FileNode>): FileNode[] {
  return Object.values(obj).map(node => {
    if (node.children) {
      return {
        name: node.name,
        path: node.path,
        children: convertToArray(node.children as Record<string, FileNode>)
      }
    }
    return { name: node.name, path: node.path }
  })
}

/**
 * Build a file tree from a flat array of relative paths, ignoring any single
 * “root” folder name. That way we don't show e.g. “aiapply” at top.
 */
function buildFileTree(files: string[]): FileNode[] {
  const root: Record<string, FileNode> = {}

  for (const file of files) {
    const parts = file.split(/[\\/]/)
    let current = root
    let currentPath = ''

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      currentPath = currentPath ? `${currentPath}/${part}` : part

      if (!current[part]) {
        current[part] = {
          name: part,
          path: currentPath,
          children: {}
        }
      }

      if (i === parts.length - 1) {
        // no children at leaf
        current[part].children = undefined
      } else {
        if (!current[part].children) {
          current[part].children = {}
        }
        current = current[part].children as Record<string, FileNode>
      }
    }
  }

  return convertToArray(root)
}

export function FileList() {
  const { baseDir, fileList, selectedFiles, toggleSelectedFile } = useRepoContext()
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({})

  // Build a nested tree from the array of paths - MOVED BEFORE CONDITIONAL RETURN
  const treeNodes = useMemo(() => 
    fileList.length > 0 ? buildFileTree(fileList) : [], 
    [fileList]
  )

  // Use a set for quick membership checks - MOVED BEFORE CONDITIONAL RETURN
  const selectedSet = useMemo(() => new Set(selectedFiles), [selectedFiles])
  
  // Auto-expand first level folders for better UX
  useMemo(() => {
    if (treeNodes.length > 0) {
      const initialExpanded: Record<string, boolean> = {};
      treeNodes.forEach(node => {
        if (node.children) {
          initialExpanded[node.path] = true;
        }
      });
      setExpandedMap(prev => ({...prev, ...initialExpanded}));
    }
  }, [treeNodes]);
  
  // If user hasn't selected a dir or there's no files, show a message
  if (!baseDir || fileList.length === 0) {
    return (
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded text-sm text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
        <span className="flex items-center justify-center space-x-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 13h6m-3-3v6m-9-6h.01M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4m-5-4v-8a2 2 0 012-2h2.5M15 3H9m6 0v2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>No files. Please select a directory.</span>
        </span>
      </div>
    )
  }

  // Toggle folder => select or unselect all children
  const handleToggleSelected = (pathStr: string, isFolder: boolean) => {
    if (!isFolder) {
      toggleSelectedFile(pathStr)
      return
    }

    // Recursively gather all children
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

    // Find the node by path
    function findNode(list: FileNode[], p: string): FileNode | null {
      for (const item of list) {
        if (item.path === p) return item
        if (item.children) {
          const found = findNode(item.children, p)
          if (found) return found
        }
      }
      return null
    }

    const node = findNode(treeNodes, pathStr)
    if (!node) return

    const allDesc = gatherAllDescendants(node)
    const allSelected = allDesc.every(d => selectedSet.has(d))
    let newSel = [...selectedFiles]

    if (allSelected) {
      // unselect
      newSel = newSel.filter(f => !allDesc.includes(f))
    } else {
      // select
      for (const d of allDesc) {
        if (!newSel.includes(d)) {
          newSel.push(d)
        }
      }
    }

    // Compare old vs new
    const toRemove = selectedFiles.filter(sf => !newSel.includes(sf))
    const toAdd = newSel.filter(nf => !selectedFiles.includes(nf))

    toRemove.forEach(sf => toggleSelectedFile(sf))
    toAdd.forEach(nf => toggleSelectedFile(nf))
  }

  return (
    <div className="file-tree overflow-y-auto text-sm p-1">
      {treeNodes.map((node, i) => (
        <FileTreeNode
          key={node.path}
          node={node}
          selectedSet={selectedSet}
          toggleSelected={handleToggleSelected}
          expandedMap={expandedMap}
          setExpandedMap={setExpandedMap}
          level={0}
          isLastChild={i === treeNodes.length - 1}
        />
      ))}
    </div>
  )
}