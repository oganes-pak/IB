// Глобальное состояние приложения
const state = {
    currentStep: 1,
    assetValue: 1000000,           // Ценность информации (Ци)
    protectionCost: 500000,        // Затраты на защиту (Zзащ)
    reservation: 0,                // Резервирование
    totalAssetCost: 0,             // Итоговая стоимость информационного ресурса
    selectedConsequences: [],
    selectedObjects: [],
    vulnerabilities: {},
    threats: {},
    results: [],
    totalRisk: 0,                  // Сумма всех рисков
    averageRisk: 0                 // Среднее значение затрат (Р)
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    showStep(1);
});

function initializeNavigation() {
    const buttons = document.querySelectorAll('.step-btn');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const step = parseInt(button.dataset.step);
            showStep(step);
        });
    });
}

function showStep(step) {
    document.querySelectorAll('.step-btn').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.step) === step) btn.classList.add('active');
    });

    document.querySelectorAll('.step').forEach(s => {
        s.style.display = 'none';
    });
    document.getElementById(`step${step}`).style.display = 'block';

    state.currentStep = step;
    initializeStepContent(step);
}

function initializeStepContent(step) {
    switch(step) {
        case 1: initializeStep1(); break;
        case 2: initializeStep2(); break;
        case 3: initializeStep3(); break;
        case 4: initializeStep4(); break;
        case 5: initializeStep5(); break;
        case 6: initializeStep6(); break;
        case 7: initializeStep7(); break;
    }
}

function initializeStep1() {
    const assetInput = document.getElementById('assetValue');
    const protectionInput = document.getElementById('protectionCost');

    assetInput.value = state.assetValue;
    protectionInput.value = state.protectionCost;

    assetInput.addEventListener('change', (e) => {
        state.assetValue = parseFloat(e.target.value);
        updateCalculations();
    });

    protectionInput.addEventListener('change', (e) => {
        state.protectionCost = parseFloat(e.target.value);
        updateCalculations(); // Обновляем расчеты, так как затраты влияют на итоговую стоимость
    });

    // Инициализируем начальные расчеты
    updateCalculations();
}

function initializeStep2() {
    const container = document.getElementById('consequencesList');
    container.innerHTML = '';
    Object.entries(NEGATIVE_CONSEQUENCES).forEach(([id, description]) => {
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        div.innerHTML = `
            <input type="checkbox" id="${id}" value="${id}" ${state.selectedConsequences.includes(id) ? 'checked' : ''}>
            <label for="${id}">${id}: ${description}</label>
        `;
        div.querySelector('input').addEventListener('change', (e) => {
            state.selectedConsequences = e.target.checked 
                ? [...state.selectedConsequences, id]
                : state.selectedConsequences.filter(c => c !== id);
            updateCalculations();
        });
        container.appendChild(div);
    });
}

function initializeStep3() {
    const container = document.getElementById('objectsList');
    container.innerHTML = '';
    Object.entries(OBJECTS).forEach(([id, name]) => {
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        div.innerHTML = `
            <input type="checkbox" id="${id}" value="${id}" ${state.selectedObjects.includes(id) ? 'checked' : ''}>
            <label for="${id}">${id}: ${name}</label>
        `;
        div.querySelector('input').addEventListener('change', (e) => {
            state.selectedObjects = e.target.checked 
                ? [...state.selectedObjects, id]
                : state.selectedObjects.filter(o => o !== id);
            updateCalculations();
        });
        container.appendChild(div);
    });
}

function initializeStep4() {
    const container = document.getElementById('vulnerabilitiesList');
    container.innerHTML = '';
    state.selectedObjects.forEach(objId => {
        const objVulnerabilities = VULNERABILITIES[objId];
        if (objVulnerabilities) {
            const objSection = document.createElement('div');
            objSection.innerHTML = `<h4>${OBJECTS[objId]}</h4>`;
            Object.entries(objVulnerabilities).forEach(([vulnId, vulnData]) => {
                const vulnDiv = document.createElement('div');
                vulnDiv.className = 'vulnerability-item';
                vulnDiv.innerHTML = `
                    <h5>${vulnId}: ${vulnData.name}</h5>
                    <p>${vulnData.description}</p>
                    <div class="slider-container">
                        <label>Оценка уровня уязвимости (%)</label>
                        <input type="range" min="0" max="100" value="${state.vulnerabilities[objId]?.[vulnId] || 50}" class="slider" id="vuln_${objId}_${vulnId}">
                        <span class="slider-value">${state.vulnerabilities[objId]?.[vulnId] || 50}%</span>
                    </div>
                `;
                const slider = vulnDiv.querySelector('.slider');
                const valueDisplay = vulnDiv.querySelector('.slider-value');
                slider.addEventListener('input', (e) => {
                    const value = e.target.value;
                    valueDisplay.textContent = `${value}%`;
                    if (!state.vulnerabilities[objId]) state.vulnerabilities[objId] = {};
                    state.vulnerabilities[objId][vulnId] = parseInt(value);
                    updateCalculations();
                });
                objSection.appendChild(vulnDiv);
            });
            container.appendChild(objSection);
        }
    });
}

function initializeStep5() {
    const container = document.getElementById('threatsList');
    container.innerHTML = '';
    state.selectedObjects.forEach(objId => {
        const objVulnerabilities = VULNERABILITIES[objId];
        if (objVulnerabilities) {
            Object.entries(objVulnerabilities).forEach(([vulnId, vulnData]) => {
                vulnData.related_threats.forEach(threatId => {
                    const threat = THREAT_SCENARIOS.find(t => t.id === threatId);
                    if (threat) {
                        const threatDiv = document.createElement('div');
                        threatDiv.className = 'threat-item';
                        threatDiv.innerHTML = `
                            <h5>${threat.id}: ${threat.name}</h5>
                            <p>${threat.description}</p>
                            <div class="slider-container">
                                <label>Оценка вероятности реализации угрозы (%)</label>
                                <input type="range" min="0" max="100" value="${state.threats[objId]?.[vulnId]?.[threatId] || 50}" class="slider" id="threat_${objId}_${vulnId}_${threatId}">
                                <span class="slider-value">${state.threats[objId]?.[vulnId]?.[threatId] || 50}%</span>
                            </div>
                        `;
                        const slider = threatDiv.querySelector('.slider');
                        const valueDisplay = threatDiv.querySelector('.slider-value');
                        slider.addEventListener('input', (e) => {
                            const value = e.target.value;
                            valueDisplay.textContent = `${value}%`;
                            if (!state.threats[objId]) state.threats[objId] = {};
                            if (!state.threats[objId][vulnId]) state.threats[objId][vulnId] = {};
                            state.threats[objId][vulnId][threatId] = parseInt(value);
                            updateCalculations();
                        });
                        container.appendChild(threatDiv);
                    }
                });
            });
        }
    });
}

function initializeStep6() {
    updateResultsDisplay();
    updateChart();
}

function initializeStep7() {
    updateFinalReport();
}

function updateCalculations() {
    state.results = [];
    state.totalRisk = 0;

    // Рассчитываем резервирование и итоговую стоимость
    state.reservation = state.assetValue * 0.25;
    state.totalAssetCost = state.assetValue + state.protectionCost + state.reservation;

    state.selectedObjects.forEach(objId => {
        const objVulnerabilities = state.vulnerabilities[objId] || {};
        Object.entries(objVulnerabilities).forEach(([vulnId, vulnValue]) => {
            const vulnLevel = getVulnerabilityLevelByPercentage(vulnValue);
            const threatValues = (state.threats[objId] || {})[vulnId] || {};
            Object.entries(threatValues).forEach(([threatId, threatValue]) => {
                const threatFreq = getThreatFrequencyByPercentage(threatValue);
                if (vulnLevel && threatFreq) {
                    const riskValue = state.assetValue * threatFreq.coefficient * vulnLevel.coefficient; // Р = Ци * В * Уи
                    state.totalRisk += riskValue;
                    state.results.push({
                        object: OBJECTS[objId],
                        vulnerability: VULNERABILITIES[objId][vulnId].name,
                        threat: THREAT_SCENARIOS.find(t => t.id === threatId).name,
                        probability: threatFreq.level,
                        vulnLevel: vulnLevel.level,
                        riskValue: riskValue
                    });
                }
            });
        });
    });

    // Среднее значение затрат
    state.averageRisk = state.results.length > 0 ? state.totalRisk / state.results.length : 0;
    updateResultsDisplay();
    updateChart();
    window.dispatchEvent(new Event('stateUpdated')); // Добавляем событие
}

function updateResultsDisplay() {
    const resultsContainer = document.getElementById('calculationResults');
    if (resultsContainer) {
        resultsContainer.innerHTML = `
            <h4>Промежуточные результаты:</h4>
            <p>Итоговая стоимость информационного ресурса: ${formatCurrency(state.totalAssetCost)}</p>
            <p>Среднее значение затрат при реализации угроз: ${formatCurrency(state.averageRisk)}</p>
            <p>Примерные затраты на защиту: ${formatCurrency(state.protectionCost)}</p>
        `;
        window.dispatchEvent(new Event('stateUpdated')); // Добавляем событие
    }
    updateFinalReport();
}

function updateFinalReport() {
    const assetSummary = document.getElementById('assetSummary');
    const consequencesSummary = document.getElementById('consequencesSummary');
    const riskTotal = document.getElementById('riskTotal');
    const riskPercentage = document.getElementById('riskPercentage');
    const riskDetails = document.getElementById('riskDetails');

    if (assetSummary) {
        assetSummary.innerHTML = `
            <p><strong>Ценность информационного ресурса:</strong> ${formatCurrency(state.assetValue)}</p>
            <p><strong>Резервирование (25% от ценности):</strong> ${formatCurrency(state.reservation)}</p>
            <p><strong>Примерные затраты на защиту:</strong> ${formatCurrency(state.protectionCost)}</p>
            <p><strong>Итоговая стоимость информационного ресурса:</strong> ${formatCurrency(state.totalAssetCost)}</p>
        `;
    }

    if (consequencesSummary) {
        consequencesSummary.innerHTML = state.selectedConsequences
            .map(cons => `<p>${cons}: ${NEGATIVE_CONSEQUENCES[cons]}</p>`)
            .join('');
    }

    if (riskTotal) {
        const formulaParts = state.results.map(result => {
            const objId = Object.keys(OBJECTS).find(id => OBJECTS[id] === result.object);
            const vulnId = Object.keys(VULNERABILITIES[objId]).find(v => VULNERABILITIES[objId][v].name === result.vulnerability);
            const threatId = THREAT_SCENARIOS.find(t => t.name === result.threat).id;
            const threatFreq = getThreatFrequencyByPercentage(state.threats[objId][vulnId][threatId]);
            const vulnLevel = getVulnerabilityLevelByPercentage(state.vulnerabilities[objId][vulnId]);
            return {
                object: result.object,
                threat: result.threat,
                vulnerability: result.vulnerability,
                threatCoef: threatFreq.coefficient,
                vulnCoef: vulnLevel.coefficient,
                riskValue: result.riskValue
            };
        });

        const generalFormula = 'Р = Ци × В × Уи<br>Среднее значение затрат = (Сумма всех Р) / Количество рисков';
        const variables = formulaParts.map((part, index) => `
            Риск ${index + 1} (${part.object}, ${part.threat}, ${part.vulnerability}):<br>
            Ци = ${formatCurrency(state.assetValue)}, В = ${part.threatCoef}, Уи = ${part.vulnCoef}
        `).join('<br>');
        const substitution = formulaParts.map((part, index) => `
            Риск ${index + 1}: ${formatCurrency(state.assetValue)} × ${part.threatCoef} × ${part.vulnCoef} = ${formatCurrency(part.riskValue)}
        `).join('<br>');
        const totalSum = formulaParts.map(part => formatCurrency(part.riskValue)).join(' + ');
        const finalCalc = `${formatCurrency(state.averageRisk)} = (${totalSum}) / ${state.results.length}`;

        const efficiencyFormula = 'Эффективность = (Zзащ / Р) × 100%';
        const efficiencyDescription = `
            Zзащ – затраты на обеспечение безопасности (${formatCurrency(state.protectionCost)})<br>
            Р – среднее значение затрат при реализации угроз (${formatCurrency(state.averageRisk)})
        `;
        const efficiencyValue = state.averageRisk > 0 ? ((state.protectionCost / state.averageRisk) * 100).toFixed(2) : 0;
        const efficiencyCalc = `${efficiencyValue}% = (${formatCurrency(state.protectionCost)} / ${formatCurrency(state.averageRisk)}) × 100%`;

        riskTotal.innerHTML = `
            <h2>${formatCurrency(state.averageRisk)}</h2>
            <p><strong>Среднее значение затрат при реализации угроз через уязвимости:</strong></p>
            <p>1. Общая формула: ${generalFormula}</p>
            <p>2. Переменные:<br>${variables}</p>
            <p>3. Подстановка значений:<br>${substitution}</p>
            <p>4. Итоговый расчет: ${finalCalc}</p>
            <p><strong>Расчет экономической эффективности:</strong></p>
            <p>Формула: ${efficiencyFormula}</p>
            <p>${efficiencyDescription}</p>
            <p>Итог: ${efficiencyCalc}</p>
        `;
    }

    if (riskPercentage) {
        const efficiencyValue = state.averageRisk > 0 ? ((state.protectionCost / state.averageRisk) * 100).toFixed(2) : 0;
        if (efficiencyValue < 65) {
            riskPercentage.innerHTML = `
                <h3>Экономическая эффективность: ${efficiencyValue}%</h3>
                <p style="color: red;">Экономическая эффективность системы защиты информации желательно должна составлять не менее 65%. В связи с этим, вам необходимо пересмотреть СЗИ, чтобы они смогли снизить уровень рисков.</p>
            `;
        } else {
            riskPercentage.innerHTML = `
                <h3>Экономическая эффективность: ${efficiencyValue}%</h3>
                <p>Экономическая эффективность системы защиты информации находится на приемлемом уровне (≥65%).</p>
            `;
        }
    }

    if (riskDetails) {
        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Объект</th>
                    <th>Уязвимость</th>
                    <th>Угроза</th>
                    <th>Вероятность</th>
                    <th>Уровень уязвимости</th>
                    <th>Затраты (руб.)</th>
                </tr>
            </thead>
            <tbody>
                ${state.results.map(result => `
                    <tr>
                        <td>${result.object}</td>
                        <td>${result.vulnerability}</td>
                        <td>${result.threat}</td>
                        <td>${result.probability}</td>
                        <td>${result.vulnLevel}</td>
                        <td>${formatCurrency(result.riskValue)}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        riskDetails.innerHTML = '';
        riskDetails.appendChild(table);
    }
    window.dispatchEvent(new Event('stateUpdated')); // Добавляем событие
}

// Экспорт в CSV
document.getElementById('exportCsv')?.addEventListener('click', () => {
    const headers = ['Объект', 'Уязвимость', 'Угроза', 'Вероятность', 'Уровень уязвимости', 'Затраты'];
    const csvContent = [
        headers.join(';'),
        ...state.results.map(result => [
            `"${result.object}"`,
            `"${result.vulnerability}"`,
            `"${result.threat}"`,
            `"${result.probability}"`,
            `"${result.vulnLevel}"`,
            result.riskValue
        ].join(';'))
    ].join('\n');

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'risk_assessment_results.csv';
    link.click();
});

// Экспорт в Excel
document.getElementById('exportExcel')?.addEventListener('click', () => {
    if (typeof XLSX === 'undefined') {
        alert('Библиотека SheetJS не загрузилась. Проверьте подключение.');
        return;
    }

    try {
        const wb = XLSX.utils.book_new();

        const efficiencyValue = state.averageRisk > 0 ? ((state.protectionCost / state.averageRisk) * 100).toFixed(2) : 0;

        const summaryData = [
            ['Калькулятор оценки рисков ИБ ФСТЭК'],
            [''],
            ['Основные параметры'],
            ['Ценность информационного ресурса:', `${formatCurrency(state.assetValue)}`],
            ['Резервирование (25%):', `${formatCurrency(state.reservation)}`],
            ['Примерные затраты на защиту:', `${formatCurrency(state.protectionCost)}`],
            ['Итоговая стоимость информационного ресурса:', `${formatCurrency(state.totalAssetCost)}`],
            [''],
            ['Негативные последствия'],
            ...state.selectedConsequences.map(cons => [cons, NEGATIVE_CONSEQUENCES[cons]]),
            [''],
            ['Итоговые показатели'],
            ['Среднее значение затрат:', `${formatCurrency(state.averageRisk)}`],
            ['Экономическая эффективность:', `${efficiencyValue}%`],
            ['']
        ];

        const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
        summaryWS['!cols'] = [{ wch: 40 }, { wch: 40 }];
        XLSX.utils.book_append_sheet(wb, summaryWS, 'Общая информация');

        const detailsData = [
            ['Объект', 'Уязвимость', 'Угроза', 'Вероятность', 'Уровень уязвимости', 'Затраты (руб.)'],
            ...state.results.map(result => [
                result.object,
                result.vulnerability,
                result.threat,
                result.probability,
                result.vulnLevel,
                result.riskValue
            ])
        ];

        const detailsWS = XLSX.utils.aoa_to_sheet(detailsData);
        detailsWS['!cols'] = [
            { wch: 20 },
            { wch: 30 },
            { wch: 30 },
            { wch: 15 },
            { wch: 20 },
            { wch: 15 }
        ];
        XLSX.utils.book_append_sheet(wb, detailsWS, 'Детализация рисков');

        XLSX.writeFile(wb, 'risk_assessment_results.xlsx');
        console.log('Excel-файл успешно создан и скачан');
    } catch (error) {
        console.error('Ошибка при создании Excel-файла:', error);
        alert('Произошла ошибка при создании Excel-файла. Проверьте консоль.');
    }
});