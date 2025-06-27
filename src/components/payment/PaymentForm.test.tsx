import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PaymentForm from './PaymentForm';
import { describe, expect, test, beforeEach } from 'vitest';

describe('PaymentForm validation', () => {
  function FormWrapper() {
    const [cardName, setCardName] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    return (
      <PaymentForm
        cardName={cardName}
        setCardName={setCardName}
        onCardReady={() => {}}
        customerName={customerName}
        setCustomerName={setCustomerName}
        customerEmail={customerEmail}
        setCustomerEmail={setCustomerEmail}
        customerPhone={customerPhone}
        setCustomerPhone={setCustomerPhone}
        deliveryAddress={deliveryAddress}
        setDeliveryAddress={setDeliveryAddress}
        onAddressSelect={() => {}}
        onAddressInput={() => {}}
        deliveryMethod="pickup"
        isProcessing={false}
        handleSubmit={() => {}}
        deliveryFee={null}
        feeLoading={false}
        amount="0"
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
