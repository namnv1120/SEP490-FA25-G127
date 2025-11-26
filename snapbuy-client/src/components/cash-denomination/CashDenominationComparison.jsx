import React from 'react';
import { Table, Typography } from 'antd';

const { Text } = Typography;

const DENOMINATIONS = [500000, 200000, 100000, 50000, 20000, 10000, 5000, 2000, 1000, 500];

const formatCurrency = (value) => {
    if (!value) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(value);
};

const CashDenominationComparison = ({ openingDenominations = [], closingDenominations = [], showClosing = true }) => {
    // Create a map for quick lookup
    const openingMap = {};
    openingDenominations.forEach(d => {
        openingMap[d.denomination] = d.quantity || 0;
    });

    const closingMap = {};
    if (showClosing) {
        closingDenominations.forEach(d => {
            closingMap[d.denomination] = d.quantity || 0;
        });
    }

    const dataSource = DENOMINATIONS
        .map(denom => {
            const openQty = openingMap[denom] || 0;
            const closeQty = closingMap[denom] || 0;
            const diff = closeQty - openQty;

            return {
                key: denom,
                denomination: denom,
                openingQty: openQty,
                closingQty: closeQty,
                difference: diff,
                openingTotal: denom * openQty,
                closingTotal: denom * closeQty,
                differenceTotal: denom * diff
            };
        })
        .filter(item => {
            // Only show rows with non-zero quantities in opening or closing
            return item.openingQty > 0 || item.closingQty > 0;
        });

    const columns = [
        {
            title: 'Mệnh giá',
            dataIndex: 'denomination',
            key: 'denomination',
            width: showClosing ? '20%' : '30%',
            render: (value) => <Text strong>{formatCurrency(value)}</Text>
        },
        {
            title: <span style={{ color: '#1890ff' }}>Mở ca</span>,
            key: 'opening',
            width: showClosing ? '20%' : '35%',
            children: [
                {
                    title: 'SL',
                    dataIndex: 'openingQty',
                    key: 'openingQty',
                    width: showClosing ? '10%' : '15%',
                    align: 'center',
                    render: (qty) => <Text>{qty || 0}</Text>
                },
                {
                    title: 'Thành tiền',
                    dataIndex: 'openingTotal',
                    key: 'openingTotal',
                    width: showClosing ? '10%' : '20%',
                    align: 'right',
                    render: (total) => <Text>{formatCurrency(total)}</Text>
                }
            ]
        }
    ];

    if (showClosing) {
        columns.push({
            title: <span style={{ color: '#52c41a' }}>Đóng ca</span>,
            key: 'closing',
            width: '20%',
            children: [
                {
                    title: 'SL',
                    dataIndex: 'closingQty',
                    key: 'closingQty',
                    width: '10%',
                    align: 'center',
                    render: (qty) => <Text>{qty || 0}</Text>
                },
                {
                    title: 'Thành tiền',
                    dataIndex: 'closingTotal',
                    key: 'closingTotal',
                    width: '10%',
                    align: 'right',
                    render: (total) => <Text>{formatCurrency(total)}</Text>
                }
            ]
        });

        columns.push({
            title: <span style={{ color: '#ff4d4f' }}>Chênh lệch</span>,
            key: 'difference',
            width: '20%',
            children: [
                {
                    title: 'SL',
                    dataIndex: 'difference',
                    key: 'difference',
                    width: '10%',
                    align: 'center',
                    render: (diff) => {
                        if (diff === 0) return <Text type="secondary">0</Text>;
                        return (
                            <Text strong style={{ color: diff > 0 ? '#52c41a' : '#ff4d4f' }}>
                                {diff > 0 ? '+' : ''}{diff}
                            </Text>
                        );
                    }
                },
                {
                    title: 'Thành tiền',
                    dataIndex: 'differenceTotal',
                    key: 'differenceTotal',
                    width: '10%',
                    align: 'right',
                    render: (total) => {
                        if (total === 0) return <Text type="secondary">{formatCurrency(0)}</Text>;
                        return (
                            <Text strong style={{ color: total > 0 ? '#52c41a' : '#ff4d4f' }}>
                                {total > 0 ? '+' : ''}{formatCurrency(Math.abs(total))}
                            </Text>
                        );
                    }
                }
            ]
        });
    }

    const openingTotal = dataSource.reduce((sum, row) => sum + row.openingTotal, 0);
    const closingTotal = dataSource.reduce((sum, row) => sum + row.closingTotal, 0);
    const differenceTotal = closingTotal - openingTotal;

    return (
        <div>
            <Table
                columns={columns}
                dataSource={dataSource}
                pagination={false}
                size="small"
                bordered
                summary={() => (
                    <Table.Summary fixed>
                        <Table.Summary.Row style={{ backgroundColor: '#fafafa' }}>
                            <Table.Summary.Cell index={0} align="left">
                                <Text strong style={{ fontSize: '15px' }}>Tổng cộng</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={1} colSpan={2} align="right">
                                <Text strong style={{ fontSize: '15px', color: '#1890ff' }}>
                                    {formatCurrency(openingTotal)}
                                </Text>
                            </Table.Summary.Cell>
                            {showClosing && (
                                <>
                                    <Table.Summary.Cell index={2} colSpan={2} align="right">
                                        <Text strong style={{ fontSize: '15px', color: '#52c41a' }}>
                                            {formatCurrency(closingTotal)}
                                        </Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={3} colSpan={2} align="right">
                                        <Text
                                            strong
                                            style={{
                                                fontSize: '15px',
                                                color: '#ff4d4f'
                                            }}
                                        >
                                            {differenceTotal > 0 ? '+' : ''}{formatCurrency(differenceTotal)}
                                        </Text>
                                    </Table.Summary.Cell>
                                </>
                            )}
                        </Table.Summary.Row>
                    </Table.Summary>
                )}
            />
        </div>
    );
};

export default CashDenominationComparison;
