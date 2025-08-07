import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supaInsert } from '../../../lib/supaQuery'

export function useInsert(table, invalidateKey = null) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload) => supaInsert(table, payload),
        onSuccess: () => {
            if (invalidateKey) {
                queryClient.invalidateQueries([invalidateKey])
            }
        },
    })
}