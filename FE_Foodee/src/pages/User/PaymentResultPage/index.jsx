import React, { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api"; // sửa theo dự án của bạn

const PaymentResultPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const params = useMemo(() => {
        const sp = new URLSearchParams(location.search);
        return {
            amount: sp.get("vnp_Amount"),
            bankCode: sp.get("vnp_BankCode"),
            orderInfo: sp.get("vnp_OrderInfo"),
            payDate: sp.get("vnp_PayDate"),
            responseCode: sp.get("vnp_ResponseCode"),
            transactionStatus: sp.get("vnp_TransactionStatus"),
            txnRef: sp.get("vnp_TxnRef"),
        };
    }, [location.search]);

    const isSuccess =
        params.responseCode === "00" &&
        params.transactionStatus === "00";

    // 🔥 Gọi API backend để cập nhật trạng thái đơn
    useEffect(() => {
        const confirmPayment = async () => {
            try {
                await axios.post(
                    `${API_BASE_URL}/payments/vnpay/confirm${location.search}`
                );
            } catch (err) {
                console.error("Lỗi cập nhật đơn hàng:", err);
            }
        };

        confirmPayment();
    }, [location.search]);

    const formattedAmount = params.amount
        ? Number(params.amount) / 100
        : 0;

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white px-4">
            <div className="max-w-lg w-full bg-slate-800 rounded-2xl p-8 shadow-xl">
                <h1 className="text-2xl font-bold mb-4 text-center">
                    {isSuccess ? "Thanh toán thành công 🎉" : "Thanh toán thất bại ❌"}
                </h1>

                <div className="space-y-2 text-sm">
                    <p><span className="font-semibold">Mã đơn hàng:</span> #{params.txnRef}</p>
                    <p><span className="font-semibold">Số tiền:</span> {formattedAmount.toLocaleString()} VND</p>
                    <p><span className="font-semibold">Ngân hàng:</span> {params.bankCode}</p>
                    <p><span className="font-semibold">Nội dung:</span> {decodeURIComponent(params.orderInfo || "")}</p>
                </div>

                <button
                    onClick={() => navigate('/orders/history')}
                    className="mt-6 w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold"
                >
                    Về lịch sử đơn hàng
                </button>

            </div>
        </div>
    );
};

export default PaymentResultPage;
