import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/statistics';

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

export const getAllCategories = async (token) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/categories`, {
            headers: getAuthHeaders(token),
            timeout: 5000,
        });
        return response.data;
    } catch (error) {
        const errorMessage =
            error.response?.data?.error ||
            error.response?.data ||
            error.message ||
            'Lỗi không xác định';
        console.error('Lỗi khi lấy danh sách danh mục:', errorMessage);
        throw new Error(errorMessage);
    }
};

export const getAllProductTypes = async (token) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/product-types`, {
            headers: getAuthHeaders(token),
            timeout: 5000,
        });
        return response.data;
    } catch (error) {
        const errorMessage =
            error.response?.data?.error ||
            error.response?.data ||
            error.message ||
            'Lỗi không xác định';
        console.error('Lỗi khi lấy danh sách loại sản phẩm:', errorMessage);
        throw new Error(errorMessage);
    }
};

export const getTopPopularDishes = async (token, limit = 3) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/top-dishes`, {
            params: { limit },
            headers: getAuthHeaders(token),
            timeout: 5000,
        });
        return response.data;
    } catch (error) {
        const errorMessage =
            error.response?.data?.error ||
            error.response?.data ||
            error.message ||
            'Lỗi không xác định';
        console.error('Lỗi khi lấy danh sách món ăn nổi bật:', errorMessage);
        throw new Error(errorMessage);
    }
};

export const getRecentActivities = async (token, limit = 7) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/recent-activities`, {
            params: { limit },
            headers: getAuthHeaders(token),
            timeout: 5000,
        });
        return response.data;
    } catch (error) {
        const errorMessage =
            error.response?.data?.error ||
            error.response?.data ||
            error.message ||
            'Lỗi không xác định';
        console.error('Lỗi khi lấy hoạt động gần đây:', errorMessage);
        throw new Error(errorMessage);
    }
};

export const getTopUsers = async (token, limit = 3) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/top-users`, {
            params: { limit },
            headers: getAuthHeaders(token),
            timeout: 5000,
        });
        return response.data;
    } catch (error) {
        const errorMessage =
            error.response?.data?.error ||
            error.response?.data ||
            error.message ||
            'Lỗi không xác định';
        console.error('Lỗi khi lấy danh sách người dùng nổi bật:', errorMessage);
        throw new Error(errorMessage);
    }
};

export const getQuickSummary = async (token) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/summary`, {
            headers: getAuthHeaders(token),
            timeout: 5000,
        });
        return response.data;
    } catch (error) {
        const errorMessage =
            error.response?.data?.error ||
            error.response?.data ||
            error.message ||
            'Lỗi không xác định';
        console.error('Lỗi khi lấy tóm tắt nhanh:', errorMessage);
        throw new Error(errorMessage);
    }
};

/**
 *  Thống kê tổng quan dashboard:
 * totalProducts, totalUsers, totalOrders, totalBookings, totalRevenue
 */
export const getDashboardOverview = async (token) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/dashboard/overview`, {
            headers: getAuthHeaders(token),
            timeout: 5000,
        });
        return response.data;
    } catch (error) {
        const errorMessage =
            error.response?.data?.error ||
            error.response?.data ||
            error.message ||
            'Lỗi không xác định';
        console.error('Lỗi khi lấy thống kê tổng quan dashboard:', errorMessage);
        throw new Error(errorMessage);
    }
};

/**
 *  Doanh thu theo tháng cho 1 năm (dùng cho biểu đồ)
 * year: số, ví dụ 2025 (có thể để undefined để BE dùng năm hiện tại)
 */
export const getRevenueByMonth = async (token, year) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/dashboard/revenue`, {
            params: { year },
            headers: getAuthHeaders(token),
            timeout: 5000,
        });
        return response.data;
    } catch (error) {
        const errorMessage =
            error.response?.data?.error ||
            error.response?.data ||
            error.message ||
            'Lỗi không xác định';
        console.error('Lỗi khi lấy doanh thu theo tháng:', errorMessage);
        throw new Error(errorMessage);
    }
};

/**
 *  Doanh thu theo ngày cho 1 tháng của 1 năm
 * year: số (ví dụ 2025)
 * month: số (1-12)
 */
export const getRevenueByDay = async (token, year, month) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/dashboard/revenue/daily`, {
            params: { year, month },
            headers: getAuthHeaders(token),
            timeout: 5000,
        });
        return response.data;
    } catch (error) {
        const errorMessage =
            error.response?.data?.error ||
            error.response?.data ||
            error.message ||
            'Lỗi không xác định';
        console.error('Lỗi khi lấy doanh thu theo ngày:', errorMessage);
        throw new Error(errorMessage);
    }
};

/**
 * Try multiple param variations for daily revenue endpoint to handle different backend expectations
 */
export const getRevenueByDayVariants = async (token, year, month) => {
    const variants = [
        { year, month },
        { year, monthIndex: month - 1 },
        { year, m: month },
        { year, month: String(month).padStart(2, '0') },
        { year, monthIndex: String(month - 1).padStart(2, '0') },
    ];

    let lastError = null;
    for (const params of variants) {
        try {
            const response = await axios.get(`${API_BASE_URL}/dashboard/revenue/daily`, {
                params,
                headers: getAuthHeaders(token),
                timeout: 5000,
            });
            return response.data;
        } catch (err) {
            lastError = err;
            console.warn('getRevenueByDay variant failed', params, err?.response?.status || err.message);
            // try next variant
        }
    }

    const errorMessage = lastError?.response?.data || lastError?.message || 'All variants failed';
    console.error('All getRevenueByDay variants failed:', errorMessage);
    throw lastError || new Error(errorMessage);
};

/**
 * Flexible daily revenue fetcher: tries multiple endpoint paths and param shapes
 * Returns the first successful response data or throws the last error.
 */
export const getRevenueDailyFlexible = async (token, year, month) => {
    const endpoints = [
        { path: `${API_BASE_URL}/dashboard/revenue/daily`, useGranularity: false },
        { path: `${API_BASE_URL}/dashboard/revenue`, useGranularity: true },
    ];

    const paramVariants = [
        { year, month },
        { year, monthIndex: month - 1 },
        { year, m: month },
        { year, month: String(month).padStart(2, '0') },
        { year, monthIndex: String(month - 1).padStart(2, '0') },
    ];

    let lastError = null;
    for (const ep of endpoints) {
        for (const params of paramVariants) {
            const finalParams = { ...params };
            if (ep.useGranularity) finalParams.granularity = 'daily';
            try {
                const response = await axios.get(ep.path, {
                    params: finalParams,
                    headers: getAuthHeaders(token),
                    timeout: 5000,
                });
                return response.data;
            } catch (err) {
                lastError = err;
                console.warn('getRevenueDailyFlexible attempt failed', { path: ep.path, params: finalParams, status: err?.response?.status || err.message });
            }
        }
    }
    console.error('getRevenueDailyFlexible: all attempts failed', lastError);
    throw lastError || new Error('All attempts to fetch daily revenue failed');
};

/**
 *  Top món ăn cho bảng "Món ăn nổi bật" trên dashboard
 */
export const getDashboardTopFoods = async (token, limit = 5) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/dashboard/top-foods`, {
            params: { limit },
            headers: getAuthHeaders(token),
            timeout: 5000,
        });
        return response.data;
    } catch (error) {
        const errorMessage =
            error.response?.data?.error ||
            error.response?.data ||
            error.message ||
            'Lỗi không xác định';
        console.error('Lỗi khi lấy top món ăn dashboard:', errorMessage);
        throw new Error(errorMessage);
    }
};

export const getTopFoods = async (token, limit = 3) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/top-foods`, {
            params: { limit },
            headers: getAuthHeaders(token),
            timeout: 5000,
        });
        return response.data; // [{ productId, name, orders, rating }]
    } catch (error) {
        const errorMessage =
            error.response?.data?.error ||
            error.response?.data ||
            error.message ||
            'Lỗi không xác định';
        console.error('Lỗi khi lấy top món ăn bán chạy:', errorMessage);
        throw new Error(errorMessage);
    }
};

export const getOrderStatusSummary = async (token, from, to) => {
    try {
        const params = {};
        if (from) params.from = from;
        if (to) params.to = to;

        const response = await axios.get(`${API_BASE_URL}/order-status-summary`, {
            params,
            headers: getAuthHeaders(token),
            timeout: 5000,
        });

        return response.data; // [{ status: 'PENDING', count: 2 }, ...]
    } catch (error) {
        const errorMessage =
            error.response?.data?.error ||
            error.response?.data ||
            error.message ||
            'Lỗi không xác định';
        console.error('Lỗi khi lấy thống kê trạng thái đơn hàng:', errorMessage);
        throw new Error(errorMessage);
    }
};


/**
 *  Top người dùng nâng cao cho dashboard
 */
export const getDashboardTopUsersAdvanced = async (token, limit = 5) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/dashboard/top-users-advanced`,
            {
                params: { limit },
                headers: getAuthHeaders(token),
                timeout: 5000,
            }
        );
        return response.data;
    } catch (error) {
        const errorMessage =
            error.response?.data?.error ||
            error.response?.data ||
            error.message ||
            'Lỗi không xác định';
        console.error('Lỗi khi lấy top user dashboard:', errorMessage);
        throw new Error(errorMessage);
    }
};

export const getProductTypeStats = async (token) => {
    try {
        const response = await axios.get(
            'http://localhost:8080/api/product-types/stats',
            {
                headers: getAuthHeaders(token),
                timeout: 5000,
            }
        );
        return response.data; // [{ name, totalProducts }, ...]
    } catch (error) {
        const errorMessage =
            error.response?.data?.error ||
            error.response?.data ||
            error.message ||
            'Lỗi không xác định';
        console.error('Lỗi khi lấy thống kê loại sản phẩm:', errorMessage);
        throw new Error(errorMessage);
    }
};

