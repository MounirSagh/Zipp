"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Save, X, ShoppingCart, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog" // Assuming Dialog components are available
import { useUser } from "@clerk/clerk-react"

function Menu() {
  const [menu, setMenu] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Search state
  const [searchQuery, ] = useState("")
  const [searchResults, ] = useState<any[]>([])
  const [, ] = useState(false)

  // Sync state
  // const [isSyncing, setIsSyncing] = useState(false)

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [editingItem, setEditingItem] = useState<any>(null)
  const { isSignedIn, user } = useUser()
  const restaurantId = user?.id


  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
  })
  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "", // This will be empty for new items
    isAvailable: true,
    ingredients: "",
    categoryId: "",
  })

  const API_BASE = "https://zipp-backend.vercel.app/api/menu"

  // Auto-clear messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  // Fetch menu data
  const fetchMenu = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/${restaurantId}`)
      const data = await response.json()
      if (data.success) {
        setMenu(data.data)
      } else {
        setError(data.error || "Failed to fetch menu")
      }
    } catch (err) {
      setError("Network error while fetching menu")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Search menu using vector database
  // const searchMenu = async () => {
  //   if (!searchQuery.trim()) return
  //   try {
  //     setIsSearching(true)
  //     const response = await fetch(`${API_BASE}/search`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         query: searchQuery,
  //         restaurantId: restaurantId,
  //         topK: 10,
  //       }),
  //     })
  //     const data = await response.json()
  //     if (data.success) {
  //       setSearchResults(data.data)
  //       setShowSearchModal(true)
  //     } else {
  //       setError(data.error || "Search failed")
  //     }
  //   } catch (err) {
  //     setError("Network error while searching")
  //     console.error(err)
  //   } finally {
  //     setIsSearching(false)
  //   }
  // }

  // Sync existing data to vector database
  // const syncToVectorDB = async () => {
  //   try {
  //     setIsSyncing(true)
  //     const response = await fetch(`${API_BASE}/sync`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ restaurantId }),
  //     })
  //     const data = await response.json()
  //     if (data.success) {
  //       setSuccess(`Successfully synced ${data.categoriesCount} categories to vector database`)
  //     } else {
  //       setError(data.error || "Sync failed")
  //     }
  //   } catch (err) {
  //     setError("Network error while syncing")
  //     console.error(err)
  //   } finally {
  //     setIsSyncing(false)
  //   }
  // }

  // Create category
  const createCategory = async () => {
    try {
      const response = await fetch(`${API_BASE}/category`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...categoryForm,
          restaurantId,
        }),
      })
      const data = await response.json()
      if (data.success) {
        await fetchMenu()
        setShowCategoryModal(false)
        setCategoryForm({ name: "", description: "" })
        setSuccess("Category created and synced to vector database")
      } else {
        setError(data.error || "Failed to create category")
      }
    } catch (err) {
      setError("Network error while creating category")
      console.error(err)
    }
  }

  // Update category
  const updateCategory = async () => {
    try {
      const response = await fetch(`${API_BASE}/category/${editingCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryForm),
      })
      const data = await response.json()
      if (data.success) {
        await fetchMenu()
        setShowCategoryModal(false)
        setEditingCategory(null)
        setCategoryForm({ name: "", description: "" })
        setSuccess("Category updated and synced to vector database")
      } else {
        setError(data.error || "Failed to update category")
      }
    } catch (err) {
      setError("Network error while updating category")
      console.error(err)
    }
  }

  // Delete category
  const deleteCategory = async (categoryId: number) => {
    if (
      !window.confirm(
        "Are you sure? This will delete all items in this category and remove them from the vector database.",
      )
    ) {
      return
    }
    try {
      const response = await fetch(`${API_BASE}/category/${categoryId}`, {
        method: "DELETE",
      })
      const data = await response.json()
      if (data.success) {
        await fetchMenu()
        setSuccess("Category deleted and removed from vector database")
      } else {
        setError(data.error || "Failed to delete category")
      }
    } catch (err) {
      setError("Network error while deleting category")
      console.error(err)
    }
  }

  // Create item
  const createItem = async () => {
    try {
      const response = await fetch(`${API_BASE}/item`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...itemForm,
          price: Number.parseFloat(itemForm.price),
          categoryId: Number.parseInt(itemForm.categoryId),
        }),
      })
      const data = await response.json()
      if (data.success) {
        await fetchMenu()
        setShowItemModal(false)
        setItemForm({
          name: "",
          description: "",
          price: "",
          imageUrl: "", // Ensure this is empty for new items
          isAvailable: true,
          ingredients: "",
          categoryId: "",
        })
        setSuccess("Menu item created and synced to vector database")
      } else {
        setError(data.error || "Failed to create item")
      }
    } catch (err) {
      setError("Network error while creating item")
      console.error(err)
    }
  }

  // Update item
  const updateItem = async () => {
    try {
      const response = await fetch(`${API_BASE}/item/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...itemForm,
          price: Number.parseFloat(itemForm.price),
          categoryId: Number.parseInt(itemForm.categoryId),
        }),
      })
      const data = await response.json()
      if (data.success) {
        await fetchMenu()
        setShowItemModal(false)
        setEditingItem(null)
        setItemForm({
          name: "",
          description: "",
          price: "",
          imageUrl: "", // Keep it empty or set to existing if needed for editing
          isAvailable: true,
          ingredients: "",
          categoryId: "",
        })
        setSuccess("Menu item updated and synced to vector database")
      } else {
        setError(data.error || "Failed to update item")
      }
    } catch (err) {
      setError("Network error while updating item")
      console.error(err)
    }
  }

  // Delete item
  const deleteItem = async (itemId: number) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return
    }
    try {
      const response = await fetch(`${API_BASE}/item/${itemId}`, {
        method: "DELETE",
      })
      const data = await response.json()
      if (data.success) {
        await fetchMenu()
        setSuccess("Menu item deleted and removed from vector database")
      } else {
        setError(data.error || "Failed to delete item")
      }
    } catch (err) {
      setError("Network error while deleting item")
      console.error(err)
    }
  }

  // Toggle item availability
  const toggleAvailability = async (item: any) => {
    try {
      const response = await fetch(`${API_BASE}/item/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isAvailable: !item.isAvailable,
        }),
      })
      const data = await response.json()
      if (data.success) {
        await fetchMenu()
        setSuccess(`Item ${!item.isAvailable ? "enabled" : "disabled"} and vector database updated`)
      } else {
        setError(data.error || "Failed to update availability")
      }
    } catch (err) {
      setError("Network error while updating availability")
      console.error(err)
    }
  }

  // Modal handlers
  const openCategoryModal = (category: any = null) => {
    if (category) {
      setEditingCategory(category)
      setCategoryForm({
        name: category.name,
        description: category.description || "",
      })
    } else {
      setEditingCategory(null)
      setCategoryForm({ name: "", description: "" })
    }
    setShowCategoryModal(true)
  }

  const openItemModal = (item: any = null, categoryId = "") => {
    if (item) {
      setEditingItem(item)
      setItemForm({
        name: item.name,
        description: item.description || "",
        price: item.price.toString(),
        imageUrl: item.imageUrl || "", // Keep existing URL for editing
        isAvailable: item.isAvailable,
        ingredients: item.ingredients || "",
        categoryId: item.categoryId.toString(),
      })
    } else {
      setEditingItem(null)
      setItemForm({
        name: "",
        description: "",
        price: "",
        imageUrl: "", // Always empty for new items
        isAvailable: true,
        ingredients: "",
        categoryId: categoryId.toString(),
      })
    }
    setShowItemModal(true)
  }

  useEffect(() => {
     if (isSignedIn && user?.id) {
      fetchMenu()
    }
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
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="border-b border-gray-100 pb-12 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-light text-black mb-2">Menu</h1>
              <p className="text-gray-600 text-lg">Manage your restaurant menu </p>
            </div>
            <div className="flex gap-3">
              {/* <Button
                onClick={syncToVectorDB}
                disabled={isSyncing}
                className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50"
              >
                {isSyncing ? <RefreshCw size={16} className="animate-spin" /> : <Database size={16} />}
                {isSyncing ? "Syncing..." : "Sync Vector DB"}
              </Button> */}
              <Button
                onClick={() => openCategoryModal()}
                className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 flex items-center gap-2"
              >
                <Plus size={16} />
                Add Category
              </Button>
            </div>
          </div>
          {/* Search Bar */}
          {/* <div className="flex gap-3 mt-6">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && searchMenu()}
                placeholder="Search menu items using AI (e.g., 'vegetarian pasta dishes under $15')"
                className="w-full border border-gray-200 rounded-full px-4 py-2 pr-10 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 text-black placeholder-gray-400"
              />
              <Search size={20} className="absolute right-3 top-2.5 text-gray-400" />
            </div>
            <Button
              onClick={searchMenu}
              disabled={isSearching || !searchQuery.trim()}
              className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
            >
              {isSearching ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
              Search
            </Button>
          </div> */}
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
            <span>{error}</span>
            <Button onClick={() => setError("")} variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
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
              <h3 className="text-2xl font-light text-black mb-2">No menu items yet</h3>
              <p className="text-gray-600 mb-4">Start by creating your first menu category</p>
              <Button
                onClick={() => openCategoryModal()}
                className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800"
              >
                Create Category
              </Button>
            </div>
          ) : (
            menu.map((category) => (
              <Card key={category.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                {/* Category Header */}
                <CardHeader className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-black">{category.name}</h2>
                      {category.description && <p className="text-gray-600 mt-1">{category.description}</p>}
                      <p className="text-sm text-gray-600 mt-1">
                        {category.items.length} item{category.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => openItemModal(null, category.id)}
                        className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Add Item
                      </Button>
                      <Button
                        onClick={() => openCategoryModal(category)}
                        variant="ghost"
                        size="icon"
                        className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full"
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        onClick={() => deleteCategory(category.id)}
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                      >
                        <Trash2 size={16} />
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
                        onClick={() => openItemModal(null, category.id)}
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
                            item.isAvailable ? "border-gray-100 hover:border-gray-200" : "border-red-100 bg-red-50"
                          }`}
                        >
                          {/* Item Image */}
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl || "/placeholder.svg"}
                              alt={item.name}
                              className="w-full h-32 object-cover rounded-lg mb-3"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                              }}
                            />
                          )}
                          {/* Item Details */}
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-black truncate flex-1 mr-2">{item.name}</h3>
                            <span className="text-lg font-semibold text-green-600 whitespace-nowrap">
                              ${Number.parseFloat(item.price).toFixed(2)}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                          )}
                          {item.ingredients && (
                            <p className="text-xs text-gray-500 mb-3 line-clamp-1">
                              <strong>Ingredients:</strong> {item.ingredients}
                            </p>
                          )}
                          {/* Item Actions */}
                          <div className="flex justify-between items-center">
                            <Button
                              onClick={() => toggleAvailability(item)}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                item.isAvailable
                                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                                  : "bg-red-100 text-red-800 hover:bg-red-200"
                              }`}
                            >
                              {item.isAvailable ? (
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
                                onClick={() => openItemModal(item)}
                                variant="ghost"
                                size="icon"
                                className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100"
                              >
                                <Edit2 size={14} />
                              </Button>
                              <Button
                                onClick={() => deleteItem(item.id)}
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Search Results Modal */}
        <Dialog open={showSearchModal} onOpenChange={setShowSearchModal}>
          <DialogContent className="sm:max-w-4xl rounded-2xl border-0 shadow-2xl p-6">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl font-medium text-black">Search Results for "{searchQuery}"</DialogTitle>
            </DialogHeader>
            {searchResults.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No results found</p>
            ) : (
              <div className="space-y-4">
                {searchResults.map((result, index) => (
                  <div key={index} className="border border-gray-100 rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-black">{result.metadata.name}</h4>
                        <p className="text-sm text-gray-600">
                          {result.metadata.type === "item" ? "Menu Item" : "Category"}
                          {result.metadata.categoryName && ` • ${result.metadata.categoryName}`}
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
                      <p className="text-sm text-gray-700 mb-2">{result.metadata.description}</p>
                    )}
                    {result.metadata.ingredients && (
                      <p className="text-xs text-gray-500">
                        <strong>Ingredients:</strong> {result.metadata.ingredients}
                      </p>
                    )}
                    {result.metadata.isAvailable !== undefined && (
                      <p className="text-xs text-gray-500 mt-1">
                        <strong>Status:</strong> {result.metadata.isAvailable ? "Available" : "Unavailable"}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 text-black placeholder-gray-400"
                  placeholder="e.g., Appetizers"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 text-black placeholder-gray-400 resize-none"
                  rows={3}
                  placeholder="Brief description of this category"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                onClick={() => {
                  setShowCategoryModal(false)
                  setEditingCategory(null)
                  setCategoryForm({ name: "", description: "" })
                }}
                variant="ghost"
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </Button>
              <Button
                onClick={editingCategory ? updateCategory : createCategory}
                className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50"
                disabled={!categoryForm.name.trim()}
              >
                <Save size={16} />
                {editingCategory ? "Update" : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Item Modal */}
        <Dialog open={showItemModal} onOpenChange={setShowItemModal}>
          <DialogContent className="sm:max-w-lg rounded-2xl border-0 shadow-2xl p-6 max-h-screen overflow-y-auto">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl font-medium text-black">
                {editingItem ? "Edit Item" : "Create Item"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={itemForm.categoryId}
                  onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 text-black placeholder-gray-400"
                  placeholder="e.g., Caesar Salad"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={itemForm.price}
                  onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 text-black placeholder-gray-400"
                  placeholder="12.99"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 text-black placeholder-gray-400 resize-none"
                  rows={3}
                  placeholder="Describe this menu item"
                />
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={itemForm.imageUrl}
                  onChange={(e) => setItemForm({ ...itemForm, imageUrl: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 text-black placeholder-gray-400"
                  placeholder="https://example.com/image.jpg"
                />
              </div> */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients</label>
                <input
                  type="text"
                  value={itemForm.ingredients}
                  onChange={(e) => setItemForm({ ...itemForm, ingredients: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 text-black placeholder-gray-400"
                  placeholder="Lettuce, Tomato, Cheese, etc."
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={itemForm.isAvailable}
                  onChange={(e) => setItemForm({ ...itemForm, isAvailable: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">
                  Available for order
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                onClick={() => {
                  setShowItemModal(false)
                  setEditingItem(null)
                  setItemForm({
                    name: "",
                    description: "",
                    price: "",
                    imageUrl: "",
                    isAvailable: true,
                    ingredients: "",
                    categoryId: "",
                  })
                }}
                variant="ghost"
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </Button>
              <Button
                onClick={editingItem ? updateItem : createItem}
                className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50"
                disabled={!itemForm.name.trim() || !itemForm.price || !itemForm.categoryId}
              >
                <Save size={16} />
                {editingItem ? "Update" : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default Menu
