import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default async function RefPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const cookieStore = await cookies()

  // Set affiliate cookie for 30 days
  cookieStore.set('ref', code, {
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
  })

  redirect('/')
}
