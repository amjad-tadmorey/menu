/* eslint-disable react/prop-types */

const STATUS_COLORS = {
    new: "bg-gray-200 text-gray-800",
    "in-kitchen": "bg-yellow-200 text-yellow-800",
    ready: "bg-blue-200 text-blue-800",
    delivered: "bg-green-200 text-green-800",
    "billing-requested": "bg-purple-200 text-purple-800",
    paid: "bg-indigo-200 text-indigo-800",
    completed: "bg-green-600 text-white",
};

export default function Badge({ status }) {
    const color = STATUS_COLORS[status] || "bg-gray-100 text-gray-800";
    const label = status.replace("-", " ");

    return (
        <span
            className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${color}`}
        >
            {label}
        </span>
    );
}
