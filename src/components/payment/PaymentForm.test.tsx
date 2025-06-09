import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PaymentForm from './PaymentForm';
import { describe, expect, test, beforeEach } from 'vitest';

describe('PaymentForm validation', () => {
  function FormWrapper() {
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [billingZip, setBillingZip] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    return (
      <PaymentForm
        cardName={cardName}
        setCardName={setCardName}
        cardNumber={cardNumber}
        setCardNumber={setCardNumber}
        expiryDate={expiryDate}
        setExpiryDate={setExpiryDate}
        cvv={cvv}
        setCvv={setCvv}
        billingZip={billingZip}
        setBillingZip={setBillingZip}
        customerName={customerName}
        setCustomerName={setCustomerName}
        customerEmail={customerEmail}
        setCustomerEmail={setCustomerEmail}
        customerPhone={customerPhone}
        setCustomerPhone={setCustomerPhone}
        deliveryAddress={deliveryAddress}
        setDeliveryAddress={setDeliveryAddress}
        deliveryMethod="pickup"
        selectedMethod="card"
        handleApplePay={() => {}}
        handleGooglePay={() => {}}
        handleCashApp={() => {}}
        isProcessing={false}
        handleSubmit={() => {}}
      />
    );
  }

  beforeEach(() => {
    render(<FormWrapper />);
  });

  test('disables Checkout button when fields are empty', () => {
    const button = screen.getByRole('button', { name: /checkout/i });
    expect(button).toBeDisabled();
  });

  test('shows error messages on blur for empty fields', () => {
    const nameInput = screen.getByLabelText(/full name/i);
    fireEvent.blur(nameInput);
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();

    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.blur(emailInput);
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();

    const phoneInput = screen.getByLabelText(/phone number/i);
    fireEvent.blur(phoneInput);
    expect(screen.getByText(/phone number is required/i)).toBeInTheDocument();
  });

  test('enables Checkout when valid customer data is provided', () => {
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '1234567890' } });
    const button = screen.getByRole('button', { name: /checkout/i });
    expect(button).toBeEnabled();
  });
}); 
