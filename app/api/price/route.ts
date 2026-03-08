// app/api/signed-url/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get('path')
  if (!path) return NextResponse.json({ error: 'Missing path' }, { status: 400 })

  const supabase = createAdminClient()

  const { data, error } = await supabase.storage
    .from('analyses-pdfs')
    .createSignedUrl(path, 60 * 60 * 24) // 24h

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: error?.message ?? 'Failed' }, { status: 500 })
  }

  return NextResponse.json({ url: data.signedUrl })
}