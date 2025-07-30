import { MongoClient } from 'mongodb'
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

let client
let db

const JWT_SECRET = 'food-mart-secret-key-2024'

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME || 'food_mart')
  }
  return db
}

function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

export async function POST(request) {
  try {
    const db = await connectToMongo()
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return handleCORS(NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      ))
    }

    const user = await db.collection('users').findOne({ email, password })
    if (!user) {
      return handleCORS(NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      ))
    }

    const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: '24h' })
    
    return handleCORS(NextResponse.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email }
    }))

  } catch (error) {
    console.error('Login API Error:', error)
    return handleCORS(NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    ))
  }
}