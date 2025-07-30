import { NextResponse } from 'next/server'

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

export async function GET() {
  return handleCORS(NextResponse.json({ 
    message: "Food Mart API is running!",
    status: "healthy",
    timestamp: new Date().toISOString()
  }))
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}