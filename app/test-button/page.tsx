'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function TestButtonPage() {
  const [showForm, setShowForm] = useState(false)

  const handleCreateTemplate = () => {
    setShowForm(true)
    console.log('Create Template button clicked!')
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Create Template Button</h1>

      <Button className="wl-button-primary" onClick={handleCreateTemplate}>
        <Plus className="mr-2 h-4 w-4" />
        Create Template
      </Button>

      {showForm && (
        <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded">
          <p className="text-green-800">✅ Create Template button works! Form would open here.</p>
          <Button onClick={() => setShowForm(false)} className="mt-2">
            Close
          </Button>
        </div>
      )}
    </div>
  )
}
