'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Input } from '@/components/ui/Input'

interface Template {
  id: string
  name: string
  subject: string
  body: string
}

const defaultTemplates: Template[] = [
  {
    id: 'day1',
    name: 'Outreach — Day 1 (Intro)',
    subject: 'Quick question about {{company_name}}',
    body: `Hi {{contact_name}},

I was looking at {{company_name}} on Google and noticed {{personalized_observation}}.

Most {{niche}} businesses in {{city}} are losing leads to slow follow-up. We fix that.

InnieAI automates your lead gen and follow-up so you never miss another potential customer.

Worth a 15-minute call this week?

{{signature}}`,
  },
  {
    id: 'day3',
    name: 'Outreach — Day 3 (Value)',
    subject: 'What I found when I looked at your competitors',
    body: `Hi {{contact_name}},

I took a look at a few other {{niche}} businesses in {{city}}.

The ones growing fastest are responding to leads within 5 minutes. Most are still calling back hours later.

InnieAI sends a personalized follow-up within 60 seconds of a new inquiry — and keeps following up over 14 days until they either reply or opt out.

Happy to show you exactly what this looks like for a {{niche}} in {{city}}.

{{signature}}`,
  },
  {
    id: 'day7',
    name: 'Outreach — Day 7 (Social Proof)',
    subject: 'What happened at {{similar_company}}',
    body: `Hi {{contact_name}},

Quick one.

A {{niche}} similar to yours was losing 60% of their leads to slow response times. Within 30 days of using InnieAI, they were booking 3x more calls from the same traffic.

No new ads. No new spend. Just faster, smarter follow-up.

Can I send over a 2-min overview of how it works for {{niche}} specifically?

{{signature}}`,
  },
  {
    id: 'day14',
    name: 'Outreach — Day 14 (Breakup)',
    subject: 'Closing your file',
    body: `Hi {{contact_name}},

I've reached out a few times without hearing back, so I'll assume the timing isn't right.

If anything changes and you'd like to see how InnieAI works for {{niche}} businesses in {{city}}, you can book a 15-minute call here: {{calcom_link}}

Take care,
{{signature}}`,
  },
]

export default function AdminEmailTemplatesPage() {
  const [templates, setTemplates] = useState(defaultTemplates)
  const [editing, setEditing] = useState<Template | null>(null)
  const [saved, setSaved] = useState(false)

  function startEdit(template: Template) {
    setEditing({ ...template })
    setSaved(false)
  }

  function save() {
    if (!editing) return
    setTemplates((prev) => prev.map((t) => (t.id === editing.id ? editing : t)))
    setSaved(true)
    setTimeout(() => {
      setEditing(null)
      setSaved(false)
    }, 1000)
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-cream mb-1">Email Templates</h1>
        <p className="text-cream/40 text-sm">
          Edit outreach sequences. Variables: {'{{'} company_name {'}}'}, {'{{'} contact_name {'}}'}, {'{{'} city {'}}'}, {'{{'} niche {'}}'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template list */}
        <div className="space-y-3">
          {templates.map((t) => (
            <div
              key={t.id}
              className={`bg-navy-light border rounded-xl p-5 cursor-pointer transition-all ${
                editing?.id === t.id ? 'border-accent/50' : 'border-white/[0.06] hover:border-white/[0.12]'
              }`}
              onClick={() => startEdit(t)}
            >
              <p className="text-cream font-medium text-sm mb-1">{t.name}</p>
              <p className="text-cream/40 text-xs truncate">{t.subject}</p>
            </div>
          ))}
        </div>

        {/* Editor */}
        {editing ? (
          <div className="bg-navy-light border border-white/[0.06] rounded-xl p-6 space-y-4">
            <h3 className="text-cream font-semibold">{editing.name}</h3>
            <Input
              label="Subject"
              value={editing.subject}
              onChange={(e) => setEditing({ ...editing, subject: e.target.value })}
            />
            <Textarea
              label="Body"
              value={editing.body}
              onChange={(e) => setEditing({ ...editing, body: e.target.value })}
              rows={12}
              className="font-mono text-xs"
            />
            <Button onClick={save} loading={saved}>
              {saved ? 'Saved ✓' : 'Save Template'}
            </Button>
          </div>
        ) : (
          <div className="bg-navy-light border border-white/[0.06] rounded-xl p-6 flex items-center justify-center">
            <p className="text-cream/30 text-sm">Select a template to edit</p>
          </div>
        )}
      </div>
    </div>
  )
}
