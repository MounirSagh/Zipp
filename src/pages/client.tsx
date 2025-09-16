// src/pages/RestaurantPage.tsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

function fromCode(code: string) {
  const b64 = code.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "===".slice((b64.length + 3) % 4);
  return atob(padded);
}

/** --- Types --- */
type MenuItem = {
  id: number;
  name: string;
  description?: string;
  price: string;
  imageUrl?: string;
  isAvailable: boolean;
  ingredients?: string;
};

type MenuCategory = {
  id: number;
  name: string;
  description?: string;
  items: MenuItem[];
};

type CartItem = MenuItem & {
  quantity: number;
};

type CustomerInfo = {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  specialInstructions: string;
  location: string;
  table: string;
};

type ApiResp<T> = { success: boolean; data: T; error?: string };

export default function RestaurantPage() {
  const { code = "" } = useParams();
  const [menu, setMenu] = useState<MenuCategory[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    phoneNumber: "",
    firstName: "",
    lastName: "",
    specialInstructions: "",
    location: "Dine-in",
    table: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    async function fetchMenu() {
      try {
        setLoading(true);
        setError(null);

        const restaurantId = fromCode(code); // decode icode → restaurantId
        console.log(restaurantId);
        const response = await fetch(
          `https://zipp-backend.vercel.app/api/menu/${restaurantId}`
        );
        const json = (await response.json()) as ApiResp<MenuCategory[]>;

        if (!json.success) throw new Error(json.error || "Failed to fetch menu");
        setMenu(json.data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Network error while fetching menu");
      } finally {
        setLoading(false);
      }
    }
    if (code) fetchMenu();
  }, [code]);

  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + parseFloat(item.price) * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleSubmitOrder = async () => {
    if (!customerInfo.phoneNumber || cart.length === 0) {
      alert("Please fill in your phone number and add items to your cart");
      return;
    }

    setIsSubmitting(true);
    try {
      const restaurantId = fromCode(code);
      const orderItems = cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        quantity: item.quantity,
      }));

      const response = await fetch("https://zipp-backend.vercel.app/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId,
          phoneNumber: customerInfo.phoneNumber,
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          orderItems,
          totalAmount: getTotalPrice(),
          specialInstructions: customerInfo.specialInstructions,
          location: customerInfo.location,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setOrderSuccess(true);
        setCart([]);
        setCustomerInfo({
          phoneNumber: "",
          firstName: "",
          lastName: "",
          specialInstructions: "",
          location: "Dine-in",
          table: ""
        });
        setIsCheckoutOpen(false);
      } else {
        throw new Error(result.error || "Failed to submit order");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to submit order");
    } finally {
      setIsSubmitting(false);
    }
  };

  /** --- Render --- */
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Loading menu…</div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-red-600 text-lg">{error}</div>
    </div>
  );
  
  if (!menu || menu.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">No menu found.</div>
      </div>
    );

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-green-600 mb-2">Order Submitted!</h1>
          <p className="text-gray-600 mb-4">
            Thank you for your order. The restaurant will contact you shortly with confirmation and preparation details.
          </p>
          <Button onClick={() => setOrderSuccess(false)} className="w-full">
            Order Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Restaurant Menu</h1>
          <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="relative">
                🛒 Cart
                {getTotalItems() > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 min-w-[20px] h-5 text-xs">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Your Order</DialogTitle>
              </DialogHeader>
              
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Your cart is empty</p>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">{parseFloat(item.price).toFixed(2)} MAD each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span>{getTotalPrice().toFixed(2)} $</span>
                    </div>
                  </div>
                  
                  <Button
                    className="w-full"
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Menu */}
      <div className="container mx-auto px-4 py-8">
        {menu.map((category) => (
          <section key={category.id} className="mb-12">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{category.name}</h2>
              {category.description && (
                <p className="text-gray-600">{category.description}</p>
              )}
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {category.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
                >
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <span className="font-bold text-lg text-green-600">
                        {parseFloat(item.price).toFixed(2)} MAD
                      </span>
                    </div>
                    
                    {item.description && (
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    )}
                    
                    {item.ingredients && (
                      <p className="text-gray-500 text-xs">{item.ingredients}</p>
                    )}
                    
                    <Button
                      className="w-full mt-3"
                      onClick={() => addToCart(item)}
                      disabled={!item.isAvailable}
                    >
                      {item.isAvailable ? "Add to Cart" : "Not Available"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number *</label>
              <Input
                type="tel"
                value={customerInfo.phoneNumber}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, phoneNumber: e.target.value }))}
                placeholder="Enter your phone number"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <Input
                  value={customerInfo.firstName}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <Input
                  value={customerInfo.lastName}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Last name"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Table</label>
              <Input
                value={customerInfo.table}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, table: e.target.value }))}
                placeholder="Enter delivery address"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Special Instructions</label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={3}
                value={customerInfo.specialInstructions}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, specialInstructions: e.target.value }))}
                placeholder="Any special requests or dietary requirements..."
              />
            </div>
            
            <div className="border-t pt-4">
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.name}</span>
                    <span>{(parseFloat(item.price) * item.quantity).toFixed(2)} MAD</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{getTotalPrice().toFixed(2)} MAD</span>
                </div>
              </div>
            </div>
            
            <Button
              className="w-full"
              onClick={handleSubmitOrder}
              disabled={isSubmitting || !customerInfo.phoneNumber || cart.length === 0}
            >
              {isSubmitting ? "Submitting..." : "Submit Order"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}