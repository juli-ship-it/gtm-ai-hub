'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Clock, Calendar, Settings } from 'lucide-react'

interface ScheduleTriggerFormProps {
  onValuesChange: (values: Record<string, any>) => void
  initialValues?: Record<string, any>
}

export function N8NScheduleTriggerForm({ onValuesChange, initialValues = {} }: ScheduleTriggerFormProps) {
  const [triggerInterval, setTriggerInterval] = useState(initialValues['Trigger Interval'] || 'Days')
  const [values, setValues] = useState<Record<string, any>>(initialValues)

  useEffect(() => {
    setValues(initialValues)
    setTriggerInterval(initialValues['Trigger Interval'] || 'Days')
  }, [initialValues])

  const updateValue = (key: string, value: any) => {
    const newValues = { ...values, [key]: value }
    setValues(newValues)
    onValuesChange(newValues)
  }

  const renderIntervalFields = () => {
    switch (triggerInterval) {
      case 'Seconds':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="seconds-between">Seconds Between Triggers</Label>
              <Input
                id="seconds-between"
                type="number"
                min="1"
                max="3600"
                value={values['Seconds Between Triggers'] || 60}
                onChange={(e) => updateValue('Seconds Between Triggers', parseInt(e.target.value))}
                placeholder="60"
              />
              <p className="text-sm text-gray-500">Number of seconds between each workflow trigger (1-3600)</p>
            </div>
          </div>
        )

      case 'Minutes':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="minutes-between">Minutes Between Triggers</Label>
              <Input
                id="minutes-between"
                type="number"
                min="1"
                max="1440"
                value={values['Minutes Between Triggers'] || 60}
                onChange={(e) => updateValue('Minutes Between Triggers', parseInt(e.target.value))}
                placeholder="60"
              />
              <p className="text-sm text-gray-500">Number of minutes between each workflow trigger (1-1440)</p>
            </div>
            <div>
              <Label htmlFor="trigger-minute">Trigger at Minute</Label>
              <Input
                id="trigger-minute"
                type="number"
                min="0"
                max="59"
                value={values['Trigger at Minute'] || 0}
                onChange={(e) => updateValue('Trigger at Minute', parseInt(e.target.value))}
                placeholder="0"
              />
              <p className="text-sm text-gray-500">Minute past the hour to trigger (0-59)</p>
            </div>
          </div>
        )

      case 'Hours':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="hours-between">Hours Between Triggers</Label>
              <Input
                id="hours-between"
                type="number"
                min="1"
                max="24"
                value={values['Hours Between Triggers'] || 1}
                onChange={(e) => updateValue('Hours Between Triggers', parseInt(e.target.value))}
                placeholder="1"
              />
              <p className="text-sm text-gray-500">Number of hours between each workflow trigger (1-24)</p>
            </div>
            <div>
              <Label htmlFor="trigger-minute-hours">Trigger at Minute</Label>
              <Input
                id="trigger-minute-hours"
                type="number"
                min="0"
                max="59"
                value={values['Trigger at Minute'] || 0}
                onChange={(e) => updateValue('Trigger at Minute', parseInt(e.target.value))}
                placeholder="0"
              />
              <p className="text-sm text-gray-500">Minute past the hour to trigger (0-59)</p>
            </div>
          </div>
        )

      case 'Days':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="days-between">Days Between Triggers</Label>
              <Input
                id="days-between"
                type="number"
                min="1"
                max="365"
                value={values['Days Between Triggers'] || 1}
                onChange={(e) => updateValue('Days Between Triggers', parseInt(e.target.value))}
                placeholder="1"
              />
              <p className="text-sm text-gray-500">Number of days between each workflow trigger (1-365)</p>
            </div>
            <div>
              <Label htmlFor="trigger-hour">Trigger at Hour</Label>
              <Input
                id="trigger-hour"
                type="number"
                min="0"
                max="23"
                value={values['Trigger at Hour'] || 9}
                onChange={(e) => updateValue('Trigger at Hour', parseInt(e.target.value))}
                placeholder="9"
              />
              <p className="text-sm text-gray-500">Hour of the day to trigger (0-23)</p>
            </div>
            <div>
              <Label htmlFor="trigger-minute-days">Trigger at Minute</Label>
              <Input
                id="trigger-minute-days"
                type="number"
                min="0"
                max="59"
                value={values['Trigger at Minute'] || 0}
                onChange={(e) => updateValue('Trigger at Minute', parseInt(e.target.value))}
                placeholder="0"
              />
              <p className="text-sm text-gray-500">Minute past the hour to trigger (0-59)</p>
            </div>
          </div>
        )

      case 'Weeks':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="weeks-between">Weeks Between Triggers</Label>
              <Input
                id="weeks-between"
                type="number"
                min="1"
                max="52"
                value={values['Weeks Between Triggers'] || 1}
                onChange={(e) => updateValue('Weeks Between Triggers', parseInt(e.target.value))}
                placeholder="1"
              />
              <p className="text-sm text-gray-500">Number of weeks between each workflow trigger (1-52)</p>
            </div>
            <div>
              <Label htmlFor="trigger-weekdays">Trigger on Weekdays</Label>
              <div className="space-y-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <label key={day} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={(values['Trigger on Weekdays'] || []).includes(day)}
                      onChange={(e) => {
                        const currentDays = values['Trigger on Weekdays'] || []
                        if (e.target.checked) {
                          updateValue('Trigger on Weekdays', [...currentDays, day])
                        } else {
                          updateValue('Trigger on Weekdays', currentDays.filter(d => d !== day))
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{day}</span>
                  </label>
                ))}
              </div>
              <p className="text-sm text-gray-500">Select which days of the week to trigger</p>
            </div>
            <div>
              <Label htmlFor="trigger-hour-weeks">Trigger at Hour</Label>
              <Input
                id="trigger-hour-weeks"
                type="number"
                min="0"
                max="23"
                value={values['Trigger at Hour'] || 9}
                onChange={(e) => updateValue('Trigger at Hour', parseInt(e.target.value))}
                placeholder="9"
              />
              <p className="text-sm text-gray-500">Hour of the day to trigger (0-23)</p>
            </div>
            <div>
              <Label htmlFor="trigger-minute-weeks">Trigger at Minute</Label>
              <Input
                id="trigger-minute-weeks"
                type="number"
                min="0"
                max="59"
                value={values['Trigger at Minute'] || 0}
                onChange={(e) => updateValue('Trigger at Minute', parseInt(e.target.value))}
                placeholder="0"
              />
              <p className="text-sm text-gray-500">Minute past the hour to trigger (0-59)</p>
            </div>
          </div>
        )

      case 'Months':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="months-between">Months Between Triggers</Label>
              <Input
                id="months-between"
                type="number"
                min="1"
                max="12"
                value={values['Months Between Triggers'] || 1}
                onChange={(e) => updateValue('Months Between Triggers', parseInt(e.target.value))}
                placeholder="1"
              />
              <p className="text-sm text-gray-500">Number of months between each workflow trigger (1-12)</p>
            </div>
            <div>
              <Label htmlFor="trigger-day-month">Trigger at Day of Month</Label>
              <Input
                id="trigger-day-month"
                type="number"
                min="1"
                max="31"
                value={values['Trigger at Day of Month'] || 1}
                onChange={(e) => updateValue('Trigger at Day of Month', parseInt(e.target.value))}
                placeholder="1"
              />
              <p className="text-sm text-gray-500">Day of the month to trigger (1-31)</p>
            </div>
            <div>
              <Label htmlFor="trigger-hour-months">Trigger at Hour</Label>
              <Input
                id="trigger-hour-months"
                type="number"
                min="0"
                max="23"
                value={values['Trigger at Hour'] || 9}
                onChange={(e) => updateValue('Trigger at Hour', parseInt(e.target.value))}
                placeholder="9"
              />
              <p className="text-sm text-gray-500">Hour of the day to trigger (0-23)</p>
            </div>
            <div>
              <Label htmlFor="trigger-minute-months">Trigger at Minute</Label>
              <Input
                id="trigger-minute-months"
                type="number"
                min="0"
                max="59"
                value={values['Trigger at Minute'] || 0}
                onChange={(e) => updateValue('Trigger at Minute', parseInt(e.target.value))}
                placeholder="0"
              />
              <p className="text-sm text-gray-500">Minute past the hour to trigger (0-59)</p>
            </div>
          </div>
        )

      case 'Custom (Cron)':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="cron-expression">Expression</Label>
              <Input
                id="cron-expression"
                type="text"
                value={values['Expression'] || '0 9 * * 1-5'}
                onChange={(e) => updateValue('Expression', e.target.value)}
                placeholder="0 9 * * 1-5"
              />
              <p className="text-sm text-gray-500">Custom cron expression (e.g., "0 9 * * 1-5" for weekdays at 9 AM)</p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Schedule Trigger Configuration</span>
        </CardTitle>
        <CardDescription>
          Configure when this workflow should run automatically
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="trigger-interval">Trigger Interval</Label>
          <Select
            value={triggerInterval}
            onValueChange={(value) => {
              setTriggerInterval(value)
              updateValue('Trigger Interval', value)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select trigger interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Seconds">Seconds</SelectItem>
              <SelectItem value="Minutes">Minutes</SelectItem>
              <SelectItem value="Hours">Hours</SelectItem>
              <SelectItem value="Days">Days</SelectItem>
              <SelectItem value="Weeks">Weeks</SelectItem>
              <SelectItem value="Months">Months</SelectItem>
              <SelectItem value="Custom (Cron)">Custom (Cron)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500">How often should this workflow run?</p>
        </div>

        {renderIntervalFields()}

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">n8n Schedule Trigger</h4>
          <p className="text-sm text-blue-800">
            This configuration matches n8n's Schedule Trigger node exactly. 
            The values will be properly formatted for n8n import.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
