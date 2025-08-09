/* eslint-disable react/prop-types */
import { useSearchParams } from "react-router-dom";
import { useGet } from "../hooks/remote/generals/useGet";
import Spinner from "../ui/Spinner";
import TrackContent from "./TrackContent";



export default function TrackUI() {
    const [searchParams] = useSearchParams();
    const restaurant_id_params = Number(searchParams.get("restaurant_id"));
    const table_id_params = Number(searchParams.get("table_id"));

    const { data: table, isPending: isPendingTable } = useGet(restaurant_id_params, 'tables', {
        filters: [{ column: 'id', operator: 'eq', value: table_id_params }],
    });

    if (isPendingTable) return <Spinner />;

    const order_id = table[0].active_order
    return <TrackContent order_id={order_id} restaurant_id={restaurant_id_params} />
}
