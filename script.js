let result = document.getElementById('result');
let isScientificVisible = false;
let openParenthesisCount = 0;
let history = loadHistory(); 
let isHistoryVisible = false;

function appendToDisplay(value) {
    let lastChar = result.value.slice(-1);
     
    // İlk karakterin operatör mü
    if (result.value === '' && isOperator(value)) {
        return; 
    }

    if (isOperator(lastChar) && isOperator(value)) {
        return; 
    }

    if (lastChar === '.' && value === '.') { 
        return; 
    }

    if (value === '.' && containsDecimal(result.value)) { //nokta varsa boş dön
        return; 
    }
    result.value += value;
}

function clearDisplay() {
    result.value = '';
    openParenthesisCount = 0;
}

function isOperator(char) {
    return ['+', '-', '*', '/','.'].includes(char); // operatör kontrolü
}

function containsDecimal(value) {
    let operators = ['+', '-', '*', '/'];
    let lastOperatorIndex = -1;

    for (let operator of operators) {
        let index = value.lastIndexOf(operator);
        if (index > lastOperatorIndex) {
            lastOperatorIndex = index;
        }
    }

    let substring = value.substring(lastOperatorIndex + 1);
    return substring.includes('.');
}

function showHistory() {
    let historyDiv = document.getElementById('history');
    if (historyDiv) {
        if (isHistoryVisible) {
            historyDiv.classList.add('hidden');
        } else {
            showHistoryContent();
            historyDiv.classList.remove('hidden');
        }
        isHistoryVisible = !isHistoryVisible;
    } else {
        console.error('history elementi bulunamadı!');
    }
}

function showHistoryContent() {
    let historyContentDiv = document.getElementById('history-content');
    
    historyContentDiv.innerHTML = '';

    if (history.length === 0) {
        let historyDiv = document.getElementById('history');
        if (historyDiv) {
            historyDiv.classList.add('hidden'); 
            isHistoryVisible = false;
        }
        return;
    }

    for (let i = 0; i < history.length; i++) {
        let operation = history[i];
        let operationElement = document.createElement('div');
        operationElement.textContent = operation.expression + ' = ' + operation.result;

        let deleteButton = document.createElement('button');
        deleteButton.textContent = 'Sil';
        deleteButton.setAttribute('data-index', i); // Hangi işlemi sileceğimizi belirlemek için index'i veri olarak saklıyoruz
        deleteButton.addEventListener('click', function() {
            deleteHistoryItem(i);
        });
        operationElement.appendChild(deleteButton);
        historyContentDiv.appendChild(operationElement);
    }
}

function deleteHistoryItem(index) {
    history.splice(index, 1); 
    saveHistory(); 
    showHistoryContent(); 
}

function clearHistory() {
    history = []; // geçmişi boş hale getirdim
    let historyContentDiv = document.getElementById('history-content');
    historyContentDiv.innerHTML = ''; // History içeriğini temizleme kısmı çalışıyor
    localStorage.removeItem('calculatorHistory'); // Local storage'dan geçmişi silme kısmı çalışıyor
    let historyDiv = document.getElementById('history');
    if (historyDiv) {
        historyDiv.classList.add('hidden'); 
        isHistoryVisible = false;
    } else {
        console.error('history elementi bulunamadı!');
    }
}

function backspace() {
    let lastChar = result.value.slice(-1);
    result.value = result.value.slice(0, -1);
    if (lastChar === '(') {
        openParenthesisCount--;
    } else if (lastChar === ')') {
        openParenthesisCount++;
    }
}

function calculate() {
    try {
        let expression = result.value;
        expression = transformExpression(expression);
        let evalResult = eval(expression);
        result.value = Number(evalResult.toFixed(10)).toString(); // Sayıyı stringe çevirerek atama
        openParenthesisCount = 0;
        history.push({ expression:expression, result: result.value });
        saveHistory(); // Geçmişi kaydet
    } catch (error) {
        result.value = 'Error';
    }
}

function transformExpression(expression) {
    // Üs işlemlerini  
    while (expression.includes('^')) {
        expression = expression.replace(/([^(]*?)\^([^()]*)/g, function(match, base, exponent) {
            base = base.trim();
            exponent = exponent.trim();

            if (base === '') {
                base = '1'; 
            } else if (base === 'π') {
                base = 'Math.PI';
            } else if (base === 'e') {
                base = 'Math.E';
            }
            if (exponent === '') {
                exponent = '1'; 
            } else if (exponent === 'π') {
                exponent = 'Math.PI';
            } else if (exponent === 'e') {
                exponent = 'Math.E';
            } else if (exponent.includes('^')) {
                exponent = exponent.split('^').map(item => transformExpression(item)).join('*');
            }

            return 'Math.pow(' + base + ', ' + exponent + ')';
        });
    }
    // Karekök işlemleri
    expression = expression.replace(/√(\d+)/g, 'Math.sqrt($1)');
    expression = expression.replace(/√\(([^)]+)\)/g, 'Math.sqrt($1)');

    // Pi dönüşümü düzelt // düzeltildi
    expression = expression.replace(/(\d*)π/g, function(match, p1) {
        if (p1) {
            return p1 + '*Math.PI'; // Öncesinde sayı varsa
        } else {
            return 'Math.PI';
        }
    });

    // e dönüşümü:
    expression = expression.replace(/(\d*)e/g, function(match, p1) {
        if (p1) {
            return p1 + '*Math.E'; // Öncesinde sayı varsa
        } else {
            return 'Math.E';
        }
    });

    // Mutlak değer
    expression = expression.replace(/abs\((-?\d+(\.\d+)?)\)/g, 'Math.abs($1)');
    expression = expression.replace(/abs(-?\d+(\.\d+)?)/g, function(match, number) {
        return 'Math.abs(' + number + ')';
    });

    // Logaritma işlemleri
    expression = expression.replace(/log(\d+)/g, function(match, number) {
        return 'Math.log10(' + number + ')';
    });
    expression = expression.replace(/ln(\d+)/g, function(match, number) {
        return 'Math.log(' + number + ')';
    });
    expression = expression.replace(/ln(\w+)/g, function(match, number) {
        return 'Math.log(' + number + ')';
    });

    // e^x işlemi
    expression = expression.replace(/e\^(\w+)/g, function(match, exponent) {
        return 'Math.exp(' + exponent + ')';
    });

    // Trigonometri işlemleri
    expression = expression.replace(/cos(\d+)/g, function(match, group1) {
        return 'calculateCos(' + group1 + ')';
    });
    expression = expression.replace(/sin(\d+)/g, function(match, group1) {
        return 'calculateSin(' + group1 + ')';
    });
    expression = expression.replace(/tan(\d+)/g, function(match, group1) {
        return 'calculateTan(' + group1 + ')';
    });
    expression = expression.replace(/cot(\d+)/g, function(match, group1) {
        return 'calculateCot(' + group1 + ')';
    });

    return expression;
}



function toggleScientific() {
    isScientificVisible = !isScientificVisible;
    document.getElementById('scientific-buttons').classList.toggle('hidden', !isScientificVisible);
}

function toggleParenthesis() {
    let value = result.value;
    let lastChar = value.slice(-1);

    if (openParenthesisCount > 0 && (lastChar !== '(' && lastChar !== '+' && lastChar !== '-' && lastChar !== '*' && lastChar !== '/')) {
        result.value += ')';
        openParenthesisCount--;
    } else {
        result.value += '(';
        openParenthesisCount++;
    }
}

function calculateSin(angleInDegrees) {
    let angleInRadians = angleInDegrees * (Math.PI / 180);
    let sinValue = Math.sin(angleInRadians);
    return sinValue;
}

function calculateCos(angleInDegrees) {
    let angleInRadians = angleInDegrees * (Math.PI / 180);
    let cosValue = Math.cos(angleInRadians);
    return cosValue;
}

function calculateTan(angleInDegrees) {
    let angleInRadians = angleInDegrees * (Math.PI / 180);
    let tanValue = Math.tan(angleInRadians);
    return tanValue;
}

function calculateCot(angleInDegrees) {
    let angleInRadians = angleInDegrees * (Math.PI / 180);
    let cotValue = 1 / Math.tan(angleInRadians);
    return cotValue;
}

function saveHistory() {
    localStorage.setItem('calculatorHistory', JSON.stringify(history));
}

function loadHistory() {
    let savedHistory = localStorage.getItem('calculatorHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
}
