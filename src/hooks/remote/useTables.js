import { useQuery } from '@tanstack/react-query'

export function useTables(fetchFn, key = 'tables') {
    return useQuery({
        queryKey: [key],
        queryFn: fetchFn,
    })
}
