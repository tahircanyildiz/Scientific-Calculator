let result = document.getElementById('result');
let isScientificVisible = false;
let openParenthesisCount = 0;

function appendToDisplay(value) {
    result.value += value;
}

function clearDisplay() {
    result.value = '';
    openParenthesisCount = 0;
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
        result.value = eval(expression);
        openParenthesisCount = 0;
    } catch (error) {
        result.value = 'Error';
    }
}

function transformExpression(expression) {
    // Üs  Math.pow 
    expression = expression.replace(/(\d+|\w+)\^(\d+)/g, 'Math.pow($1,$2)');
    // √  Math.sqrt ür
    expression = expression.replace(/√(\d+)/g, 'Math.sqrt($1)');
    expression = expression.replace(/√\(([^)]+)\)/g, 'Math.sqrt($1)');

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

function square() {
    let currentValue = result.value;
    let squaredValue = Math.pow(parseFloat(currentValue), 2);
    result.value = squaredValue;
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
