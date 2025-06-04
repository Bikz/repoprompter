/**
 * Token calculation utilities for estimating AI context usage
 */

export interface TokenInfo {
  count: number
  formatted: string // e.g., "12.3k", "890"
}

/**
 * Estimate token count for text content
 * Uses a simple approximation: ~4 characters per token (GPT average)
 * This is faster than using a full tokenizer and sufficient for UI display
 */
export function estimateTokens(content: string): number {
  if (!content) return 0
  
  // Basic estimation: 4 characters per token on average
  // This accounts for common English text, code, and whitespace
  return Math.ceil(content.length / 4)
}

/**
 * Format token count for display (e.g., 12345 -> "12.3k")
 */
export function formatTokenCount(tokens: number): string {
  if (tokens < 1000) {
    return tokens.toString()
  } else if (tokens < 1000000) {
    return `${(tokens / 1000).toFixed(1)}k`
  } else {
    return `${(tokens / 1000000).toFixed(1)}M`
  }
}

/**
 * Get token info with count and formatted string
 */
export function getTokenInfo(content: string): TokenInfo {
  const count = estimateTokens(content)
  return {
    count,
    formatted: formatTokenCount(count)
  }
}

/**
 * Calculate percentage of total tokens
 */
export function calculateTokenPercentage(fileTokens: number, totalTokens: number): number {
  if (totalTokens === 0) return 0
  return Math.round((fileTokens / totalTokens) * 100 * 10) / 10 // Round to 1 decimal
}

/**
 * Get color class based on token percentage
 * Returns empty string for small files to keep UI clean
 */
export function getTokenColorClass(percentage: number): string {
  if (percentage >= 20) {
    return 'text-red-600 dark:text-red-400' // Large files (20%+)
  } else if (percentage >= 5) {
    return 'text-amber-600 dark:text-amber-400' // Medium files (5-20%)
  }
  return '' // Small files (<5%) - no color to avoid noise
}

/**
 * Determine if token info should be displayed
 * Show for all files to give complete visibility
 */
export function shouldShowTokenInfo(percentage: number): boolean {
  return true // Show for all files - users want complete visibility
}

/**
 * Calculate total tokens for a folder by summing all descendant files
 */
export function calculateFolderTokens(
  folderNode: any, 
  fileTokens: Record<string, number>
): number {
  let total = 0
  
  const gatherFileTokens = (node: any): void => {
    if (!node.isFolder) {
      // This is a file - add its tokens
      total += fileTokens[node.path] || 0
    } else if (node.children) {
      // This is a folder - recurse into children
      node.children.forEach(gatherFileTokens)
    }
  }
  
  gatherFileTokens(folderNode)
  return total
}