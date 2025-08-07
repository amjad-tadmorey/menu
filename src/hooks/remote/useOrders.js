import { useQuery } from '@tanstack/react-query'

export function useOrders(fetchFn, key = 'orders') {
    return useQuery({
        queryKey: [key],
        queryFn: fetchFn,
    })
}
