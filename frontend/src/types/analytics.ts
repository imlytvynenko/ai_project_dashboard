export interface ChartConfiguration {
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  chart_type: 'bar' | 'line' | 'pie' | 'doughnut';
  title?: string;
  x_axis?: string;
  y_axis?: string;
  data: any[];
  options?: any;
}

export interface AnalyticsResponse {
  type: 'result' | 'error' | 'thinking';
  content: string;
  data?: any[];
  chart_config?: ChartConfiguration;
}

export interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  sender: 'user' | 'assistant';
  type: 'message' | 'error' | 'thinking' | 'result';
  data?: any[];
  chart_config?: ChartConfiguration;
}
