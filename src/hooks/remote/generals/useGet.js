import { useQuery } from '@tanstack/react-query'
import { supaQuery } from '../../../lib/supaQuery'


export function useGet(restaurant_id, table, options = {}) {
    return useQuery({
        queryKey: [table, options],
        queryFn: () => supaQuery(restaurant_id, table, options),
    })
}