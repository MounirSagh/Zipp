import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronDown, ShoppingCartIcon, Trash } from "lucide-react";
import LanguageSelector from "@/components/LanguageSelector";
import Preloader from "@/components/Preloader";
import { AnimatePresence } from "framer-motion";

function fromCode(code: string) {
  const b64 = code.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "===".slice((b64.length + 3) % 4);
  return atob(padded);
}

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
  order?: number;
  items: MenuItem[];
};

type CartItem = MenuItem & {
  quantity: number;
  categoryName: string;
  specialInstructions?: string;
};

type CustomerInfo = {
  specialInstructions: string;
  table: string;
  location: string;
};

type ApiResp<T> = { success: boolean; data: T; error?: string };

export default function RestaurantPage() {
  const { code = "", table = "" } = useParams<{
    code: string;
    table: string;
  }>();
  const { t } = useTranslation();

  const tableNumber = table;
  const [menu, setMenu] = useState<MenuCategory[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemSpecialInstructions, setItemSpecialInstructions] = useState("");
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    specialInstructions: "",
    table: tableNumber,
    location: "dine-in",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>("");

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
        // Set the first category as default selected
        if (json.data.length > 0) {
          const sortedCategories = json.data.sort(
            (a, b) => (a.order || 0) - (b.order || 0)
          );
          setSelectedCategoryTab(sortedCategories[0].id.toString());
        }
        // The preloader will handle its own timing, so we don't set loading to false here
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Network error while fetching menu");
        setLoading(false); // On error, stop loading immediately
      }
    }
    if (code) fetchMenu();
  }, [code]);

  // const addToCart = (item: MenuItem, categoryName: string) => {
  //   setCart((prevCart) => {
  //     const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
  //     if (existingItem) {
  //       return prevCart.map((cartItem) =>
  //         cartItem.id === item.id
  //           ? { ...cartItem, quantity: cartItem.quantity + 1 }
  //           : cartItem
  //       );
  //     } else {
  //       return [...prevCart, { ...item, quantity: 1, categoryName }];
  //     }
  //   });
  // };

  const addToCartWithQuantity = (
    item: MenuItem,
    quantity: number,
    categoryName: string,
    specialInstructions?: string
  ) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (cartItem) =>
          cartItem.id === item.id &&
          cartItem.specialInstructions === specialInstructions
      );
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id &&
          cartItem.specialInstructions === specialInstructions
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        return [
          ...prevCart,
          { ...item, quantity, categoryName, specialInstructions },
        ];
      }
    });
  };

  const openItemModal = (item: MenuItem, categoryName: string) => {
    setSelectedItem(item);
    setSelectedCategory(categoryName);
    setItemQuantity(1);
    setItemSpecialInstructions("");
  };

  const closeItemModal = () => {
    setSelectedItem(null);
    setSelectedCategory("");
    setItemQuantity(1);
    setItemSpecialInstructions("");
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
    if (cart.length === 0) {
      alert(t("checkout.validation.emptyCart"));
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
        category: item.categoryName,
        specialInstructions: item.specialInstructions,
      }));

      // Collect all item-level special instructions
      const allInstructions = cart
        .filter((item) => item.specialInstructions?.trim())
        .map((item) => `${item.name}: ${item.specialInstructions}`)
        .join("; ");

      const orderData = {
        restaurantId,
        phoneNumber: "-",
        firstName: "-",
        lastName: "-",
        orderItems,
        totalAmount: getTotalPrice(),
        specialInstructions: allInstructions || "-",
        location: customerInfo.location,
        table: tableNumber,
      };

      console.log("Sending order data:", orderData);

      const response = await fetch(
        "https://zipp-backend.vercel.app/api/orders/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        }
      );

      const result = await response.json();
      if (result.success) {
        setOrderSuccess(true);
        setCart([]);
        setCustomerInfo({
          specialInstructions: "",
          table: tableNumber,
          location: "dine-in",
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

  if (loading && menu) {
    return (
      <AnimatePresence mode="wait">
        <Preloader key="preloader" onComplete={() => setLoading(false)} />
      </AnimatePresence>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center relative overflow-hidden">
        {/* Background decorative elements for loading */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-yellow-300/20"></div>
          <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-yellow-300/20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-yellow-300/20"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-yellow-300/20"></div>
        </div>

        <div className="text-center z-10">
          <div className="text-7xl font-bold text-yellow-300 mb-2 min-h-[3rem] flex items-center justify-center transition-all duration-300 font-qwigley"></div>
        </div>
        <div className="absolute bottom-20"></div>
      </div>
    );
  }

  if (error)
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-red-400 text-lg sm:text-xl font-semibold leading-relaxed">
            {error}
          </div>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 bg-white text-neutral-900 hover:bg-neutral-100 font-semibold"
          >
            {t("error.tryAgain")}
          </Button>
        </div>
      </div>
    );

  if (!menu || menu.length === 0)
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📋</div>
          <div className="text-neutral-400 text-lg sm:text-xl font-medium">
            {t("error.noMenu")}
          </div>
        </div>
      </div>
    );

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
        <div className="bg-neutral-800 border border-yellow-300/20 p-6 sm:p-8 rounded-2xl shadow-2xl text-center max-w-md w-full">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            {t("orderSuccess.title")}
          </h1>
          <p className="text-neutral-400 mb-6 text-sm sm:text-base">
            {t("orderSuccess.message")}
          </p>
          <Button
            onClick={() => setOrderSuccess(false)}
            className="w-full bg-white text-neutral-900 hover:bg-neutral-100 font-bold py-3 rounded-lg transition-all duration-200"
          >
            {t("orderSuccess.orderAgain")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white relative">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Corner accent elements */}
        <div className="absolute top-0 left-0 w-40 h-40 border-l-2 border-yellow-300/40 "></div>
        <div className="absolute top-0 right-0 w-40 h-40 border-r-2 border-yellow-300/40 "></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 border-l-2  border-yellow-300/40 "></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 border-r-2  border-yellow-300/40"></div>
      </div>

      <div className="bg-neutral-900/95 backdrop-blur-lg border-b border-neutral-800 sticky top-0 z-50 shadow-xl">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <h1 className="text-3xl font-bold text-white font-qwigley">
                ZIPP
              </h1>
              <h1 className="text-2xl font-bold text-yellow-300 font-qwigley mt-4">
                Dine
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="relative bg-neutral-800 border-yellow-300/20 text-white hover:bg-neutral-700 transition-all duration-200 px-3 sm:px-4 py-2 rounded-lg font-medium text-sm min-h-[40px] shadow-lg"
                >
                  <ShoppingCartIcon className="w-5 h-5" />
                  <span className="hidden sm:inline ml-2">
                    {t("cart.title")}
                  </span>
                  {getTotalItems() > 0 && (
                    <Badge className="badge absolute -top-1 rtl:-left-1 ltr:-right-1 min-w-[18px] h-4 text-xs bg-red-500 text-white border-0 font-bold">
                      {getTotalItems()}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-sm max-h-[85vh] bg-neutral-900 border-yellow-500/30 text-white rounded-2xl shadow-2xl backdrop-blur-lg flex flex-col">
                <DialogHeader className="pb-4 border-b border-yellow-500/20 flex-shrink-0">
                  <DialogTitle className="text-xl sm:text-2xl text-white font-bold text-center">
                    {t("cart.title")}
                  </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto min-h-0 max-h-[50vh]">
                  {cart.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-3 opacity-50">🛒</div>
                      <p className="text-neutral-400 text-sm">
                        {t("cart.empty")}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 p-1 pb-4">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="cart-item flex items-center justify-between p-3 border-b border-yellow-300/20 rounded-lg"
                        >
                          <div className="cart-item-details flex-1 min-w-0">
                            <h4 className="font-semibold text-white text-sm truncate">
                              {item.categoryName}: {item.name}
                            </h4>
                            <p className="cart-item-price text-xs text-neutral-400">
                              MAD{parseFloat(item.price).toFixed(2)}{" "}
                              {t("cart.each")}
                            </p>
                            {item.specialInstructions && (
                              <p className="text-xs text-yellow-300 mt-1 italic truncate">
                                {t("cart.instructions")}:{" "}
                                {item.specialInstructions}
                              </p>
                            )}
                          </div>
                          <div className="quantity-controls flex items-center gap-1 rtl:mr-2 ltr:ml-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-neutral-600 border-neutral-500 text-white hover:bg-neutral-500 w-8 h-8 min-h-[32px] text-sm"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                            >
                              -
                            </Button>
                            <span className="w-8 text-center font-medium text-white text-sm">
                              {item.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-neutral-600 border-neutral-500 text-white hover:bg-neutral-500 w-8 h-8 min-h-[32px] text-sm"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                            >
                              +
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="bg-red-600 hover:bg-red-700 w-8 h-8 min-h-[32px] text-sm rtl:mr-1 ltr:ml-1"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="border-t border-neutral-700 pt-3 mt-3 flex-shrink-0">
                    <div className="cart-total flex justify-between items-center text-lg font-bold mb-3">
                      <span className="text-white">{t("cart.total")}</span>
                      <span className="text-white price">
                        MAD{getTotalPrice().toFixed(2)}
                      </span>
                    </div>

                    <Button
                      className="w-full bg-white text-neutral-900 hover:bg-neutral-100 font-bold py-4 rounded-xl transition-all duration-200 min-h-[48px]"
                      onClick={() => {
                        setIsCartOpen(false);
                        setIsCheckoutOpen(true);
                      }}
                    >
                      {t("cart.checkout")}
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10">
        {menu && menu.length > 0 && (
          <Tabs
            value={selectedCategoryTab}
            onValueChange={setSelectedCategoryTab}
            className="w-full"
          >
            {/* Menu Categories Section */}
            <div className="sticky top-[73px] z-40 bg-gradient-to-b from-neutral-900 via-neutral-900/98 to-neutral-900/95 backdrop-blur-xl border-b border-yellow-300/20 pb-6 mb-8 -mx-4 px-4 shadow-lg">
              {/* Title Section */}
              <div className="text-center mb-6 pt-2">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-8 h-px bg-gradient-to-r from-transparent to-yellow-300/60"></div>
                  <h2 className="text-4xl font-bold text-yellow-300 font-qwigley">
                    {t("menu.ourMenu") || "Our Menu"}
                  </h2>
                  <div className="w-8 h-px bg-gradient-to-l from-transparent to-yellow-300/60"></div>
                </div>
                <p className="text-neutral-400 text-sm sm:text-base font-medium">
                  {t("menu.selectCategory") ||
                    "Select a category to explore our delicious dishes"}
                </p>
              </div>

              {/* Tabs Container */}
              <div className="relative">
                {/* Fade edges for scrollable area */}
                <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-neutral-900 to-transparent z-10 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-neutral-900 to-transparent z-10 pointer-events-none"></div>

                <div className="overflow-x-auto scrollbar-hide px-2">
                  <TabsList className="inline-flex bg-transparent border-0 gap-3 p-0 h-auto min-w-full w-max">
                    {menu
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((category, index) => (
                        <TabsTrigger
                          key={category.id}
                          value={category.id.toString()}
                          className="group relative data-[state=active]:bg-yellow-300 data-[state=active]:text-neutral-900 data-[state=active]:font-bold data-[state=active]:shadow-xl data-[state=active]:shadow-yellow-300/20 bg-neutral-800/80 text-white hover:text-yellow-300 hover:bg-neutral-700/90 hover:shadow-lg transition-all duration-300 px-8 py-4 rounded-full text-sm font-semibold whitespace-nowrap border border-yellow-300/30 data-[state=active]:border-yellow-300 data-[state=active]:scale-105 hover:scale-102 backdrop-blur-sm"
                          style={{
                            animationDelay: `${index * 100}ms`,
                          }}
                        >
                          <span className="relative z-10">{category.name}</span>
                        </TabsTrigger>
                      ))}
                  </TabsList>
                </div>
              </div>
            </div>

            {menu
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((category) => (
                <TabsContent
                  key={category.id}
                  value={category.id.toString()}
                  className="mt-0 animate-fadeInUp"
                >
                  <div className="space-y-5">
                    {category.description && (
                      <div className="text-center mb-8 p-4 bg-neutral-800/30 rounded-2xl border border-yellow-300/10 backdrop-blur-sm">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <div className="w-4 h-px bg-yellow-300/40"></div>
                          <span className="text-yellow-300 text-xs font-semibold uppercase tracking-wider">
                            {category.name}
                          </span>
                          <div className="w-4 h-px bg-yellow-300/40"></div>
                        </div>
                        <p className="text-neutral-300 text-sm sm:text-base font-medium leading-relaxed">
                          {category.description}
                        </p>
                      </div>
                    )}

                    {category.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => openItemModal(item, category.name)}
                        className="bg-gradient-to-r from-neutral-900 via-neutral-900/95 to-neutral-800/90 border border-yellow-300/20 rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:border-yellow-300/40 hover:shadow-xl hover:shadow-yellow-300/5 transition-all duration-300 touch-manipulation active:scale-98 relative overflow-hidden group backdrop-blur-sm"
                      >
                        {/* Subtle hover accent line */}
                        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-yellow-300/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div
                          className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-yellow-300/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{ transitionDelay: "100ms" }}
                        ></div>
                        {item.imageUrl && (
                          <div className="w-25 h-25 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-700">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-base sm:text-lg mb-1 truncate">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-neutral-400 text-sm line-clamp-2 mb-2">
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-white font-bold text-lg">
                              MAD{parseFloat(item.price).toFixed(2)}
                            </span>
                            <div className="flex items-center gap-2">
                              {!item.isAvailable && (
                                <span className="text-red-400 text-xs font-medium">
                                  {t("menu.notAvailable")}
                                </span>
                              )}
                              <div
                                key={item.id}
                                onClick={() =>
                                  openItemModal(item, category.name)
                                }
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                                  item.isAvailable
                                    ? "bg-neutral-600 hover:bg-neutral-500 cursor-pointer active:scale-95"
                                    : "bg-neutral-700 cursor-not-allowed opacity-50"
                                }`}
                              >
                                <span className="text-white text-lg font-bold">
                                  <ChevronDown />
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
          </Tabs>
        )}
      </div>

      <Dialog open={selectedItem !== null} onOpenChange={closeItemModal}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] bg-neutral-800 border-yellow-300/20 text-white rounded-2xl shadow-2xl flex flex-col">
          {selectedItem && (
            <>
              <DialogHeader className="pb-4 border-b border-yellow-300/20 flex-shrink-0">
                <DialogTitle className="text-xl font-bold text-white">
                  {t("menu.details")}
                </DialogTitle>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="space-y-4 p-1">
                  {selectedItem.imageUrl && (
                    <div className="w-full h-48 rounded-xl overflow-hidden">
                      <img
                        src={selectedItem.imageUrl}
                        alt={selectedItem.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {selectedItem.name}
                    </h3>
                    {selectedItem.description && (
                      <p className="text-neutral-300 text-sm mb-3">
                        {selectedItem.description}
                      </p>
                    )}
                    {selectedItem.ingredients && (
                      <div className="mb-3">
                        <p className="text-neutral-400 text-xs">
                          <span className="font-semibold text-white">
                            {t("menu.ingredients")}
                          </span>{" "}
                          {selectedItem.ingredients}
                        </p>
                      </div>
                    )}
                    <div className="text-2xl font-bold text-white">
                      MAD{parseFloat(selectedItem.price).toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-white font-medium">
                      {t("menu.quantity")}:
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-neutral-700 border-neutral-600 text-white hover:bg-neutral-600 w-8 h-8"
                        onClick={() =>
                          setItemQuantity(Math.max(1, itemQuantity - 1))
                        }
                      >
                        -
                      </Button>
                      <span className="w-8 text-center font-medium text-white">
                        {itemQuantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-neutral-700 border-neutral-600 text-white hover:bg-neutral-600 w-8 h-8"
                        onClick={() => setItemQuantity(itemQuantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-white">
                      {t("menu.specialInstructions")} (
                      {t("checkout.optionality")})
                    </label>
                    <textarea
                      className="w-full p-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:border-neutral-500 focus:outline-none resize-none text-sm min-h-[60px]"
                      rows={2}
                      value={itemSpecialInstructions}
                      onChange={(e) =>
                        setItemSpecialInstructions(e.target.value)
                      }
                      placeholder={t("menu.specialInstructionsPlaceholder")}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-yellow-300/20 flex-shrink-0">
                <Button
                  variant="outline"
                  className="flex-1 bg-neutral-700 border-neutral-600 text-white hover:bg-neutral-600"
                  onClick={closeItemModal}
                >
                  {t("menu.close")}
                </Button>
                <Button
                  className={`flex-1 ${
                    selectedItem.isAvailable
                      ? "bg-white text-neutral-900 hover:bg-neutral-100"
                      : "bg-neutral-600 text-neutral-400 cursor-not-allowed"
                  } font-semibold`}
                  onClick={() => {
                    if (selectedItem.isAvailable) {
                      addToCartWithQuantity(
                        selectedItem,
                        itemQuantity,
                        selectedCategory,
                        itemSpecialInstructions.trim() || undefined
                      );
                      closeItemModal();
                    }
                  }}
                  disabled={!selectedItem.isAvailable}
                >
                  {selectedItem.isAvailable
                    ? t("menu.addToCart")
                    : t("menu.notAvailable")}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="w-[95vw] max-w-md max-h-[90vh] bg-neutral-800 border-yellow-300/20 text-white rounded-2xl shadow-2xl flex flex-col">
          <DialogHeader className="pb-4 border-b border-yellow-300/20 flex-shrink-0">
            <DialogTitle className="text-xl sm:text-2xl text-white font-bold">
              {t("checkout.title")}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="space-y-4 p-1">
              {tableNumber && (
                <div className="bg-neutral-700 p-3 rounded-lg border border-yellow-300/20">
                  <div className="text-sm font-semibold text-white mb-1">
                    {t("checkout.table")}
                  </div>
                  <div className="text-yellow-300 font-bold text-lg">
                    {tableNumber}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
                  {t("checkout.location")}
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() =>
                      setCustomerInfo((prev) => ({
                        ...prev,
                        location: "dine-in",
                      }))
                    }
                    className={`flex-1 py-3 rounded-lg font-medium transition-all duration-200 ${
                      customerInfo.location === "dine-in"
                        ? "bg-white text-neutral-900 hover:bg-neutral-100"
                        : "bg-neutral-700 border border-neutral-600 text-white hover:bg-neutral-600"
                    }`}
                  >
                    {t("checkout.locationOptions.dineIn")}
                  </Button>
                  <Button
                    type="button"
                    onClick={() =>
                      setCustomerInfo((prev) => ({
                        ...prev,
                        location: "take-home",
                      }))
                    }
                    className={`flex-1 py-3 rounded-lg font-medium transition-all duration-200 ${
                      customerInfo.location === "take-home"
                        ? "bg-white text-neutral-900 hover:bg-neutral-100"
                        : "bg-neutral-700 border border-neutral-600 text-white hover:bg-neutral-600"
                    }`}
                  >
                    {t("checkout.locationOptions.takeHome")}
                  </Button>
                </div>
              </div>

              <div className="border-t border-neutral-700 pt-4">
                <div className="space-y-2">
                  {cart.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className="bg-neutral-700 p-3 rounded"
                    >
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-300 flex-1 min-w-0 truncate">
                          {item.quantity}x {item.categoryName}: {item.name}
                        </span>
                        <span className="text-white font-medium rtl:mr-2 ltr:ml-2 price">
                          MAD
                          {(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      {item.specialInstructions && (
                        <div className="mt-2 text-xs text-yellow-300 italic">
                          <span className="font-semibold">
                            {t("cart.instructions")}:
                          </span>{" "}
                          {item.specialInstructions}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="cart-total flex justify-between font-bold text-lg border-t border-neutral-700 pt-3">
                    <span className="text-white">{t("cart.total")}</span>
                    <span className="text-white price">
                      MAD{getTotalPrice().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 pt-4">
            <Button
              className={`w-full py-4 rounded-xl font-bold transition-all duration-200 min-h-[52px] text-base ${
                isSubmitting || cart.length === 0
                  ? "bg-neutral-600 text-neutral-400 cursor-not-allowed"
                  : "bg-white text-neutral-900 hover:bg-neutral-100"
              }`}
              onClick={handleSubmitOrder}
              disabled={isSubmitting || cart.length === 0}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
                  {t("checkout.submitting")}
                </div>
              ) : (
                t("checkout.submitOrder")
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
