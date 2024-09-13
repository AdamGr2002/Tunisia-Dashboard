'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface DataPoint {
  year: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
  label?: string;
  dataKey: string;
  description: string;
}

function CustomTooltip({ active, payload, label, description }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded shadow-lg max-w-xs">
        <p className="font-bold">{`Year: ${label}`}</p>
        <p>{`${payload[0].name}: ${payload[0].value.toFixed(2)}`}</p>
        <p className="text-sm mt-2">{description}</p>
      </div>
    )
  }
  return null
}

interface ChartProps {
  data: DataPoint[];
  dataKey: string;
  name: string;
  color: string;
  description: string;
}

export default function Chart({ data, dataKey, name, color, description }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip content={<CustomTooltip dataKey={dataKey} description={description} />} />
        <Legend />
        <Line type="monotone" dataKey={dataKey} name={name} stroke={color} />
      </LineChart>
    </ResponsiveContainer>
  )
}