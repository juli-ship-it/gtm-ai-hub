import fs from 'fs'
import path from 'path'

const pagesDir = path.join(__dirname, '../app')

const pages = [
  'runs/page.tsx',
  'intake/page.tsx', 
  'playbooks/page.tsx',
  'prompts/page.tsx',
  'admin/page.tsx'
]

pages.forEach(pagePath => {
  const fullPath = path.join(pagesDir, pagePath)
  
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8')
    
    // Add Sidebar import if not present
    if (!content.includes("import { Sidebar }")) {
      // Find the last import statement
      const importLines = content.split('\n').filter(line => line.startsWith('import'))
      const lastImportIndex = content.lastIndexOf(importLines[importLines.length - 1])
      const insertIndex = content.indexOf('\n', lastImportIndex) + 1
      
      content = content.slice(0, insertIndex) + 
        "import { Sidebar } from '@/components/sidebar'\n" +
        content.slice(insertIndex)
    }
    
    // Add Sidebar component if not present
    if (!content.includes('<Sidebar />')) {
      content = content.replace(
        /<div className="min-h-screen bg-wl-bg">\s*<div className="flex">\s*<div className="flex-1 p-8">/,
        '<div className="min-h-screen bg-wl-bg">\n      <div className="flex">\n        <Sidebar />\n        <div className="flex-1 p-8">'
      )
    }
    
    fs.writeFileSync(fullPath, content)
    console.log(`Updated ${pagePath}`)
  }
})

console.log('All pages updated with sidebar!')
