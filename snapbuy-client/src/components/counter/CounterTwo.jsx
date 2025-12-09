import React, { useState, useEffect } from "react";

const CounterTwo = ({ defaultValue = 0, onChange }) => {
  const [quantity, setQuantity] = useState(defaultValue);
  const [inputValue, setInputValue] = useState(defaultValue.toString());

  useEffect(() => {
    setQuantity(defaultValue);
    setInputValue(defaultValue.toString());
  }, [defaultValue]);

  const handleIncrement = () => {
    if (quantity < 99) {
      const newVal = quantity + 1;
      setQuantity(newVal);
      setInputValue(newVal.toString());
      onChange && onChange(newVal);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      const newVal = quantity - 1;
      setQuantity(newVal);
      setInputValue(newVal.toString());
      onChange && onChange(newVal);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;

    // Cho phép xóa hết để nhập số mới
    if (value === "") {
      setInputValue("");
      return;
    }

    const numericValue = parseInt(value, 10);

    if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 99) {
      setInputValue(value);
      // Chỉ update quantity nếu là số hợp lệ > 0
      if (numericValue > 0) {
        setQuantity(numericValue);
      }
    }
  };

  const handleBlur = () => {
    // Khi blur, nếu input trống hoặc = 0, set lại về 1
    if (inputValue === "" || parseInt(inputValue, 10) === 0) {
      setQuantity(1);
      setInputValue("1");
      onChange && onChange(1);
    } else {
      // Nếu có giá trị hợp lệ, gọi onChange
      const numericValue = parseInt(inputValue, 10);
      if (!isNaN(numericValue) && numericValue > 0) {
        setQuantity(numericValue);
        onChange && onChange(numericValue);
      }
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
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      <span className="quantity-btn" onClick={handleIncrement}>
        <i className="feather icon-plus-circle feather-16" />
      </span>
    </>
  );
};

export default CounterTwo;