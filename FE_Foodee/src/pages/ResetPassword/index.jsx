import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    if (!password || !confirm) {
      setStatus({ type: "error", message: "Vui lòng nhập đầy đủ mật khẩu" });
      return;
    }
    if (password !== confirm) {
      setStatus({ type: "error", message: "Mật khẩu nhập lại không khớp" });
      return;
    }
    if (!token) {
      setStatus({ type: "error", message: "Token không hợp lệ" });
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:8080/api/auth/reset-password", {
        token,
        newPassword: password,
      });

      setStatus({
        type: "success",
        message: "Đặt lại mật khẩu thành công. Đang chuyển tới trang đăng nhập...",
      });

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err.response?.data || "Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-rose-50 to-yellow-100 px-4">
      <div className="bg-white/90 backdrop-blur-sm w-full max-w-md p-8 rounded-2xl shadow-2xl border border-orange-100">
        <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">
          Đặt lại mật khẩu
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Nhập mật khẩu mới cho tài khoản của bạn.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Mật khẩu mới
            </label>
            <input
              type="password"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Nhập lại mật khẩu
            </label>
            <input
              type="password"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={loading}
            />
          </div>

          {status.message && (
            <div
              className={`px-4 py-3 rounded-xl text-sm ${
                status.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {status.message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : "Xác nhận"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
