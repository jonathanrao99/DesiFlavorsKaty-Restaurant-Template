import { deliveryApi } from './supabaseFunctions';

export const calculateDistanceFee = async (customerAddress: string, customerPhone: string, orderDate: Date = new Date()) => {
  try {
    console.log('Calling delivery API with:', { customerAddress, customerPhone });
    // Add timeout to the API call
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out')), 8000); // 8 second timeout
    });
    const apiPromise = deliveryApi.calculateFee(customerAddress, customerPhone);
    const response = await Promise.race([apiPromise, timeoutPromise]);
    console.log('Delivery API response:', response);
    if (!response || typeof response.fee !== 'number') {
      throw new Error('Invalid response from delivery API');
    }
    return response.fee;
  } catch (error) {
    console.error('Delivery fee calculation failed:', error);
    throw error; // Re-throw the error instead of returning fallback
  }
}; 