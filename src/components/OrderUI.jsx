// components/OrderPage.jsx
import { useState } from "react"
import { useCreateOrder } from "../hooks/remote/useCreateOrder"
import { useGet } from "../hooks/remote/generals/useGet"
import Spinner from "../ui/Spinner"
import toast from "react-hot-toast"
import Button from "../ui/Button"
import Image from "../ui/Image"
import { motion } from 'framer-motion'
import { Undo2 } from "lucide-react"



export default function OrderUI() {
    const { mutate: createOrder, isPending: isCreating, isSuccess } = useCreateOrder()
    const { data: menuItems, isPending } = useGet(1, 'menu')

    const [selectedItems, setSelectedItems] = useState({})
    const [activeCategory, setActiveCategory] = useState('all')
    const [notes, setNotes] = useState('')

    const [showReview, setShowReview] = useState(false)

    const handleAddToOrder = (item) => {
        setSelectedItems((prev) => ({
            ...prev,
            [item.id]: { ...item, quantity: 1 },
        }))
    }

    const handleQuantityChange = (menu_id, delta) => {
        setSelectedItems((prev) => {
            const current = prev[menu_id]
            const newQty = current.quantity + delta
            if (newQty <= 0) {
                const updated = { ...prev }
                delete updated[menu_id]
                return updated
            }
            return {
                ...prev,
                [menu_id]: { ...current, quantity: newQty },
            }
        })
    }

    const totalPrice = Object.values(selectedItems).reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    )

    const handleSubmit = () => {
        if (Object.keys(selectedItems).length === 0) return toast.error("أضف عناصر أولاً")
        setShowReview(true)
    }

    const handleCreateOrder = async () => {
        try {
            const items = Object.values(selectedItems).map((item) => ({
                menu_id: item.id,
                quantity: item.quantity,
                unit_price: item.price,
            }))

            createOrder({
                restaurant_id: 1, table_id: 25, items, notes
            })
            isSuccess && toast.success('done')
            setSelectedItems({})
            setNotes('')
            setShowReview(false)
        } catch (err) {
            toast.error(err.message)
        }
    }

    if (isPending) return <Spinner />

    const categories = ['all', ...new Set(menuItems?.map((item) => item.category))]

    const filteredMenu = activeCategory === 'all'
        ? menuItems
        : menuItems.filter((item) => item.category === activeCategory)

    return (
        <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-md mb-[143px]">
            <div className="fixed bottom-0 left-0 w-full bg-white shadow-inner p-4 border-t border-gray-300 flex flex-col gap-2 z-50">
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="ملاحظات (اختياري)"
                    className="w-full mt-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-none shadow-sm"
                    rows={1}
                />
                <Button
                    onClick={handleSubmit}
                    disabled={isCreating}
                    variant="lg"
                    className="w-full"
                >
                    مراجعة ({totalPrice} ج.م)
                </Button>
            </div>
            <h1 className="text-3xl font-semibold mb-6 text-gray-800">Customer UI</h1>

            <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-full border text-sm whitespace-nowrap transition-all ${activeCategory === cat
                            ? "bg-[#6EC1F6] text-white"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredMenu.map((item) => {
                    const selected = selectedItems[item.id]
                    return (
                        <div
                            key={item.id}
                            className="rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden bg-white"
                        >
                            <Image
                                src={item.image_url}
                                alt={item.name}
                                className="w-full h-25 object-cover"
                            />

                            <div className="p-4 flex flex-col items-center">
                                <h2 className="text-xs font-semibold text-center">{item.name}</h2>
                                <p className="text-sm text-gray-600 mb-2">{item.price} ج.م</p>

                                {selected ? (
                                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                        <button
                                            onClick={() => handleQuantityChange(item.id, -1)}
                                            className="bg-gray-300 px-3 py-1 rounded text-lg"
                                        >
                                            -
                                        </button>
                                        <span className="font-medium">{selected.quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange(item.id, 1)}
                                            className="bg-blue-500 text-white px-3 py-1 rounded text-lg"
                                        >
                                            +
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleAddToOrder(item)}
                                        className="bg-green-600 text-sm text-white mt-2 px-4 py-2 rounded hover:bg-green-700 transition"

                                    >
                                        Add
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {showReview && (
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed inset-0 z-50 bg-opacity-30 backdrop-blur-xs flex justify-center items-end"
                    onClick={() => setShowReview(false)}
                >

                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="w-full max-h-[90vh] bg-white rounded-t-xl p-6 overflow-auto relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-semibold mb-4">مراجعة الطلب</h2>

                        <div className="space-y-2 text-sm">
                            {Object.values(selectedItems).map((item) => (
                                <div key={item.id} className="flex justify-between border-b pb-1">
                                    <span>{item.name} × {item.quantity}</span>
                                    <span>{item.price * item.quantity} ج.م</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 text-sm text-gray-600">
                            <p><strong>ملاحظات:</strong> {notes || "لا يوجد"}</p>
                        </div>

                        <div className="mt-4 flex justify-between items-center text-lg font-bold">
                            <span>المجموع:</span>
                            <span className="text-green-600">{totalPrice} ج.م</span>
                        </div>

                        <Button
                            onClick={handleCreateOrder}
                            disabled={isCreating}
                            className="w-full mt-6"
                        >
                            تأكيد الطلب
                        </Button>

                        <button onClick={() => setShowReview(false)} className=" absolute top-2 right-2 text-2xl" ><Undo2 /></button>
                    </motion.div>
                </motion.div>
            )}

        </div>
    )
}
