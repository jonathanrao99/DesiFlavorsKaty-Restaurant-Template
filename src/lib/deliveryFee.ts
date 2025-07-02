import { Client } from "@googlemaps/google-maps-services-js";

const ORIGIN = "1989 North Fry Rd, Katy, TX 77449";

export const calculateDistanceFee = async (customerAddress: string, orderDate: Date = new Date()) => {
  const client = new Client({});
  try {
    const response = await client.distancematrix({
      params: {
        origins: [ORIGIN],
        destinations: [customerAddress],
        key: process.env.GOOGLE_MAPS_API_KEY as string,
      },
    });
    const distanceInMeters = response.data.rows[0].elements[0].distance.value;
    const distanceInMiles = distanceInMeters / 1609.34;
    // Pricing Logic
    let deliveryFee = 5; // base fee
    if (distanceInMiles > 3) deliveryFee += 2;
    if (distanceInMiles > 6) deliveryFee += 5;
    // Peak hour surcharge: 8pm–10pm
    const hour = orderDate.getHours();
    if (hour >= 20 && hour < 22) deliveryFee += 2;
    return deliveryFee;
  } catch (error) {
    console.error("Error calculating delivery distance:", error);
    return 5; // default fee if Google API fails
  }
}; 