import { useSearchParams } from "react-router-dom";
import OrderUI from "./OrderUI";
import TrackUI from "./TrackUI";
import { useGet } from "../hooks/remote/generals/useGet";
import Spinner from "../ui/Spinner";

export default function Main() {
    const [searchParams] = useSearchParams();

    const restaurant_id = searchParams.get("restaurant_id");
    const table_id_params = Number(searchParams.get("table_id"));

    const { data: tablesData, isPending } = useGet(restaurant_id, 'tables')

    if (isPending) return <Spinner />

    const table = tablesData.filter(table => table.id === table_id_params)[0]


    return (
        <>
            {
                table.is_active ? <TrackUI /> : <OrderUI table_id={table_id_params} restaurant_id={restaurant_id} />
            }
        </>
    )
}
