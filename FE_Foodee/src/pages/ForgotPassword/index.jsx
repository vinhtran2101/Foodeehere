import { useState } from "react";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    if (!email) {
      setStatus({ type: "error", message: "Vui lòng nhập email" });
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:8080/api/auth/forgot-password", { email });

      setStatus({
        type: "success",
        message:
          "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi liên kết đặt lại mật khẩu. Vui lòng kiểm tra email.",
      });
    } catch (err) {
      setStatus({
        type: "error",
        message: "Có lỗi xảy ra, vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 px-4 py-8">
      <div className="bg-white/80 backdrop-blur-sm w-full max-w-md p-8 rounded-2xl shadow-2xl border border-white/20">
        <h2 className="text-2xl font-bold text-center mb-2">
          Quên mật khẩu
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Nhập email bạn đã đăng ký để nhận hướng dẫn đặt lại mật khẩu.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Đang gửi..." : "Gửi yêu cầu"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Nhớ mật khẩu rồi?{" "}
          <a href="/login" className="text-blue-600 font-medium">
            Quay lại đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
