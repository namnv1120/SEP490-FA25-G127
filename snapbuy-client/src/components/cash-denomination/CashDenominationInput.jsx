import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { InputNumber, Table, Typography, message } from 'antd';

const { Text } = Typography;

const DENOMINATIONS = [
  500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000
];

const formatCurrency = (value) => {
  if (!value) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value);
};

const CashDenominationInput = forwardRef(({ value = [], onChange, expectedTotal }, ref) => {
  const [denominations, setDenominations] = useState(() => {
    const initial = {};
    DENOMINATIONS.forEach(denom => {
      const existing = value?.find(v => v.denomination === denom);
      initial[denom] = existing?.quantity || 0;
    });
    return initial;
  });

  const [hasInvalidInput, setHasInvalidInput] = useState(false);

  // Expose validate function to parent
  useImperativeHandle(ref, () => ({
    validate: () => {
      // Check if any denomination has invalid input
      const hasInvalid = DENOMINATIONS.some(denom => {
        const val = denominations[denom];
        return val !== 0 && val !== null && val !== undefined && (!Number.isInteger(val) || val < 0);
      });

      if (hasInvalid) {
        message.error("Vui lòng kiểm tra lại số lượng tờ tiền! Chỉ được nhập số nguyên dương.");
        setHasInvalidInput(true);
        return false;
      }
      setHasInvalidInput(false);
      return true;
    }
  }), [denominations]);

  const calculateTotal = () => {
    return DENOMINATIONS.reduce((sum, denom) => {
      return sum + (denom * (denominations[denom] || 0));
    }, 0);
  };

  const handleQuantityChange = (denomination, quantity) => {
    const newDenominations = {
      ...denominations,
      [denomination]: quantity || 0
    };
    setDenominations(newDenominations);

    // Convert to array format for parent
    const denominationsArray = DENOMINATIONS
      .filter(denom => newDenominations[denom] > 0)
      .map(denom => ({
        denomination: denom,
        quantity: newDenominations[denom]
      }));

    onChange?.(denominationsArray);
  };

  const total = calculateTotal();
  const difference = expectedTotal ? total - expectedTotal : 0;

  console.log('CashDenominationInput:', { expectedTotal, total, difference });

  const columns = [
    {
      title: 'Mệnh giá',
      dataIndex: 'denomination',
      key: 'denomination',
      width: '35%',
      render: (value) => <Text strong style={{ fontSize: '13px' }}>{formatCurrency(value)}</Text>
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '30%',
      render: (_, record) => (
        <InputNumber
          min={0}
          value={denominations[record.denomination]}
          onChange={(val) => {
            if (val === null || val === undefined) {
              handleQuantityChange(record.denomination, 0);
              return;
            }
            if (typeof val === 'number' && !isNaN(val) && val >= 0 && Number.isInteger(val)) {
              handleQuantityChange(record.denomination, val);
            } else {
              message.warning("Vui lòng chỉ nhập số nguyên dương!");
            }
          }}
          onKeyDown={(e) => {
            // Chặn các ký tự không phải số, phím điều hướng, và phím điều khiển
            const allowedKeys = [
              'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
              'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
              'Home', 'End'
            ];
            const isNumber = /[0-9]/.test(e.key);
            const isAllowedKey = allowedKeys.includes(e.key);
            const isCtrlA = e.ctrlKey && e.key === 'a';
            const isCtrlC = e.ctrlKey && e.key === 'c';
            const isCtrlV = e.ctrlKey && e.key === 'v';
            const isCtrlX = e.ctrlKey && e.key === 'x';

            if (!isNumber && !isAllowedKey && !isCtrlA && !isCtrlC && !isCtrlV && !isCtrlX) {
              e.preventDefault();
              message.warning("Vui lòng chỉ nhập số!");
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pastedText = e.clipboardData.getData('text');
            const numericValue = pastedText.replace(/[^\d]/g, '');
            if (numericValue) {
              const num = parseInt(numericValue, 10);
              if (!isNaN(num) && num >= 0) {
                handleQuantityChange(record.denomination, num);
                message.success("Đã dán số lượng");
              } else {
                message.warning("Dữ liệu dán không hợp lệ! Vui lòng chỉ dán số.");
              }
            }
          }}
          style={{ width: '100%' }}
          size="small"
        />
      )
    },
    {
      title: 'Thành tiền',
      dataIndex: 'total',
      key: 'total',
      width: '35%',
      render: (_, record) => {
        const amount = record.denomination * (denominations[record.denomination] || 0);
        return <Text style={{ fontSize: '13px' }}>{formatCurrency(amount)}</Text>;
      }
    }
  ];

  const dataSource = DENOMINATIONS.map(denom => ({
    key: denom,
    denomination: denom
  }));

  return (
    <div>
      <style>
        {`
          .compact-denomination-table .ant-table-thead > tr > th {
            padding: 6px 8px !important;
            font-size: 13px !important;
            font-weight: 600 !important;
          }
          .compact-denomination-table .ant-table-tbody > tr > td {
            padding: 4px 8px !important;
          }
          .compact-denomination-table .ant-table-summary > tr > td {
            padding: 6px 8px !important;
          }
        `}
      </style>
      <Table
        className="compact-denomination-table"
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        size="small"
        bordered
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={2}>
                <Text strong style={{ fontSize: '13px' }}>Tổng cộng</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <Text strong style={{ fontSize: '13px', color: '#1890ff' }}>
                  {formatCurrency(total)}
                </Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
            {expectedTotal > 0 && difference !== 0 && (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={2}>
                  <Text strong style={{ fontSize: '13px' }}>Chênh lệch</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <Text
                    strong
                    style={{
                      fontSize: '13px',
                      color: difference > 0 ? '#52c41a' : '#ff4d4f'
                    }}
                  >
                    {difference > 0 ? '+' : ''}{formatCurrency(difference)}
                  </Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          </Table.Summary>
        )}
      />
    </div>
  );
});

CashDenominationInput.displayName = 'CashDenominationInput';

export default CashDenominationInput;

