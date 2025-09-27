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
import { ShoppingCartIcon, Trash } from "lucide-react";
import LanguageSelector from "@/components/LanguageSelector";

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
};

type CustomerInfo = {
  specialInstructions: string;
  table: string;
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
  const [itemQuantity, setItemQuantity] = useState(1);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    specialInstructions: "",
    table: tableNumber,
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

  const addToCartWithQuantity = (item: MenuItem, quantity: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity }];
      }
    });
  };

  const openItemModal = (item: MenuItem) => {
    setSelectedItem(item);
    setItemQuantity(1);
  };

  const closeItemModal = () => {
    setSelectedItem(null);
    setItemQuantity(1);
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
      }));

      const orderData = {
        restaurantId,
        phoneNumber: "-",
        firstName: "-",
        lastName: "-",
        orderItems,
        totalAmount: getTotalPrice(),
        specialInstructions: customerInfo.specialInstructions || "-",
        location: "-",
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

  if (loading)
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-lg sm:text-xl text-white animate-pulse flex items-center gap-3 font-medium">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          {t("loading")}
        </div>
      </div>
    );

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
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="backdrop-blur-lg border-b border-neutral-800 sticky top-0 z-40 shadow-xl">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-white  font-qwigley">
                ZIPP
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
                    <Badge className="absolute -top-1 -right-1 min-w-[18px] h-4 text-xs bg-red-500 text-white border-0 font-bold">
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
                          className="flex items-center justify-between p-3 border-b border-yellow-300/20 rounded-lg"
                          dir="ltr"
                        >
                          <div className="flex-1 min-w-0 rtl:text-right ltr:text-left">
                            <h4 className="font-semibold text-white text-sm truncate">
                              {item.name}
                            </h4>
                            <p className="text-xs text-neutral-400">
                              MAD{parseFloat(item.price).toFixed(2)}{" "}
                              {t("cart.each")}
                            </p>
                          </div>
                          <div
                            className="flex items-center gap-1 rtl:mr-2 ltr:ml-2"
                            dir="ltr"
                          >
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
                              className="bg-red-600 hover:bg-red-700 w-8 h-8 min-h-[32px] text-sm ml-1"
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
                    <div
                      className="flex justify-between items-center text-lg font-bold mb-3"
                      dir="ltr"
                    >
                      <span className="text-white">{t("cart.total")}</span>
                      <span className="text-white">
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

      <div className="container mx-auto px-4 py-6">
        {menu &&
          menu
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((category) => (
              <section key={category.id} className="mb-8">
                <div className="flex text-center items-center justify-center gap-2 bg-neutral-900 border-b border-yellow-300/50 mb-6 rounded-lg">
                  <h2 className="text-xl sm:text-2xl font-bold text-yellow-300 mb-2">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-neutral-400 text-sm sm:text-base">
                      {category.description}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => openItemModal(item)}
                      className="bg-neutral-900 border border-yellow-300/20 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-neutral-750 transition-all duration-200 touch-manipulation active:scale-98"
                    >
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
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.isAvailable) {
                                  addToCart(item);
                                }
                              }}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                                item.isAvailable
                                  ? "bg-neutral-600 hover:bg-neutral-500 cursor-pointer active:scale-95"
                                  : "bg-neutral-700 cursor-not-allowed opacity-50"
                              }`}
                            >
                              <span className="text-white text-lg font-bold">
                                +
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
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
                      addToCartWithQuantity(selectedItem, itemQuantity);
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
                  {t("checkout.specialInstructions")} (
                  {t("checkout.optionality")})
                </label>
                <textarea
                  className="w-full p-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:border-neutral-500 focus:outline-none resize-none text-base min-h-[80px]"
                  rows={3}
                  value={customerInfo.specialInstructions}
                  onChange={(e) =>
                    setCustomerInfo((prev) => ({
                      ...prev,
                      specialInstructions: e.target.value,
                    }))
                  }
                  placeholder={t("checkout.specialInstructionsPlaceholder")}
                />
              </div>

              <div className="border-t border-neutral-700 pt-4">
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm bg-neutral-700 p-3 rounded"
                    >
                      <span className="text-neutral-300 flex-1 min-w-0 truncate">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="text-white font-medium ml-2">
                        MAD{(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-lg border-t border-neutral-700 pt-3">
                    <span className="text-white">{t("cart.total")}</span>
                    <span className="text-white">
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
