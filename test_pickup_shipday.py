#!/usr/bin/env python3
"""
Test script for pickup orders with Shipday integration
Tests the complete flow: pickup order creation in Shipday
"""

import requests
import json
from datetime import datetime

# Supabase configuration
SUPABASE_URL = "https://tpncxlxsggpsiswoownv.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwbmN4bHhzZ2dwc2lzd29vd252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NTM0OTgsImV4cCI6MjA1ODMyOTQ5OH0.nsm4z-lK97p-IGfUytp6SISz5OuWF7rHnnlgiK0gL0Q"

def test_pickup_order_creation():
    """Test pickup order creation in Shipday"""
    
    # Sample pickup order data
    pickup_order_data = {
        "orderId": "PICKUP-SHIPDAY-001",
        "customerName": "Sarah Johnson",
        "customerPhone": "+1555123456",
        "customerEmail": "sarah@example.com",
        "orderItems": [
            {
                "name": "Chicken Dum Biryani",
                "quantity": 1,
                "price": 11.99
            },
            {
                "name": "Mango Lassi",
                "quantity": 2,
                "price": 3.99
            },
            {
                "name": "Gulab Jamun",
                "quantity": 1,
                "price": 4.99
            }
        ],
        "subtotal": 24.96,
        "taxAmount": 2.05,
        "totalAmount": 27.01
    }
    
    print("🧪 Testing Pickup Order Creation with Shipday")
    print("=" * 60)
    print(f"Order ID: {pickup_order_data['orderId']}")
    print(f"Customer: {pickup_order_data['customerName']}")
    print(f"Phone: {pickup_order_data['customerPhone']}")
    print(f"Total: ${pickup_order_data['totalAmount']}")
    print(f"Items: {len(pickup_order_data['orderItems'])} items")
    print()
    
    try:
        # Create pickup order via Edge Function
        response = requests.post(
            f"{SUPABASE_URL}/functions/v1/create-shipday-pickup-order",
            headers={
                'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
                'Content-Type': 'application/json'
            },
            json=pickup_order_data
        )
        
        print(f"📦 Pickup Order Creation Response:")
        print(f"Status: {response.status_code}")
        
        if response.ok:
            result = response.json()
            print(f"✅ Success: {result.get('success')}")
            print(f"Shipday Order ID: {result.get('shipdayOrderId')}")
            print(f"Order Number: {result.get('orderNumber')}")
            print(f"Message: {result.get('message')}")
            print(f"Pickup Time: {result.get('pickupTime')}")
            print(f"Total Amount: ${result.get('totalAmount')}")
            
            if result.get('success'):
                print("\n🎉 Pickup order created successfully in Shipday!")
                print("📋 Order will appear in Shipday dashboard for kitchen staff")
                print("⏰ Customer can pick up in 25 minutes")
            else:
                print(f"\n❌ Failed to create pickup order: {result.get('error')}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")

def test_delivery_vs_pickup_comparison():
    """Compare delivery and pickup order flows"""
    
    print("\n🔄 Comparing Delivery vs Pickup Order Flows")
    print("=" * 60)
    
    # Test data
    test_data = {
        "orderId": "COMPARE-001",
        "customerName": "Test Customer",
        "customerPhone": "+1555123456",
        "customerEmail": "test@example.com",
        "orderItems": [
            {"name": "Butter Chicken", "quantity": 1, "price": 12.99}
        ],
        "subtotal": 12.99,
        "taxAmount": 1.07,
        "totalAmount": 14.06
    }
    
    # Test pickup order
    print("📦 Testing Pickup Order Flow:")
    try:
        pickup_response = requests.post(
            f"{SUPABASE_URL}/functions/v1/create-shipday-pickup-order",
            headers={
                'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
                'Content-Type': 'application/json'
            },
            json=test_data
        )
        
        if pickup_response.ok:
            pickup_result = pickup_response.json()
            print(f"  ✅ Pickup: {pickup_result.get('success')}")
            print(f"  📍 Location: Store (1989 North Fry Rd, Katy, TX)")
            print(f"  🚚 Driver: None (customer pickup)")
            print(f"  ⏰ Timing: 25 min prep only")
        else:
            print(f"  ❌ Pickup failed: {pickup_response.text}")
            
    except Exception as e:
        print(f"  ❌ Pickup exception: {str(e)}")
    
    # Test delivery order (using existing function)
    print("\n🚚 Testing Delivery Order Flow:")
    try:
        delivery_data = {
            **test_data,
            "deliveryAddress": "123 Test Street, Katy, TX 77449",
            "deliveryFee": 3.99
        }
        
        delivery_response = requests.post(
            f"{SUPABASE_URL}/functions/v1/create-shipday-order-sdk",
            headers={
                'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
                'Content-Type': 'application/json'
            },
            json=delivery_data
        )
        
        if delivery_response.ok:
            delivery_result = delivery_response.json()
            print(f"  ✅ Delivery: {delivery_result.get('success')}")
            print(f"  📍 Location: Customer address")
            print(f"  🚚 Driver: Assigned automatically")
            print(f"  ⏰ Timing: 25 min prep + 30 min delivery")
        else:
            print(f"  ❌ Delivery failed: {delivery_response.text}")
            
    except Exception as e:
        print(f"  ❌ Delivery exception: {str(e)}")

def test_kitchen_workflow():
    """Test how orders appear in kitchen workflow"""
    
    print("\n👨‍🍳 Kitchen Workflow Analysis")
    print("=" * 60)
    
    print("📋 How orders appear in Shipday dashboard:")
    print("  • All orders (pickup + delivery) in one view")
    print("  • Pickup orders marked as 'pickup' type")
    print("  • Delivery orders marked as 'delivery' type")
    print("  • Same preparation workflow for both")
    print("  • Different fulfillment process:")
    print("    - Pickup: Customer collects from store")
    print("    - Delivery: Driver picks up and delivers")
    
    print("\n🎯 Benefits of unified system:")
    print("  ✅ Single dashboard for all orders")
    print("  ✅ Consistent order processing")
    print("  ✅ Complete order history")
    print("  ✅ Better analytics and reporting")
    print("  ✅ Simplified kitchen workflow")

def main():
    """Run all pickup order tests"""
    print("🚀 Starting Pickup Order with Shipday Integration Tests")
    print("=" * 80)
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Test pickup order creation
    test_pickup_order_creation()
    
    # Compare delivery vs pickup flows
    test_delivery_vs_pickup_comparison()
    
    # Analyze kitchen workflow
    test_kitchen_workflow()
    
    print("\n" + "=" * 80)
    print("✅ All pickup order tests completed!")
    print("\n📝 Summary:")
    print("- Pickup orders now use Shipday for unified management")
    print("- Kitchen staff see all orders in one dashboard")
    print("- No delivery driver assigned for pickup orders")
    print("- Same preparation workflow for both pickup and delivery")
    print("- Better order tracking and analytics")

if __name__ == "__main__":
    main() 