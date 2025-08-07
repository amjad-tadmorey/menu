import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTable } from '../../lib/TablesApi'

export function useCreateTable() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createTable,
        onSuccess: () => {
            // invalidate orders list to refetch updated data
            queryClient.invalidateQueries({ queryKey: ['tables'] })
        },
    })
}