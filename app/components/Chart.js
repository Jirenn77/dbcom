import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const branchData = [
    { name: 'Pabayo', value: 25 },
    { name: 'Gingpog City', value: 25 },
    { name: 'Patag', value: 25 },
    { name: 'Bukidhon', value: 25 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Replace the branches pie chart placeholder with:
<ResponsiveContainer width="100%" height="100%">
    <PieChart>
        <Pie
            data={branchData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
            {branchData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
        </Pie>
        <Legend />
    </PieChart>
</ResponsiveContainer>