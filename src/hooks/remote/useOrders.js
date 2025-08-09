import { useQuery } from "@tanstack/react-query";

export function useOrders(fetchFn, queryKey = ['orders']) {
    return useQuery({
        queryKey,
        queryFn: fetchFn,
    });
}