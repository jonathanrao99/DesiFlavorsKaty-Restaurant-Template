import { deliveryApi } from './supabaseFunctions';

export const calculateDistanceFee = async (customerAddress: string, customerPhone: string, orderDate: Date = new Date()) => {
  try {
    const { fee } = await deliveryApi.calculateFee(customerAddress, customerPhone);
    console.log('Delivery fee from ShipDay:', fee);
    return fee;
  } catch (error) {
    console.error('Error calculating delivery fee:', error);
    return 5; // default fee if ShipDay API fails
  }
}; 