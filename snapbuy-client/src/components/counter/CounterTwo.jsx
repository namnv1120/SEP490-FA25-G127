import React, { useState, useEffect } from "react";

const CounterTwo = ({ defaultValue = 0, onChange }) => {
  const [quantity, setQuantity] = useState(defaultValue);

  // Đồng bộ nếu defaultValue thay đổi từ bên ngoài
  useEffect(() => {
    setQuantity(defaultValue);
  }, [defaultValue]);

  const handleIncrement = () => {
    if (quantity < 99) {
      const newVal = quantity + 1;
      setQuantity(newVal);
      onChange && onChange(newVal); // Gọi callback
    }
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      const newVal = quantity - 1;
      setQuantity(newVal);
      onChange && onChange(newVal); // Gọi callback
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    const numericValue = parseInt(value, 10);

    if (value === "") {
      setQuantity(0);
      onChange && onChange(0);
    } else if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 99) {
      setQuantity(numericValue);
      onChange && onChange(numericValue);
    }
  };

  return (
    <>
      <span className="quantity-btn" onClick={handleDecrement}>
        <i className="feather-16 feather icon-minus-circle" />
      </span>
      <input
        type="text"
        className="quntity-input p-0"
        value={quantity.toString()}
        onChange={handleChange}
      />
      <span className="quantity-btn" onClick={handleIncrement}>
        <i className="feather icon-plus-circle feather-16" />
      </span>
    </>
  );
};

export default CounterTwo;