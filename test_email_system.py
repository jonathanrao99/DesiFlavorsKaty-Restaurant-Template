#!/usr/bin/env python3
"""
Test script for the email confirmation system
Tests both customer and business email notifications
"""

import requests
import json
from datetime import datetime

# Supabase configuration
SUPABASE_URL = "https://tpncxlxsggpsiswoownv.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwbmN4bHhzZ2dwc2lzd29vd252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NTM0OTgsImV4cCI6MjA1ODMyOTQ5OH0.nsm4z-lK97p-IGfUytp6SISz5OuWF7rHnnlgiK0gL0Q"

def test_order_confirmation():
    """Test the order confirmation email system"""
    
    # Sample order data
    order_data = {
        "orderId": "TEST-12345",
        "customerName": "John Doe",
        "customerEmail": "test@example.com",  # Change this to your email for testing
        "customerPhone": "+1234567890",
        "deliveryAddress": "123 Test Street, Katy, TX 77449",
        "fulfillmentMethod": "delivery",  # or "pickup"
        "orderItems": [
            {
                "name": "Chicken Dum Biryani",
                "quantity": 2,
                "price": 11.99
            },
            {
                "name": "Butter Chicken",
                "quantity": 1,
                "price": 12.99
            },
            {
                "name": "Naan Bread",
                "quantity": 3,
                "price": 2.99
            }
        ],
        "subtotal": 42.94,
        "deliveryFee": 3.99,
        "taxAmount": 3.52,
        "totalAmount": 50.45,
        "scheduledTime": "ASAP"
    }
    
    print("🧪 Testing Order Confirmation System")
    print("=" * 50)
    print(f"Order ID: {order_data['orderId']}")
    print(f"Customer: {order_data['customerName']}")
    print(f"Email: {order_data['customerEmail']}")
    print(f"Method: {order_data['fulfillmentMethod']}")
    print(f"Total: ${order_data['totalAmount']}")
    print()
    
    try:
        # Send order confirmation
        response = requests.post(
            f"{SUPABASE_URL}/functions/v1/send-order-confirmation",
            headers={
                'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
                'Content-Type': 'application/json'
            },
            json=order_data
        )
        
        print(f"📧 Email Confirmation Response:")
        print(f"Status: {response.status_code}")
        
        if response.ok:
            result = response.json()
            print(f"✅ Success: {result.get('success')}")
            print(f"Message: {result.get('message')}")
            print(f"Order ID: {result.get('orderId')}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")

def test_pickup_order():
    """Test pickup order confirmation"""
    
    pickup_order_data = {
        "orderId": "PICKUP-67890",
        "customerName": "Jane Smith",
        "customerEmail": "pickup@example.com",  # Change this to your email for testing
        "customerPhone": "+1987654321",
        "deliveryAddress": "",
        "fulfillmentMethod": "pickup",
        "orderItems": [
            {
                "name": "Veg Biryani",
                "quantity": 1,
                "price": 10.99
            },
            {
                "name": "Mango Lassi",
                "quantity": 2,
                "price": 3.99
            }
        ],
        "subtotal": 18.97,
        "deliveryFee": 0,
        "taxAmount": 1.56,
        "totalAmount": 20.53,
        "scheduledTime": "ASAP"
    }
    
    print("\n🧪 Testing Pickup Order Confirmation")
    print("=" * 50)
    print(f"Order ID: {pickup_order_data['orderId']}")
    print(f"Customer: {pickup_order_data['customerName']}")
    print(f"Method: {pickup_order_data['fulfillmentMethod']}")
    print(f"Total: ${pickup_order_data['totalAmount']}")
    print()
    
    try:
        response = requests.post(
            f"{SUPABASE_URL}/functions/v1/send-order-confirmation",
            headers={
                'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
                'Content-Type': 'application/json'
            },
            json=pickup_order_data
        )
        
        print(f"📧 Pickup Order Response:")
        print(f"Status: {response.status_code}")
        
        if response.ok:
            result = response.json()
            print(f"✅ Success: {result.get('success')}")
            print(f"Message: {result.get('message')}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")

def test_sms_notification():
    """Test SMS notification system"""
    
    sms_data = {
        "orderId": "SMS-11111",
        "customerName": "Bob Wilson",
        "customerPhone": "+1555123456",
        "fulfillmentMethod": "delivery",
        "totalAmount": 35.67,
        "orderItems": [
            {"name": "Chicken Curry", "quantity": 1, "price": 13.99},
            {"name": "Rice", "quantity": 1, "price": 3.99},
            {"name": "Naan", "quantity": 2, "price": 2.99},
            {"name": "Gulab Jamun", "quantity": 1, "price": 4.99}
        ]
    }
    
    print("\n🧪 Testing SMS Notification System")
    print("=" * 50)
    print(f"Order ID: {sms_data['orderId']}")
    print(f"Customer: {sms_data['customerName']}")
    print(f"Method: {sms_data['fulfillmentMethod']}")
    print(f"Total: ${sms_data['totalAmount']}")
    print()
    
    try:
        response = requests.post(
            f"{SUPABASE_URL}/functions/v1/send-sms-notification",
            headers={
                'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
                'Content-Type': 'application/json'
            },
            json=sms_data
        )
        
        print(f"📱 SMS Notification Response:")
        print(f"Status: {response.status_code}")
        
        if response.ok:
            result = response.json()
            print(f"✅ Success: {result.get('success')}")
            print(f"Message: {result.get('message')}")
            print(f"SMS Content:")
            print("-" * 30)
            print(result.get('smsMessage', 'No message content'))
            print("-" * 30)
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")

def main():
    """Run all tests"""
    print("🚀 Starting Email and SMS System Tests")
    print("=" * 60)
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Test delivery order confirmation
    test_order_confirmation()
    
    # Test pickup order confirmation
    test_pickup_order()
    
    # Test SMS notification
    test_sms_notification()
    
    print("\n" + "=" * 60)
    print("✅ All tests completed!")
    print("\n📝 Notes:")
    print("- Check your email for customer confirmation emails")
    print("- Check orders@desiflavorskaty.com for business notifications")
    print("- SMS notifications are logged but not sent (Twilio not configured)")
    print("- Update email addresses in the test data to receive actual emails")

if __name__ == "__main__":
    main() 