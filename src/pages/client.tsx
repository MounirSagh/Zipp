// src/pages/RestaurantPage.tsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingCartIcon } from "lucide-react";

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

        if (!json.success)
          throw new Error(json.error || "Failed to fetch menu");
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
    return cart.reduce(
      (total, item) => total + parseFloat(item.price) * item.quantity,
      0
    );
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

      const response = await fetch(
        "https://zipp-backend.vercel.app/api/orders/create",
        {
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
        }
      );

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
          table: "",
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
  if (loading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-lg sm:text-xl text-orange-400 animate-pulse flex items-center gap-3 font-medium">
          <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
          Loading menu...
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-red-400 text-lg sm:text-xl font-semibold leading-relaxed">
            {error}
          </div>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-black font-semibold tracking-wide"
          >
            Try Again
          </Button>
        </div>
      </div>
    );

  if (!menu || menu.length === 0)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📋</div>
          <div className="text-gray-400 text-lg sm:text-xl font-medium">
            No menu found.
          </div>
        </div>
      </div>
    );

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-black border border-orange-500/30 p-6 sm:p-8 rounded-2xl shadow-2xl text-center max-w-md w-full">
          <div className="text-6xl mb-6 animate-bounce">✅</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-orange-400 mb-4 leading-tight tracking-wide">
            Order Submitted!
          </h1>
          <p className="text-gray-400 mb-6 leading-relaxed text-sm sm:text-base">
            Thank you for your order. The restaurant will contact you shortly
            with confirmation and preparation details.
          </p>
          <Button
            onClick={() => setOrderSuccess(false)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 tracking-wide"
          >
            Order Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-black border-b border-orange-500/30 sticky top-0 z-40 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="text-2xl sm:text-3xl">🍽️</div>
            <h1 className="text-xl sm:text-3xl font-bold text-orange-400 tracking-tight leading-none">
              Restaurant Menu
            </h1>
          </div>
          <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="relative bg-black border-orange-500/60 text-orange-400 hover:bg-orange-500/20 hover:border-orange-400 transition-all duration-200 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base min-h-[44px] shadow-lg hover:shadow-orange-500/20"
              >
                <ShoppingCartIcon />
                <span className="hidden sm:inline ml-1">Cart</span>
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-2 -right-2 min-w-[20px] h-5 text-xs bg-orange-500 text-black border-0 animate-pulse font-bold shadow-lg">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md max-h-[85vh] bg-black border-orange-500/40 text-white rounded-2xl shadow-2xl flex flex-col">
              <DialogHeader className="pb-4 border-b border-zinc-800 flex-shrink-0">
                <DialogTitle className="text-xl sm:text-2xl text-orange-400 font-black tracking-tight">
                  Your Order
                </DialogTitle>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto min-h-0">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3 opacity-50">🛒</div>
                    <p className="text-gray-400 text-sm">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-3 p-1">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-orange-500/30 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-orange-400 text-sm truncate">
                            {item.name}
                          </h4>
                          <p className="text-xs text-gray-400">
                            {parseFloat(item.price).toFixed(2)} $ each
                          </p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 w-8 h-8 min-h-[32px] text-sm"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                          >
                            -
                          </Button>
                          <span className="w-8 text-center font-medium text-orange-400 text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 w-8 h-8 min-h-[32px] text-sm"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            +
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700 w-8 h-8 min-h-[32px] text-sm ml-1"
                            onClick={() => removeFromCart(item.id)}
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-zinc-800 pt-3 mt-3 flex-shrink-0">
                  <div className="flex justify-between items-center text-lg font-bold mb-3">
                    <span className="text-white">Total:</span>
                    <span className="text-orange-400">
                      {getTotalPrice().toFixed(2)} $
                    </span>
                  </div>

                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600 text-black font-black py-4 rounded-xl transition-all duration-200 transform hover:scale-105 min-h-[48px] tracking-wide shadow-lg hover:shadow-orange-500/30"
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
      <div className="container mx-auto px-4 py-6">
        {menu &&
          menu.map((category) => (
            <section key={category.id} className="mb-12">
              <div className="mb-6 text-center">
                <h2 className="text-2xl sm:text-4xl font-black text-orange-400 mb-2 tracking-tight leading-tight">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="text-gray-400 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
                    {category.description}
                  </p>
                )}
                <div className="w-16 sm:w-24 h-1 bg-orange-500 mx-auto mt-3 rounded-full"></div>
              </div>

              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {category.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-orange-500/60 p-4 sm:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 shadow-lg group backdrop-blur-sm"
                  >
                    {item.imageUrl && (
                      <div className="overflow-hidden rounded-lg mb-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-36 sm:h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-black text-lg sm:text-xl text-orange-400 group-hover:text-orange-300 transition-colors leading-tight tracking-tight">
                          {item.name}
                        </h3>
                        <div className="bg-orange-500 text-black font-black px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap tracking-wide">
                          {parseFloat(item.price).toFixed(2)} $
                        </div>
                      </div>

                      {item.description && (
                        <p className="text-gray-400 text-xs sm:text-sm leading-relaxed font-light tracking-wide">
                          {item.description}
                        </p>
                      )}

                      {item.ingredients && (
                        <p className="text-gray-500 text-xs bg-zinc-800 p-2 rounded-md font-light leading-relaxed">
                          <span className="text-orange-400 font-semibold tracking-wide">
                            Ingredients:
                          </span>{" "}
                          {item.ingredients}
                        </p>
                      )}

                      <Button
                        className={`w-full mt-3 py-3 sm:py-4 rounded-xl font-black transition-all duration-200 min-h-[48px] text-sm sm:text-base tracking-wide shadow-lg ${
                          item.isAvailable
                            ? "bg-orange-500 hover:bg-orange-600 text-black transform hover:scale-105 active:scale-95 hover:shadow-orange-500/30"
                            : "bg-zinc-700 text-gray-400 cursor-not-allowed"
                        }`}
                        onClick={() => addToCart(item)}
                        disabled={!item.isAvailable}
                      >
                        {item.isAvailable
                          ? "🛒 Add to Cart"
                          : "❌ Not Available"}
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
        <DialogContent className="w-[95vw] max-w-md max-h-[90vh] bg-black border-orange-500/40 text-white rounded-2xl shadow-2xl flex flex-col">
          <DialogHeader className="pb-4 border-b border-zinc-800 flex-shrink-0">
            <DialogTitle className="text-xl sm:text-2xl text-orange-400 mb-2 font-black tracking-tight">
              Checkout
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="space-y-4 p-1">
              <div>
                <label className="block text-sm font-semibold mb-2 text-orange-400">
                  Phone Number *
                </label>
                <Input
                  type="tel"
                  value={customerInfo.phoneNumber}
                  onChange={(e) =>
                    setCustomerInfo((prev) => ({
                      ...prev,
                      phoneNumber: e.target.value,
                    }))
                  }
                  placeholder="Enter your phone number"
                  className="bg-zinc-900 border-zinc-700 text-white placeholder-gray-500 focus:border-orange-400 focus:ring-orange-400/20 h-12 text-base"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-orange-400">
                    First Name
                  </label>
                  <Input
                    value={customerInfo.firstName}
                    onChange={(e) =>
                      setCustomerInfo((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    placeholder="First name"
                    className="bg-zinc-900 border-zinc-700 text-white placeholder-gray-500 focus:border-orange-400 focus:ring-orange-400/20 h-12 text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-orange-400">
                    Last Name
                  </label>
                  <Input
                    value={customerInfo.lastName}
                    onChange={(e) =>
                      setCustomerInfo((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    placeholder="Last name"
                    className="bg-zinc-900 border-zinc-700 text-white placeholder-gray-500 focus:border-orange-400 focus:ring-orange-400/20 h-12 text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-orange-400">
                  Table
                </label>
                <Input
                  value={customerInfo.table}
                  onChange={(e) =>
                    setCustomerInfo((prev) => ({
                      ...prev,
                      table: e.target.value,
                    }))
                  }
                  placeholder="Table number or delivery address"
                  className="bg-zinc-900 border-zinc-700 text-white placeholder-gray-500 focus:border-orange-400 focus:ring-orange-400/20 h-12 text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-orange-400">
                  Special Instructions
                </label>
                <textarea
                  className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:border-orange-400 focus:ring-orange-400/20 focus:outline-none resize-none text-base min-h-[80px]"
                  rows={3}
                  value={customerInfo.specialInstructions}
                  onChange={(e) =>
                    setCustomerInfo((prev) => ({
                      ...prev,
                      specialInstructions: e.target.value,
                    }))
                  }
                  placeholder="Any special requests or dietary requirements..."
                />
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm bg-zinc-900 p-3 rounded"
                    >
                      <span className="text-gray-400 flex-1 min-w-0 truncate">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="text-orange-400 font-medium ml-2">
                        {(parseFloat(item.price) * item.quantity).toFixed(2)}{" "}
                        $
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-lg border-t border-zinc-800 pt-3">
                    <span className="text-white">Total:</span>
                    <span className="text-orange-400">
                      {getTotalPrice().toFixed(2)} $
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 pt-4">
            <Button
              className={`w-full py-4 rounded-xl font-black transition-all duration-200 min-h-[52px] text-base tracking-wide shadow-lg ${
                isSubmitting || !customerInfo.phoneNumber || cart.length === 0
                  ? "bg-zinc-700 text-gray-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 text-black transform hover:scale-105 active:scale-95 hover:shadow-orange-500/30"
              }`}
              onClick={handleSubmitOrder}
              disabled={
                isSubmitting || !customerInfo.phoneNumber || cart.length === 0
              }
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </div>
              ) : (
                "🚀 Submit Order"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
