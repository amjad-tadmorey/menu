/* eslint-disable react/prop-types */
import { useState } from "react"
import { useCreateOrder } from "../hooks/remote/useCreateOrder"
import { useUpdate } from "../hooks/remote/generals/useUpdate"
import { useGet } from "../hooks/remote/generals/useGet"
import Spinner from "../ui/Spinner"
import toast from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart, X } from "lucide-react"

export default function OrderUI({ table_id, restaurant_id }) {
  const { mutate: createOrder, isPending: isCreating } = useCreateOrder()
  const { mutate: updateTable } = useUpdate("tables", "tables")
  const { data: menuItems, isPending } = useGet(restaurant_id, "menu")

  const [selectedItems, setSelectedItems] = useState({})
  const [activeCategory, setActiveCategory] = useState("all")
  const [showReview, setShowReview] = useState(false)
  const [expanded, setExpanded] = useState(null)
  const [notes, setNotes] = useState("")

  // --- Add Item
  const handleAdd = (item) => {
    setSelectedItems((prev) => ({
      ...prev,
      [item.id]: { ...item, quantity: (prev[item.id]?.quantity || 0) + 1 },
    }))
  }

  // --- Adjust Qty
  const handleQuantity = (id, delta) => {
    setSelectedItems((prev) => {
      const newQty = (prev[id]?.quantity || 0) + delta
      if (newQty <= 0) {
        const copy = { ...prev }
        delete copy[id]
        return copy
      }
      return { ...prev, [id]: { ...prev[id], quantity: newQty } }
    })
  }

  // --- Cart total
  const total = Object.values(selectedItems).reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  )

  const categories = ["all", ...new Set(menuItems?.map((i) => i.category))]

  const filtered =
    activeCategory === "all"
      ? menuItems
      : menuItems?.filter((i) => i.category === activeCategory)

  // --- Submit order
  const submitOrder = async () => {
    if (!Object.keys(selectedItems).length) return toast.error("Add items first")

    const items = Object.values(selectedItems).map((i) => ({
      menu_id: i.id,
      quantity: i.quantity,
      unit_price: i.price,
    }))

    await createOrder(
      { restaurant_id, table_id, items, notes },
      {
        onSuccess: (order) => {
          toast.success("Order placed!")
          setSelectedItems({})
          setNotes("")
          setShowReview(false)
          updateTable({
            match: { id: table_id },
            updates: { is_active: true, active_order: order.id },
          })
        },
        onError: () => toast.error("Failed to place order"),
      }
    )
  }

  if (isPending) return <Spinner />

  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col bg-gradient-to-br from-[#6b3f2f] via-[#8e5440] to-[#d18b73]


">
      {/* Header */}
      <header className="p-4 bg-transparent sticky top-0 z-40 flex justify-between items-center border-b border-white/10 bg-transparent">
        <h1 className="text-xl font-bold">La Scala</h1>
        {/* <div className="text-sm opacity-70">Table {table_id}</div> */}
      </header>

      {/* Categories */}
      <div className="flex gap-3 px-4 py-3 overflow-x-auto scrollbar-hide sticky top-[65px] z-30 bg-transparent">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat
                ? "bg-white text-black"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu - FULL WIDTH SCROLL */}
      <div className="flex flex-col">
        {filtered?.map((item) => (
          <motion.div
            key={item.id}
            className="relative w-full h-[280px] mb-4 cursor-pointer"
            onClick={() => setExpanded(item)}
          >
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover rounded-xl"
            />
            <div className="absolute inset-0 bg-black/40 rounded-xl flex flex-col justify-end p-4">
              <h2 className="text-lg font-bold">{item.name}</h2>
              <span className="text-sm opacity-80">{item.price} EGP</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Cart */}
      {Object.keys(selectedItems).length > 0 && (
        <motion.div
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 w-full bg-white text-black shadow-xl p-4 flex justify-between items-center z-50"
        >
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <span className="font-medium">{total} EGP</span>
          </div>
          <button
            onClick={() => setShowReview(true)}
            className="bg-black text-white px-5 py-2 rounded-full font-medium hover:bg-gray-800"
          >
            Review Order
          </button>
        </motion.div>
      )}

      {/* Expanded Dish Bottom Sheet */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="fixed inset-x-0 bottom-0 bg-white text-black rounded-t-3xl shadow-2xl z-[100]"
          >
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{expanded.name}</h2>
                <button onClick={() => setExpanded(null)}>
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <p className="text-sm text-gray-600">{expanded.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-blue-600">
                  {expanded.price} EGP
                </span>
                {selectedItems[expanded.id] ? (
                  <div className="flex items-center bg-gray-100 rounded-full px-2">
                    <button
                      onClick={() => handleQuantity(expanded.id, -1)}
                      className="px-2 text-lg"
                    >
                      -
                    </button>
                    <span className="px-2 text-sm">
                      {selectedItems[expanded.id].quantity}
                    </span>
                    <button
                      onClick={() => handleQuantity(expanded.id, 1)}
                      className="px-2 text-lg"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleAdd(expanded)}
                    className="bg-black text-white px-4 py-2 rounded-full text-sm"
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Order Modal */}
      <AnimatePresence>
        {showReview && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="fixed inset-x-0 bottom-0 bg-white text-black rounded-t-3xl shadow-2xl z-[200] max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Review Order</h2>
                <button onClick={() => setShowReview(false)}>
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Items */}
              <div className="space-y-4">
                {Object.values(selectedItems).map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} × {item.price} EGP
                      </p>
                    </div>
                    <span className="font-semibold">
                      {item.quantity * item.price} EGP
                    </span>
                  </div>
                ))}
              </div>

              {/* Notes */}
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes (e.g. no onions, extra spicy...)"
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />

              {/* Total + Submit */}
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-lg font-semibold">{total} EGP</span>
                <button
                  onClick={submitOrder}
                  disabled={isCreating}
                  className="bg-black text-white px-6 py-2 rounded-full font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                  {isCreating ? "Placing..." : "Confirm Order"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
