import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
  Title
);

export { Chart };
