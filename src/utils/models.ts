
export interface  MenuItem { text: string; icon: React.ReactNode; active?: boolean }

export interface MetricsCardProps {
  title: string;
  value: number | string;
  change: number | string;
  changeType: string;
  chartData: any;
  chartColor: string;
};

export interface MiniChartProps  {
  data: Array<number>;
  color: string;
  type: string;
};

export interface AlertCardProps {
  icon: React.ElementType;
  iconBgColor: string;
  iconColor: string;
  count: number | string;
  countColor: string;
  title: string;
  subtitle: string;
  notifyBtnColor: string;
  notifyBtnTextColor: string;
  viewBtnColor: string;
  viewBtnTextColor: string;
}

export interface ActionItem {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  onClick: () => void;
}

export interface LoginResponse {
  success: boolean;
  user?: any;
  error?: string;
}

export interface User {
  sub: string;
  name: string;
  role: string;
  exp: number;
}

export interface TextInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  focused?: boolean;
}

export interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  error?: string;
  focused?: boolean;
}