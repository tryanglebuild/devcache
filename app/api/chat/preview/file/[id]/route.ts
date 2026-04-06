// File Preview API - DEPRECATED: Redirects to unified resource preview
// Kept for backward compatibility

import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    console.log('[Preview API] Redirecting file preview to unified resource API:', id)
    
    // Redirect to unified resource preview API
    const baseUrl = request.url.split('/api/')[0]
    const response = await fetch(`${baseUrl}/api/chat/preview/resource/${id}`, {
      headers: request.headers,
    })
    
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })


  } catch (error) {
    console.error('Preview error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
