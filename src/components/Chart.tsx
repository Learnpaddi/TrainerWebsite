import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type LineDatum = Record<string, string | number>;

interface ChartProps {
  variant: 'line' | 'donut';
  title: string;
  subtitle?: string;
  lineData?: LineDatum[];
  lineXKey?: string;
  lineYKey?: string;
  lineColor?: string;
  donutData?: Array<{ name: string; value: number; color: string }>;
}

const Chart = ({
  variant,
  title,
  subtitle,
  lineData = [],
  lineXKey = 'name',
  lineYKey = 'value',
  lineColor = '#2563EB',
  donutData = [],
}: ChartProps) => {
  return (
    <section className="rounded-xl border border-slate-200 bg-corporate-surface p-5 shadow-sm hover:shadow-md">
      <p className="text-sm font-semibold text-corporate-text">{title}</p>
      {subtitle && <p className="mt-1 text-xs text-corporate-muted">{subtitle}</p>}

      <div className="mt-4 h-64">
        {variant === 'line' ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey={lineXKey} tick={{ fill: '#64748B', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={lineYKey} stroke={lineColor} strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip />
              <Legend />
              <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={65} outerRadius={95}>
                {donutData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
};

export default Chart;
