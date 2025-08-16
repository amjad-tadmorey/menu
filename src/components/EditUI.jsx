/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { useGet } from "../hooks/remote/generals/useGet";
import { useUpdateOrder } from "../hooks/remote/useUpdateOrder";
import Spinner from "../ui/Spinner";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, X } from "lucide-react";

export default function EditUI({ order }) {
    // ---- Derive ids from the received order prop
    const restaurant_id = order?.restaurant_id;
    console.log(restaurant_id);

    const table_id = order?.table_id;

    // ---- Fetch full menu so user can add new items
    const { data: menuItems, isPending } = useGet(restaurant_id, "menu");

    // ---- Update hook for saving changes
    const { mutate: updateOrder, isPending: isUpdating } = useUpdateOrder();

    // ---- Local state
    const [selectedItems, setSelectedItems] = useState({});
    const [activeCategory, setActiveCategory] = useState("all");
    const [showReview, setShowReview] = useState(false);
    const [expanded, setExpanded] = useState(null);
    const [notes, setNotes] = useState(order?.notes || "");

    // ---- Preload existing order items into local cart state
    useEffect(() => {
        if (!order) return;
        const mapped = {};
        (order.order_items || []).forEach((oi) => {
            const m = oi.menu;
            mapped[m.id] = {
                id: m.id,
                name: (m.name || "").trim(),
                price: oi.unit_price ?? m.price ?? 0,
                quantity: oi.quantity ?? 1,
                image_url: m.image_url,
                category: m.category,
            };
        });
        setSelectedItems(mapped);
        setNotes(order.notes || "");
    }, [order]);

    // ---- Helpers
    const handleAdd = (item) => {
        setSelectedItems((prev) => ({
            ...prev,
            [item.id]: {
                ...item,
                name: (item.name || "").trim(),
                price: item.price ?? 0,
                quantity: (prev[item.id]?.quantity || 0) + 1,
            },
        }));
    };

    const handleQuantity = (id, delta) => {
        setSelectedItems((prev) => {
            const current = prev[id];
            const newQty = (current?.quantity || 0) + delta;
            if (newQty <= 0) {
                const copy = { ...prev };
                delete copy[id];
                return copy;
            }
            return { ...prev, [id]: { ...current, quantity: newQty } };
        });
    };

    const removeItem = (id) => {
        setSelectedItems((prev) => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
        });
    };

    const total = useMemo(
        () => Object.values(selectedItems).reduce((sum, i) => sum + i.price * i.quantity, 0),
        [selectedItems]
    );

    const categories = useMemo(() => {
        const cats = new Set();
        (menuItems || []).forEach((i) => i?.category && cats.add(i.category));
        return ["all", ...Array.from(cats)];
    }, [menuItems]);

    const filtered = useMemo(() => {
        const list =
            activeCategory === "all"
                ? menuItems || []
                : (menuItems || []).filter((i) => i.category === activeCategory);

        // sort so selected ones appear first
        return list.slice().sort((a, b) => {
            const as = !!selectedItems[a.id];
            const bs = !!selectedItems[b.id];
            if (as && !bs) return -1;
            if (!as && bs) return 1;
            return 0;
        });
    }, [menuItems, activeCategory, selectedItems]);

    // ---- Submit update
    const submitUpdate = async () => {
        if (!Object.keys(selectedItems).length) {
            toast.error("Add items first");
            return;
        }

        const items = Object.values(selectedItems).map((i) => ({
            menu_id: i.id,
            quantity: i.quantity,
            unit_price: i.price,
        }));

        updateOrder(
            {
                orderId: order.id,
                updatedFields: {
                    items,
                    notes,
                    // total_price can be sent if your RPC expects it; otherwise backend can compute
                    total_price: total,
                },
            },
            {
                onSuccess: () => {
                    toast.success("Order updated");
                    setShowReview(false);
                    location.reload()
                },
                onError: (e) => {
                    console.error(e);
                    toast.error("Failed to update order");
                },
            }
        );
    };

    if (isPending) return <Spinner />;

    return (
        <div className="w-full min-h-screen bg-black text-white flex flex-col bg-gradient-to-br from-[#6b3f2f] via-[#8e5440] to-[#d18b73]
">
            {/* Header */}
            <header className="p-4 bg-transparent sticky top-0 z-40 flex justify-between items-center border-b border-white/10">
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold">Edit Order #{order?.order_number ?? order?.id}</h1>
                    <span className="text-xs opacity-60">
                        Status: {order?.status ?? "—"}
                    </span>
                </div>
                {/* <div className="text-sm opacity-70">Table {order?.table?.table_number ?? table_id}</div> */}
            </header>

            {/* Categories */}
            <div className="flex gap-3 px-4 py-3 overflow-x-auto scrollbar-hide sticky top-[65px] z-30 bg-transparent">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat
                            ? "bg-white text-black"
                            : "bg-white/10 text-white hover:bg-white/20"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Menu - FULL WIDTH SCROLL */}
            <div className="flex flex-col pb-28">
                {filtered?.map((item) => (
                    <motion.div
                        key={item.id}
                        className="relative w-full h-[280px] mb-4 cursor-pointer"
                        onClick={() => setExpanded(item)}
                    >
                        {/* image */}
                        {item.image_url ? (
                            <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-full h-full object-cover rounded-xl"
                            />
                        ) : (
                            <div className="w-full h-full rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-700" />
                        )}
                        {/* overlay */}
                        <div className="absolute inset-0 bg-black/40 rounded-xl flex flex-col justify-end p-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold line-clamp-1">{(item.name || "").trim()}</h2>
                                {selectedItems[item.id] && (
                                    <span className="text-xs bg-white/90 text-black px-2 py-0.5 rounded-full">
                                        × {selectedItems[item.id].quantity}
                                    </span>
                                )}
                            </div>
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
                        <ShoppingCart className="w-5 h-5" />
                        <span className="font-medium">{total} EGP</span>
                    </div>
                    <button
                        onClick={() => setShowReview(true)}
                        className="bg-black text-white px-5 py-2 rounded-full font-medium hover:bg-gray-800"
                    >
                        Review Changes
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
                                <h2 className="text-xl font-bold">{(expanded.name || "").trim()}</h2>
                                <button onClick={() => setExpanded(null)}>
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                            {expanded.description && (
                                <p className="text-sm text-gray-600">{expanded.description}</p>
                            )}
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold">
                                    {expanded.price} EGP
                                </span>
                                {selectedItems[expanded.id] ? (
                                    <div className="flex items-center bg-gray-100 rounded-full px-2">
                                        <button
                                            onClick={() => handleQuantity(expanded.id, -1)}
                                            className="px-3 text-lg"
                                        >
                                            -
                                        </button>
                                        <span className="px-2 text-sm">
                                            {selectedItems[expanded.id].quantity}
                                        </span>
                                        <button
                                            onClick={() => handleQuantity(expanded.id, 1)}
                                            className="px-3 text-lg"
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

            {/* Review Changes Modal */}
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
                                <div>
                                    <h2 className="text-xl font-bold">Review Changes</h2>
                                    <p className="text-xs text-gray-500">
                                        Order #{order?.order_number ?? order?.id} — Table{" "}
                                        {order?.table?.table_number ?? table_id}
                                    </p>
                                </div>
                                <button onClick={() => setShowReview(false)}>
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>

                            {/* Items */}
                            <div className="space-y-3">
                                {Object.values(selectedItems).map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between border-b pb-3 gap-3"
                                    >
                                        <div className="min-w-0">
                                            <p className="font-medium truncate">{item.name}</p>
                                            <p className="text-xs text-gray-600">
                                                {item.price} EGP
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleQuantity(item.id, -1)}
                                                className="px-3 py-1 rounded-full border"
                                            >
                                                −
                                            </button>
                                            <span className="w-6 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => handleQuantity(item.id, 1)}
                                                className="px-3 py-1 rounded-full border"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold whitespace-nowrap">
                                                {item.quantity * item.price} EGP
                                            </span>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-gray-500 hover:text-red-500"
                                                title="Remove"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Notes</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add notes (e.g. no onions, extra spicy...)"
                                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>

                            {/* Total + Submit */}
                            <div className="flex justify-between items-center pt-4 border-t">
                                <span className="text-lg font-semibold">{total} EGP</span>
                                <button
                                    onClick={submitUpdate}
                                    disabled={isUpdating}
                                    className="bg-black text-white px-6 py-2 rounded-full font-medium hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {isUpdating ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
