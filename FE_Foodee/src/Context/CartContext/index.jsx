import { createContext, useContext, useState, useEffect } from 'react';
import {
    getCart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
} from '../../services/api/cartService';
import { createOrderFromProduct } from '../../services/api/orderService';

const CartContext = createContext();

// Lấy token mỗi lần cần dùng
const getToken = () => localStorage.getItem('token');

/**
 * Chuẩn hóa dữ liệu trả về từ API giỏ hàng
 * để luôn có { items: [], total: number }
 */
const normalizeCartResponse = (res) => {
    if (!res) return { items: [], total: 0 };

    // Nếu dùng axios chưa xử lý, data thường nằm trong res.data
    const data = res.data ?? res;

    // Tìm mảng sản phẩm
    const items = Array.isArray(data.cartItems)
        ? data.cartItems
        : Array.isArray(data.items)
        ? data.items
        : Array.isArray(data.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];

    // Tìm tổng tiền
    const total =
        typeof data.totalPrice === 'number'
            ? data.totalPrice
            : typeof data.total === 'number'
            ? data.total
            : 0;

    return { items, total };
};

/**
 * Map item từ API sang format dùng trong FE
 */
const mapApiItemsToCartItems = (items) =>
    (Array.isArray(items) ? items : []).map((item) => ({
        id: item.id,
        productId: item.productId,
        name: item.productName,
        image: item.productImage,
        price: item.price,
        quantity: item.quantity,
    }));

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);

    const fetchCart = async () => {
        const token = getToken();
        if (!token) {
            console.warn('Không có token → không gọi API giỏ hàng');
            setCartItems([]);
            setTotalPrice(0);
            return;
        }

        try {
            const res = await getCart(token);
            console.log('Cart API response:', res);

            const { items, total } = normalizeCartResponse(res);
            const mappedItems = mapApiItemsToCartItems(items);

            setCartItems(mappedItems);
            setTotalPrice(total);
        } catch (error) {
            console.error('Lỗi khi lấy giỏ hàng:', error);
            setCartItems([]);
            setTotalPrice(0);
        }
    };

    const addToCartAction = async (productId, quantity) => {
        const token = getToken();
        if (!token) {
            console.error('Bạn cần đăng nhập trước khi thêm vào giỏ hàng');
            throw new Error('Bạn cần đăng nhập để sử dụng giỏ hàng');
        }

        try {
            const res = await addToCart(token, productId, quantity);
            const { items, total } = normalizeCartResponse(res);
            const mappedItems = mapApiItemsToCartItems(items);

            setCartItems(mappedItems);
            setTotalPrice(total);
        } catch (error) {
            console.error('Lỗi khi thêm vào giỏ hàng:', error);
            throw error;
        }
    };

    const updateQuantity = async (productId, delta) => {
        const token = getToken();
        if (!token) return;

        const item = cartItems.find((item) => item.productId === productId);
        if (!item) return;

        const newQuantity = item.quantity + delta;
        if (newQuantity < 0) return;

        try {
            const res = await updateCartQuantity(token, productId, newQuantity);
            const { items, total } = normalizeCartResponse(res);
            const mappedItems = mapApiItemsToCartItems(items);

            setCartItems(mappedItems);
            setTotalPrice(total);
        } catch (error) {
            console.error('Lỗi khi cập nhật số lượng:', error);
            throw error;
        }
    };

    const removeItem = async (productId) => {
        const token = getToken();
        if (!token) return;

        try {
            const res = await removeFromCart(token, productId);
            const { items, total } = normalizeCartResponse(res);
            const mappedItems = mapApiItemsToCartItems(items);

            setCartItems(mappedItems);
            setTotalPrice(total);
        } catch (error) {
            console.error('Lỗi khi xóa sản phẩm:', error);
            throw error;
        }
    };

    const clearCartAction = async () => {
        const token = getToken();
        if (!token) return;

        try {
            const res = await clearCart(token);
            const { items, total } = normalizeCartResponse(res);
            const mappedItems = mapApiItemsToCartItems(items);

            setCartItems(mappedItems);
            setTotalPrice(total);
        } catch (error) {
            console.error('Lỗi khi xóa giỏ hàng:', error);
            throw error;
        }
    };

    const orderNow = async (orderData) => {
        const token = getToken();
        if (!token) {
            throw new Error('Bạn cần đăng nhập để đặt hàng');
        }

        try {
            const order = await createOrderFromProduct(token, orderData);
            // Tùy backend: có thể cần fetchCart() lại sau khi đặt
            return order;
        } catch (error) {
            console.error('Lỗi khi đặt hàng trực tiếp:', error);
            throw error;
        }
    };

    useEffect(() => {
        const token = getToken();
        if (!token) {
            setCartItems([]);
            setTotalPrice(0);
            return;
        }
        fetchCart();
    }, []);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                totalPrice,
                addToCart: addToCartAction,
                updateQuantity,
                removeItem,
                clearCart: clearCartAction,
                fetchCart,
                orderNow,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
