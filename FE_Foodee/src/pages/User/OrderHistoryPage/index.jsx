import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaBoxOpen, FaShippingFast, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getOrders, cancelOrder, submitReviewApi  } from '../../../services/api/orderService';

const OrderHistoryPage = () => {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedOrderItem, setSelectedOrderItem] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [toast, setToast] = useState(null);


    const openReviewModal = (order, item) => {
        setSelectedOrder(order);
        setSelectedOrderItem(item); 

        // Set rating mặc định
        setRating(5);
        setComment("");

        setShowReviewModal(true);
    };

    const submitReview = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                // ... xử lý hết hạn token
                return;
            }

            await submitReviewApi(token, {
                orderId: selectedOrder.id,
                productId: selectedOrderItem.productId,
                rating,
                comment,
            });

            setShowReviewModal(false);

            // 🔔 hiện toast
            setToast({
                type: 'success',
                message: 'Cảm ơn bạn đã đánh giá!',
            });
        } catch (error) {
            console.error('Review error:', error);
            setToast({
                type: 'error',
                message: error.message || 'Lỗi khi gửi đánh giá',
            });
        }
    };






    const fetchOrders = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Vui lòng đăng nhập lại');
            }

            const orderData = await getOrders(token);

            // ⭐ SẮP XẾP ĐƠN MỚI → CŨ
            const sortedOrders = [...orderData].sort((a, b) => {
                if (a.createdAt && b.createdAt) {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                }
                return b.id - a.id;
            });

            setOrders(sortedOrders);

        } catch (error) {
            let errorMessage = error.message || 'Lỗi không xác định';
            if (error.response?.status === 401) {
                errorMessage = 'Vui lòng đăng nhập lại';
                localStorage.removeItem('token');
                navigate('/login');
            } else if (error.response?.status === 404) {
                errorMessage = 'Không tìm thấy đơn hàng';
            }
            setError(errorMessage);
            console.error('Lỗi khi lấy danh sách đơn hàng:', errorMessage);
        } finally {
            setLoading(false);
        }
    };


    const handleCancel = async (id) => {
        Swal.fire({
            title: 'Xác nhận hủy đơn hàng',
            text: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy bỏ',
            buttonsStyling: false,
            customClass: {
                confirmButton: 'px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105',
                cancelButton: 'px-4 py-2 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105',
                title: 'text-lg font-bold text-gray-800',
                htmlContainer: 'text-gray-600',
            },
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) throw new Error('Vui lòng đăng nhập lại');

                    const updatedOrder = await cancelOrder(token, id);
                    setOrders(orders.map((order) =>
                        order.id === id ? { ...order, orderStatus: updatedOrder.orderStatus } : order
                    ));

                    toast.success('Yêu cầu hủy đơn hàng thành công!', {
                        position: 'top-right',
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        theme: 'colored',
                    });
                } catch (error) {
                    const errorMessage = error.message || 'Lỗi khi yêu cầu hủy đơn hàng';
                    toast.error(errorMessage, {
                        position: 'top-right',
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        theme: 'colored',
                    });
                }
            }
        });
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(t);
    }, [toast]);


    const statusStyles = {
        PENDING: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200',
        CONFIRMED: 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200',
        SHIPPING: 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border border-orange-200',
        DELIVERED: 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200',
        CANCELLED: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200',
        CANCEL_REQUESTED: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200',
    };

    const statusIcons = {
        PENDING: <FaClock className="w-3 h-3" />,
        CONFIRMED: <FaCheckCircle className="w-3 h-3" />,
        SHIPPING: <FaShippingFast className="w-3 h-3" />,
        DELIVERED: <FaCheckCircle className="w-3 h-3" />,
        CANCELLED: <FaTimesCircle className="w-3 h-3" />,
        CANCEL_REQUESTED: <FaTimes className="w-3 h-3" />,
    };

    const formatStatus = (status) => {
        switch (status) {
            case 'PENDING':
                return 'Chờ xác nhận';
            case 'CONFIRMED':
                return 'Đã xác nhận';
            case 'SHIPPING':
                return 'Đang giao hàng';
            case 'DELIVERED':
                return 'Đã giao';
            case 'CANCELLED':
                return 'Đã hủy';
            case 'CANCEL_REQUESTED':
                return 'Chờ hủy';
            default:
                return status || 'Không xác định';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-25 to-indigo-50 py-6 px-4 sm:px-6 lg:px-8">
            <ToastContainer />
             {/* ⭐ Toast thông báo */}
            {toast && (
                <div
                    className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white flex items-center gap-2
                        ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}
                >
                    <span className="font-semibold">{toast.message}</span>
                </div>
            )}

            {/* Header Section */}
            <div className="max-w-6xl mx-auto mb-8">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4 shadow-md">
                        <FaBoxOpen className="text-white text-xl" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3 tracking-tight leading-tight">
                        Lịch Sử Đơn Hàng
                    </h1>
                    <p className="text-slate-600 text-md max-w-xl mx-auto">
                        Theo dõi và quản lý tất cả các đơn hàng của bạn một cách dễ dàng
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto">
                {loading ? (
                    <div className="flex flex-col justify-center items-center h-64 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-200"></div>
                            <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-blue-600 absolute top-0 left-0"></div>
                        </div>
                        <p className="mt-4 text-slate-600 text-lg font-medium">Đang tải đơn hàng...</p>
                    </div>
                ) : error ? (
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-3 border-red-400 p-6 rounded-xl shadow-md">
                        <div className="flex items-center">
                            <FaTimesCircle className="text-red-500 text-xl mr-3" />
                            <p className="text-red-700 text-lg font-semibold">{error}</p>
                        </div>
                    </div>
                ) : orders.length > 0 ? (
                    <div className="grid gap-6">
                        {orders.map((order, index) => (
                            <div
                                key={order.id || `order-${index}`}
                                className="group bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-white/20 hover:border-blue-200/50 hover:-translate-y-0.5"
                            >
                                <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                                    <div className="flex-1 space-y-4">
                                        {/* Order Header */}
                                        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                                            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm">
                                                <FaBoxOpen className="text-white text-lg" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-slate-800">Đơn hàng #{index + 1}</h2>
                                            </div>
                                        </div>

                                        {/* Order Details */}
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <div className="flex items-start gap-2">
                                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                                                    <div>
                                                        <p className="text-slate-500 text-xs font-medium">Địa chỉ giao hàng</p>
                                                        <p className="text-slate-800 font-semibold text-sm">
                                                            {order.deliveryAddress || 'Không có thông tin'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-2">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                                                    <div>
                                                        <p className="text-slate-500 text-xs font-medium">Ngày giao hàng</p>
                                                        <p className="text-slate-800 font-semibold text-sm">
                                                            {order.deliveryDate
                                                                ? new Date(order.deliveryDate).toLocaleString('vi-VN', {
                                                                    dateStyle: 'medium',
                                                                    timeStyle: 'short',
                                                                })
                                                                : 'Đang cập nhật thời gian giao hàng'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2"></div>
                                                <div>
                                                    <p className="text-slate-500 text-xs font-medium mb-1">Trạng thái đơn hàng</p>
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm ${statusStyles[order.orderStatus] || 'bg-gray-100 text-gray-700'
                                                            }`}
                                                    >
                                                        {statusIcons[order.orderStatus]}
                                                        {formatStatus(order.orderStatus)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        {order.orderItems && order.orderItems.length > 0 && (
                                            <div className="mt-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-slate-100">
                                                <h3 className="text-md font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                                                    Danh sách sản phẩm
                                                </h3>
                                                <div className="space-y-3">
                                                    {order.orderItems.map((item, itemIndex) => (
                                                        <div
                                                            key={item.id || `item-${index}-${itemIndex}`}
                                                            className="flex items-center p-3 bg-white rounded-lg shadow-sm border border-white/50 hover:shadow-md transition-all duration-300"
                                                        >
                                                            <div className="relative overflow-hidden rounded-lg mr-3">
                                                                <img
                                                                    src={item.productImage || 'https://via.placeholder.com/60'}
                                                                    alt={item.productName || 'Sản phẩm'}
                                                                    className="w-16 h-16 object-cover transform hover:scale-110 transition-transform duration-300"
                                                                />
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-semibold text-slate-800 text-sm">{item.productName || 'Không xác định'}</p>
                                                                <p className="text-slate-500 text-xs">Số lượng: {item.quantity || 0}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-bold text-indigo-600 text-sm">
                                                                    {(item.unitPrice || 0).toLocaleString('vi-VN')} ₫
                                                                </p>
                                                                <p className="text-slate-500 text-xs">
                                                                    Tổng: {(item.subtotal || item.unitPrice * item.quantity || 0).toLocaleString('vi-VN')} ₫
                                                                </p>

                                                                {/* ⭐ Nếu user đã đánh giá, hiển thị sao */}
                                                                {item.userRating && (
                                                                    <div className="mt-1 text-xs text-amber-500 font-semibold flex items-center gap-1">
                                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                                            <span key={i}>{i < item.userRating ? '★' : '☆'}</span>
                                                                        ))}
                                                                        <span className="text-slate-500 ml-1">(Bạn đã đánh giá)</span>
                                                                    </div>
                                                                )}
                                                                {order.orderStatus === 'DELIVERED' && !item.userRating && (
                                                                    <button
                                                                        onClick={() => openReviewModal(order, item)}
                                                                        className="mt-2 px-3 py-1 bg-yellow-500 text-white rounded-lg text-xs hover:bg-yellow-600 transition"
                                                                    >
                                                                        ⭐ Đánh giá món này
                                                                    </button>
                                                                )}


                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Order Actions */}
                                    <div className="flex flex-col items-end gap-4 min-w-fit">
                                        <div className="text-right p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border border-emerald-100">
                                            <p className="text-slate-600 text-xs font-medium mb-1">Tổng tiền</p>
                                            <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                                {(order.totalAmount || 0).toLocaleString('vi-VN')} ₫
                                            </p>
                                        </div>

                                        {(order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED') && (
                                            <button
                                                onClick={() => handleCancel(order.id)}
                                                className="group/btn flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 font-semibold text-sm"
                                            >
                                                <FaTimes className="group-hover/btn:rotate-90 transition-transform duration-300" />
                                                Hủy Đơn Hàng
                                            </button>
                                        )}


                                        
                                        {order.orderStatus === 'CANCEL_REQUESTED' && (
                                            <p className="text-gray-600 text-xs font-medium">Đang chờ admin phê duyệt yêu cầu hủy</p>
                                        )}

                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-md text-center border border-white/20">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full mb-4">
                            <FaBoxOpen className="text-slate-500 text-2xl" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có đơn hàng</h3>
                        <p className="text-slate-600 text-md">Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm ngay!</p>
                    </div>
                )}
            </div>

            {showReviewModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-lg">
                        <h3 className="text-xl font-bold mb-4 text-slate-800">Đánh giá món ăn</h3>

                        <p className="font-semibold mb-2 text-sm">{selectedOrderItem?.productName}</p>

                        {/* Chọn số sao */}
                        <div className="flex gap-2 mb-4">
                            {[1,2,3,4,5].map(star => (
                                <span
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className={`cursor-pointer text-2xl ${
                                        star <= rating ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                >
                                    ★
                                </span>
                            ))}
                        </div>

                        <textarea
                            placeholder="Nhận xét (không bắt buộc)"
                            className="w-full border rounded-lg p-3 mb-4"
                            rows={3}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowReviewModal(false)}
                                className="px-4 py-2 bg-gray-200 rounded-lg"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={submitReview}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                            >
                                Gửi
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
export default OrderHistoryPage;