import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  //   Optional
  //   Legend,
  //   Tooltip,
  //   Title,
} from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale);

export { Chart };
