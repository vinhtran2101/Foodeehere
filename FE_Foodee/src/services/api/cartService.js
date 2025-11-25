import axios from 'axios';

// ĐÚNG: chỉ tới /api, KHÔNG tới /api/cart
const API_BASE_URL = 'http://localhost:8080/api';

const getAuthHeaders = (token) => {
    if (!token) {
        console.warn('Không tìm thấy token trong localStorage');
        return {};
    }
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};

// ================= GET CART =================
export const getCart = async (token) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/cart`, {
            headers: getAuthHeaders(token),
        });
        return response.data; 
    } catch (error) {
        if (error.response && error.response.status === 400) {
            console.info('Giỏ hàng rỗng → trả về giỏ mặc định.');
            return {
                items: [],
                totalAmount: 0,
                totalQuantity: 0,
            };
        }
        throw error;
    }
};

// ================ ADD =================
export const addToCart = async (token, productId, quantity) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/cart/add`,
            null,
            {
                params: { productId, quantity },
                headers: getAuthHeaders(token),
                timeout: 5000,
            }
        );

        const cartData = response.data.data || response.data.cart || {};

        return {
            cartItems: cartData.cartItems || [],
            totalPrice: cartData.totalPrice || 0,
        };
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        console.error('Lỗi khi thêm vào giỏ:', errorMessage);
        throw new Error(errorMessage);
    }
};

// ============= UPDATE =================
export const updateCartQuantity = async (token, productId, quantity) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/cart/update`,
            null,
            {
                params: { productId, quantity },
                headers: getAuthHeaders(token),
                timeout: 5000,
            }
        );

        const cartData = response.data.data || response.data.cart || {};

        return {
            cartItems: cartData.cartItems || [],
            totalPrice: cartData.totalPrice || 0,
        };
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        console.error('Lỗi khi cập nhật số lượng:', errorMessage);
        throw new Error(errorMessage);
    }
};

// ================ REMOVE =================
export const removeFromCart = async (token, productId) => {
    try {
        const response = await axios.delete(
            `${API_BASE_URL}/cart/remove`,
            {
                params: { productId },
                headers: getAuthHeaders(token),
                timeout: 5000,
            }
        );

        const cartData = response.data.data || response.data.cart || {};

        return {
            cartItems: cartData.cartItems || [],
            totalPrice: cartData.totalPrice || 0,
        };
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        console.error('Lỗi khi xóa sản phẩm:', errorMessage);
        throw new Error(errorMessage);
    }
};

// ================ CLEAR ALL =================
export const clearCart = async (token) => {
    try {
        await axios.delete(`${API_BASE_URL}/cart/clear`, {
            headers: getAuthHeaders(token),
            timeout: 5000,
        });

        return { cartItems: [], totalPrice: 0 };
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        console.error('Lỗi khi xóa giỏ hàng:', errorMessage);
        throw new Error(errorMessage);
    }
};
