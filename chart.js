function updateChart() {
    console.log('State для графика:', {
        assetValue: state.assetValue,
        protectionCost: state.protectionCost,
        averageRisk: state.averageRisk,
        resultsLength: state.results.length
    });
// Подключаем Chart.js
document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('riskChart').getContext('2d');

    // Функция для построения графика
    function updateChart() {
        // Собираем данные из состояния
        const assetValue = state.assetValue;
        const averageRisk = state.averageRisk;
        const protectionCost = state.protectionCost;

        // Генерируем массив затрат на защиту (от 0 до удвоенной текущей стоимости)
        const protectionRange = [];
        for (let i = 0; i <= protectionCost * 2; i += protectionCost / 10) {
            protectionRange.push(i);
        }

        // Экономическая эффективность для каждого значения затрат
        const efficiencyData = protectionRange.map(cost => {
            return averageRisk > 0 ? (cost / averageRisk) * 100 : 0;
        });

        // Данные для графика
        const chartData = {
            labels: protectionRange.map(cost => formatCurrency(cost)),
            datasets: [
                {
                    label: 'Возможные потери (средний риск)',
                    data: protectionRange.map(() => averageRisk), // Потери фиксированы
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: false,
                    yAxisID: 'y'
                },
                {
                    label: 'Ценность информационного ресурса',
                    data: protectionRange.map(() => assetValue), // Фиксированная линия
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    fill: false,
                    yAxisID: 'y'
                },
                {
                    label: 'Экономическая эффективность (%)',
                    data: efficiencyData,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: false,
                    yAxisID: 'y1'
                }
            ]
        };

        // Конфигурация графика
        const config = {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Затраты на защиту (руб.)'
                        }
                    },
                    y: {
                        type: 'linear',
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Сумма (руб.)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Экономическая эффективность (%)'
                        },
                        grid: {
                            drawOnChartArea: false // Отключаем сетку для второй оси
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.dataset.yAxisID === 'y') {
                                    label += formatCurrency(context.parsed.y);
                                } else {
                                    label += context.parsed.y.toFixed(2) + '%';
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        };

        // Если график уже существует, обновляем его, иначе создаем новый
        if (window.riskChart) {
            window.riskChart.data = chartData;
            window.riskChart.update();
        } else {
            window.riskChart = new Chart(ctx, config);
        }
    }

    // Вызываем обновление графика при загрузке и при изменении данных
    updateChart();

    // Подписываемся на обновления состояния (добавьте вызов в script.js)
    window.addEventListener('stateUpdated', updateChart);
});

// Функция форматирования валюты (дублируем из data.js, если не импортируется)
function formatCurrency(value) {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(value);
}