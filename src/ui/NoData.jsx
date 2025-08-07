/* eslint-disable react/prop-types */
import { Ghost } from "lucide-react"; // Optional icon, replace if needed

export default function NoData({ message = "No data available" }) {
    return (
        <div className="flex flex-col items-center justify-center h-full py-12 text-center text-gray-500">
            <Ghost className="w-12 h-12 mb-4 text-gray-400" />
            <p className="text-lg font-medium">{message}</p>
        </div>
    );
}
