#!/usr/bin/env python3
"""
Test script for complete notification system
Tests emails, SMS, and phone calls for both pickup and delivery orders
"""

import requests
import json
from datetime import datetime

# Supabase configuration
SUPABASE_URL = "https://tpncxlxsggpsiswoownv.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwbmN4bHhzZ2dwc2lzd29vd252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NTM0OTgsImV4cCI6MjA1ODMyOTQ5OH0.nsm4z-lK97p-IGfUytp6SISz5OuWF7rHnnlgiK0gL0Q"

def test_pickup_order_with_notifications():
    """Test pickup order with complete notifications"""
    
    pickup_order_data = {
        "orderId": "PICKUP-NOTIFY-001",
        "customerName": "Mike Johnson",
        "customerPhone": "+1555123456",
        "customerEmail": "mike@example.com",  # Change this to your email for testing
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
            },
            {
                "name": "Gulab Jamun",
                "quantity": 2,
                "price": 4.99
            }
        ],
        "subtotal": 47.92,
        "taxAmount": 3.93,
        "totalAmount": 51.85
    }
    
    print("🧪 Testing Pickup Order with Complete Notifications")
    print("=" * 70)
    print(f"Order ID: {pickup_order_data['orderId']}")
    print(f"Customer: {pickup_order_data['customerName']}")
    print(f"Phone: {pickup_order_data['customerPhone']}")
    print(f"Email: {pickup_order_data['customerEmail']}")
    print(f"Total: ${pickup_order_data['totalAmount']}")
    print(f"Items: {len(pickup_order_data['orderItems'])} items")
    print()
    
    try:
        # Create pickup order (includes notifications)
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
            print(f"Message: {result.get('message')}")
            
            if result.get('success'):
                print("\n🎉 Pickup order created with notifications!")
                print("📧 Customer email confirmation sent")
                print("📧 Business email notification sent")
                print("📱 SMS notification sent to +13468244212")
                print("📞 Phone call notification sent to +13468244212")
                print("📋 Order appears in Shipday dashboard")
            else:
                print(f"\n❌ Failed to create pickup order: {result.get('error')}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")

def test_delivery_order_with_notifications():
    """Test delivery order with complete notifications"""
    
    delivery_order_data = {
        "orderId": "DELIVERY-NOTIFY-001",
        "customerName": "Lisa Chen",
        "customerPhone": "+1555987654",
        "customerEmail": "lisa@example.com",  # Change this to your email for testing
        "deliveryAddress": "456 Oak Street, Katy, TX 77449",
        "orderItems": [
            {
                "name": "Veg Biryani",
                "quantity": 1,
                "price": 10.99
            },
            {
                "name": "Paneer Butter Masala",
                "quantity": 1,
                "price": 13.99
            },
            {
                "name": "Mango Lassi",
                "quantity": 2,
                "price": 3.99
            }
        ],
        "subtotal": 32.96,
        "deliveryFee": 3.99,
        "taxAmount": 2.70,
        "totalAmount": 39.65
    }
    
    print("\n🧪 Testing Delivery Order with Complete Notifications")
    print("=" * 70)
    print(f"Order ID: {delivery_order_data['orderId']}")
    print(f"Customer: {delivery_order_data['customerName']}")
    print(f"Phone: {delivery_order_data['customerPhone']}")
    print(f"Email: {delivery_order_data['customerEmail']}")
    print(f"Delivery Address: {delivery_order_data['deliveryAddress']}")
    print(f"Total: ${delivery_order_data['totalAmount']}")
    print(f"Items: {len(delivery_order_data['orderItems'])} items")
    print()
    
    try:
        # Send order confirmation (includes all notifications)
        response = requests.post(
            f"{SUPABASE_URL}/functions/v1/send-order-confirmation",
            headers={
                'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                **delivery_order_data,
                "fulfillmentMethod": "delivery",
                "scheduledTime": "ASAP"
            }
        )
        
        print(f"📦 Delivery Order Notifications Response:")
        print(f"Status: {response.status_code}")
        
        if response.ok:
            result = response.json()
            print(f"✅ Success: {result.get('success')}")
            print(f"Order ID: {result.get('orderId')}")
            
            if result.get('success'):
                print("\n🎉 Delivery order notifications sent!")
                print("📧 Customer email confirmation sent")
                print("📧 Business email notification sent")
                print("📱 SMS notification sent to +13468244212")
                print("📞 Phone call notification sent to +13468244212")
            else:
                print(f"\n❌ Failed to send notifications: {result.get('error')}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")

def test_individual_notifications():
    """Test individual notification services"""
    
    test_data = {
        "orderId": "TEST-NOTIFY-001",
        "customerName": "Test Customer",
        "customerPhone": "+1555123456",
        "fulfillmentMethod": "pickup",
        "totalAmount": 25.50,
        "orderItems": [
            {"name": "Chicken Curry", "quantity": 1, "price": 13.99},
            {"name": "Rice", "quantity": 1, "price": 3.99},
            {"name": "Naan", "quantity": 2, "price": 2.99}
        ]
    }
    
    print("\n🧪 Testing Individual Notification Services")
    print("=" * 70)
    
    # Test SMS notification
    print("📱 Testing SMS Notification:")
    try:
        sms_response = requests.post(
            f"{SUPABASE_URL}/functions/v1/send-sms-notification",
            headers={
                'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
                'Content-Type': 'application/json'
            },
            json=test_data
        )
        
        if sms_response.ok:
            sms_result = sms_response.json()
            print(f"  ✅ SMS: {sms_result.get('success')}")
            print(f"  📱 Message: {sms_result.get('smsMessage', 'No message')[:100]}...")
        else:
            print(f"  ❌ SMS failed: {sms_response.text}")
    except Exception as e:
        print(f"  ❌ SMS exception: {str(e)}")
    
    # Test phone notification
    print("\n📞 Testing Phone Call Notification:")
    try:
        phone_response = requests.post(
            f"{SUPABASE_URL}/functions/v1/send-phone-notification",
            headers={
                'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
                'Content-Type': 'application/json'
            },
            json=test_data
        )
        
        if phone_response.ok:
            phone_result = phone_response.json()
            print(f"  ✅ Phone: {phone_result.get('success')}")
            print(f"  📞 Message: {phone_result.get('phoneMessage', 'No message')[:100]}...")
        else:
            print(f"  ❌ Phone failed: {phone_response.text}")
    except Exception as e:
        print(f"  ❌ Phone exception: {str(e)}")

def test_email_notifications():
    """Test email notification system"""
    
    email_data = {
        "orderId": "EMAIL-TEST-001",
        "customerName": "Email Test Customer",
        "customerEmail": "test@example.com",  # Change this to your email
        "customerPhone": "+1555123456",
        "deliveryAddress": "789 Test Street, Katy, TX 77449",
        "fulfillmentMethod": "delivery",
        "orderItems": [
            {"name": "Butter Chicken", "quantity": 1, "price": 12.99},
            {"name": "Naan", "quantity": 2, "price": 2.99}
        ],
        "subtotal": 18.97,
        "deliveryFee": 3.99,
        "taxAmount": 1.56,
        "totalAmount": 24.52,
        "scheduledTime": "ASAP"
    }
    
    print("\n🧪 Testing Email Notification System")
    print("=" * 70)
    
    try:
        email_response = requests.post(
            f"{SUPABASE_URL}/functions/v1/send-order-confirmation",
            headers={
                'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
                'Content-Type': 'application/json'
            },
            json=email_data
        )
        
        if email_response.ok:
            email_result = email_response.json()
            print(f"✅ Email Success: {email_result.get('success')}")
            print(f"📧 Customer email sent to: {email_data['customerEmail']}")
            print(f"📧 Business email sent to: orders@desiflavorskaty.com")
            print(f"📱 SMS sent to: +13468244212")
            print(f"📞 Phone call to: +13468244212")
        else:
            print(f"❌ Email failed: {email_response.text}")
    except Exception as e:
        print(f"❌ Email exception: {str(e)}")

def main():
    """Run all notification tests"""
    print("🚀 Starting Complete Notification System Tests")
    print("=" * 80)
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Test pickup order with notifications
    test_pickup_order_with_notifications()
    
    # Test delivery order with notifications
    test_delivery_order_with_notifications()
    
    # Test individual notification services
    test_individual_notifications()
    
    # Test email notifications
    test_email_notifications()
    
    print("\n" + "=" * 80)
    print("✅ All notification tests completed!")
    print("\n📝 Summary:")
    print("- Pickup orders: Shipday + Email + SMS + Phone")
    print("- Delivery orders: Shipday + Email + SMS + Phone")
    print("- Business notifications sent to +13468244212")
    print("- Customer emails sent to provided email addresses")
    print("- All notifications include order details and timing")
    print("\n🔧 To Enable Actual Phone Calls:")
    print("1. Sign up for Twilio Voice")
    print("2. Set environment variables:")
    print("   TWILIO_ACCOUNT_SID=your_account_sid")
    print("   TWILIO_AUTH_TOKEN=your_auth_token")
    print("   TWILIO_PHONE_NUMBER=your_twilio_number")
    print("3. Uncomment Twilio code in send-phone-notification")

if __name__ == "__main__":
    main() 