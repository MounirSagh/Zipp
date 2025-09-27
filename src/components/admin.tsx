"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Volume2, VolumeX } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import {
  NotificationSound,
  requestNotificationPermission,
  showBrowserNotification,
} from "@/utils/notifications";

function Admin() {
  const [orders, setOrders] = useState<any[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [rejectingOrderId, setRejectingOrderId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasNotificationPermission, setHasNotificationPermission] =
    useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [newOrderIds, setNewOrderIds] = useState<Set<number>>(new Set());
  const { isSignedIn, user } = useUser();

  // Refs for notification functionality
  const notificationSound = useRef<NotificationSound | null>(null);
  const previousOrdersRef: any = useRef<Set<number>>(new Set());
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchOrders = async (showNotification = false) => {
    try {
      if (showNotification) {
        setIsPolling(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(
        `https://zipp-backend.vercel.app/api/orders/${user?.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      // Check for new orders if this is not the initial load
      if (showNotification && data.length > 0) {
        const currentOrderIds = new Set(
          data.map((order: any) => Number(order.id))
        );
        const previousOrderIds = previousOrdersRef.current;

        // Find new orders by comparing with previous order IDs
        const newOrders = data.filter(
          (order: any) =>
            !previousOrderIds.has(Number(order.id)) &&
            order.status.toLowerCase() === "pending"
        );

        if (newOrders.length > 0) {
          console.log(
            `🔔 ${newOrders.length} new order(s) detected!`,
            newOrders
          );

          // Highlight new orders for 10 seconds
          const newOrdersSet = new Set<number>(
            newOrders.map((order: any) => Number(order.id))
          );
          setNewOrderIds(newOrdersSet);

          // Clear highlights after 10 seconds
          setTimeout(() => {
            setNewOrderIds(new Set());
          }, 30000);

          // Play notification sound immediately
          if (soundEnabled && notificationSound.current) {
            try {
              notificationSound.current.playNotificationSound();
              console.log("🔊 Notification sound played");
            } catch (error) {
              console.error("Failed to play notification sound:", error);
            }
          }

          // Show browser notification
          if (hasNotificationPermission) {
            const orderText =
              newOrders.length === 1
                ? `New order #${newOrders[0].id} from ${newOrders[0].firstName} ${newOrders[0].lastName} - $${newOrders[0].totalAmount}`
                : `${newOrders.length} new orders received`;

            try {
              showBrowserNotification("🍽️ New Order Alert!", orderText, {
                requireInteraction: false,
                silent: false,
                icon: "/zap.svg",
              });
              console.log("📢 Browser notification sent");
            } catch (error) {
              console.error("Failed to show browser notification:", error);
            }
          }
        }

        // Update the previous orders reference
        previousOrdersRef.current = currentOrderIds;
      } else if (!showNotification) {
        // Initial load - just set the previous orders without notification
        previousOrdersRef.current = new Set(
          data.map((order: any) => Number(order.id))
        );
      }

      setOrders(data);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      // Don't show alert during automatic polling, only during manual refresh
      if (!showNotification) {
        alert("Error fetching orders: " + err.message);
      }
    } finally {
      setLoading(false);
      setIsPolling(false);
    }
  };

  const sendSMS = async (to: string, message: string) => {
    try {
      await fetch("https://zipp-backend.vercel.app/api/sms/send-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to, text: message }),
      });
    } catch (error) {
      console.error("SMS sending failed", error);
    }
  };

  const updateOrderStatus = async (id: number, status: string) => {
    try {
      await fetch("https://zipp-backend.vercel.app/api/orders/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      });
    } catch (err) {
      console.error("Failed to update order status", err);
    }
  };

  const handleConfirm = async (orderId: number, phone: string) => {
    await updateOrderStatus(orderId, "Confirmed");
    await sendSMS(phone, `Your order #${orderId} has been confirmed! ✅`);
    fetchOrders();
  };

  const handleReject = async (orderId: number, phone: string) => {
    await updateOrderStatus(orderId, "Rejected");
    await sendSMS(
      phone,
      `Unfortunately, your order has been rejected. ${
        rejectionReason ? "Reason: " + rejectionReason : ""
      } ❌`
    );
    alert(`Order ${orderId} rejected.`);
    setRejectingOrderId(null);
    setRejectionReason("");
    fetchOrders();
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-100";
      case "confirmed":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "ready":
        return "bg-green-50 text-green-700 border-green-100";
      case "completed":
        return "bg-gray-50 text-gray-700 border-gray-100";
      case "rejected":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Initialize notification system
  useEffect(() => {
    // Initialize notification sound
    notificationSound.current = new NotificationSound();

    // Request browser notification permission
    const setupNotifications = async () => {
      const hasPermission = await requestNotificationPermission();
      setHasNotificationPermission(hasPermission);
    };

    setupNotifications();

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Handle orders fetching and polling
  useEffect(() => {
    if (isSignedIn && user?.id) {
      // Initial fetch
      fetchOrders(false);

      // Set up polling for new orders every 10 seconds for faster response
      pollingIntervalRef.current = setInterval(() => {
        fetchOrders(true);
      }, 30000); // 10 seconds - more responsive

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [isSignedIn, user]);

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8 rounded-lg shadow-sm bg-white">
          <h2 className="text-2xl font-light text-gray-700 mb-2">
            Sign In Required
          </h2>
          <p className="text-gray-500 font-light">
            Please sign in to view the admin panel.
          </p>
        </div>
      </div>
    );
  }

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-light text-black mb-2">Orders</h1>
              <p className="text-gray-600 text-lg">
                Manage your restaurant orders
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchOrders(true)}
                className="flex items-center space-x-2 hover:bg-blue-50 border-blue-200 text-blue-700"
                disabled={loading}
              >
                <span>🔄</span>
                <span>Refresh</span>
              </Button>
              <div className="flex items-center space-x-2">
                {/* <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (soundEnabled && notificationSound.current) {
                      notificationSound.current.playNotificationSound();
                    }
                  }}
                  className="flex items-center space-x-1 hover:bg-blue-50 border-blue-200 text-blue-700 text-xs px-2 py-1"
                  disabled={!soundEnabled}
                >
                  🔊 Test
                </Button> */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`flex items-center space-x-2 ${
                    soundEnabled
                      ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                      : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                  <span>{soundEnabled ? "Sound On" : "Sound Off"}</span>
                </Button>
              </div>
              {/* <div className="text-right">
                <div className="text-sm text-gray-500 flex items-center space-x-2">
                  <span>
                    {hasNotificationPermission
                      ? "🔔 Notifications enabled"
                      : "🔕 Enable notifications"}
                  </span>
                  {isPolling && (
                    <span className="inline-flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                      <span className="text-xs text-green-600">
                        Checking...
                      </span>
                    </span>
                  )}
                </div>
                {lastUpdated && (
                  <div className="text-xs text-gray-400">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </div>
                )}
                <div className="text-xs text-blue-600 mt-1">
                  🔄 Auto-refresh every 10s
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-12">
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-2xl font-normal text-gray-800 mb-2">
              No orders yet
            </h3>
            <p className="text-gray-500">
              New orders will appear here when customers place them.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-100 hover:bg-transparent">
                  <TableHead className="font-semibold text-gray-600 py-4 px-6">
                    Full Name
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 py-4 px-6">
                    Phone
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 py-4">
                    Date
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 py-4">
                    Total
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 py-4">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 py-4">
                    Location
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 py-4">
                    Table
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 py-4"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order, index) => (
                  <React.Fragment key={order.id}>
                    <TableRow
                      className={`border-b border-gray-50 hover:bg-gray-50 transition-all duration-500 ${
                        index === orders.length - 1 &&
                        expandedOrderId !== order.id
                          ? "border-b-0"
                          : ""
                      } ${
                        newOrderIds.has(Number(order.id))
                          ? "bg-gradient-to-r from-green-50 to-blue-50 border-green-200 shadow-md animate-pulse"
                          : ""
                      }`}
                    >
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-800 font-semibold">
                            {order.firstName} {order.lastName}
                          </span>
                          {newOrderIds.has(Number(order.id)) && (
                            <Badge className="bg-green-500 text-white text-xs px-2 py-1 animate-bounce">
                              NEW!
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <span className="text-gray-800 font-semibold">
                          {order.phoneNumber}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-gray-500">
                          {new Date(order.orderDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-gray-800 font-semibold">
                          {order.totalAmount} MAD
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          className={`${getStatusStyle(
                            order.status
                          )} border font-medium px-3 py-1 rounded-full text-sm capitalize`}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-gray-800 font-semibold">
                          {order.location}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-gray-800 font-semibold">
                          {order.table}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setExpandedOrderId(
                              expandedOrderId === order.id ? null : order.id
                            )
                          }
                          className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 font-medium px-4"
                        >
                          {expandedOrderId === order.id ? (
                            <>
                              Hide <ChevronUp className="ml-1 w-4 h-4" />
                            </>
                          ) : (
                            <>
                              Details <ChevronDown className="ml-1 w-4 h-4" />
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedOrderId === order.id && (
                      <TableRow className="border-b border-gray-50">
                        <TableCell colSpan={5} className="py-0">
                          <div className="bg-gray-50/30 px-6 py-8 space-y-8">
                            <div>
                              <h4 className="text-lg font-medium text-black mb-4">
                                Items
                              </h4>
                              <div className="space-y-3">
                                {order.orderItems?.map(
                                  (item: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0"
                                    >
                                      <span className="text-black">
                                        {item.name}
                                      </span>
                                      <div className="flex items-center space-x-4 text-gray-500">
                                        <span>{item.price} MAD</span>
                                        <span>×</span>
                                        <span>{item.quantity}</span>
                                        <span className="text-gray-800 font-semibold min-w-[80px] text-right">
                                          {(item.price * item.quantity).toFixed(
                                            2
                                          )}{" "}
                                          MAD
                                        </span>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>

                            {order.specialInstructions && (
                              <div>
                                <h4 className="text-lg font-medium text-black mb-3">
                                  Special Instructions
                                </h4>
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                                  <p className="text-blue-800">
                                    {order.specialInstructions}
                                  </p>
                                </div>
                              </div>
                            )}
                            <div className="flex space-x-3 pt-4">
                              <Button
                                onClick={() =>
                                  handleConfirm(order.id, order.phoneNumber)
                                }
                                disabled={
                                  order.status.toLowerCase() === "ready"
                                }
                                className={`bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-6 py-2 font-medium transition-colors ${
                                  order.status.toLowerCase() === "ready"
                                    ? "opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400"
                                    : ""
                                }`}
                              >
                                Confirm
                              </Button>
                              <Dialog
                                open={rejectingOrderId === order.id}
                                onOpenChange={(open) =>
                                  setRejectingOrderId(open ? order.id : null)
                                }
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    disabled={
                                      order.status.toLowerCase() === "ready"
                                    }
                                    className={`border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-lg px-6 py-2 font-medium transition-colors bg-transparent ${
                                      order.status.toLowerCase() === "ready"
                                        ? "opacity-50 cursor-not-allowed border-gray-300 text-gray-400 hover:bg-transparent hover:border-gray-300"
                                        : ""
                                    }`}
                                  >
                                    Reject
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl">
                                  <DialogHeader className="pb-6">
                                    <DialogTitle className="text-xl font-medium text-black">
                                      Reject Order #{order.id}
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-6">
                                    <p className="text-gray-600">
                                      Why are you rejecting this order?
                                    </p>
                                    <textarea
                                      placeholder="Optional reason..."
                                      value={rejectionReason}
                                      onChange={(e) =>
                                        setRejectionReason(e.target.value)
                                      }
                                      className="w-full h-24 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-black placeholder-gray-400 bg-white"
                                    />
                                    <div className="flex justify-end space-x-3 pt-2">
                                      <Button
                                        variant="outline"
                                        onClick={() => {
                                          setRejectingOrderId(null);
                                          setRejectionReason("");
                                        }}
                                        className="rounded-full px-6 py-2 font-medium border-gray-200 text-gray-600 hover:bg-gray-50"
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        onClick={() =>
                                          handleReject(
                                            order.id,
                                            order.phoneNumber
                                          )
                                        }
                                        className="bg-red-600 text-white hover:bg-red-700 rounded-full px-6 py-2 font-medium transition-colors"
                                      >
                                        Reject Order
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
