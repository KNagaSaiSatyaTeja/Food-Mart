'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ShoppingCart, Search, User, Menu, X, Sun, Moon, Star } from 'lucide-react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'

const HomePage = () => {
  const [user, setUser] = useState(null)
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    
    // Get cart items from localStorage
    const savedCart = localStorage.getItem('cartItems')
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }
    
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/products/featured')
      const data = await response.json()
      if (data.success) {
        setFeaturedProducts(data.products)
      }
    } catch (error) {
      console.error('Error fetching featured products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  const handleAddToCart = (product) => {
    if (!user) {
      toast.error('Please login to add items to cart')
      router.push('/login')
      return
    }
    
    const updatedCart = [...cartItems]
    const existingItem = updatedCart.find(item => item.id === product.id)
    
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      updatedCart.push({ ...product, quantity: 1 })
    }
    
    setCartItems(updatedCart)
    localStorage.setItem('cartItems', JSON.stringify(updatedCart))
    toast.success(`${product.name} added to cart!`)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('cartItems')
    setUser(null)
    setCartItems([])
    toast.success('Logged out successfully')
  }

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-primary">Food Mart</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/products" className="text-foreground hover:text-primary transition-colors">
                Products
              </Link>
              {user ? (
                <>
                  <Link href="/cart" className="text-foreground hover:text-primary transition-colors">
                    Cart ({cartItemCount})
                  </Link>
                  <Link href="/orders" className="text-foreground hover:text-primary transition-colors">
                    Orders
                  </Link>
                </>
              ) : null}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </Button>
              
              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Hi, {user.name}</span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/login">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t">
              <nav className="flex flex-col space-y-2 pt-4">
                <Link href="/" className="text-foreground hover:text-primary py-2">Home</Link>
                <Link href="/products" className="text-foreground hover:text-primary py-2">Products</Link>
                {user ? (
                  <>
                    <Link href="/cart" className="text-foreground hover:text-primary py-2">
                      Cart ({cartItemCount})
                    </Link>
                    <Link href="/orders" className="text-foreground hover:text-primary py-2">Orders</Link>
                    <button onClick={handleLogout} className="text-left text-foreground hover:text-primary py-2">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-foreground hover:text-primary py-2">Login</Link>
                    <Link href="/login" className="text-foreground hover:text-primary py-2">Sign Up</Link>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Fresh Groceries
            <span className="block text-primary">Delivered Fast</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Shop the finest selection of fresh produce, dairy, snacks, and household essentials. 
            Quality guaranteed, convenience delivered.
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Button type="submit" size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                Search
              </Button>
            </div>
          </form>

          <Button size="lg" asChild>
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Featured Products</h2>
            <p className="text-muted-foreground">Discover our handpicked selection of quality products</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="w-full h-48 bg-muted rounded-lg"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-2/3 mb-2"></div>
                    <div className="h-6 bg-muted rounded w-1/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                  <CardHeader className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.discount > 0 && (
                        <Badge className="absolute top-2 left-2 bg-red-500">
                          {product.discount}% OFF
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.rating) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({product.rating})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-primary">
                          ${product.price}
                        </span>
                        {product.originalPrice > product.price && (
                          <span className="text-sm text-muted-foreground line-through">
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.inStock}
                      >
                        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link href="/products">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Shop by Category</h2>
            <p className="text-muted-foreground">Find everything you need in our organized sections</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Fresh Fruits', image: 'https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHw0fHxmb29kJTIwcHJvZHVjdHN8ZW58MHx8fHwxNzUzODAyOTQ0fDA&ixlib=rb-4.1.0&q=85', category: 'fruits' },
              { name: 'Fresh Vegetables', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHw0fHxncm9jZXJpZXN8ZW58MHx8fHwxNzUzODUzNTI0fDA&ixlib=rb-4.1.0&q=85', category: 'vegetables' },
              { name: 'Dairy & Eggs', image: 'https://images.unsplash.com/photo-1587790032594-babe1292cede?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwxfHxmb29kJTIwcHJvZHVjdHN8ZW58MHx8fHwxNzUzODAyOTQ0fDA&ixlib=rb-4.1.0&q=85', category: 'dairy' },
              { name: 'Snacks & Beverages', image: 'https://images.unsplash.com/photo-1584473457406-6240486418e9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwzfHxmb29kJTIwcHJvZHVjdHN8ZW58MHx8fHwxNzUzODAyOTQ0fDA&ixlib=rb-4.1.0&q=85', category: 'snacks' }
            ].map((category) => (
              <Link 
                key={category.category} 
                href={`/products?category=${category.category}`}
                className="group"
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden">
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="font-medium text-foreground">{category.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-2xl font-bold text-primary">Food Mart</span>
              </div>
              <p className="text-muted-foreground">
                Your trusted partner for fresh groceries and household essentials.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/products" className="text-muted-foreground hover:text-primary">All Products</Link></li>
                <li><Link href="/products?category=fruits" className="text-muted-foreground hover:text-primary">Fruits</Link></li>
                <li><Link href="/products?category=vegetables" className="text-muted-foreground hover:text-primary">Vegetables</Link></li>
                <li><Link href="/products?category=dairy" className="text-muted-foreground hover:text-primary">Dairy</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Customer Service</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary">Help Center</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Contact Us</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Return Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Shipping Info</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Connect</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary">Facebook</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Twitter</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Instagram</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Newsletter</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center">
            <p className="text-muted-foreground">
              © 2024 Food Mart. All rights reserved. Built with Next.js and MongoDB.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage