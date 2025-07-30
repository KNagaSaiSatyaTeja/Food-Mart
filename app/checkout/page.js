'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreditCard, ShoppingCart, ArrowLeft, CheckCircle, MapPin, Truck, Lock } from 'lucide-react'
import { toast } from 'sonner'

const CheckoutPage = () => {
  const [user, setUser] = useState(null)
  const [cartItems, setCartItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderId, setOrderId] = useState('')
  
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  })
  
  const [paymentMethod, setPaymentMethod] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  })

  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      toast.error('Please login to checkout')
      router.push('/login')
      return
    }

    const user = JSON.parse(userData)
    setUser(user)
    
    // Pre-fill shipping address with user data
    setShippingAddress(prev => ({
      ...prev,
      fullName: user.name,
      email: user.email
    }))
    
    const savedCart = localStorage.getItem('cartItems')
    if (!savedCart || JSON.parse(savedCart).length === 0) {
      toast.error('Your cart is empty')
      router.push('/cart')
      return
    }
    
    setCartItems(JSON.parse(savedCart))
    setIsLoading(false)
  }, [router])

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const calculateSavings = () => {
    return cartItems.reduce((total, item) => {
      if (item.originalPrice > item.price) {
        return total + ((item.originalPrice - item.price) * item.quantity)
      }
      return total
    }, 0)
  }

  const subtotal = calculateSubtotal()
  const savings = calculateSavings()
  const shipping = subtotal > 50 ? 0 : 5.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const handleShippingChange = (field, value) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }))
  }

  const handlePaymentChange = (field, value) => {
    setPaymentMethod(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'zipCode']
    const missingFields = requiredFields.filter(field => !shippingAddress[field])
    
    if (missingFields.length > 0) {
      toast.error('Please fill in all shipping address fields')
      return false
    }

    if (!paymentMethod.cardNumber || !paymentMethod.expiryDate || !paymentMethod.cvv || !paymentMethod.cardholderName) {
      toast.error('Please fill in all payment details')
      return false
    }

    return true
  }

  const handlePlaceOrder = async () => {
    if (!validateForm()) return

    setIsProcessing(true)

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      const token = localStorage.getItem('token')
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cartItems,
          total: total,
          shippingAddress: shippingAddress
        })
      })

      const data = await response.json()

      if (data.success) {
        setOrderId(data.order.id)
        setOrderComplete(true)
        localStorage.removeItem('cartItems')
        toast.success('Order placed successfully!')
      } else {
        toast.error(data.error || 'Failed to place order')
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
      console.error('Order error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Order Confirmed!</h2>
            <p className="text-muted-foreground mb-4">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
            <div className="bg-muted p-4 rounded-lg mb-6">
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="font-mono text-lg font-semibold">{orderId}</p>
            </div>
            <div className="space-y-2">
              <Button className="w-full" asChild>
                <Link href="/orders">View My Orders</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/cart">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Cart
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-foreground flex items-center">
                <CreditCard className="w-6 h-6 mr-2" />
                Checkout
              </h1>
            </div>

            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4" />
              Secure Checkout
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Shipping Address
                </CardTitle>
                <CardDescription>
                  Enter the address where you want your order delivered
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={shippingAddress.fullName}
                      onChange={(e) => handleShippingChange('fullName', e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingAddress.email}
                      onChange={(e) => handleShippingChange('email', e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={shippingAddress.phone}
                    onChange={(e) => handleShippingChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Textarea
                    id="address"
                    value={shippingAddress.address}
                    onChange={(e) => handleShippingChange('address', e.target.value)}
                    placeholder="Enter your street address"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) => handleShippingChange('city', e.target.value)}
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={shippingAddress.state}
                      onChange={(e) => handleShippingChange('state', e.target.value)}
                      placeholder="Enter state"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={shippingAddress.zipCode}
                      onChange={(e) => handleShippingChange('zipCode', e.target.value)}
                      placeholder="Enter ZIP code"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Method
                </CardTitle>
                <CardDescription>
                  Enter your payment details (This is a demo - no real charges will be made)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    value={paymentMethod.cardholderName}
                    onChange={(e) => handlePaymentChange('cardholderName', e.target.value)}
                    placeholder="Name as it appears on card"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    value={paymentMethod.cardNumber}
                    onChange={(e) => handlePaymentChange('cardNumber', e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      value={paymentMethod.expiryDate}
                      onChange={(e) => handlePaymentChange('expiryDate', e.target.value)}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      value={paymentMethod.cvv}
                      onChange={(e) => handlePaymentChange('cvv', e.target.value)}
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Demo Mode:</strong> This is a test environment. Use any values for card details. 
                    No real payments will be processed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items Preview */}
                <div className="space-y-3">
                  {cartItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity} × ${item.price}
                        </p>
                      </div>
                      <span className="font-medium text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  
                  {cartItems.length > 3 && (
                    <p className="text-sm text-muted-foreground text-center">
                      ...and {cartItems.length - 3} more items
                    </p>
                  )}
                </div>

                <Separator />

                {/* Order Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items):</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {savings > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Savings:</span>
                      <span>-${savings.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center">
                      <Truck className="w-4 h-4 mr-1" />
                      Shipping:
                    </span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `$${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    `Place Order • $${total.toFixed(2)}`
                  )}
                </Button>

                <div className="text-center text-xs text-muted-foreground">
                  By placing your order, you agree to our Terms of Service and Privacy Policy.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage