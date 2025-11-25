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
 * 📌 Thống kê tổng quan dashboard:
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
 * 📌 Doanh thu theo tháng cho 1 năm (dùng cho biểu đồ)
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
 * 📌 Top món ăn cho bảng "Món ăn nổi bật" trên dashboard
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

/**
 * 📌 Top người dùng nâng cao cho dashboard
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

