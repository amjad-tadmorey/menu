import { useQuery } from '@tanstack/react-query'
import { supaQuery } from '../../../lib/supaQuery'

export function useGetOne(table, queryKey, filters) {
    return useQuery({
        queryKey: [queryKey, filters],
        queryFn: () =>
            supaQuery(table, {
                filters,
                single: true,
            }),
    });
}
