import React, { useState, useEffect } from "react";
import { Table } from "antd";
import { collection, getDocs, where, query } from "firebase/firestore";
import { db, auth } from "../../Services/firebase";
import { useNavigate } from "react-router-dom"; // Thêm useNavigate để điều hướng

export default function VehicleShow() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Sử dụng navigate để điều hướng người dùng

  useEffect(() => {
    const fetchApprovedVehicles = async () => {
      setLoading(true);

      // Lấy thông tin người dùng hiện tại từ Firebase Authentication
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.error("No user is logged in.");
        alert("Vui lòng đăng nhập để xem phương tiện đã được phê duyệt.");
        navigate("/login"); // Điều hướng người dùng đến trang đăng nhập
        setLoading(false);
        return;
      }

      const userId = currentUser.uid; // Lấy user ID

      // Truy vấn dữ liệu từ Firestore cho phương tiện đã được phê duyệt của người dùng
      const q = query(
        collection(db, "Vehicle"),
        where("userId", "==", userId),
        where("status", "==", "approved")
      );

      const querySnapshot = await getDocs(q);
      const approvedVehicles = [];

      querySnapshot.forEach((doc) => {
        approvedVehicles.push({ ...doc.data(), id: doc.id });
      });

      setVehicles(approvedVehicles);
      setLoading(false);
    };

    fetchApprovedVehicles();
  }, [navigate]); // Thêm navigate vào dependency để đảm bảo điều hướng chính xác

  const columns = [
    {
      title: "Loại phương tiện",
      dataIndex: "vehicleType",
      key: "vehicleType",
    },
    {
      title: "Biển số",
      dataIndex: "licensePlate",
      key: "licensePlate",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Hình ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (text) =>
        text ? <img src={text} alt="vehicle" style={{ width: 100 }} /> : "N/A",
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={vehicles}
      loading={loading}
      rowKey="id"
      pagination={false}
    />
  );
}
