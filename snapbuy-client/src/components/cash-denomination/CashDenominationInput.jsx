import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { InputNumber, Table, Typography, message, Row, Col } from "antd";

const { Text } = Typography;

// Chia mệnh giá thành 2 nhóm
const LEFT_DENOMINATIONS = [500, 1000, 2000, 5000, 10000];
const RIGHT_DENOMINATIONS = [20000, 50000, 100000, 200000, 500000];
const ALL_DENOMINATIONS = [...LEFT_DENOMINATIONS, ...RIGHT_DENOMINATIONS];

const formatCurrency = (value) => {
  if (!value) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const CashDenominationInput = forwardRef(
  ({ value = [], onChange, expectedTotal }, ref) => {
    const [denominations, setDenominations] = useState(() => {
      const initial = {};
      ALL_DENOMINATIONS.forEach((denom) => {
        const existing = value?.find((v) => v.denomination === denom);
        initial[denom] = existing?.quantity || 0;
      });
      return initial;
    });

    const [_hasInvalidInput, setHasInvalidInput] = useState(false);

    // Sync state when value prop changes (e.g., when modal is reopened)
    useEffect(() => {
      const newDenominations = {};
      ALL_DENOMINATIONS.forEach((denom) => {
        const existing = value?.find((v) => v.denomination === denom);
        newDenominations[denom] = existing?.quantity || 0;
      });
      setDenominations(newDenominations);
    }, [value]);

    // Expose validate function to parent
    useImperativeHandle(
      ref,
      () => ({
        validate: () => {
          // Check if any denomination has invalid input
          const hasInvalid = ALL_DENOMINATIONS.some((denom) => {
            const val = denominations[denom];
            return (
              val !== 0 &&
              val !== null &&
              val !== undefined &&
              (!Number.isInteger(val) || val < 0)
            );
          });

          if (hasInvalid) {
            message.error(
              "Vui lòng kiểm tra lại số lượng tờ tiền! Chỉ được nhập số nguyên dương."
            );
            setHasInvalidInput(true);
            return false;
          }
          setHasInvalidInput(false);
          return true;
        },
      }),
      [denominations]
    );

    const calculateTotal = () => {
      return ALL_DENOMINATIONS.reduce((sum, denom) => {
        return sum + denom * (denominations[denom] || 0);
      }, 0);
    };

    const handleQuantityChange = (denomination, quantity) => {
      const newDenominations = {
        ...denominations,
        [denomination]: quantity || 0,
      };
      setDenominations(newDenominations);

      // Convert to array format for parent
      const denominationsArray = ALL_DENOMINATIONS.filter(
        (denom) => newDenominations[denom] > 0
      ).map((denom) => ({
        denomination: denom,
        quantity: newDenominations[denom],
      }));

      onChange?.(denominationsArray);
    };

    const total = calculateTotal();
    const difference = expectedTotal ? total - expectedTotal : 0;

    console.log("CashDenominationInput:", { expectedTotal, total, difference });

    const columns = [
      {
        title: "Mệnh giá",
        dataIndex: "denomination",
        key: "denomination",
        width: "30%",
        render: (value) => (
          <Text strong style={{ fontSize: "13px" }}>
            {formatCurrency(value)}
          </Text>
        ),
      },
      {
        title: "Số lượng",
        dataIndex: "quantity",
        key: "quantity",
        width: "30%",
        render: (_, record) => (
          <InputNumber
            min={0}
            value={denominations[record.denomination]}
            onChange={(val) => {
              if (val === null || val === undefined) {
                handleQuantityChange(record.denomination, 0);
                return;
              }
              if (
                typeof val === "number" &&
                !isNaN(val) &&
                val >= 0 &&
                Number.isInteger(val)
              ) {
                handleQuantityChange(record.denomination, val);
              } else {
                message.destroy("invalid-input-warning");
                message.warning({
                  content: "Vui lòng chỉ nhập số nguyên dương!",
                  key: "invalid-input-warning",
                  duration: 2,
                });
              }
            }}
            onKeyDown={(e) => {
              // Chặn các ký tự không phải số, phím điều hướng, và phím điều khiển
              const allowedKeys = [
                "Backspace",
                "Delete",
                "Tab",
                "Escape",
                "Enter",
                "ArrowLeft",
                "ArrowRight",
                "ArrowUp",
                "ArrowDown",
                "Home",
                "End",
              ];
              const isNumber = /[0-9]/.test(e.key);
              const isAllowedKey = allowedKeys.includes(e.key);
              const isCtrlA = e.ctrlKey && e.key === "a";
              const isCtrlC = e.ctrlKey && e.key === "c";
              const isCtrlV = e.ctrlKey && e.key === "v";
              const isCtrlX = e.ctrlKey && e.key === "x";

              if (
                !isNumber &&
                !isAllowedKey &&
                !isCtrlA &&
                !isCtrlC &&
                !isCtrlV &&
                !isCtrlX
              ) {
                e.preventDefault();
                message.destroy("keydown-warning");
                message.warning({
                  content: "Vui lòng chỉ nhập số!",
                  key: "keydown-warning",
                  duration: 2,
                });
              }
            }}
            onPaste={(e) => {
              e.preventDefault();
              const pastedText = e.clipboardData.getData("text");
              const numericValue = pastedText.replace(/[^\d]/g, "");
              if (numericValue) {
                const num = parseInt(numericValue, 10);
                if (!isNaN(num) && num >= 0) {
                  handleQuantityChange(record.denomination, num);
                  message.destroy("paste-success");
                  message.success({
                    content: "Đã dán số lượng",
                    key: "paste-success",
                    duration: 2,
                  });
                } else {
                  message.destroy("paste-warning");
                  message.warning({
                    content: "Dữ liệu dán không hợp lệ! Vui lòng chỉ dán số.",
                    key: "paste-warning",
                    duration: 2,
                  });
                }
              }
            }}
            style={{ width: "100%" }}
            size="small"
          />
        ),
      },
      {
        title: "Thành tiền",
        dataIndex: "total",
        key: "total",
        width: "45%",
        render: (_, record) => {
          const amount =
            record.denomination * (denominations[record.denomination] || 0);
          return (
            <Text style={{ fontSize: "13px" }}>{formatCurrency(amount)}</Text>
          );
        },
      },
    ];

    const leftDataSource = LEFT_DENOMINATIONS.map((denom) => ({
      key: denom,
      denomination: denom,
    }));

    const rightDataSource = RIGHT_DENOMINATIONS.map((denom) => ({
      key: denom,
      denomination: denom,
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
          .denomination-two-columns {
            display: flex;
            gap: 16px;
          }
          .denomination-two-columns > div {
            flex: 1;
          }
        `}
        </style>

        {/* Two column layout */}
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Table
              className="compact-denomination-table"
              columns={columns}
              dataSource={leftDataSource}
              pagination={false}
              size="small"
              bordered
            />
          </Col>
          <Col xs={24} md={12}>
            <Table
              className="compact-denomination-table"
              columns={columns}
              dataSource={rightDataSource}
              pagination={false}
              size="small"
              bordered
            />
          </Col>
        </Row>

        {/* Summary section */}
        <div
          style={{
            marginTop: "16px",
            padding: "12px",
            background: "#f5f5f5",
            borderRadius: "4px",
            border: "1px solid #d9d9d9",
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Text strong style={{ fontSize: "14px" }}>
                Tổng cộng:
              </Text>
            </Col>
            <Col span={12} style={{ textAlign: "right" }}>
              <Text strong style={{ fontSize: "14px", color: "#1890ff" }}>
                {formatCurrency(total)}
              </Text>
            </Col>
          </Row>
          {expectedTotal > 0 && difference !== 0 && (
            <Row gutter={16} style={{ marginTop: "8px" }}>
              <Col span={12}>
                <Text strong style={{ fontSize: "14px" }}>
                  Chênh lệch:
                </Text>
              </Col>
              <Col span={12} style={{ textAlign: "right" }}>
                <Text
                  strong
                  style={{
                    fontSize: "14px",
                    color: difference > 0 ? "#52c41a" : "#ff4d4f",
                  }}
                >
                  {difference > 0 ? "+" : ""}
                  {formatCurrency(difference)}
                </Text>
              </Col>
            </Row>
          )}
        </div>
      </div>
    );
  }
);

CashDenominationInput.displayName = "CashDenominationInput";

export default CashDenominationInput;
