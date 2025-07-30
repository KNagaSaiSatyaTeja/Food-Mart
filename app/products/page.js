'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { ShoppingCart, Search, Filter, Star, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

const ProductsPage = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [priceRange, setPriceRange] = useState([0, 50])
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sortBy, setSortBy] = useState('name')
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 })
  const [user, setUser] = useState(null)
  const [cartItems, setCartItems] = useState([])
  
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get user and cart from localStorage
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    
    const savedCart = localStorage.getItem('cartItems')
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }

    // Get URL parameters
    const categoryParam = searchParams.get('category')
    const searchParam = searchParams.get('search')
    
    if (categoryParam) setSelectedCategory(categoryParam)
    if (searchParam) setSearchTerm(searchParam)

    fetchCategories()
    fetchProducts()
  }, [searchParams])

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory, priceRange, inStockOnly, sortBy, pagination.page])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.append('category', selectedCategory)
      if (searchTerm) params.append('search', searchTerm)
      params.append('minPrice', priceRange[0].toString())
      params.append('maxPrice', priceRange[1].toString())
      if (inStockOnly) params.append('inStock', 'true')
      params.append('page', pagination.page.toString())

      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()
      
      if (data.success) {
        let sortedProducts = [...data.products]
        
        // Apply sorting
        switch (sortBy) {
          case 'price-asc':
            sortedProducts.sort((a, b) => a.price - b.price)
            break
          case 'price-desc':
            sortedProducts.sort((a, b) => b.price - a.price)
            break
          case 'rating':
            sortedProducts.sort((a, b) => b.rating - a.rating)
            break
          case 'name':
          default:
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name))
            break
        }
        
        setProducts(sortedProducts)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchProducts()
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

  const clearFilters = () => {
    setSelectedCategory('')
    setSearchTerm('')
    setPriceRange([0, 50])
    setInStockOnly(false)
    setSortBy('name')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const isFiltered = selectedCategory || searchTerm || priceRange[0] > 0 || priceRange[1] < 50 || inStockOnly

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Products</h1>
            </div>

            <div className="flex items-center space-x-4">
              {user && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/cart">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Cart ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h2 className="text-lg font-semibold flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </h2>
                {isFiltered && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Search Products
                  </label>
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10"
                      />
                      <Button 
                        type="submit" 
                        size="sm" 
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 px-2"
                      >
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Category
                  </label>
                  <Select value={selectedCategory || "all"} onValueChange={(value) => setSelectedCategory(value === "all" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.slug}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={100}
                    min={0}
                    step={1}
                    className="mt-2"
                  />
                </div>

                {/* In Stock Only */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inStock"
                    checked={inStockOnly}
                    onCheckedChange={setInStockOnly}
                  />
                  <label htmlFor="inStock" className="text-sm font-medium text-foreground">
                    In Stock Only
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <p className="text-muted-foreground">
                  {isLoading ? 'Loading...' : `${pagination.total} products found`}
                </p>
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                  <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="p-0">
                      <div className="w-full h-48 bg-muted rounded-t-lg"></div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3 mb-2"></div>
                      <div className="h-6 bg-muted rounded w-1/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground mb-4">No products found</p>
                <p className="text-muted-foreground mb-6">Try adjusting your filters or search terms</p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card key={product.id} className="group hover:shadow-lg transition-all duration-300">
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
                          {!product.inStock && (
                            <Badge variant="secondary" className="absolute top-2 right-2">
                              Out of Stock
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        
                        <div className="flex items-center mb-3">
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

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-8">
                    <Button
                      variant="outline"
                      disabled={pagination.page === 1}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                      Previous
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {[...Array(pagination.pages)].map((_, i) => {
                        const page = i + 1
                        return (
                          <Button
                            key={page}
                            variant={pagination.page === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPagination(prev => ({ ...prev, page }))}
                          >
                            {page}
                          </Button>
                        )
                      })}
                    </div>

                    <Button
                      variant="outline"
                      disabled={pagination.page === pagination.pages}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductsPage