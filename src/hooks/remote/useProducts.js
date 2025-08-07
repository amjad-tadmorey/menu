import { useQuery } from '@tanstack/react-query'

export function useProducts(fetchFn, key = 'products') {
    return useQuery({
        queryKey: [key],
        queryFn: fetchFn,
    })
}
