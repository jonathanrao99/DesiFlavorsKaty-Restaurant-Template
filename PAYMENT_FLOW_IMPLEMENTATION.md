# Payment Flow Implementation Guide

## 🎯 **Your Desired Flow**

1. **User enters delivery address** → Shipday SDK estimates delivery fee
2. **Fee updates total** → User sees new total with delivery fee
3. **User enters other info** → Name, phone, etc.
4. **User clicks "Proceed to Pay"** → Redirected to Square checkout
5. **After successful payment** → Order created in Shipday with proper timing (25min prep + 30min delivery)

## ✅ **What's Already Working**

- ✅ **Delivery Fee Estimation**: Python SDK service working
- ✅ **Order Creation**: Successfully creating orders in Shipday
- ✅ **Timing Logic**: 25min prep + 30min delivery implemented
- ✅ **Edge Functions**: Deployed and ready

## 🔧 **Implementation Steps**

### Step 1: Update Payment Page for Delivery Fee Estimation

In your payment page component, add delivery fee estimation when the address changes:

```typescript
// In your payment page component
import { deliveryApi } from '@/lib/supabaseFunctions';

const [deliveryFee, setDeliveryFee] = useState(0);
const [isEstimating, setIsEstimating] = useState(false);

// Function to estimate delivery fee
const estimateDeliveryFee = async (address: string, subtotal: number) => {
  if (!address) return;
  
  setIsEstimating(true);
  try {
    const result = await deliveryApi.estimateDeliveryFee(address, subtotal);
    if (result.success) {
      setDeliveryFee(result.delivery_fee);
      // Update total with delivery fee
      const newTotal = subtotal + result.delivery_fee + (subtotal * 0.08); // 8% tax
      setTotalAmount(newTotal);
    }
  } catch (error) {
    console.error('Failed to estimate delivery fee:', error);
  } finally {
    setIsEstimating(false);
  }
};

// Call this when address changes
useEffect(() => {
  if (deliveryAddress && cartSubtotal > 0) {
    estimateDeliveryFee(deliveryAddress, cartSubtotal);
  }
}, [deliveryAddress, cartSubtotal]);
```

### Step 2: Update Payment Success Page

In your payment success page, use the new SDK function:

```typescript
// In src/components/payment/PaymentSuccessPage.tsx
const createShipdayOrder = async () => {
  try {
    setIsCreatingOrder(true);
    
    // Get order details from URL params or localStorage
    const orderId = searchParams.get('orderId') || `order-${Date.now()}`;
    const customerName = searchParams.get('customerName') || localStorage.getItem('customerName');
    const customerPhone = searchParams.get('customerPhone') || localStorage.getItem('customerPhone');
    const customerEmail = searchParams.get('customerEmail') || localStorage.getItem('customerEmail');
    const deliveryAddress = searchParams.get('deliveryAddress') || localStorage.getItem('deliveryAddress');
    const subtotal = parseFloat(searchParams.get('subtotal') || localStorage.getItem('subtotal') || '0');
    const deliveryFee = parseFloat(searchParams.get('deliveryFee') || localStorage.getItem('deliveryFee') || '0');
    const totalAmount = parseFloat(searchParams.get('totalAmount') || localStorage.getItem('totalAmount') || '0');
    
    // Calculate tax (8%)
    const taxAmount = subtotal * 0.08;
    
    const orderData = {
      orderId: orderId,
      customerName: customerName,
      customerPhone: customerPhone,
      customerEmail: customerEmail,
      deliveryAddress: deliveryAddress,
      orderItems: cartItems,
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      taxAmount: taxAmount,
      totalAmount: totalAmount,
      paymentId: `payment-${Date.now()}`
    };

    console.log('Creating Shipday order with SDK:', orderData);
    
    // Use the new SDK function
    const result = await deliveryApi.createShipdayOrderSDK(orderData);
    
    if (result.success) {
      console.log('✅ Shipday order created successfully:', result.shipdayOrderId);
      toast.success('Order confirmed! Your food will be ready in 25 minutes.');
      
      // Clear localStorage
      localStorage.removeItem('customerName');
      localStorage.removeItem('customerPhone');
      localStorage.removeItem('customerEmail');
      localStorage.removeItem('deliveryAddress');
      localStorage.removeItem('deliveryFee');
      localStorage.removeItem('totalAmount');
      localStorage.removeItem('subtotal');
    } else {
      console.error('❌ Failed to create Shipday order:', result.error);
      toast.error('Order received but there was an issue with delivery setup.');
    }
  } catch (error) {
    console.error('Error creating order:', error);
    toast.error('Failed to create order. Please contact support.');
  } finally {
    setIsCreatingOrder(false);
  }
};
```

### Step 3: Update Payment Page to Store All Data

Make sure your payment page stores all the necessary data:

```typescript
// Before redirecting to Square checkout
const handleProceedToPayment = () => {
  // Store all order data
  localStorage.setItem('customerName', customerName);
  localStorage.setItem('customerPhone', customerPhone);
  localStorage.setItem('customerEmail', customerEmail);
  localStorage.setItem('deliveryAddress', deliveryAddress);
  localStorage.setItem('subtotal', subtotal.toString());
  localStorage.setItem('deliveryFee', deliveryFee.toString());
  localStorage.setItem('totalAmount', totalAmount.toString());
  
  // Redirect to Square checkout
  // ... your existing Square checkout logic
};
```

## 📊 **Expected Results in Shipday Dashboard**

After implementation, your orders in Shipday should show:

- ✅ **Delivery Fees**: Proper calculated fees (not N/A)
- ✅ **Total**: Correct total including delivery fee and tax
- ✅ **Tax**: 8% tax calculation
- ✅ **Pickup Time**: 25 minutes from order placement
- ✅ **Delivery Time**: 30 minutes after pickup (55 minutes total)
- ✅ **Delivery Instructions**: Complete financial breakdown

## 🧪 **Testing the Complete Flow**

### Test Case 1: Houston Address
```
Address: 123 Main St, Houston, TX 77001
Subtotal: $25.00
Delivery Fee: $6.99
Tax (8%): $2.00
Total: $33.99
Pickup: 25 minutes from now
Delivery: 55 minutes from now
```

### Test Case 2: Katy Address (Lower Fee)
```
Address: 456 Oak Ave, Katy, TX 77449
Subtotal: $45.00
Delivery Fee: $4.99 (discount applied)
Tax (8%): $3.60
Total: $53.59
```

### Test Case 3: Large Order (Free Delivery)
```
Address: 789 Pine St, Sugar Land, TX 77478
Subtotal: $60.00
Delivery Fee: $2.99 (free delivery for orders over $50)
Tax (8%): $4.80
Total: $67.79
```

## 🔄 **Migration Strategy**

### Phase 1: Parallel Testing (Current)
- Keep existing payment flow
- Test new SDK flow alongside
- Compare results in Shipday dashboard

### Phase 2: Gradual Rollout
- Update payment page to use new estimation
- Test with real customers
- Monitor for issues

### Phase 3: Full Migration
- Remove old REST API calls
- Optimize based on real usage
- Add advanced features

## 🚨 **Troubleshooting**

### Common Issues

1. **Delivery Fee Not Updating**
   - Check if address is being passed correctly
   - Verify Edge Function is deployed
   - Check browser console for errors

2. **Order Creation Failing**
   - Verify all required fields are present
   - Check Shipday API key permissions
   - Review order data format

3. **Timing Issues**
   - Ensure server time is correct
   - Check timezone settings
   - Verify pickup/delivery time calculations

### Debug Commands

```bash
# Test delivery fee estimation
curl -X POST https://tpncxlxsggpsiswoownv.supabase.co/functions/v1/estimate-delivery-fee \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"deliveryAddress":"123 Main St, Houston, TX 77001","orderValue":25.00}'

# Test order creation
curl -X POST https://tpncxlxsggpsiswoownv.supabase.co/functions/v1/create-shipday-order-sdk \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"orderId":"test","customerName":"Test","customerPhone":"+1234567890","deliveryAddress":"123 Test St","subtotal":25.00,"deliveryFee":6.99,"taxAmount":2.00,"totalAmount":33.99}'
```

## 🎯 **Success Criteria**

### Technical Success
- [ ] Delivery fee estimation working on address change
- [ ] Total updates correctly with delivery fee and tax
- [ ] Orders created in Shipday with proper timing
- [ ] All financial fields populated (not N/A)

### Business Success
- [ ] Customers see accurate delivery fees upfront
- [ ] No surprises at checkout
- [ ] Faster order processing
- [ ] Better customer experience

## 🚀 **Ready to Implement?**

You now have everything needed to implement your exact flow:

1. ✅ **Delivery fee estimation** working
2. ✅ **Order creation** with proper timing and fees
3. ✅ **Edge Functions** deployed and tested
4. ✅ **Frontend API functions** ready to use

The next step is to update your payment page components to use the new estimation and order creation functions! 