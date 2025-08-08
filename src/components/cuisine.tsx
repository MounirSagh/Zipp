"use client"

import { useEffect, useState } from "react"
import { Clock, ChefHat } from "lucide-react"
import { useUser } from "@clerk/clerk-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"

function CuisinePanel() {
  const [confirmedOrders, setConfirmedOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { isSignedIn, user } = useUser()

  const fetchConfirmedOrders = async () => {
    try {
      setLoading(true)
      if (!user?.id) {
        console.warn("User ID not available for fetching orders.")
        setConfirmedOrders([])
        return
      }
      const response = await fetch(`https://zipp-backend.vercel.app/api/orders/${user.id}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      const confirmed = data.filter((order: any) => order.status === "confirmed")
      setConfirmedOrders(confirmed)
    } catch (err: any) {
      console.error("Error fetching orders:", err.message)
      setConfirmedOrders([])
    } finally {
      setLoading(false)
    }
  }

  const getTimeSinceOrder = (orderDate: string) => {
    const now = new Date()
    const orderTime = new Date(orderDate)
    const diff = now.getTime() - orderTime.getTime()
    const diffInMinutes = Math.floor(diff / 60000)
    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    const hours = Math.floor(diffInMinutes / 60)
    return `${hours}h ${diffInMinutes % 60}m`
  }

  const getUrgencyLevel = (orderDate: string) => {
    const now = new Date()
    const orderTime = new Date(orderDate)
    const diffInMinutes = Math.floor((now.getTime() - orderTime.getTime()) / 60000)
    if (diffInMinutes > 30) return "critical"
    if (diffInMinutes > 15) return "warning"
    return "normal"
  }

  const updateOrderStatus = async (id: number, status: string) => {
    try {
      const response = await fetch("https://zipp-backend.vercel.app/api/orders/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      })
      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.statusText}`)
      }
    } catch (err) {
      console.error("Failed to update order status", err)
    }
  }

  const sendSMS = async (to: string, message: string) => {
    try {
      const response = await fetch("https://zipp-backend.vercel.app/api/sms/send-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to, text: message }),
      })
      if (!response.ok) {
        throw new Error(`Failed to send SMS: ${response.statusText}`)
      }
    } catch (error) {
      console.error("SMS sending failed", error)
    }
  }

  const handleReady = async (orderId: number, phone: string) => {
    await updateOrderStatus(orderId, "ready")
    await sendSMS(phone, `Your order #${orderId} is ready for pickup! 🍽️`)
    fetchConfirmedOrders()
  }

  useEffect(() => {
    if (isSignedIn && user?.id) {
      fetchConfirmedOrders()
    }
    const interval = setInterval(fetchConfirmedOrders, 30000)
    return () => clearInterval(interval)
  }, [isSignedIn, user?.id])

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8 rounded-lg shadow-sm bg-white">
          <h2 className="text-2xl font-light text-gray-700 mb-2">Sign In Required</h2>
          <p className="text-gray-500 font-light">Please sign in to view the kitchen panel.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-light text-black mb-2">Kitchen</h1>
          <p className="text-gray-600 text-lg">Ready to prepare delicious meals</p>
          <div className="flex items-center space-x-10 mt-6">
            {" "}
            {/* Adjusted spacing */}
            <div className="text-center">
              <div className="text-5xl font-extralight text-black">{confirmedOrders.length}</div>
              <div className="text-sm text-gray-600 font-light mt-1">orders</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-extralight text-black">
                {confirmedOrders.reduce(
                  (acc, order) => acc + order.orderItems.reduce((sum: number, item: any) => sum + item.quantity, 0),
                  0,
                )}
              </div>
              <div className="text-sm text-gray-600 font-light mt-1">items</div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-12">
        {" "}
        {/* Adjusted max-width and padding */}
        {confirmedOrders.length === 0 ? (
          <div className="text-center py-20">
            {" "}
            {/* Adjusted padding */}
            <ChefHat className="w-20 h-20 text-gray-200 mx-auto mb-8" />
            <h2 className="text-2xl font-light text-black mb-2">All caught up</h2> {/* Adjusted font */}
            <p className="text-gray-600">New orders will appear here automatically</p> {/* Adjusted font */}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {confirmedOrders.map((order: any) => {
              const urgency = getUrgencyLevel(order.orderDate)
              const urgencyBorderClass =
                urgency === "critical"
                  ? "border-red-400"
                  : urgency === "warning"
                    ? "border-amber-400"
                    : "border-gray-200"
              return (
                <Card
                  key={order.id}
                  className={`relative overflow-hidden rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 ${urgencyBorderClass}`} // Added border and shadow classes from admin.tsx
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-medium text-black">Order #{order.id}</div>
                      <div
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                          urgency === "critical"
                            ? "bg-red-50 text-red-700 border-red-200" // Matched admin.tsx badge style
                            : urgency === "warning"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200" // Matched admin.tsx badge style
                              : "bg-gray-50 text-gray-700 border-gray-200" // Matched admin.tsx badge style
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{getTimeSinceOrder(order.orderTime)}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2 pb-4">
                    <div className="space-y-2">
                      {order.orderItems.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-base">
                          <div className="font-medium text-black">{item.name}</div> {/* Matched admin.tsx item font */}
                          <div className="text-gray-600">x{item.quantity}</div> {/* Matched admin.tsx quantity font */}
                        </div>
                      ))}
                    </div>
                    {order.specialInstructions && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="bg-gray-100 border border-gray-200 rounded-xl p-4">
                          {" "}
                          {/* Matched admin.tsx instructions style */}
                          <p className="text-gray-800 text-sm">
                            <span className="font-medium">Instructions:</span> {order.specialInstructions}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button
                      onClick={() => handleReady(order.id, order.phoneNumber)}
                      className="w-full bg-black text-white hover:bg-gray-800 rounded-full px-6 py-2 font-medium transition-colors" // Matched admin.tsx button style
                    >
                      Mark as Ready
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default CuisinePanel
