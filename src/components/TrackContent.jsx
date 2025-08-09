/* eslint-disable react/prop-types */
import { useGet } from '../hooks/remote/generals/useGet';
import BigSpinner from '../ui/BigSpinner'
import Spinner from '../ui/Spinner';
const statusMessages = {
    new: "🚀 Your order is being prepared! Get ready for a great meal soon.",
    "in-kitchen": "👨‍🍳 Your order is now being cooked with love!",
    ready: "✅ Your order is ready! Pick it up or wait for delivery.",
    delivered: "🎉 Enjoy your meal! Thank you for choosing us."
};
export default function TrackContent({ order_id, restaurant_id }) {

    const { data, isPending } = useGet(restaurant_id, 'orders', {
        filters: [{ column: 'id', operator: 'eq', value: order_id }],
    });
    if (isPending) return <Spinner />
    const order = data[0]
    console.log(order);
    return <div className="py-6 px-4">
        <BigSpinner />
        <p className="text-lg text-center mt-4 font-medium text-gray-700">
            {statusMessages[order.status] || "📦 Updating your order status..."}
        </p>
    </div>
}
