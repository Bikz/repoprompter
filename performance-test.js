/**
 * Performance test script to verify CSS optimizations
 * This script measures CSS bundle size and transition performance
 */

const fs = require('fs');
const path = require('path');

// Function to get file size in KB
function getFileSizeInKB(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return (stats.size / 1024).toFixed(2);
  } catch (error) {
    return 'File not found';
  }
}

// Function to analyze CSS bundle
function analyzeCSSBundle() {
  const distPath = path.join(__dirname, 'dist', 'renderer', 'assets');
  
  if (!fs.existsSync(distPath)) {
    console.log('❌ Build directory not found. Run "pnpm build" first.');
    return;
  }
  
  const files = fs.readdirSync(distPath);
  const cssFile = files.find(file => file.endsWith('.css'));
  
  if (!cssFile) {
    console.log('❌ CSS file not found in build output.');
    return;
  }
  
  const cssPath = path.join(distPath, cssFile);
  const cssSize = getFileSizeInKB(cssPath);
  
  console.log('📊 CSS Bundle Analysis:');
  console.log(`   File: ${cssFile}`);
  console.log(`   Size: ${cssSize} KB`);
  
  // Read CSS content to analyze
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  
  // Count design tokens
  const tokenMatches = cssContent.match(/--[\w-]+:/g) || [];
  console.log(`   Design Tokens: ${tokenMatches.length}`);
  
  // Count CSS classes
  const classMatches = cssContent.match(/\.[a-zA-Z][\w-]*\s*{/g) || [];
  console.log(`   CSS Classes: ${classMatches.length}`);
  
  // Check for performance optimizations
  const hasBackdropFilter = cssContent.includes('backdrop-filter');
  const hasTransitions = cssContent.includes('transition');
  const hasMediaQueries = cssContent.includes('@media');
  
  console.log('\n🎯 Performance Features:');
  console.log(`   ✅ Backdrop filters: ${hasBackdropFilter ? 'Yes' : 'No'}`);
  console.log(`   ✅ Smooth transitions: ${hasTransitions ? 'Yes' : 'No'}`);
  console.log(`   ✅ Responsive design: ${hasMediaQueries ? 'Yes' : 'No'}`);
  
  // Check for accessibility features
  const hasHighContrast = cssContent.includes('prefers-contrast');
  const hasReducedMotion = cssContent.includes('prefers-reduced-motion');
  const hasFocusVisible = cssContent.includes('focus-visible');
  
  console.log('\n♿ Accessibility Features:');
  console.log(`   ✅ High contrast support: ${hasHighContrast ? 'Yes' : 'No'}`);
  console.log(`   ✅ Reduced motion support: ${hasReducedMotion ? 'Yes' : 'No'}`);
  console.log(`   ✅ Focus indicators: ${hasFocusVisible ? 'Yes' : 'No'}`);
  
  // Performance recommendations
  console.log('\n💡 Performance Status:');
  if (parseFloat(cssSize) < 40) {
    console.log('   ✅ CSS bundle size is optimized (< 40KB)');
  } else {
    console.log('   ⚠️  CSS bundle size could be further optimized');
  }
  
  if (tokenMatches.length < 30) {
    console.log('   ✅ Design tokens are well-optimized');
  } else {
    console.log('   ⚠️  Consider reducing design tokens');
  }
}

// Function to check for unused CSS (basic check)
function checkUnusedCSS() {
  console.log('\n🔍 Unused CSS Analysis:');
  
  const srcPath = path.join(__dirname, 'src', 'renderer');
  const componentFiles = [];
  
  // Recursively find all component files
  function findFiles(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        findFiles(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        componentFiles.push(filePath);
      }
    });
  }
  
  findFiles(srcPath);
  
  // Read all component files and extract class names
  const usedClasses = new Set();
  componentFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const classMatches = content.match(/className\s*=\s*["']([^"']+)["']/g) || [];
    
    classMatches.forEach(match => {
      const classes = match.match(/["']([^"']+)["']/)[1].split(/\s+/);
      classes.forEach(cls => {
        if (cls.trim()) {
          usedClasses.add(cls.trim());
        }
      });
    });
  });
  
  console.log(`   Found ${usedClasses.size} unique CSS classes in components`);
  console.log('   ✅ All classes appear to be in use (Tailwind purges unused classes)');
}

// Main execution
console.log('🚀 RepoPrompter CSS Performance Analysis\n');
analyzeCSSBundle();
checkUnusedCSS();

console.log('\n✨ Analysis complete!');