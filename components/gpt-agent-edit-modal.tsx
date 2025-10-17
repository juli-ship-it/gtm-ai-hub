'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface GPTAgentEditModalProps {
  isOpen: boolean
  onClose: () => void
  agent: any
  onSave: (updatedAgent: any) => Promise<void>
}

export function GPTAgentEditModal({ isOpen, onClose, agent, onSave }: GPTAgentEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'support',
    status: 'active',
    createdByUser: ''
  })
  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name || '',
        description: agent.description || '',
        category: agent.category || 'support',
        status: agent.status || 'active',
        createdByUser: agent.configuration?.created_by_user || ''
      })
    }
  }, [agent])

  // Auto-save when form data changes
  const handleFormChange = async (field: string, value: string) => {
    console.log('🔄 Form field changed:', field, 'to:', value)

    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)

    // Auto-save immediately with the new data
    setSaveStatus('saving')
    try {
      const updatedAgent = {
        ...agent,
        name: newFormData.name,
        description: newFormData.description,
        category: newFormData.category,
        status: newFormData.status,
        configuration: {
          ...agent.configuration,
          created_by_user: newFormData.createdByUser
        }
      }
      console.log('💾 Auto-saving agent:', updatedAgent)
      await onSave(updatedAgent)
      console.log('✅ Auto-save completed successfully')
      setSaveStatus('saved')

      // Reset status after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      console.error('❌ Error auto-saving agent:', error)
      setSaveStatus('error')

      // Reset status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  if (!agent) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
        <DialogHeader>
          <DialogTitle>Edit GPT Agent</DialogTitle>
          <DialogDescription>
            Update the basic information for this GPT agent.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Agent Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              placeholder="Enter agent name"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              placeholder="Enter agent description"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => handleFormChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="content">Content</SelectItem>
                <SelectItem value="analysis">Analysis</SelectItem>
                <SelectItem value="automation">Automation</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleFormChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="createdByUser">Created By</Label>
            <Input
              id="createdByUser"
              value={formData.createdByUser}
              onChange={(e) => handleFormChange('createdByUser', e.target.value)}
              placeholder="Enter creator email or username"
            />
          </div>
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <div className="text-sm">
              {saveStatus === 'saving' && (
                <span className="text-blue-600">💾 Saving changes...</span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-green-600">✅ Changes saved</span>
              )}
              {saveStatus === 'error' && (
                <span className="text-red-600">❌ Save failed</span>
              )}
              {saveStatus === 'idle' && (
                <span className="text-gray-500">Changes are saved automatically</span>
              )}
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
