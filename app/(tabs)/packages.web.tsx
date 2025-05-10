import React, { useEffect, useState } from "react";
import { Package } from "@/interfaces/package.interface";
import PaymentService from "@/services/PaymentService";

export default function PackagesWeb() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Giả sử PaymentService có hàm fetchPackages cho web giống mobile
        const data = await PaymentService.fetchPackages();
        setPackages(data);
      } catch (err: any) {
        setError(err?.message || "Lỗi khi tải danh sách gói cước");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const handlePurchase = async (pkg: Package) => {
    setPurchaseError(null);
    try {
      await PaymentService.purchaseSubscription(pkg._id);
      alert("Mua gói thành công!");
    } catch (err: any) {
      setPurchaseError(err?.message || "Lỗi khi mua gói cước");
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: "0 auto" }}>
      <h2>Danh sách gói cước</h2>
      {isLoading && <p>Đang tải...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {packages.map((pkg) => (
          <li key={pkg._id} style={{ marginBottom: 24, border: "1px solid #eee", borderRadius: 8, padding: 16 }}>
            <div><b>{pkg.name}</b></div>
            <div>Giá: {pkg.price}đ</div>
            <div>Thời hạn: {pkg.duration} ngày</div>
            <button onClick={() => handlePurchase(pkg)} style={{ marginTop: 8 }}>
              Mua gói này
            </button>
          </li>
        ))}
      </ul>
      {purchaseError && <p style={{ color: "red" }}>{purchaseError}</p>}
    </div>
  );
}
