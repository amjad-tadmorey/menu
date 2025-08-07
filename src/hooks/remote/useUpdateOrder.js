import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateOrder } from '../../lib/ordersApi';

export function useUpdateOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderId, updatedFields }) =>
            updateOrder(orderId, updatedFields),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });
}