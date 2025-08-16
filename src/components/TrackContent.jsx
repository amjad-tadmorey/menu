/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { useOrders } from '../hooks/remote/useOrders';
import { supabase } from '../lib/supabase';
import BigSpinner from '../ui/BigSpinner';
import Spinner from '../ui/Spinner';
import { useQueryClient } from '@tanstack/react-query';
import { fetchOrderWithFullDetails } from '../lib/ordersApi';
import EditUI from './EditUI';
import OrderUI from './OrderUI';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '../ui/Button';
import toast from 'react-hot-toast';
import { useUpdateOrder } from '../hooks/remote/useUpdateOrder';

export const STATUS_MESSAGES = {
    new: "🚀 Your order is new and being prepared. Thanks for your patience!",
    "in-kitchen": "👨‍🍳 Your order is now cooking with care.",
    ready: "✅ Your order is ready. Enjoy your meal!",
    delivered: "🎉 Your order has been delivered. Thank you for choosing us!",
    "billing-requested": "💳 You requested the bill. Preparing your payment.",
    paid: "🙏 Thanks for your payment. Finalizing your order shortly.",
    completed: "🎊 Your order is complete. Have a wonderful day!",
};

export default function TrackContent({ order_id, restaurant_id, table_id }) {
    const [showEdit, setShowEdit] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [showCheck, setShowCheck] = useState(false);
    console.log(showAdd);
    console.log(showEdit);
    
    const queryClient = useQueryClient();
    const { mutate: updateOrder } = useUpdateOrder();
    const { data, isPending } = useOrders(() => fetchOrderWithFullDetails(order_id), ['orders', order_id]);
    useEffect(() => {
        const channel = supabase
            .channel('public:orders')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                (payload) => {
                    console.log('Realtime event:', payload);
                    queryClient.invalidateQueries(['orders']);
                }
            )
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    if (isPending) return <Spinner />;

    const order = data[0];
    console.log(order);

    const handleCheck = async () => {
        try {
            await updateOrder(
                {
                    orderId: order.id,
                    updatedFields: {
                        status: 'billing-requested',
                    }

                }, {
                onSuccess: () => {
                    toast.success('done')
                    setShowCheck(false)
                },
            }
            );
        } catch (err) {
            toast.error(err.message);
        }
    };


    return (
        <div className="pt-24 pb-6 px-4 flex flex-col h-screen">
            {order.status !== 'delivered' && <BigSpinner />}

            <p className="text-lg text-center not-last:font-medium text-gray-700 my-auto">
                {STATUS_MESSAGES[order?.status] || "📦 Updating your order status..."}
            </p>

            <AnimatePresence>
                {showEdit && (
                    <motion.div
                        key="edit-ui-modal"
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed inset-0 bg-white z-50 overflow-auto"
                    >
                        <button
                            onClick={() => setShowEdit(false)}
                            className="absolute top-2 right-4 text-xl font-bold p-1 bg-gray-200 rounded z-[9999]"
                        >
                            ×
                        </button>

                        <EditUI
                            order={order}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {showAdd && (
                    <motion.div
                        key="edit-ui-modal"
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed inset-0 bg-white z-50 overflow-auto"
                    >
                        <button
                            onClick={() => setShowAdd(false)}
                            className="absolute top-2 right-4 text-xl font-bold p-1 bg-gray-200 rounded z-[9999]"
                        >
                            ×
                        </button>

                        <OrderUI
                            restaurant_id={restaurant_id}
                            table_id={table_id}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showCheck && (
                    <motion.div
                        key="edit-ui-modal"
                        initial={{ y: "100%" }}
                        animate={{ y: '50%' }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed inset-0 bg-white z-50 overflow-auto"
                    >
                        <button
                            onClick={() => setShowCheck(false)}
                            className="absolute top-2 right-4 text-xl font-bold p-1 bg-gray-200 rounded"
                        >
                            ×
                        </button>

                        <div className='p-6 shadow-lg rounded-2xl mx-2'>
                            <h2 className="text-2xl font-semibold mb-4 text-center">Checkout</h2>

                            <div className="max-h-64 overflow-y-auto mb-4">
                                {order.order_items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex justify-between border-b py-2 text-gray-700"
                                    >
                                        <span>
                                            {item.menu.name} × {item.quantity}
                                        </span>
                                        <span>{item.unit_price * item.quantity} EGP</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between font-bold text-lg mb-6">
                                <span>Total:</span>
                                <span className="text-green-600">{order.total_price} EGP</span>
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    className="flex-1"
                                    onClick={() => setShowCheck(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 "
                                    onClick={handleCheck}
                                >
                                    Submit
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className='flex items-center justify-between gap-2'>
                {
                    order.status === 'new' ? <Button
                        onClick={() => setShowEdit(true)}
                        className='w-1/3'
                        disabled={order.status !== 'new'}
                    >
                        Edit
                    </Button> : <Button
                        onClick={() => setShowAdd(true)}
                        className='w-1/3'
                    >
                        Add
                    </Button>
                }


                <Button
                    onClick={() => setShowCheck(true)}
                    className='w-1/3'
                    disabled={order.status !== 'delivered'}
                >
                    Checkout
                </Button>
            </div>

        </div>
    );
}
