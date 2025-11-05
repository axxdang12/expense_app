import React, { useMemo } from 'react';
import { Transaction } from '../types';
import { calculateTotals, formatCurrency, processWeeklyData, processMonthlyExpenseData } from '../utils/transactionUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';

// FIX: Add module augmentation for recharts to include `activeIndex` in PieProps.
// This is a workaround for a known issue in older versions of recharts'
// TypeScript definitions where the `activeIndex` prop is missing.
declare module 'recharts' {
  interface PieProps {
    activeIndex?: number;
  }
}

interface SummaryProps {
  transactions: Transaction[];
}

const COLORS = ['#0ea5e9', '#10b981', '#f97316', '#ef4444', '#8b5cf6', '#3b82f6', '#f59e0b', '#ec4899'];

// Custom shape for the active pie chart sector for better interactivity
const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-bold">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="text-sm">{`${formatCurrency(value)}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" className="text-xs">
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};


const Summary: React.FC<SummaryProps> = ({ transactions }) => {
  const { totalIncome, totalExpense, balance } = calculateTotals(transactions);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const weeklyData = useMemo(() => processWeeklyData(transactions), [transactions]);
  const monthlyExpenseData = useMemo(() => processMonthlyExpenseData(transactions), [transactions]);

  const yAxisTickFormatter = (value: number) => {
    if (value >= 1000000) return `${value / 1000000}tr`;
    if (value >= 1000) return `${value / 1000}k`;
    return value.toString();
  }

  return (
    <>
      <div className="bg-card p-4 rounded-xl shadow-md grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-500 uppercase">Thu nhập</h3>
          <p className="text-2xl font-semibold text-text-primary mt-1">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="p-4 rounded-lg">
          <h3 className="text-sm font-medium text-red-500 uppercase">Chi tiêu</h3>
          <p className="text-2xl font-semibold text-text-primary mt-1">{formatCurrency(totalExpense)}</p>
        </div>
        <div className="p-4 rounded-lg">
          <h3 className="text-sm font-medium text-primary uppercase">Số dư</h3>
          <p className={`text-2xl font-semibold mt-1 ${balance >= 0 ? 'text-text-primary' : 'text-red-500'}`}>
            {formatCurrency(balance)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        {/* Weekly Chart */}
        <div className="bg-card p-4 rounded-xl shadow-md">
            <h3 className="text-lg font-bold text-text-primary mb-4">Tổng quan tuần</h3>
            <div style={{ width: '100%', height: 300 }}>
                 <ResponsiveContainer>
                    <BarChart data={weeklyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis tickFormatter={yAxisTickFormatter} fontSize={12} width={40} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="income" fill="#10b981" name="Thu nhập" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expense" fill="#ef4444" name="Chi tiêu" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Monthly Chart */}
        <div className="bg-card p-4 rounded-xl shadow-md">
            <h3 className="text-lg font-bold text-text-primary mb-4">Chi tiêu tháng này</h3>
             <div style={{ width: '100%', height: 300 }}>
                 <ResponsiveContainer>
                    {monthlyExpenseData.length > 0 ? (
                        <PieChart>
                            <Pie
                                activeIndex={activeIndex}
                                activeShape={renderActiveShape}
                                data={monthlyExpenseData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={90}
                                fill="#8884d8"
                                dataKey="value"
                                onMouseEnter={onPieEnter}
                            >
                                {monthlyExpenseData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                             <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        </PieChart>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-text-secondary">Không có dữ liệu chi tiêu trong tháng.</p>
                        </div>
                    )}
                </ResponsiveContainer>
             </div>
        </div>
      </div>
    </>
  );
};

export default Summary;