import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createOrder } from '../../lib/ordersApi'

export function useCreateOrder() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createOrder,
        onSuccess: () => {
            // invalidate orders list to refetch updated data
            queryClient.invalidateQueries({ queryKey: ['orders'] })
        },
    })
}