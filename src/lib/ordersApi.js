import { endOfDay, startOfDay } from "date-fns"
import { supabase } from "./supabase"


export async function fetchOrderWithFullDetails(id) {
    const { data, error } = await supabase
        .from('orders')
        .select(`
      *,
      table:table_id (
        table_number
      ),
      order_items (
        id,
        quantity,
        unit_price,
        menu:menu_id (
          id,
          name,
          price
        )
      )
    `).eq('id', id)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('❌ Error fetching detailed orders:', error.message);
        throw error;
    }
    return data;
}


// ─────────────────────────────────────────────
// ✅ . Create Order

export async function createOrder({ restaurant_id, table_id, items = [], notes }) {

    if (!restaurant_id || !table_id) return alert('something went wrong')

    if (!Array.isArray(items) || items.length === 0) {
        throw new Error('You must provide at least one order item.')
    }

    const start = startOfDay(new Date()).toISOString()
    const end = endOfDay(new Date()).toISOString()

    // 1. Get latest order_number for today
    const { data: latestOrder, error: fetchError } = await supabase
        .from('orders')
        .select('order_number')
        .eq('restaurant_id', restaurant_id)
        .gte('created_at', start)
        .lte('created_at', end)
        .order('order_number', { ascending: false })
        .limit(1)
        .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
        throw new Error('Error fetching latest order: ' + fetchError.message)
    }

    const nextOrderNumber = (latestOrder?.order_number || 0) + 1

    // 2. Calculate total_price
    const total_price = items.reduce((sum, item) => {
        return sum + item.unit_price * item.quantity
    }, 0)

    // 3. Create new order
    const { data: newOrder, error: insertOrderError } = await supabase
        .from('orders')
        .insert([
            {
                restaurant_id,
                table_id,
                total_price,
                notes,
                order_number: nextOrderNumber,
            },
        ])
        .select()
        .single()

    if (insertOrderError) {
        throw new Error('Error inserting order: ' + insertOrderError.message)
    }

    // 4. Insert order_items with the new order_id
    const orderItems = items.map(item => ({
        order_id: newOrder.id,
        menu_id: item.menu_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
    }))

    const { error: insertItemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

    if (insertItemsError) {
        throw new Error('Error inserting order items: ' + insertItemsError.message)
    }

    return newOrder
}

//

// ─────────────────────────────────────────────
// ✅ . Update Order
export async function updateOrder(orderId, { notes, status, items = [] }) {
    if (!orderId) throw new Error('orderId is required');

    const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update({ notes, status })
        .eq('id', orderId)
        .select()
        .single();

    if (updateError) {
        throw new Error('Error updating order: ' + updateError.message);
    }

    const { error: deleteItemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

    if (deleteItemsError) {
        throw new Error('Error deleting old order items: ' + deleteItemsError.message);
    }

    if (items.length > 0) {
        const orderItems = items.map((item) => ({
            order_id: orderId,
            menu_id: item.menu_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
        }));

        const { error: insertItemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (insertItemsError) {
            throw new Error('Error inserting order items: ' + insertItemsError.message);
        }
    }

    return updatedOrder;
}
