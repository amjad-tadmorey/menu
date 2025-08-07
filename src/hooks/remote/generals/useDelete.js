import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supaDelete } from '../../../lib/supaQuery'

export function useDelete(table, invalidateKey = null) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (match) => supaDelete(table, match),
        onSuccess: () => {
            if (invalidateKey) {
                queryClient.invalidateQueries([invalidateKey])
            }
        },
    })
}
