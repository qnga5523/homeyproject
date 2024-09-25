import React, { useState, useEffect } from "react";
import { message } from "antd";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../../Services/firebase";

export default function ListVehicle() {
  const [vehicleCounts, setVehicleCounts] = useState({
    motorbike: 0,
    car: 0,
    bicycle: 0,
    electric_bicycle: 0,
  });

  useEffect(() => {
    // Hàm để đếm các loại phương tiện
    const fetchAndCountVehicles = async () => {
      try {
        const usersCollectionRef = collection(db, "Users");
        const querySnapshot = await getDocs(usersCollectionRef);

        // Tạo một đối tượng để lưu số lượng xe
        const counts = {
          motorbike: 0,
          car: 0,
          bicycle: 0,
          electric_bicycle: 0,
        };

        // Duyệt qua mỗi tài liệu người dùng
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.vehicles && Array.isArray(userData.vehicles)) {
            // Duyệt qua mỗi phương tiện trong danh sách vehicles
            userData.vehicles.forEach((vehicle) => {
              const type = vehicle.vehicleType;
              if (counts[type] !== undefined) {
                counts[type] += 1; // Tăng số lượng loại phương tiện tương ứng
              }
            });
          }
        });

        setVehicleCounts(counts); // Cập nhật số lượng phương tiện vào state
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        message.error("Lỗi khi lấy dữ liệu phương tiện.");
      }
    };

    fetchAndCountVehicles();
  }, []);

  return (
    <div>
      <h3>Số lượng phương tiện theo loại:</h3>
      <p>Xe máy: {vehicleCounts.motorbike}</p>
      <p>Ô tô: {vehicleCounts.car}</p>
      <p>Xe đạp: {vehicleCounts.bicycle}</p>
      <p>Xe đạp điện: {vehicleCounts.electric_bicycle}</p>
    </div>
  );
}
