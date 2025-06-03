import React, { useMemo, useRef, useEffect, useState } from 'react'
import { Tree } from 'react-arborist'
import { useRepoContext } from '../hooks/useRepoContext'

interface TreeNode {
  id: string
  name: string
  isFolder: boolean
  children?: TreeNode[]
  path: string
}

function buildArboristTree(files: string[], baseDir: string): TreeNode[] {
  if (!files.length) return []

  const projectName = baseDir.split('/').pop() || 'Project'
  
  // Create a simple flat-to-tree converter
  const createNode = (path: string, name: string, isFolder: boolean): TreeNode => ({
    id: path,
    name: name,
    path: path,
    isFolder: isFolder,
    children: isFolder ? [] : undefined
  })

  // Build tree structure
  const nodeMap = new Map<string, TreeNode>()
  const rootChildren: TreeNode[] = []

  // First pass: create all nodes
  for (const file of files) {
    const parts = file.split('/').filter(part => part.length > 0)
    let currentPath = ''

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const previousPath = currentPath
      currentPath = currentPath ? `${currentPath}/${part}` : part
      const isFolder = i < parts.length - 1
      
      if (!nodeMap.has(currentPath)) {
        const node = createNode(currentPath, part, isFolder)
        nodeMap.set(currentPath, node)
        
        if (previousPath) {
          // Add to parent
          const parent = nodeMap.get(previousPath)
          if (parent && parent.children) {
            parent.children.push(node)
          }
        } else {
          // Top level node
          rootChildren.push(node)
        }
      }
    }
  }

  // Sort children alphabetically (folders first, then files)
  const sortNodes = (nodes: TreeNode[]) => {
    return nodes.sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1
      if (!a.isFolder && b.isFolder) return 1
      return a.name.localeCompare(b.name)
    })
  }

  // Sort all children recursively
  nodeMap.forEach(node => {
    if (node.children) {
      node.children = sortNodes(node.children)
    }
  })

  const sortedRootChildren = sortNodes(rootChildren)

  // Return with root wrapper
  return [{
    id: '__ROOT__',
    name: projectName,
    path: '__ROOT__',
    isFolder: true,
    children: sortedRootChildren
  }]
}

function getFileIcon(name: string | undefined, isFolder: boolean, isOpen?: boolean) {
  if (!name) return '📄'
  
  if (isFolder) {
    if (name === '__ROOT__' || name.includes('Project')) {
      return '📁'
    }
    return isOpen ? '📂' : '📁'
  }

  const ext = name.split('.').pop()?.toLowerCase() || ''
  switch (ext) {
    case 'ts': return '🔷'
    case 'tsx': return '⚛️'
    case 'js': return '🟨'
    case 'jsx': return '⚛️'
    case 'json': return '📋'
    case 'md': return '📝'
    case 'html': return '🌐'
    case 'css': case 'scss': return '🎨'
    case 'png': case 'jpg': case 'jpeg': case 'gif': case 'svg': return '🖼️'
    default: return '📄'
  }
}

export function FileList() {
  const { baseDir, fileList, selectedFiles, toggleSelectedFile } = useRepoContext()
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState(400)

  const treeData = useMemo(() => {
    if (!fileList.length || !baseDir) return []
    return buildArboristTree(fileList, baseDir)
  }, [fileList, baseDir])

  const selectedSet = useMemo(() => new Set(selectedFiles), [selectedFiles])

  // Calculate container height
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setContainerHeight(rect.height || 400)
      }
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  const handleSelect = (nodes: TreeNode[]) => {
    // Handle selection changes
    const newSelection = nodes.map(n => n.path).filter(path => path !== '__ROOT__')
    
    // Find files to add and remove
    const toAdd = newSelection.filter(path => !selectedFiles.includes(path))
    const toRemove = selectedFiles.filter(path => !newSelection.includes(path))
    
    // Apply changes
    toAdd.forEach(path => toggleSelectedFile(path))
    toRemove.forEach(path => toggleSelectedFile(path))
  }

  const isSelected = (node: TreeNode) => {
    if (node.path === '__ROOT__') {
      // Root is selected if all files are selected
      return fileList.length > 0 && fileList.every(file => selectedFiles.includes(file))
    }
    return selectedSet.has(node.path)
  }

  const Node = ({ node, style, dragHandle }: any) => {
    if (!node) return null
    
    // React-arborist wraps our data - access the actual data
    const nodeData = node.data || node
    
    const selected = isSelected(nodeData)
    const icon = getFileIcon(nodeData.name, nodeData.isFolder, node.isOpen)
    
    const handleClick = () => {
      if (nodeData.isFolder) {
        if (nodeData.path === '__ROOT__') {
          // Special handling for root - select/unselect ALL items (files + directories)
          const gatherAllPaths = (n: TreeNode): string[] => {
            const paths: string[] = []
            if (n.path !== '__ROOT__') {
              paths.push(n.path)
            }
            if (n.children) {
              n.children.forEach(child => {
                paths.push(...gatherAllPaths(child))
              })
            }
            return paths
          }
          
          const allPaths = gatherAllPaths(nodeData)
          console.log('All paths in tree:', allPaths)
          console.log('Currently selected:', selectedFiles)
          
          const allSelected = allPaths.every(path => selectedFiles.includes(path))
          
          if (allSelected) {
            // Unselect all
            allPaths.forEach(path => {
              if (selectedFiles.includes(path)) {
                toggleSelectedFile(path)
              }
            })
          } else {
            // Select all
            allPaths.forEach(path => {
              if (!selectedFiles.includes(path)) {
                toggleSelectedFile(path)
              }
            })
          }
        } else {
          // For regular folders, gather all descendant files
          const gatherFiles = (n: TreeNode): string[] => {
            if (!n.isFolder) return [n.path]
            if (!n.children) return []
            return n.children.flatMap(gatherFiles)
          }
          
          const allFiles = gatherFiles(nodeData)
          const allSelected = allFiles.every(file => selectedFiles.includes(file))
          
          if (allSelected) {
            // Unselect all
            allFiles.forEach(file => {
              if (selectedFiles.includes(file)) {
                toggleSelectedFile(file)
              }
            })
          } else {
            // Select all
            allFiles.forEach(file => {
              if (!selectedFiles.includes(file)) {
                toggleSelectedFile(file)
              }
            })
          }
        }
      } else {
        // Single file
        toggleSelectedFile(nodeData.path)
      }
    }

    return (
      <div
        ref={dragHandle}
        style={style}
        className={`flex items-center py-1 px-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 text-sm transition-colors ${
          selected ? 'bg-blue-50 dark:bg-blue-900/30 font-medium border-l-2 border-blue-500' : ''
        }`}
        onClick={handleClick}
      >
        <input
          type="checkbox"
          checked={selected}
          onChange={() => {}} // Handled by onClick
          className="mr-2 pointer-events-none w-3 h-3 rounded border border-gray-300 dark:border-gray-600"
        />
        <span className="mr-2 text-base leading-none">{icon}</span>
        <span className="truncate text-gray-700 dark:text-gray-300 font-mono text-xs">{nodeData.name || 'Unknown'}</span>
      </div>
    )
  }

  if (!baseDir || fileList.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-500 dark:text-gray-300">
        <span className="flex items-center justify-center space-x-2">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              d="M9 13h6m-3-3v6m-9-6h.01M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4m-5-4v-8a2 2 0 012-2h2.5M15 3H9m6 0v2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>No files. Please select a directory.</span>
        </span>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="h-full react-arborist-tree">
      <Tree
        data={treeData}
        openByDefault={true}
        width={containerRef.current?.clientWidth || 300}
        height={containerHeight}
        indent={20}
        rowHeight={26}
        overscanCount={20}
        disableDrop
        disableDrag
        disableMultiSelection={true}
        padding={4}
      >
        {Node}
      </Tree>
    </div>
  )
}