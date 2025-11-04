// js/orders.js
import { supabase } from './supabase.js';

class OrderSystem {
    static generateTrackingCode() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `ROM${timestamp}${random}`.toUpperCase();
    }

    static async createOrder(cartItems, customerId = null, shippingAddress = null) {
        const trackingCode = this.generateTrackingCode();
        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const { data, error } = await supabase
            .from('orders')
            .insert([
                {
                    customer_id: customerId,
                    tracking_code: trackingCode,
                    products: cartItems,
                    total_amount: total,
                    shipping_address: shippingAddress,
                    status: 'confirmed'
                }
            ])
            .select();

        if (error) throw error;

        return {
            order: data[0],
            trackingCode
        };
    }

    static async getOrderStatus(trackingCode) {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('tracking_code', trackingCode)
            .single();

        if (error) throw error;
        return data;
    }
}