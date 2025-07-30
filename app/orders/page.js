'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Package, ArrowLeft, Calendar, MapPin, CreditCard, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

const OrdersPage = () => {
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      toast.error('Please login to view your orders')
      router.push('/login')
      return
    }

    setUser(JSON.parse(userData))
    fetchOrders()
  }, [router])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (data.success) {
        setOrders(data.orders)
      } else {
        toast.error('Failed to load orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-foreground flex items-center">
                <Package className="w-6 h-6 mr-2" />
                My Orders
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={fetchOrders}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              {user && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Hi, {user.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-foreground mb-4">No orders yet</h2>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't placed any orders yet. Start shopping to see your orders here!
            </p>
            <Button asChild>
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Order History</h2>
                <p className="text-muted-foreground">
                  {orders.length} order{orders.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg">
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <Calendar className="w-4 h-4 mr-1" />
                          Placed on {formatDate(order.createdAt)}
                        </CardDescription>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                        <div className="text-right">
                          <div className="font-semibold">
                            ${order.total.toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    {/* Order Items */}
                    <div className="space-y-3 mb-6">
                      <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                        Items Ordered
                      </h4>
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-grow min-w-0">
                              <h4 className="font-medium truncate">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                Qty: {item.quantity} × ${item.price}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="font-medium">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                      <div className="mt-6">
                        <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-3">
                          Shipping Address
                        </h4>
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <MapPin className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                            <div className="text-sm">
                              <div className="font-medium">{order.shippingAddress.fullName}</div>
                              <div>{order.shippingAddress.address}</div>
                              <div>
                                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                              </div>
                              <div className="text-muted-foreground mt-1">
                                {order.shippingAddress.email} • {order.shippingAddress.phone}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Order Actions */}
                    <div className="flex justify-between items-center mt-6 pt-6 border-t">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <CreditCard className="w-4 h-4 mr-1" />
                          {order.paymentStatus === 'paid' ? 'Payment confirmed' : 'Payment pending'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {order.status === 'delivered' && (
                          <Button variant="outline" size="sm">
                            Reorder Items
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrdersPage