// export const calculation = (user, cleanPrice, waterPrice, parkingPrices) => {
//  // Calculate total area fee based on area and clean price
//  const totalAreaFee = user.area * (cleanPrice || 0);
  
//  // Calculate water consumption and total water fee
//  const CSC = user.CSC ?? 0;
//  const CSD = user.CSD ?? 0;
//  const totalConsume = CSC - CSD;
//  const totalWater = totalConsume * (waterPrice || 0);

//  // Calculate total fees for each type of vehicle
//  const totalCar = (user.carCount || 0) * (parkingPrices.Car || 0);
//  const totalMotorbike = (user.motorcycleCount || 0) * (parkingPrices.Motorcycle || 0);
//  const totalElectric = (user.electricBicycleCount || 0) * (parkingPrices.Electric || 0);
//  const totalBicycle = (user.bicycleCount || 0) * (parkingPrices.Bicycle || 0);

//  // Calculate the total parking fee
//  const totalParking = totalCar + totalMotorbike + totalElectric + totalBicycle;

//  // Calculate the grand total
//  const totalMoney = totalAreaFee + totalWater + totalParking;

//  return {
//    totalarea: totalAreaFee,
//    totalconsume: totalConsume,
//    totalwater: totalWater,
//    totalcar: totalCar,
//    totalmotorbike: totalMotorbike,
//    totalelectric: totalElectric,
//    totalbicycle: totalBicycle,
//    totalparking: totalParking,
//    totalmoney: totalMoney,
//  };
// };
