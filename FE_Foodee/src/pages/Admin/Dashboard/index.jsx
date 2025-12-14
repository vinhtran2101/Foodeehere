import React, { useState, useEffect } from 'react';
import { FaUtensils, FaUsers, FaClipboardList, FaChartBar, FaStar, FaHamburger, FaArrowUp, FaArrowDown, FaUserCircle, FaCalendar } from 'react-icons/fa';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Calendar, ChevronDown, X, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateAdminProfile } from '../../../services/api/userService';
import { getAllProductTypes, getRecentActivities, getDashboardOverview, getTopFoods, getOrderStatusSummary,  getDashboardTopFoods, getRevenueByMonth, getRevenueDailyFlexible } from '../../../services/api/statisticsService';
import { getProductTypeStats } from '../../../services/api/statisticsService';

// Toast Notification Component
function Toast({ message, type, onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-80 animate-slide-in ${type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
            {type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <span className="font-medium flex-1">{message}</span>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

function AdminDashboard() {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState({
        username: '',
        email: '',
        fullname: '',
        address: '',
        phoneNumber: ''
    });
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileForm, setProfileForm] = useState(admin);
    const [selectedTab, setSelectedTab] = useState('Tổng quan');
    const todayStr = new Date().toISOString().slice(0, 10); // "yyyy-MM-dd"

    const [startDate, setStartDate] = useState(todayStr);
    const [endDate, setEndDate] = useState(todayStr);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [foodProductType, setFoodProductType] = useState([]);
    const [activities, setActivities] = useState([]);
    const [productTypeLoading, setProductTypeLoading] = useState(false);
    const [activityLoading, setActivityLoading] = useState(false);
    const [stats, setStats] = useState([]);
    const [dashboardLoading, setDashboardLoading] = useState(false);
    const [topFoods, setTopFoods] = useState([]);
    const [topFoodsLoading, setTopFoodsLoading] = useState(false);    
    const [topFoodsRaw, setTopFoodsRaw] = useState([]);      // dữ liệu gốc từ API
    const [topFoodSort, setTopFoodSort] = useState('MOST_SOLD'); // kiểu sắp xếp hiện tại
    const [orderStatusSummary, setOrderStatusSummary] = useState([]);
    const [orderStatusLoading, setOrderStatusLoading] = useState(false);

    // Revenue chart state: granularity (monthly/daily), selected year/month and series data
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const defaultMonthlyData = Array.from({ length: 12 }, (_, i) => ({ name: `T${i + 1}`, revenue: 0 }));
    const [revenueSeries, setRevenueSeries] = useState(defaultMonthlyData);
    const [revenueLoading, setRevenueLoading] = useState(false);
    const [revenueGranularity, setRevenueGranularity] = useState('monthly'); // 'monthly' or 'daily'
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    const token =
    localStorage.getItem('token') || sessionStorage.getItem('token');

    
    const orderStatusConfig = {
        PENDING: { 
            label: 'Chờ xác nhận', 
            bg: 'bg-yellow-50', 
            text: 'text-yellow-700', 
            dot: 'bg-yellow-400' 
        },
        CONFIRMED: { 
            label: 'Đã xác nhận', 
            bg: 'bg-blue-50', 
            text: 'text-blue-700', 
            dot: 'bg-blue-400' 
        },
        SHIPPING: { 
            label: 'Đang giao', 
            bg: 'bg-purple-50', 
            text: 'text-purple-700', 
            dot: 'bg-purple-400' 
        },
        DELIVERED: { 
            label: 'Đã giao', 
            bg: 'bg-emerald-50', 
            text: 'text-emerald-700', 
            dot: 'bg-emerald-400' 
        },
        CANCEL_REQUESTED: { 
            label: 'Yêu cầu hủy', 
            bg: 'bg-orange-50', 
            text: 'text-orange-700', 
            dot: 'bg-orange-400' 
        },
        CANCELLED: { 
            label: 'Đã hủy', 
            bg: 'bg-red-50', 
            text: 'text-red-700', 
            dot: 'bg-red-400' 
        }
    };

    const handleFilterOrderStatus = async () => {
        if (!startDate || !endDate) {
            setToast({
                message: 'Vui lòng chọn đủ ngày bắt đầu và kết thúc.',
                type: 'error',
            });
            return;
        }

        setOrderStatusLoading(true);
        try {
            const data = await getOrderStatusSummary(token, startDate, endDate);
            setOrderStatusSummary(data);
        } catch (error) {
            console.error('Lỗi khi lọc trạng thái đơn hàng:', error);
            setToast({
                message: 'Lỗi khi lọc trạng thái đơn hàng.',
                type: 'error',
            });
        } finally {
            setOrderStatusLoading(false);
        }
    };

    // Hàm áp dụng sắp xếp cho danh sách món ăn
    const applyTopFoodSort = (data, sort) => {
        const sorted = [...data];

        switch (sort) {
            case 'LEAST_SOLD':
                // Bán ít nhất , ít đơn nhất lên đầu
                sorted.sort((a, b) => a.orders - b.orders);
                break;

            case 'HIGHEST_RATING':
                // Đánh giá cao nhất , điểm cao hơn lên đầu, nếu bằng nhau thì nhiều lượt đánh giá hơn lên trước
                sorted.sort((a, b) => {
                    const ra = parseFloat(a.rating) || 0;
                    const rb = parseFloat(b.rating) || 0;
                    if (rb !== ra) return rb - ra;
                    return (b.ratingCount || 0) - (a.ratingCount || 0);
                });
                break;

            case 'LOWEST_RATING':
                // Đánh giá thấp nhất , điểm thấp hơn lên đầu, ưu tiên món đã có lượt đánh giá
                sorted.sort((a, b) => {
                    const ra = parseFloat(a.rating) || 0;
                    const rb = parseFloat(b.rating) || 0;
                    if (ra !== rb) return ra - rb;
                    return (b.ratingCount || 0) - (a.ratingCount || 0);
                });
                break;

            case 'MOST_SOLD':
            default:
                // Bán chạy nhất (mặc định) → nhiều đơn nhất lên đầu
                sorted.sort((a, b) => b.orders - a.orders);
                break;
        }

        return sorted;
    };




    // Màu sắc cho biểu đồ tròn
    const COLORS = ['#3b82f6', '#22c55e', '#facc15', '#ef4444', '#a855f7'];

    // Load thông tin admin và dữ liệu từ API khi component mount
    useEffect(() => {
        if (!token) {
            setToast({ message: 'Vui lòng đăng nhập để xem thông tin admin.', type: 'error' });
            navigate('/login');
            return;
        }

    // Load thông tin admin
    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await getProfile(token);
            setAdmin(response);
            setProfileForm({
                username: response.username || '',
                email: response.email || '',
                fullname: response.fullname || '',
                address: response.address || '',
                phoneNumber: response.phoneNumber || '',
            });
        } catch (error) {
            let errorMsg = error.message || 'Lỗi khi tải thông tin admin.';
            if (error.response?.status === 401) {
                errorMsg = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
                localStorage.removeItem('token');
                navigate('/login');
            }
            setToast({ message: errorMsg, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Load danh sách loại sản phẩm
    const fetchProductTypes = async () => {
    setProductTypeLoading(true);
    try {
        // gọi API thống kê mới
        const productTypes = await getProductTypeStats(token);

        const formattedProductTypes = productTypes.map((productType, index) => ({
            name: productType.name,
            value: productType.totalProducts,          // dùng số lượng thật
            color: COLORS[index % COLORS.length]
        }));

        setFoodProductType(formattedProductTypes);
    } catch (error) {
        console.error(error);
        setToast({ message: 'Lỗi khi tải danh sách loại sản phẩm.', type: 'error' });
    } finally {
        setProductTypeLoading(false);
    }
};



    // Load hoạt động gần đây
    const fetchActivities = async () => {
        setActivityLoading(true);
        try {
            const activitiesData = await getRecentActivities(token, 4); // Lấy 4 hoạt động gần nhất
            const formattedActivities = activitiesData.map((activity, index) => {
                const [text, time] = activity.split(' | ');
                const types = ['Mới', 'Thành công', 'Chờ', 'Đánh giá', 'Hủy'];
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500'];
                return {
                    type: types[index % types.length],
                    color: colors[index % colors.length],
                    text: text || activity,
                    time: time || '2 giờ trước'
                };
            });
            setActivities(formattedActivities);
        } catch (error) {
            setToast({ message: 'Lỗi khi tải hoạt động gần đây.', type: 'error' });
        } finally {
            setActivityLoading(false);
        }
    };

    // Load thống kê tổng quan dashboard
    const fetchDashboardStats = async () => {
        setDashboardLoading(true);
        try {
            const overview = await getDashboardOverview(token);

            setStats([
                {
                    label: 'Tổng món ăn có sẵn',
                    value: overview.totalProducts,
                    icon: <FaUtensils />,
                    color: 'from-blue-500 to-blue-600',
                    bgColor: 'bg-blue-50',
                    textColor: 'text-blue-600',
                },
                {
                    label: 'Người dùng',
                    value: overview.totalUsers,
                    icon: <FaUsers />,
                    color: 'from-green-500 to-green-600',
                    bgColor: 'bg-green-50',
                    textColor: 'text-green-600',
                },
                {
                    label: 'Đơn hàng',
                    value: overview.totalOrders,
                    icon: <FaClipboardList />,
                    color: 'from-yellow-500 to-yellow-600',
                    bgColor: 'bg-yellow-50',
                    textColor: 'text-yellow-600',
                },
                {
                    label: 'Đặt bàn',
                    value: overview.totalBookings,
                    icon: <FaCalendar />,
                    color: 'from-purple-500 to-purple-600',
                    bgColor: 'bg-purple-50',
                    textColor: 'text-purple-600',
                },
                {
                    label: 'Doanh thu (VND)',
                    value: overview.totalRevenue?.toLocaleString('vi-VN'),
                    icon: <FaChartBar />,
                    color: 'from-red-500 to-red-600',
                    bgColor: 'bg-red-50',
                    textColor: 'text-red-600',
                },

            ]);
        } catch (error) {
            console.error(error);
            setToast({ message: 'Lỗi khi tải thống kê dashboard.', type: 'error' });
        } finally {
            setDashboardLoading(false);
        }
    };

    const fetchTopFoods = async () => {
        try {
            setTopFoodsLoading(true);
            const token =
    localStorage.getItem('token') || sessionStorage.getItem('token');


            // Lấy khoảng 5 món cho hiển thị Top 5
            const data = await getDashboardTopFoods(token, 5);

            const mapped = data.map((item) => ({
                id: item.productId,
                name: item.productName,
                image: item.productImage,
                orders: item.totalOrdered,
                rating: Number(item.averageRating || 0).toFixed(1),
                ratingCount: item.ratingCount || 0,
            }));

            setTopFoodsRaw(mapped); // lưu dữ liệu gốc
            setTopFoods(applyTopFoodSort(mapped, topFoodSort)); // sắp xếp theo kiểu hiện tại
        } catch (error) {
            console.error('Lỗi khi lấy top món ăn:', error);
        } finally {
            setTopFoodsLoading(false);
        }
    };



    const fetchOrderStatusSummaryData = async () => {
        setOrderStatusLoading(true);
        try {
            const data = await getOrderStatusSummary(token, startDate, endDate);
            setOrderStatusSummary(data);
        } catch (error) {
            console.error('Lỗi khi tải thống kê trạng thái đơn hàng:', error);
            setToast({
                message: 'Lỗi khi tải thống kê trạng thái đơn hàng.',
                type: 'error',
            });
        } finally {
            setOrderStatusLoading(false);
        }
    };
    



    // Gọi tất cả API
    fetchProfile();
    fetchProductTypes();
    fetchActivities();
    fetchDashboardStats();
    fetchTopFoods(); 
    fetchOrderStatusSummaryData();
    const interval = setInterval(fetchOrderStatusSummaryData, 900000);
    return () => clearInterval(interval);
    
      

}, [navigate, token]);

    // legacy demo data removed — use `revenueSeries` state populated from API



    const notableAccounts = [
        {
            name: 'Nguyễn Văn A',
            lastBooking: '2025-07-29 19:00',
            lastOrder: 'Pizza Hải Sản',
            totalSpent: '5.2 triệu',
            orderCount: 12,
            time: 'Hôm qua'
        },
        {
            name: 'Trần Thị B',
            lastBooking: '2025-07-28 18:30',
            lastOrder: 'Phở Bò',
            totalSpent: '3.8 triệu',
            orderCount: 8,
            time: '2 ngày trước'
        },
        {
            name: 'Lê Văn C',
            lastBooking: '2025-07-27 20:00',
            lastOrder: 'Hamburger Gà',
            totalSpent: '2.1 triệu',
            orderCount: 5,
            time: '3 ngày trước'
        },
    ];

    const growthStats = [
        { label: 'Tăng trưởng doanh thu', value: '+10%', icon: <FaArrowUp />, color: 'from-emerald-500 to-emerald-600', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600', desc: 'so với tháng trước' },
        { label: 'Tăng trưởng người dùng', value: '+15%', icon: <FaArrowUp />, color: 'from-cyan-500 to-cyan-600', bgColor: 'bg-cyan-50', textColor: 'text-cyan-600', desc: 'so với tháng trước' },
        { label: 'Tăng trưởng đơn hàng', value: '-2%', icon: <FaArrowDown />, color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50', textColor: 'text-orange-600', desc: 'so với tháng trước' },
        { label: 'Trung bình điểm đánh giá', value: 4.5, icon: <FaStar />, color: 'from-amber-500 to-amber-600', bgColor: 'bg-amber-50', textColor: 'text-amber-600', desc: 'từ người dùng' },
    ];

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleDateChange = (type, value) => {
        if (type === 'start') {
            setStartDate(value);
        } else {
            setEndDate(value);
        }
    };

    const validateForm = () => {
        const errors = [];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(profileForm.email)) {
            errors.push('Email không hợp lệ.');
        }
        if (!profileForm.fullname.trim()) {
            errors.push('Họ và tên không được để trống.');
        }
        if (profileForm.phoneNumber && !/^\+?\d{8,15}$/.test(profileForm.phoneNumber)) {
            errors.push('Số điện thoại không hợp lệ (8-15 chữ số).');
        }
        if (errors.length > 0) {
            setToast({ message: errors.join(' '), type: 'error' });
            return false;
        }
        return true;
    };

    const handleProfileChange = (e) => {
        setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        if (!token) {
            setToast({ message: 'Vui lòng đăng nhập để cập nhật thông tin.', type: 'error' });
            navigate('/login');
            return;
        }

        if (!window.confirm('Bạn có chắc muốn lưu thay đổi?')) {
            return;
        }

        setUpdateLoading(true);
        try {
            const updatedData = await updateAdminProfile(token, {
                username: admin.username,
                email: profileForm.email,
                fullname: profileForm.fullname,
                address: profileForm.address || '',
                phoneNumber: profileForm.phoneNumber || '',
            });

            setAdmin(updatedData);
            setToast({ message: 'Cập nhật thông tin admin thành công! 🎉', type: 'success' });
            setTimeout(() => {
                setShowProfileModal(false);
                setToast(null);
            }, 1500);
        } catch (error) {
            let errorMsg = error.message || 'Không thể cập nhật thông tin admin.';
            if (error.response?.status === 401) {
                errorMsg = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
                localStorage.removeItem('token');
                navigate('/login');
            } else if (error.response?.status === 403) {
                errorMsg = 'Bạn không có quyền cập nhật thông tin này. Vui lòng kiểm tra vai trò admin.';
            }
            setToast({ message: errorMsg, type: 'error' });
        } finally {
            setUpdateLoading(false);
        }
    };

    useEffect(() => {
        // Mỗi lần dữ liệu gốc hoặc kiểu sort đổi → sort lại
        if (!topFoodsRaw || topFoodsRaw.length === 0) return;
        setTopFoods(applyTopFoodSort(topFoodsRaw, topFoodSort));
    }, [topFoodsRaw, topFoodSort]);
    // Fetch revenue series when granularity / year / month changes
    useEffect(() => {
        const fetchRevenueSeries = async () => {
            if (!token) return;
            setRevenueLoading(true);
            try {
                if (revenueGranularity === 'monthly') {
                    const data = await getRevenueByMonth(token, selectedYear);
                    const months = Array.from({ length: 12 }, (_, i) => ({ name: `T${i + 1}`, revenue: 0 }));
                    if (Array.isArray(data)) {
                        data.forEach((item) => {
                            const m = Number(item.month) || Number(item.monthIndex) || Number(item.monthNumber) || 0;
                            const val = Number(item.revenue ?? item.totalRevenue ?? item.value ?? 0);
                            if (m >= 1 && m <= 12) months[m - 1].revenue = val;
                        });
                    } else if (data && typeof data === 'object') {
                        for (let i = 1; i <= 12; i++) {
                            months[i - 1].revenue = Number(data[i] ?? data[`T${i}`] ?? data[`M${i}`] ?? 0);
                        }
                    }
                    setRevenueSeries(months);
                } else {
                    let data;
                    try {
                        data = await getRevenueDailyFlexible(token, selectedYear, selectedMonth);
                    } catch (err) {
                        console.error('Daily revenue fetch failed (all attempts):', err);
                        setRevenueSeries([]);
                        setToast({ message: 'Không lấy được dữ liệu theo ngày. Vui lòng kiểm tra backend.', type: 'error' });
                        setRevenueLoading(false);
                        return;
                    }

                    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
                    const days = Array.from({ length: daysInMonth }, (_, i) => ({ name: `${i + 1}`, revenue: 0 }));
                    if (Array.isArray(data)) {
                        data.forEach((item) => {
                            const d = Number(item.day) || Number(item.date) || Number(item.dayOfMonth) || 0;
                            const val = Number(item.revenue ?? item.totalRevenue ?? item.value ?? 0);
                            if (d >= 1 && d <= daysInMonth) days[d - 1].revenue = val;
                        });
                    } else if (data && typeof data === 'object') {
                        for (let d = 1; d <= daysInMonth; d++) days[d - 1].revenue = Number(data[d] ?? 0);
                    }
                    setRevenueSeries(days);
                }
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu doanh thu:', error);
                setToast({ message: 'Lỗi khi tải dữ liệu doanh thu.', type: 'error' });
            } finally {
                setRevenueLoading(false);
            }
        };

        fetchRevenueSeries();
    }, [token, revenueGranularity, selectedYear, selectedMonth]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 shadow-lg rounded-lg border">
                    <p className="text-gray-800 font-medium">{revenueGranularity === 'daily' ? `Ngày ${label}` : `Tháng ${label}`}</p>
                    <p className="text-sm text-gray-700">Doanh thu: {payload[0].value?.toLocaleString?.('vi-VN') ?? payload[0].value} VND</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-6 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header với thông tin admin */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-white/20">
                    {loading ? (
                        <div className="flex justify-center items-center py-4">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="mr-4 relative cursor-pointer group" onClick={() => { setProfileForm(admin); setShowProfileModal(true); }}>
                                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:shadow-xl transition-all duration-300">
                                        {admin.fullname ? admin.fullname.charAt(0) : 'A'}
                                    </div>
                                    <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-md">Sửa</span>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800 mb-1">Chào mừng trở lại, {admin.fullname || 'Quản trị viên'}!</h1>
                                    <p className="text-gray-600">Bảng điều khiển quản trị - {admin.email || 'admin@example.com'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Toast notification */}
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}

                {/* Thống kê tăng trưởng */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {growthStats.map((item, index) => (
                        <div key={item.label} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-white/20">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                                    {item.icon}
                                </div>
                                <div className={`${item.bgColor} ${item.textColor} px-3 py-1 rounded-full text-sm font-medium`}>
                                    {item.value}
                                </div>
                            </div>
                            <h3 className="font-semibold text-gray-800 mb-1">{item.label}</h3>
                            <p className="text-gray-500 text-sm">{item.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Các chỉ số chính */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    {stats.map((item, index) => (
                        <div key={item.label} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-white/20">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-14 h-14 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center text-white text-xl shadow-lg`}>
                                    {item.icon}
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-gray-800 mb-1">{item.value}</div>
                            <div className="text-gray-600 text-sm">{item.label}</div>
                        </div>
                    ))}
                </div>

                {/* Biểu đồ và thông tin chi tiết */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cột trái - Biểu đồ chính */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Biểu đồ doanh thu */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-white/20">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-bold text-gray-800">
                                        {revenueGranularity === 'daily'
                                            ? `Doanh thu Thg ${selectedMonth} - ${selectedYear}`
                                            : `Doanh thu Năm ${selectedYear}`}
                                    </h3>

                                    <div className="ml-4 flex items-center gap-2">
                                        <select
                                            value={revenueGranularity}
                                            onChange={(e) => setRevenueGranularity(e.target.value)}
                                            className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="monthly">Theo tháng (năm)</option>
                                            <option value="daily">Theo ngày (tháng)</option>
                                        </select>

                                        {/* Year selector only when monthly view */}
                                        {revenueGranularity === 'monthly' ? (
                                            <select
                                                value={selectedYear}
                                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                                className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                {[currentYear - 2, currentYear - 1, currentYear].map((y) => (
                                                    <option key={y} value={y}>{y}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            // show year as label when viewing daily
                                            <span className="text-sm text-gray-600 px-2">{selectedYear}</span>
                                        )}

                                        {/* Month selector only when daily view */}
                                        <select
                                            value={selectedMonth}
                                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                            disabled={revenueGranularity === 'monthly'}
                                            className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                        >
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                                <option key={m} value={m}>{`Thg ${m}`}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="h-80">
                                {revenueLoading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                    </div>
                                ) : revenueSeries.length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        Không có dữ liệu cho lựa chọn này.
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={revenueSeries} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                            <defs>
                                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="#3b82f6"
                                                strokeWidth={2}
                                                fill="url(#revenueGradient)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                            <div className="flex items-center justify-center gap-6 mt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                    <span className="text-sm text-gray-600">Doanh thu thực tế</span>
                                </div>
                            </div>
                        </div>

                        {/* Top món ăn */}
                        <div className="bg-white rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-gray-800">Thống kê tình trạng các món ăn</h3>

                                    {/* Bộ lọc sắp xếp */}
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span className="hidden sm:inline">Sắp xếp:</span>
                                        <select
                                            value={topFoodSort}
                                            onChange={(e) => setTopFoodSort(e.target.value)}
                                            className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="MOST_SOLD">Bán chạy nhất</option>
                                            <option value="LEAST_SOLD">Ít bán nhất</option>
                                            <option value="HIGHEST_RATING">Đánh giá cao nhất</option>
                                            <option value="LOWEST_RATING">Đánh giá thấp nhất</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tên món ăn</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Lượt đặt</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Đánh giá</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topFoodsLoading ? (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-6 text-center">
                                                    <div className="flex items-center justify-center gap-2 text-gray-500">
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        <span>Đang tải dữ liệu...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : topFoods.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-6 text-center text-gray-500">
                                                    Chưa có dữ liệu top món ăn.
                                                </td>
                                            </tr>
                                        ) : (
                                            topFoods.map((food, idx) => (
                                                <tr
                                                    key={food.productId || food.name || idx}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white mr-3">
                                                                <FaHamburger />
                                                            </div>
                                                            <span className="font-semibold text-gray-800">
                                                                {food.name}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                                            {food.orders}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center text-sm">
                                                            <FaStar className="text-yellow-400 mr-1" />
                                                            <span className="font-semibold text-gray-800">
                                                                {food.rating}
                                                            </span>
                                                            <span className="text-gray-400 text-xs ml-2">
                                                                ({food.ratingCount} lượt)
                                                            </span>
                                                        </div>
                                                    </td>

                                                </tr>
                                            ))
                                        )}
                                    </tbody>

                                </table>
                            </div>
                        </div>

                        {/* Tài khoản nổi bật */}
                        <div className="bg-white rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-xl font-bold text-gray-800">Tài khoản nổi bật</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tên khách hàng</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Lần đặt bàn</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Đơn hàng gần nhất</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tổng chi tiêu</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Số đơn hàng</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {notableAccounts.map((account, idx) => (
                                            <tr key={account.name} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center text-white mr-3">
                                                            <FaUserCircle />
                                                        </div>
                                                        <span className="font-semibold text-gray-800">{account.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{formatDate(account.lastBooking)}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{account.lastOrder}</td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                                        {account.totalSpent}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                                        {account.orderCount}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Cột phải - Thông tin bổ sung */}
                    <div className="space-y-6">
                        {/* Biểu đồ tròn loại sản phẩm */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-white/20">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Các loại sản phẩm</h3>
                            {productTypeLoading ? (
                                <div className="flex justify-center items-center h-48">
                                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                </div>
                            ) : foodProductType.length > 0 ? (
                                <>
                                    <div className="flex justify-center mb-4">
                                        <PieChart width={200} height={200}>
                                            <Pie
                                                data={foodProductType}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {foodProductType.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </div>

                                    <div className="space-y-2">
                                    {foodProductType.map((item) => (
                                        <div key={item.name} className="flex items-center justify-between">
                                        <div className="flex items-center min-w-0">
                                            <div
                                            className="w-3 h-3 rounded-full mr-2 shrink-0"
                                            style={{ backgroundColor: item.color }}
                                            />
                                            <span className="text-sm text-gray-600 truncate max-w-[120px]">
                                            {item.name}
                                            </span>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-800">
                                            {(item.value ?? 0).toLocaleString('vi-VN')} món
                                        </span>
                                        </div>
                                    ))}
                                    </div>

                                </>
                            ) : (
                                <p className="text-center text-gray-600">Không có dữ liệu loại sản phẩm.</p>
                            )}
                        </div>

                        {/* Trạng thái đơn hàng  */}
                        <div className="bg-white rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex flex-col gap-3">
                                    {/* Tiêu đề + mô tả */}
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">
                                            Trạng thái đơn hàng
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Thống kê số đơn theo trạng thái
                                        </p>
                                    </div>

                                    {/* Bộ lọc ngày */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-400">-</span>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            onClick={handleFilterOrderStatus}
                                            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
                                        >
                                            Lọc
                                        </button>
                                    </div>
                                </div>
                            </div>




                            <div className="p-6">
                                {orderStatusLoading ? (
                                    <div className="flex items-center justify-center gap-2 text-gray-500 py-6">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Đang tải dữ liệu...</span>
                                    </div>
                                ) : orderStatusSummary.length === 0 ? (
                                    <div className="text-center text-gray-500 py-6">
                                        Chưa có đơn hàng nào trong ngày hôm nay.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        {orderStatusSummary.map((item) => {
                                            const config =
                                                orderStatusConfig[item.status] || {
                                                    label: item.status,
                                                    bg: 'bg-gray-50',
                                                    text: 'text-gray-700',
                                                    dot: 'bg-gray-400',
                                                };

                                            return (
                                                <div
                                                    key={item.status}
                                                    className={`flex items-center justify-between p-3 rounded-xl ${config.bg}`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`w-2 h-2 rounded-full ${config.dot}`}
                                                        ></span>
                                                        <span
                                                            className={`text-sm font-medium ${config.text}`}
                                                        >
                                                            {config.label}
                                                        </span>
                                                    </div>
                                                    <span
                                                        className={`text-lg font-bold tracking-tight ${config.text}`}
                                                    >
                                                        {item.count}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>


                        
                    </div>
                </div>
            </div>

            {/* Modal chỉnh sửa thông tin cá nhân */}
            {showProfileModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl">
                        <form onSubmit={handleProfileSubmit}>
                            <div className="flex justify-between items-center p-6 border-b border-gray-200">
                                <h5 className="text-xl font-bold text-gray-800">Chỉnh sửa thông tin admin</h5>
                                <button
                                    type="button"
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                    onClick={() => setShowProfileModal(false)}
                                    disabled={updateLoading}
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex-1 min-w-[200px]">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tên đăng nhập</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100 cursor-not-allowed"
                                            name="username"
                                            value={profileForm.username}
                                            disabled
                                        />
                                    </div>
                                    <div className="flex-1 min-w-[200px]">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            name="fullname"
                                            value={profileForm.fullname}
                                            onChange={handleProfileChange}
                                            required
                                            disabled={updateLoading}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-[200px]">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
                                        <input
                                            type="email"
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            name="email"
                                            value={profileForm.email}
                                            onChange={handleProfileChange}
                                            required
                                            disabled={updateLoading}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-[200px]">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                                        <input
                                            type="tel"
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            name="phoneNumber"
                                            value={profileForm.phoneNumber}
                                            onChange={handleProfileChange}
                                            disabled={updateLoading}
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ</label>
                                    <textarea
                                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        name="address"
                                        value={profileForm.address}
                                        onChange={handleProfileChange}
                                        rows={4}
                                        disabled={updateLoading}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    onClick={() => setShowProfileModal(false)}
                                    disabled={updateLoading}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                    disabled={updateLoading}
                                >
                                    {updateLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Đang lưu...
                                        </>
                                    ) : (
                                        'Lưu thay đổi'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;