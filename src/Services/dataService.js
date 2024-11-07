// import { collection, getDocs, query, where } from "firebase/firestore";
// import { db } from "./firebase"; 


// const fetchUsersWithRoomData = async () => {
//   const usersSnapshot = await getDocs(collection(db, "Users"));
//   const roomsSnapshot = await getDocs(collection(db, "rooms"));
  
//   const users = [];

//   for (const userDoc of usersSnapshot.docs) {
//     const userData = userDoc.data();
//     if (userData.role === "owner") {
//       const roomDoc = roomsSnapshot.docs.find(
//         (doc) => doc.data().roomNumber === userData.room
//       );
//       const roomData = roomDoc ? roomDoc.data() : {};
//       users.push({
//         id: userDoc.id,
//         username: userData.Username,
//         room: userData.room,
//         building: userData.building,
//         area: roomData.area || 0,
//         totalVehicles: 0,
//         carCount: 0,
//         motorcycleCount: 0,
//         electricBicycleCount: 0,
//         bicycleCount: 0,
//         CSC: 0,
//         CSD: 0,
//       });
//     }
//   }

//   return users;
// };


// const fetchGroupedVehicles = async () => {
//   const vehicleQuery = query(
//     collection(db, "Vehicle"),
//     where("status", "==", "approved")
//   );
//   const vehicleSnapshot = await getDocs(vehicleQuery);

//   const groupedVehicles = {};

//   vehicleSnapshot.docs.forEach((doc) => {
//     const vehicle = doc.data();
//     const userId = vehicle.userId;
//     const vehicleType = vehicle.vehicleType;

//     if (!groupedVehicles[userId]) {
//       groupedVehicles[userId] = {
//         totalVehicles: 0,
//         carCount: 0,
//         motorcycleCount: 0,
//         electricBicycleCount: 0,
//         bicycleCount: 0,
//       };
//     }

//     groupedVehicles[userId].totalVehicles += 1;
//     if (vehicleType === "car") groupedVehicles[userId].carCount += 1;
//     else if (vehicleType === "motorbike") groupedVehicles[userId].motorcycleCount += 1;
//     else if (vehicleType === "electric_bicycle") groupedVehicles[userId].electricBicycleCount += 1;
//     else if (vehicleType === "bicycle") groupedVehicles[userId].bicycleCount += 1;
//   });

//   return groupedVehicles;
// };


// const fetchPrices = async () => {
//   const [cleanPricesSnapshot, waterPricesSnapshot, parkingPricesSnapshot] = await Promise.all([
//     getDocs(collection(db, "cleanPrices")),
//     getDocs(collection(db, "waterPrices")),
//     getDocs(collection(db, "parkingPrices")),
//   ]);

//   const cleanPriceData = cleanPricesSnapshot.docs.map((doc) => doc.data());
//   const defaultCleanPrice = cleanPriceData.find((price) => price.default)?.price || 0;

//   const waterPriceData = waterPricesSnapshot.docs.map((doc) => doc.data());
//   const defaultWaterPrice = waterPriceData.find((price) => price.default)?.price || 0;

//   const parkingPrices = {};
//   parkingPricesSnapshot.docs.forEach((doc) => {
//     const data = doc.data();
//     if (data.vehicleType && data.price) {
//       parkingPrices[data.vehicleType] = data.price;
//     }
//   });

//   return {
//     cleanPrice: defaultCleanPrice,
//     waterPrice: defaultWaterPrice,
//     parkingPrices,
//   };
// };


// export const fetchUsersAndPrices = async () => {
//   const users = await fetchUsersWithRoomData();
//   const vehicles = await fetchGroupedVehicles();
//   const { cleanPrice, waterPrice, parkingPrices } = await fetchPrices();

//   const mergedUsers = users.map((user) => {
//     const userVehicles = vehicles[user.id] || {};
    
//     const totalAreaFee = user.area * cleanPrice;
//     const totalCar = (userVehicles.carCount || 0) * (parkingPrices.Car || 0);
//     const totalMotorbike = (userVehicles.motorcycleCount || 0) * (parkingPrices.Motorcycle || 0);
//     const totalElectric = (userVehicles.electricBicycleCount || 0) * (parkingPrices.Electric || 0);
//     const totalBicycle = (userVehicles.bicycleCount || 0) * (parkingPrices.Bicycle || 0);
//     const totalParking = totalCar + totalMotorbike + totalElectric + totalBicycle;

//     return {
//       ...user,
//       ...userVehicles,
//       priceservice: cleanPrice,
//       totalarea: totalAreaFee,
//       priceswater: waterPrice,
//       totalcar: totalCar,
//       totalmotorbike: totalMotorbike,
//       totalelectric: totalElectric,
//       totalbicycle: totalBicycle,
//       totalParking,
//       totalmoney: totalAreaFee + totalParking,
//       ...Object.keys(parkingPrices).reduce((acc, type) => {
//         acc[`prices${type}`] = parkingPrices[type];
//         return acc;
//       }, {}),
//     };
//   });

//   return mergedUsers;
// };
