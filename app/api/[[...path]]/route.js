import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// MongoDB connection
let client
let db

const JWT_SECRET = 'food-mart-secret-key-2024'

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME || 'food_mart')
    
    // Initialize collections and sample data if they don't exist
    await initializeDatabase()
  }
  return db
}

async function initializeDatabase() {
  try {
    // Create collections
    const collections = ['products', 'users', 'orders', 'categories']
    for (const collection of collections) {
      try {
        await db.createCollection(collection)
      } catch (error) {
        // Collection might already exist
      }
    }

    // Check if we have sample data
    const productsCount = await db.collection('products').countDocuments()
    if (productsCount === 0) {
      await initializeSampleData()
    }
  } catch (error) {
    console.error('Database initialization error:', error)
  }
}

async function initializeSampleData() {
  const categories = [
    { id: uuidv4(), name: 'Fruits', slug: 'fruits', description: 'Fresh seasonal fruits' },
    { id: uuidv4(), name: 'Vegetables', slug: 'vegetables', description: 'Farm fresh vegetables' },
    { id: uuidv4(), name: 'Dairy & Eggs', slug: 'dairy', description: 'Fresh dairy products and eggs' },
    { id: uuidv4(), name: 'Snacks & Beverages', slug: 'snacks', description: 'Tasty snacks and refreshing beverages' },
    { id: uuidv4(), name: 'Pantry Staples', slug: 'pantry', description: 'Essential pantry items' },
    { id: uuidv4(), name: 'Frozen Foods', slug: 'frozen', description: 'High-quality frozen products' }
  ]

  const products = [
    {
      id: uuidv4(),
      name: 'Organic Bananas',
      description: 'Sweet and nutritious organic bananas, perfect for breakfast or snacks.',
      price: 2.99,
      originalPrice: 3.49,
      discount: 14,
      image: 'https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHw0fHxmb29kJTIwcHJvZHVjdHN8ZW58MHx8fHwxNzUzODAyOTQ0fDA&ixlib=rb-4.1.0&q=85',
      category: 'fruits',
      inStock: true,
      rating: 4.5,
      featured: true,
      tags: ['organic', 'healthy', 'vitamin'],
      nutritionInfo: { calories: '89 per 100g', fiber: '2.6g', potassium: '358mg' }
    },
    {
      id: uuidv4(),
      name: 'Fresh Spinach Bundle',
      description: 'Crisp and fresh spinach leaves, rich in iron and vitamins.',
      price: 3.49,
      originalPrice: 3.99,
      discount: 13,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHw0fHxncm9jZXJpZXN8ZW58MHx8fHwxNzUzODUzNTI0fDA&ixlib=rb-4.1.0&q=85',
      category: 'vegetables',
      inStock: true,
      rating: 4.7,
      featured: true,
      tags: ['fresh', 'iron-rich', 'leafy-green']
    },
    {
      id: uuidv4(),
      name: 'Pacific Barista Oat Milk',
      description: 'Creamy oat milk perfect for coffee, cereal, and baking.',
      price: 4.99,
      originalPrice: 5.49,
      discount: 9,
      image: 'https://images.unsplash.com/photo-1587790032594-babe1292cede?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwxfHxmb29kJTIwcHJvZHVjdHN8ZW58MHx8fHwxNzUzODAyOTQ0fDA&ixlib=rb-4.1.0&q=85',
      category: 'dairy',
      inStock: true,
      rating: 4.6,
      featured: true,
      tags: ['plant-based', 'barista', 'oat-milk']
    },
    {
      id: uuidv4(),
      name: 'Green Bean Medley',
      description: 'Premium quality green beans, ready to cook and serve.',
      price: 1.99,
      originalPrice: 2.29,
      discount: 13,
      image: 'https://images.unsplash.com/photo-1584473457406-6240486418e9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwzfHxmb29kJTIwcHJvZHVjdHN8ZW58MHx8fHwxNzUzODAyOTQ0fDA&ixlib=rb-4.1.0&q=85',
      category: 'vegetables',
      inStock: true,
      rating: 4.3,
      featured: false,
      tags: ['canned', 'ready-to-eat', 'protein']
    },
    {
      id: uuidv4(),
      name: 'Mixed Fruit Basket',
      description: 'A delightful mix of seasonal fruits in a convenient basket.',
      price: 12.99,
      originalPrice: 14.99,
      discount: 13,
      image: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwzfHxncm9jZXJpZXN8ZW58MHx8fHwxNzUzODUzNTI0fDA&ixlib=rb-4.1.0&q=85',
      category: 'fruits',
      inStock: true,
      rating: 4.8,
      featured: true,
      tags: ['variety', 'gift-basket', 'seasonal']
    },
    {
      id: uuidv4(),
      name: 'Organic Strawberries',
      description: 'Sweet and juicy organic strawberries, perfect for desserts.',
      price: 5.99,
      originalPrice: 6.99,
      discount: 14,
      image: 'https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHw0fHxmb29kJTIwcHJvZHVjdHN8ZW58MHx8fHwxNzUzODAyOTQ0fDA&ixlib=rb-4.1.0&q=85',
      category: 'fruits',
      inStock: false,
      rating: 4.9,
      featured: false,
      tags: ['organic', 'berries', 'antioxidants']
    },
    {
      id: uuidv4(),
      name: 'Fresh Whole Milk',
      description: 'Rich and creamy whole milk from local farms.',
      price: 3.79,
      originalPrice: 4.29,
      discount: 12,
      image: 'https://images.unsplash.com/photo-1587790032594-babe1292cede?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwxfHxmb29kJTIwcHJvZHVjdHN8ZW58MHx8fHwxNzUzODAyOTQ0fDA&ixlib=rb-4.1.0&q=85',
      category: 'dairy',
      inStock: true,
      rating: 4.4,
      featured: true,
      tags: ['fresh', 'local', 'calcium']
    },
    {
      id: uuidv4(),
      name: 'Artisan Crackers',
      description: 'Gourmet crackers perfect for cheese and spreads.',
      price: 4.49,
      originalPrice: 4.99,
      discount: 10,
      image: 'https://images.unsplash.com/photo-1584473457406-6240486418e9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwzfHxmb29kJTIwcHJvZHVjdHN8ZW58MHx8fHwxNzUzODAyOTQ0fDA&ixlib=rb-4.1.0&q=85',
      category: 'snacks',
      inStock: true,
      rating: 4.2,
      featured: true,
      tags: ['artisan', 'gourmet', 'party']
    }
  ]

  await db.collection('categories').insertMany(categories)
  await db.collection('products').insertMany(products)

  // Create test user for login testing
  const testUser = {
    id: uuidv4(),
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123', // In production, hash the password
    createdAt: new Date(),
    orders: []
  }

  await db.collection('users').insertOne(testUser)
}

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// Middleware to verify JWT token
async function verifyToken(request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.substring(7)
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch (error) {
    return null
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// Route handler function
async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method
  
  console.log(`API Route called: ${method} ${route}`, { params, path })

  try {
    const db = await connectToMongo()

    // Root endpoint - Handle both /api/ and /api
    if ((route === '/' || route === '' || path.length === 0) && method === 'GET') {
      return handleCORS(NextResponse.json({ message: "Food Mart API is running!" }))
    }
    
    // Health check endpoint
    if (route === '/health' && method === 'GET') {
      return handleCORS(NextResponse.json({ status: "healthy", timestamp: new Date().toISOString() }))
    }

    // Authentication endpoints
    if (route === '/auth/register' && method === 'POST') {
      const body = await request.json()
      const { name, email, password } = body

      if (!name || !email || !password) {
        return handleCORS(NextResponse.json(
          { success: false, error: "Name, email, and password are required" },
          { status: 400 }
        ))
      }

      // Check if user already exists
      const existingUser = await db.collection('users').findOne({ email })
      if (existingUser) {
        return handleCORS(NextResponse.json(
          { success: false, error: "User with this email already exists" },
          { status: 409 }
        ))
      }

      const userId = uuidv4()
      const user = {
        id: userId,
        name,
        email,
        password, // In production, hash the password
        createdAt: new Date(),
        orders: []
      }

      await db.collection('users').insertOne(user)
      
      const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '24h' })
      
      return handleCORS(NextResponse.json({
        success: true,
        token,
        user: { id: userId, name, email }
      }))
    }

    if (route === '/auth/login' && method === 'POST') {
      let body
      try {
        const rawBody = await request.text()
        console.log('Raw request body:', rawBody)
        
        if (!rawBody || rawBody.trim() === '') {
          return handleCORS(NextResponse.json(
            { success: false, error: "Request body is empty" },
            { status: 400 }
          ))
        }
        
        body = JSON.parse(rawBody)
        console.log('Parsed body:', body)
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError)
        return handleCORS(NextResponse.json(
          { success: false, error: "Invalid JSON in request body" },
          { status: 400 }
        ))
      }
      
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
    }

    // Products endpoints
    if (route === '/products' && method === 'GET') {
      const url = new URL(request.url)
      const category = url.searchParams.get('category')
      const search = url.searchParams.get('search')
      const minPrice = parseFloat(url.searchParams.get('minPrice') || '0')
      const maxPrice = parseFloat(url.searchParams.get('maxPrice') || '1000')
      const inStock = url.searchParams.get('inStock')
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = parseInt(url.searchParams.get('limit') || '20')
      const skip = (page - 1) * limit

      let query = {}
      
      if (category) {
        query.category = category
      }
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ]
      }
      
      query.price = { $gte: minPrice, $lte: maxPrice }
      
      if (inStock === 'true') {
        query.inStock = true
      }

      const products = await db.collection('products')
        .find(query)
        .skip(skip)
        .limit(limit)
        .toArray()

      const total = await db.collection('products').countDocuments(query)
      
      const cleanedProducts = products.map(({ _id, ...rest }) => rest)
      
      return handleCORS(NextResponse.json({
        success: true,
        products: cleanedProducts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }))
    }

    if (route === '/products/featured' && method === 'GET') {
      const products = await db.collection('products')
        .find({ featured: true })
        .limit(8)
        .toArray()

      const cleanedProducts = products.map(({ _id, ...rest }) => rest)
      
      return handleCORS(NextResponse.json({
        success: true,
        products: cleanedProducts
      }))
    }

    // Categories endpoint
    if (route === '/categories' && method === 'GET') {
      const categories = await db.collection('categories').find({}).toArray()
      const cleanedCategories = categories.map(({ _id, ...rest }) => rest)
      
      return handleCORS(NextResponse.json({
        success: true,
        categories: cleanedCategories
      }))
    }

    // Orders endpoints (protected)
    if (route === '/orders' && method === 'POST') {
      const user = await verifyToken(request)
      if (!user) {
        return handleCORS(NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        ))
      }

      const body = await request.json()
      const { items, total, shippingAddress } = body

      if (!items || !Array.isArray(items) || items.length === 0) {
        return handleCORS(NextResponse.json(
          { success: false, error: "Order items are required" },
          { status: 400 }
        ))
      }

      const orderId = uuidv4()
      const order = {
        id: orderId,
        userId: user.userId,
        items,
        total,
        shippingAddress,
        status: 'pending',
        paymentStatus: 'paid',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await db.collection('orders').insertOne(order)
      
      return handleCORS(NextResponse.json({
        success: true,
        order: { ...order, _id: undefined }
      }))
    }

    if (route === '/orders' && method === 'GET') {
      const user = await verifyToken(request)
      if (!user) {
        return handleCORS(NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        ))
      }

      const orders = await db.collection('orders')
        .find({ userId: user.userId })
        .sort({ createdAt: -1 })
        .toArray()

      const cleanedOrders = orders.map(({ _id, ...rest }) => rest)
      
      return handleCORS(NextResponse.json({
        success: true,
        orders: cleanedOrders
      }))
    }

    // Route not found
    return handleCORS(NextResponse.json(
      { success: false, error: `Route ${route} not found` },
      { status: 404 }
    ))

  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    ))
  }
}

// Export all HTTP methods
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute