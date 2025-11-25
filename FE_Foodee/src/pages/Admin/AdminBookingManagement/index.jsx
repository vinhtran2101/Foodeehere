import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
    FaCheck,
    FaTimes,
    FaTrash,
    FaEye,
    FaCheckCircle,
    FaBan,
    FaSearch,   // ⬅ thêm
    FaTimes as FaClear // ⬅ alias để dùng cho nút X clear search, tránh trùng tên
} from 'react-icons/fa';
import {
    getAllBookings,
    confirmBooking,
    cancelBookingByAdmin,
    deleteBooking,
    getBookingDetails,
    approveCancelBooking,
    rejectCancelBooking
} from '../../../services/api/bookingService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

function AdminBookingManagement() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const bookingsPerPage = 7; // 7 records per page

    // 🔍 state cho ô tìm kiếm
    const [search, setSearch] = useState('');

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchBookings = async () => {
            if (!token) {
                setError('Vui lòng đăng nhập với vai trò admin để quản lý đặt bàn.');
                setLoading(false);
                return;
            }

            try {
                const data = await getAllBookings(token);
                setBookings(data);
                setLoading(false);
            } catch (err) {
                setError(err.message || 'Không có quyền truy cập hoặc lỗi khi lấy danh sách đặt bàn.');
                toast.error(err.message || 'Không thể tải danh sách đặt bàn.', {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: 'light',
                });
                setLoading(false);
            }
        };

        fetchBookings();
    }, [token]);

    const handleConfirm = async (id) => {
        const confirmResult = await Swal.fire({
            title: 'Xác nhận đơn đặt bàn',
            text: 'Bạn có chắc muốn xác nhận đơn đặt bàn này?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4F46E5',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Hủy',
        });

        if (!confirmResult.isConfirmed) return;

        try {
            const updatedBooking = await confirmBooking(token, id);
            setBookings(bookings.map((booking) => (booking.id === id ? updatedBooking : booking)));
            toast.success('Xác nhận đơn đặt bàn thành công!', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: 'light',
            });
        } catch (err) {
            toast.error(err.message || 'Lỗi khi xác nhận đơn đặt bàn.', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: 'light',
            });
        }
    };

    const handleCancelByAdmin = async (id) => {
        const confirmResult = await Swal.fire({
            title: 'Xác nhận hủy đơn đặt bàn',
            text: 'Bạn có chắc muốn hủy đơn đặt bàn này? Đơn sẽ chuyển sang trạng thái Đã hủy.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Hủy đơn',
            cancelButtonText: 'Thoát',
        });

        if (!confirmResult.isConfirmed) return;

        try {
            const updatedBooking = await cancelBookingByAdmin(token, id);
            setBookings(bookings.map((booking) => (booking.id === id ? updatedBooking : booking)));
            toast.success('Hủy đơn đặt bàn thành công!', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: 'light',
            });
        } catch (err) {
            toast.error(err.message || 'Lỗi khi hủy đơn đặt bàn.', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: 'light',
            });
        }
    };

    const handleApproveCancel = async (id) => {
        const confirmResult = await Swal.fire({
            title: 'Xác nhận yêu cầu hủy',
            text: 'Bạn có chắc muốn đồng ý với yêu cầu hủy đơn đặt bàn này? Đơn sẽ chuyển sang trạng thái Đã hủy.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4F46E5',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy',
        });

        if (!confirmResult.isConfirmed) return;

        try {
            const updatedBooking = await approveCancelBooking(token, id);
            setBookings(bookings.map((booking) => (booking.id === id ? updatedBooking : booking)));
            toast.success('Đồng ý yêu cầu hủy thành công! Đơn đã chuyển sang trạng thái Đã hủy.', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: 'light',
            });
        } catch (err) {
            toast.error(err.message || 'Lỗi khi đồng ý yêu cầu hủy.', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: 'light',
            });
        }
    };

    const handleRejectCancel = async (id) => {
        const confirmResult = await Swal.fire({
            title: 'Từ chối yêu cầu hủy',
            text: 'Bạn có chắc muốn từ chối yêu cầu hủy đơn đặt bàn này? Đơn sẽ quay lại trạng thái Đã xác nhận.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Từ chối',
            cancelButtonText: 'Thoát',
        });

        if (!confirmResult.isConfirmed) return;

        try {
            const updatedBooking = await rejectCancelBooking(token, id);
            setBookings(bookings.map((booking) => (booking.id === id ? updatedBooking : booking)));
            toast.success('Từ chối yêu cầu hủy thành công! Đơn đã quay lại trạng thái Đã xác nhận.', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: 'light',
            });
        } catch (err) {
            toast.error(err.message || 'Lỗi khi từ chối yêu cầu hủy.', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: 'light',
            });
        }
    };

    const handleDelete = async (id) => {
        const confirmResult = await Swal.fire({
            title: 'Xác nhận xóa đơn đặt bàn',
            text: 'Bạn có chắc muốn xóa đơn đặt bàn này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });

        if (!confirmResult.isConfirmed) return;

        try {
            await deleteBooking(token, id);
            setBookings(bookings.filter((booking) => booking.id !== id));
            toast.success('Xóa đơn đặt bàn thành công!', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: 'light',
            });
            // Adjust current page if necessary
            if (currentBookings.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        } catch (err) {
            toast.error(err.message || 'Lỗi khi xóa đơn đặt bàn.', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: 'light',
            });
        }
    };

    const handleViewDetails = async (id) => {
        try {
            const booking = await getBookingDetails(token, id);
            setSelectedBooking(booking);
            setShowDetailModal(true);
        } catch (err) {
            toast.error(err.message || 'Lỗi khi xem chi tiết đơn đặt bàn.', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: 'light',
            });
        }
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedBooking(null);
    };

    const formatStatus = (status) => {
        switch (status) {
            case 'PENDING': return 'Chờ xác nhận';
            case 'CONFIRMED': return 'Đã xác nhận';
            case 'CANCELLED': return 'Đã hủy';
            case 'CANCEL_REQUESTED': return 'Yêu cầu hủy';
            default: return status || 'Không xác định';
        }
    };

    const formatArea = (area) => {
        switch (area) {
            case 'indoor': return 'Khu vực chính';
            case 'vip': return 'Phòng VIP';
            case 'outdoor': return 'Khu vườn';
            case 'terrace': return 'Sân thượng';
            default: return area || 'Không xác định';
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'CONFIRMED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            case 'CANCEL_REQUESTED': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // 🔍 Lọc danh sách theo search (tên, sdt, mã đơn, ngày, khu vực, trạng thái)
    const normalizedSearch = search.trim().toLowerCase();
    const filteredBookings = bookings.filter((booking) => {
        if (!normalizedSearch) return true;

        const bookingDateStr = booking.bookingDate
            ? format(new Date(booking.bookingDate), 'dd/MM/yyyy')
            : '';
        const createdAtStr = booking.createdAt
            ? format(new Date(booking.createdAt), 'dd/MM/yyyy HH:mm')
            : '';

        return (
            String(booking.id).includes(normalizedSearch) ||
            (booking.fullName && booking.fullName.toLowerCase().includes(normalizedSearch)) ||
            (booking.phoneNumber && booking.phoneNumber.toLowerCase().includes(normalizedSearch)) ||
            bookingDateStr.includes(normalizedSearch) ||
            createdAtStr.includes(normalizedSearch) ||
            formatArea(booking.area).toLowerCase().includes(normalizedSearch) ||
            formatStatus(booking.status).toLowerCase().includes(normalizedSearch)
        );
    });

    // Pagination logic (dựa trên danh sách đã lọc)
    const indexOfLastBooking = currentPage * bookingsPerPage;
    const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
    const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
    const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Xóa nội dung tìm kiếm
    const handleClearSearch = () => {
        setSearch('');
        setCurrentPage(1);
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-600">Đang tải...</div>;
    if (error) return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            <ToastContainer />
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-3xl font-extrabold text-indigo-900 tracking-tight">Quản Lý Đặt Bàn</h2>
                {/* Ô tìm kiếm giống trang Quản lý thực đơn */}
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-80">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Tìm kiếm theo tên, SĐT, mã đơn..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                        {search && (
                            <FaClear
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer hover:text-red-500"
                                onClick={handleClearSearch}
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-indigo-100 text-indigo-900">
                                <th className="p-4 text-left font-semibold">#</th>
                                <th className="p-4 text-left font-semibold">Họ Tên</th>
                                <th className="p-4 text-left font-semibold">Số Điện Thoại</th>
                                <th className="p-4 text-left font-semibold">Ngày</th>
                                <th className="p-4 text-left font-semibold">Giờ</th>
                                <th className="p-4 text-left font-semibold">Số Khách</th>
                                <th className="p-4 text-left font-semibold">Khu Vực</th>
                                <th className="p-4 text-left font-semibold">Yêu Cầu Đặc Biệt</th>
                                <th className="p-4 text-left font-semibold">Thời Gian Đặt</th>
                                <th className="p-4 text-left font-semibold">Trạng Thái</th>
                                <th className="p-4 text-left font-semibold">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="11" className="text-center text-gray-500 py-6">
                                        Không có đơn đặt bàn nào.
                                    </td>
                                </tr>
                            ) : (
                                currentBookings.map((booking, idx) => (
                                    <tr key={booking.id} className="hover:bg-gray-50 transition-all duration-200">
                                        <td className="p-4 border-t border-gray-200">
                                            {idx + 1 + (currentPage - 1) * bookingsPerPage}
                                        </td>
                                        <td className="p-4 border-t border-gray-200">{booking.fullName}</td>
                                        <td className="p-4 border-t border-gray-200">{booking.phoneNumber}</td>
                                        <td className="p-4 border-t border-gray-200">
                                            {format(new Date(booking.bookingDate), 'dd/MM/yyyy')}
                                        </td>
                                        <td className="p-4 border-t border-gray-200">{booking.bookingTime}</td>
                                        <td className="p-4 border-t border-gray-200">{booking.numberOfGuests}</td>
                                        <td className="p-4 border-t border-gray-200">{formatArea(booking.area)}</td>
                                        <td className="p-4 border-t border-gray-200">{booking.specialRequests || 'Không có'}</td>
                                        <td className="p-4 border-t border-gray-200">
                                            {format(new Date(booking.createdAt), 'dd/MM/yyyy HH:mm')}
                                        </td>
                                        <td className="p-4 border-t border-gray-200">
                                            <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusStyle(booking.status)}`}>
                                                {formatStatus(booking.status)}
                                            </span>
                                        </td>
                                        <td className="p-4 border-t border-gray-200 flex space-x-3">
                                            <button
                                                onClick={() => handleViewDetails(booking.id)}
                                                className="p-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-all duration-200"
                                                title="Xem chi tiết"
                                            >
                                                <FaEye />
                                            </button>
                                            {booking.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        onClick={() => handleConfirm(booking.id)}
                                                        className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all duration-200"
                                                        title="Xác nhận đơn đặt bàn"
                                                    >
                                                        <FaCheck />
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancelByAdmin(booking.id)}
                                                        className="p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-all duration-200"
                                                        title="Hủy đơn đặt bàn"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </>
                                            )}
                                            {booking.status === 'CANCEL_REQUESTED' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApproveCancel(booking.id)}
                                                        className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all duration-200"
                                                        title="Đồng ý yêu cầu hủy"
                                                    >
                                                        <FaCheckCircle />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectCancel(booking.id)}
                                                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200"
                                                        title="Từ chối yêu cầu hủy"
                                                    >
                                                        <FaBan />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleDelete(booking.id)}
                                                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200"
                                                title="Xóa đơn đặt bàn"
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                {filteredBookings.length > bookingsPerPage && (
                    <div className="flex justify-center items-center gap-2 py-4">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded-lg text-sm font-medium ${currentPage === 1
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-indigo-500 text-white hover:bg-indigo-600'
                                }`}
                        >
                            Previous
                        </button>
                        {[...Array(totalPages).keys()].map((page) => (
                            <button
                                key={page + 1}
                                onClick={() => handlePageChange(page + 1)}
                                className={`px-3 py-1 rounded-lg text-sm font-medium ${currentPage === page + 1
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {page + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded-lg text-sm font-medium ${currentPage === totalPages
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-indigo-500 text-white hover:bg-indigo-600'
                                }`}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {showDetailModal && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 w-full max-w-4xl shadow-2xl backdrop-blur-lg">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Chi Tiết Đơn Đặt Bàn</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: 'ID', value: selectedBooking.id },
                                { label: 'Họ Tên', value: selectedBooking.fullName },
                                { label: 'Số Điện Thoại', value: selectedBooking.phoneNumber },
                                { label: 'Ngày', value: format(new Date(selectedBooking.bookingDate), 'dd/MM/yyyy') },
                                { label: 'Giờ', value: selectedBooking.bookingTime },
                                { label: 'Số Khách', value: selectedBooking.numberOfGuests },
                                { label: 'Khu Vực', value: formatArea(selectedBooking.area) },
                                { label: 'Yêu Cầu Đặc Biệt', value: selectedBooking.specialRequests || 'Không có' },
                                { label: 'Thời Gian Đặt', value: format(new Date(selectedBooking.createdAt), 'dd/MM/yyyy HH:mm') },
                                {
                                    label: 'Trạng Thái',
                                    value: (
                                        <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusStyle(selectedBooking.status)}`}>
                                            {formatStatus(selectedBooking.status)}
                                        </span>
                                    )
                                },
                                { label: 'Tên Người Dùng', value: selectedBooking.username || 'Không có' },
                            ].map((item, index) => (
                                <div key={index}>
                                    <label className="block text-sm font-medium text-gray-700">{item.label}:</label>
                                    <p className="mt-1 text-sm text-gray-600">{item.value}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end mt-6 space-x-3">
                            {selectedBooking.status === 'CANCEL_REQUESTED' && (
                                <>
                                    <button
                                        onClick={() => handleApproveCancel(selectedBooking.id)}
                                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200"
                                    >
                                        Đồng ý hủy
                                    </button>
                                    <button
                                        onClick={() => handleRejectCancel(selectedBooking.id)}
                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
                                    >
                                        Từ chối hủy
                                    </button>
                                </>
                            )}
                            <button
                                onClick={handleCloseDetailModal}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminBookingManagement;
