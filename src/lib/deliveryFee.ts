export const calculateDistanceFee = async (customerAddress: string, orderDate: Date = new Date()) => {
  try {
    const response = await fetch('/api/distance-fee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: customerAddress,
        orderDate: orderDate.toISOString(),
      }),
    });
    const { fee, distanceInMiles, error } = await response.json();
    console.log('Distance from server (miles):', distanceInMiles);
    if (error) {
      console.error('Distance-fee API error:', error);
      throw new Error(error);
    }
    return fee;
  } catch (error) {
    console.error('Error calculating delivery distance:', error);
    return 5; // default fee
  }
}; 