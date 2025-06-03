interface ProgressCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  label: string;
  value: string;
}

export default function ProgressCircle({
  percentage,
  size = 80,
  strokeWidth = 3,
  color,
  label,
  value
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${(percentage * circumference) / 100} ${circumference}`;

  return (
    <div className="text-center">
      <div className={`relative w-${size/4} h-${size/4} mx-auto mb-3`}>
        <svg className={`w-${size/4} h-${size/4} transform -rotate-90`} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg font-bold`} style={{ color }}>
            {percentage}%
          </span>
        </div>
      </div>
      <div className="font-medium text-gray-900">{label}</div>
      <div className="text-sm text-gray-600">{value}</div>
    </div>
  );
}
