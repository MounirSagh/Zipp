"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  ShoppingCart,
  Eye,
  EyeOff,
  GripVertical,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUser } from "@clerk/clerk-react";
import ImageUpload from "./ImageUpload";

// Sortable Category Component
function SortableCategory({
  category,
  onEdit,
  onDelete,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onToggleAvailability,
  isDeletingCategory,
  isDeletingItem,
  isTogglingAvailability,
}: {
  category: any;
  onEdit: (category: any) => void;
  onDelete: (categoryId: number) => void;
  onAddItem: (item: any, categoryId: string) => void;
  onEditItem: (item: any) => void;
  onDeleteItem: (itemId: number) => void;
  onToggleAvailability: (item: any) => void;
  isDeletingCategory: number | null;
  isDeletingItem: number | null;
  isTogglingAvailability: number | null;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        {/* Category Header */}
        <CardHeader className="bg-gray-50 px-6 py-4 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab hover:cursor-grabbing p-1 rounded hover:bg-gray-200 transition-colors"
              >
                <GripVertical size={20} className="text-gray-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-black">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="text-gray-600 mt-1">{category.description}</p>
                )}
                <p className="text-sm text-gray-600 mt-1">
                  {category.items.length} item
                  {category.items.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => onAddItem(null, category.id)}
                className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 flex items-center gap-2"
              >
                <Plus size={16} />
                Add Item
              </Button>
              <Button
                onClick={() => onEdit(category)}
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full"
              >
                <Edit2 size={16} />
              </Button>
              <Button
                onClick={() => onDelete(category.id)}
                variant="ghost"
                size="icon"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                disabled={isDeletingCategory === category.id}
              >
                {isDeletingCategory === category.id ? (
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        {/* Menu Items */}
        <CardContent className="p-6">
          {category.items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No items in this category yet</p>
              <Button
                onClick={() => onAddItem(null, category.id)}
                variant="link"
                className="mt-2 text-blue-600 hover:text-blue-700"
              >
                Add the first item
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.items.map((item: any) => (
                <div
                  key={item.id}
                  className={`border rounded-xl p-4 transition-all duration-200 ${
                    item.isAvailable
                      ? "border-gray-100 hover:border-gray-200"
                      : "border-red-100 bg-red-50"
                  }`}
                >
                  {/* Item Image */}
                  <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // On error, show placeholder
                          const target = e.currentTarget;
                          target.style.display = "none";
                          const placeholder =
                            target.nextElementSibling as HTMLElement;
                          if (placeholder) {
                            placeholder.style.display = "flex";
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-full h-full flex items-center justify-center text-gray-400 ${
                        item.imageUrl ? "hidden" : "flex"
                      }`}
                    >
                      <div className="text-center">
                        <svg
                          className="w-8 h-8 mx-auto mb-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <p className="text-xs">No image</p>
                      </div>
                    </div>
                  </div>
                  {/* Item Details */}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-black truncate flex-1 mr-2">
                      {item.name}
                    </h3>
                    <span className="text-lg font-semibold text-green-600 whitespace-nowrap">
                      ${Number.parseFloat(item.price).toFixed(2)}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  {item.ingredients && (
                    <p className="text-xs text-gray-500 mb-3 line-clamp-1">
                      <strong>Ingredients:</strong> {item.ingredients}
                    </p>
                  )}
                  {/* Item Actions */}
                  <div className="flex justify-between items-center">
                    <Button
                      onClick={() => onToggleAvailability(item)}
                      disabled={isTogglingAvailability === item.id}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors disabled:opacity-50 ${
                        item.isAvailable
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                    >
                      {isTogglingAvailability === item.id ? (
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin inline mr-1" />
                      ) : item.isAvailable ? (
                        <>
                          <Eye size={12} className="inline mr-1" />
                          Available
                        </>
                      ) : (
                        <>
                          <EyeOff size={12} className="inline mr-1" />
                          Unavailable
                        </>
                      )}
                    </Button>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => onEditItem(item)}
                        variant="ghost"
                        size="icon"
                        className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100"
                      >
                        <Edit2 size={14} />
                      </Button>
                      <Button
                        onClick={() => onDeleteItem(item.id)}
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                        disabled={isDeletingItem === item.id}
                      >
                        {isDeletingItem === item.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Menu() {
  const [menu, setMenu] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Action loading states
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);
  const [isDeletingCategory, setIsDeletingCategory] = useState<number | null>(
    null
  );
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [isUpdatingItem, setIsUpdatingItem] = useState(false);
  const [isDeletingItem, setIsDeletingItem] = useState<number | null>(null);
  const [isTogglingAvailability, setIsTogglingAvailability] = useState<
    number | null
  >(null);

  // Search state
  const [searchQuery] = useState("");
  const [searchResults] = useState<any[]>([]);
  const [,] = useState(false);

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const { isSignedIn, user } = useUser();
  const restaurantId = user?.id;

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
  });
  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    isAvailable: true,
    ingredients: "",
    categoryId: "",
  });

  const API_BASE = "https://zipp-backend.vercel.app/api/menu";

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = sortedMenu.findIndex(
        (category) => category.id === active.id
      );
      const newIndex = sortedMenu.findIndex(
        (category) => category.id === over?.id
      );

      const newSortedMenu = arrayMove(sortedMenu, oldIndex, newIndex);

      // Create a new menu array with updated order values
      const updatedMenu = newSortedMenu.map((category, index) => ({
        ...category,
        order: index + 1,
      }));

      // Update local state immediately for better UX
      setMenu(updatedMenu);

      // Update order values based on new positions and send to backend
      try {
        const updatePromises = updatedMenu.map((category, index) =>
          fetch(`${API_BASE}/category/${category.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              order: index + 1, // 1-based ordering
              plan: user?.publicMetadata.plan,
            }),
          })
        );

        await Promise.all(updatePromises);
        setSuccess("Category order updated successfully");
      } catch (err) {
        setError("Failed to update category order");
        console.error(err);
        // Revert local state on error
        fetchMenu();
      }
    }
  };

  // Auto-clear messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Fetch menu data
  const fetchMenu = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/${restaurantId}`);
      const data = await response.json();
      console.log(data);
      if (data.success) {
        setMenu(data.data);
      } else {
        setError(data.error || "Failed to fetch menu");
      }
    } catch (err) {
      setError("Network error while fetching menu");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Create category
  const createCategory = async () => {
    try {
      setIsCreatingCategory(true);
      // Calculate next order value
      const maxOrder = Math.max(...menu.map((cat) => cat.order || 0), 0);
      const response = await fetch(`${API_BASE}/category`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...categoryForm,
          order: maxOrder + 1,
          restaurantId,
          plan: user?.publicMetadata.plan,
        }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchMenu();
        setShowCategoryModal(false);
        setCategoryForm({ name: "", description: "" });
        setSuccess("Category created");
      } else {
        setError(data.error || "Failed to create category");
      }
    } catch (err) {
      setError("Network error while creating category");
      console.error(err);
    } finally {
      setIsCreatingCategory(false);
    }
  };

  // Update category
  const updateCategory = async () => {
    try {
      setIsUpdatingCategory(true);
      const response = await fetch(
        `${API_BASE}/category/${editingCategory.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...categoryForm,
            plan: user?.publicMetadata.plan,
          }),
        }
      );
      const data = await response.json();
      if (data.success) {
        await fetchMenu();
        setShowCategoryModal(false);
        setEditingCategory(null);
        setCategoryForm({ name: "", description: "" });
        setSuccess("Category updated");
      } else {
        setError(data.error || "Failed to update category");
      }
    } catch (err) {
      setError("Network error while updating category");
      console.error(err);
    } finally {
      setIsUpdatingCategory(false);
    }
  };

  // Delete category
  const deleteCategory = async (categoryId: number) => {
    if (
      !window.confirm(
        "Are you sure? This will delete all items in this category"
      )
    ) {
      return;
    }
    try {
      setIsDeletingCategory(categoryId);
      const response = await fetch(
        `${API_BASE}/category/${categoryId}?plan=${encodeURIComponent(
          String(user?.publicMetadata?.plan || "")
        )}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();
      if (data.success) {
        await fetchMenu();
        setSuccess("Category deleted");
      } else {
        setError(data.error || "Failed to delete category");
      }
    } catch (err) {
      setError("Network error while deleting category");
      console.error(err);
    } finally {
      setIsDeletingCategory(null);
    }
  };

  // Create item
  const createItem = async () => {
    try {
      setIsCreatingItem(true);
      const response = await fetch(`${API_BASE}/item`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...itemForm,
          price: Number.parseFloat(itemForm.price),
          categoryId: Number.parseInt(itemForm.categoryId),
          plan: user?.publicMetadata?.plan,
        }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchMenu();
        setShowItemModal(false);
        setItemForm({
          name: "",
          description: "",
          price: "",
          imageUrl: "",
          isAvailable: true,
          ingredients: "",
          categoryId: "",
        });
        setSuccess("Menu item created");
      } else {
        setError(data.error || "Failed to create item");
      }
    } catch (err) {
      setError("Network error while creating item");
      console.error(err);
    } finally {
      setIsCreatingItem(false);
    }
  };

  // Update item
  const updateItem = async () => {
    try {
      setIsUpdatingItem(true);
      const response = await fetch(`${API_BASE}/item/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...itemForm,
          price: Number.parseFloat(itemForm.price),
          categoryId: Number.parseInt(itemForm.categoryId),
          plan: user?.publicMetadata?.plan,
        }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchMenu();
        setShowItemModal(false);
        setEditingItem(null);
        setItemForm({
          name: "",
          description: "",
          price: "",
          imageUrl: "",
          isAvailable: true,
          ingredients: "",
          categoryId: "",
        });
        setSuccess("Menu item updated");
      } else {
        setError(data.error || "Failed to update item");
      }
    } catch (err) {
      setError("Network error while updating item");
      console.error(err);
    } finally {
      setIsUpdatingItem(false);
    }
  };

  // Delete item
  const deleteItem = async (itemId: number) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }
    try {
      setIsDeletingItem(itemId);
      const response = await fetch(
        `${API_BASE}/item/${itemId}?plan=${encodeURIComponent(
          String(user?.publicMetadata?.plan || "")
        )}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();
      if (data.success) {
        await fetchMenu();
        setSuccess("Menu item deleted");
      } else {
        setError(data.error || "Failed to delete item");
      }
    } catch (err) {
      setError("Network error while deleting item");
      console.error(err);
    } finally {
      setIsDeletingItem(null);
    }
  };

  // Toggle item availability
  const toggleAvailability = async (item: any) => {
    try {
      setIsTogglingAvailability(item.id);
      const response = await fetch(`${API_BASE}/item/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isAvailable: !item.isAvailable,
          plan: user?.publicMetadata?.plan,
        }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchMenu();
        setSuccess(
          `Item ${
            !item.isAvailable ? "enabled" : "disabled"
          }`
        );
      } else {
        setError(data.error || "Failed to update availability");
      }
    } catch (err) {
      setError("Network error while updating availability");
      console.error(err);
    } finally {
      setIsTogglingAvailability(null);
    }
  };

  // Modal handlers
  const openCategoryModal = (category: any = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        description: category.description || "",
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: "", description: "" });
    }
    setShowCategoryModal(true);
  };

  const openItemModal = (item: any = null, categoryId = "") => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        name: item.name,
        description: item.description || "",
        price: item.price.toString(),
        imageUrl: item.imageUrl || "",
        isAvailable: item.isAvailable,
        ingredients: item.ingredients || "",
        categoryId: item.categoryId.toString(),
      });
    } else {
      setEditingItem(null);
      setItemForm({
        name: "",
        description: "",
        price: "",
        imageUrl: "",
        isAvailable: true,
        ingredients: "",
        categoryId: categoryId.toString(),
      });
    }
    setShowItemModal(true);
  };

  // Create a stable sorted menu array using useMemo
  const sortedMenu = useMemo(() => {
    return [...menu].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [menu]);

  useEffect(() => {
    if (isSignedIn && user?.id) {
      fetchMenu();
    }
  }, [isSignedIn, user?.id]);

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8 rounded-lg shadow-sm bg-white">
          <h2 className="text-2xl font-light text-gray-700 mb-2">
            Sign In Required
          </h2>
          <p className="text-gray-500 font-light">
            Please sign in to view the panel.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="border-b border-gray-100 pb-12 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-light text-black mb-2">Menu</h1>
              <p className="text-gray-600 text-lg">
                Manage your restaurant menu
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => openCategoryModal()}
                className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 flex items-center gap-2"
              >
                <Plus size={16} />
                Add Category
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
            <span>{error}</span>
            <Button
              onClick={() => setError("")}
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700"
            >
              <X size={16} />
            </Button>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
            <span>{success}</span>
            <Button
              onClick={() => setSuccess("")}
              variant="ghost"
              size="sm"
              className="text-green-500 hover:text-green-700"
            >
              <X size={16} />
            </Button>
          </div>
        )}

        {/* Menu Categories */}
        <div className="space-y-8">
          {menu.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <ShoppingCart size={48} className="mx-auto text-gray-200 mb-4" />
              <h3 className="text-2xl font-light text-black mb-2">
                No menu items yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start by creating your first menu category
              </p>
              <Button
                onClick={() => openCategoryModal()}
                className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800"
              >
                Create Category
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedMenu.map((cat) => cat.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-8">
                  {sortedMenu.map((category) => (
                    <SortableCategory
                      key={category.id}
                      category={category}
                      onEdit={openCategoryModal}
                      onDelete={deleteCategory}
                      onAddItem={openItemModal}
                      onEditItem={openItemModal}
                      onDeleteItem={deleteItem}
                      onToggleAvailability={toggleAvailability}
                      isDeletingCategory={isDeletingCategory}
                      isDeletingItem={isDeletingItem}
                      isTogglingAvailability={isTogglingAvailability}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Search Results Modal */}
        <Dialog open={showSearchModal} onOpenChange={setShowSearchModal}>
          <DialogContent className="sm:max-w-4xl rounded-2xl border-0 shadow-2xl p-6">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl font-medium text-black">
                Search Results for "{searchQuery}"
              </DialogTitle>
            </DialogHeader>
            {searchResults.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No results found</p>
            ) : (
              <div className="space-y-4">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="border border-gray-100 rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-black">
                          {result.metadata.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {result.metadata.type === "item"
                            ? "Menu Item"
                            : "Category"}
                          {result.metadata.categoryName &&
                            ` • ${result.metadata.categoryName}`}
                          {" • "}Similarity: {(result.score * 100).toFixed(1)}%
                        </p>
                      </div>
                      {result.metadata.price && (
                        <span className="text-lg font-semibold text-green-600">
                          ${result.metadata.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {result.metadata.description && (
                      <p className="text-sm text-gray-700 mb-2">
                        {result.metadata.description}
                      </p>
                    )}
                    {result.metadata.ingredients && (
                      <p className="text-xs text-gray-500">
                        <strong>Ingredients:</strong>{" "}
                        {result.metadata.ingredients}
                      </p>
                    )}
                    {result.metadata.isAvailable !== undefined && (
                      <p className="text-xs text-gray-500 mt-1">
                        <strong>Status:</strong>{" "}
                        {result.metadata.isAvailable
                          ? "Available"
                          : "Unavailable"}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Category Modal */}
        <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
          <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl p-6">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl font-medium text-black">
                {editingCategory ? "Edit Category" : "Create Category"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, name: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 text-black placeholder-gray-400"
                  placeholder="e.g., Appetizers"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 text-black placeholder-gray-400 resize-none"
                  rows={3}
                  placeholder="Brief description of this category"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                onClick={() => {
                  setShowCategoryModal(false);
                  setEditingCategory(null);
                  setCategoryForm({ name: "", description: "" });
                }}
                variant="ghost"
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </Button>
              <Button
                onClick={editingCategory ? updateCategory : createCategory}
                className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50"
                disabled={
                  !categoryForm.name.trim() ||
                  isCreatingCategory ||
                  isUpdatingCategory
                }
              >
                {isCreatingCategory || isUpdatingCategory ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {editingCategory
                  ? isUpdatingCategory
                    ? "Updating..."
                    : "Update"
                  : isCreatingCategory
                  ? "Creating..."
                  : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Item Modal */}
        <Dialog open={showItemModal} onOpenChange={setShowItemModal}>
          <DialogContent className="sm:max-w-lg rounded-2xl border-0 shadow-2xl p-6 max-h-screen overflow-y-auto">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl font-medium text-black">
                {editingItem ? "Edit Menu Item" : "Create Menu Item"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={itemForm.categoryId}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, categoryId: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 text-black"
                >
                  <option value="">Select a category</option>
                  {menu.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={itemForm.name}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, name: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 text-black placeholder-gray-400"
                  placeholder="e.g., Caesar Salad"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={itemForm.price}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, price: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 text-black placeholder-gray-400"
                  placeholder="12.99"
                />
              </div>

              {/* Image Upload Component */}
              <ImageUpload
                currentImageUrl={itemForm.imageUrl}
                onImageUpload={(imageUrl) =>
                  setItemForm({ ...itemForm, imageUrl })
                }
                onImageRemove={() => setItemForm({ ...itemForm, imageUrl: "" })}
                disabled={isCreatingItem || isUpdatingItem}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, description: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 text-black placeholder-gray-400 resize-none"
                  rows={3}
                  placeholder="Describe this menu item"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ingredients
                </label>
                <input
                  type="text"
                  value={itemForm.ingredients}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, ingredients: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 text-black placeholder-gray-400"
                  placeholder="Lettuce, Tomato, Cheese, etc."
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={itemForm.isAvailable}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, isAvailable: e.target.checked })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="isAvailable"
                  className="text-sm font-medium text-gray-700"
                >
                  Available for order
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                onClick={() => {
                  setShowItemModal(false);
                  setEditingItem(null);
                  setItemForm({
                    name: "",
                    description: "",
                    price: "",
                    imageUrl: "",
                    isAvailable: true,
                    ingredients: "",
                    categoryId: "",
                  });
                }}
                variant="ghost"
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </Button>
              <Button
                onClick={editingItem ? updateItem : createItem}
                className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50"
                disabled={
                  !itemForm.name.trim() ||
                  !itemForm.price ||
                  !itemForm.categoryId ||
                  isCreatingItem ||
                  isUpdatingItem
                }
              >
                {isCreatingItem || isUpdatingItem ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {editingItem
                  ? isUpdatingItem
                    ? "Updating..."
                    : "Update"
                  : isCreatingItem
                  ? "Creating..."
                  : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default Menu;
