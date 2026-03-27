import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { ApiResponse, PortalDashboardData } from '@/types/api'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
): Promise<NextResponse<ApiResponse<PortalDashboardData>>> {
  const { clientId } = await params
  const supabase = createServerClient()

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single()

  if (!client) {
    return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 })
  }

  // Update last portal login
  await supabase
    .from('clients')
    .update({ last_portal_login: new Date().toISOString() })
    .eq('id', clientId)

  // Stats
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [{ count: leadsThisMonth }, { count: emailsThisMonth }, { data: recentLeads }, { data: latestReport }] =
    await Promise.all([
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .not('status', 'in', '("Invalid")')
        .gte('created_at', startOfMonth.toISOString()),
      supabase
        .from('email_sequences')
        .select('*', { count: 'exact', head: true })
        .not('sent_at', 'is', null)
        .gte('sent_at', startOfMonth.toISOString()),
      supabase
        .from('leads')
        .select('company_name, city, score, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('reports')
        .select('content, week_of')
        .eq('client_id', clientId)
        .order('week_of', { ascending: false })
        .limit(1)
        .single(),
    ])

  return NextResponse.json({
    success: true,
    data: {
      client: {
        name: client.name,
        company: client.company,
        tier: client.tier,
        status: client.status,
        created_at: client.created_at,
      },
      stats: {
        leadsThisMonth: leadsThisMonth ?? 0,
        emailsSentThisMonth: emailsThisMonth ?? 0,
        reviewRequestsSent: 0, // future metric
      },
      recentLeads: recentLeads ?? [],
      latestReport: latestReport ?? null,
      invoices: [], // populated by Stripe webhook in Phase 10
    },
  })
}
