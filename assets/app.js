const $ = document.querySelector.bind(document);
let rectangles = [];

// DOM elements
const $screenshot = $('#screenshot');
const $draw = $('#draw');
const $marquee = $('#marquee');
const $boxes = $('#boxes');
let clearBtn = document.getElementById('imageClearBtn');
let imgInp = document.querySelector('#imgInp');
let text1 = document.getElementById('text1');
let text2 = document.getElementById('text2');
let resultBox = document.getElementById('resultBox');
let result = document.getElementById('result');
let goodResult = document.getElementById('goodResult');
let badResult = document.getElementById('badResult');
let boxCountResult = document.getElementById('boxCount');
let checkResult = document.getElementById('checkResult');
let backBoxBtn = document.getElementById('backBox');

// Temp variables
let startX = 0;
let startY = 0;
const marqueeRect = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
};
function imageClear() {
    $screenshot.style.display = 'none';
    $screenshot.src = ''
    imgInp.style.display = '';
    clearBtn.style.display = 'none';
    $boxes.innerHTML = '';
    rectangles = []
    imgInp.value = ''
    text1.style.display = '';
    text2.style.display = 'none';
    resultBox.style.display = 'none';
    boxCountResult.innerHTML = '0';
    result.innerHTML = '0%';
    goodResult.style.display = 'none';
    badResult.style.display = 'none';
    checkResult.style.display = 'none';
    backBoxBtn.style.display = 'none';
}

imgInp.onchange = evt => {
    let img = document.getElementById('screenshot');
    const [file] = imgInp.files
    if (file) {
        $screenshot.src = URL.createObjectURL(file)
    }
    img.onload = () => {
        if (img.width > 500) {
            $screenshot.style.display = 'block';
            sessionStorage.clear('imageSize');
            sessionStorage.setItem('selectSize', []);
            let imageSize = { width: img.clientWidth, height: img.clientHeight };
            imageSize = imageSize.width * imageSize.height
            $draw.style.height = imageSize.height;
            $draw.setAttribute('viewBox', `0 0 500 ${img.clientHeight}`);
            sessionStorage.setItem('imageSize', imageSize);
            sessionStorage.setItem('selectSize', '[]')
            imgInp.style.display = 'none';
            text1.style.display = 'none';
            text2.style.display = '';
            clearBtn.style.display = '';
            checkResult.style.display = '';
        } else {
            alert('The width of the image should be greater than 500px');
        }
    }
};

$marquee.classList.add('hide');
$screenshot.addEventListener('pointerdown', startDrag);

function startDrag(ev) {
    // middle button delete rect
    if (ev.button === 1) {
        const rect = hitTest(ev.layerX, ev.layerY);
        if (rect) {
            rectangles.splice(rectangles.indexOf(rect), 1);
            redraw();
        }
        return;
    }
    window.addEventListener('pointerup', stopDrag);
    $screenshot.addEventListener('pointermove', moveDrag);
    $marquee.classList.remove('hide');
    startX = ev.layerX;
    startY = ev.layerY;
    drawRect($marquee, startX, startY, 0, 0);
}

function stopDrag(ev) {
    $marquee.classList.add('hide');
    window.removeEventListener('pointerup', stopDrag);
    $screenshot.removeEventListener('pointermove', moveDrag);
    if (ev.target === $screenshot && marqueeRect.width && marqueeRect.height) {
        sessionStorage.removeItem('selectSize');
        rectangles.push(Object.assign({}, marqueeRect));
        sessionStorage.setItem('selectSize', JSON.stringify(rectangles))
        redraw();
        adsVerify();
    }
}

function moveDrag(ev) {
    let x = ev.layerX;
    let y = ev.layerY;
    let width = startX - x;
    let height = startY - y;
    if (width < 0) {
        width *= -1;
        x -= width;
    }
    if (height < 0) {
        height *= -1;
        y -= height;
    }
    Object.assign(marqueeRect, { x, y, width, height });
    drawRect($marquee, marqueeRect);
}

function hitTest(x, y) {
    return rectangles.find(rect => (
        x >= rect.x &&
        y >= rect.y &&
        x <= rect.x + rect.width &&
        y <= rect.y + rect.height
    ));
}

function redraw() {
    boxes.innerHTML = '';
    rectangles.forEach((data) => {
        boxes.appendChild(drawRect(
            document.createElementNS("http://www.w3.org/2000/svg", 'rect'), data
        ));
    });
    backBoxBtn.style.display = '';
}

function drawRect(rect, data) {
    const { x, y, width, height } = data;
    rect.setAttributeNS(null, 'width', width);
    rect.setAttributeNS(null, 'height', height);
    rect.setAttributeNS(null, 'x', x);
    rect.setAttributeNS(null, 'y', y);
    return rect;
}

const adsVerify = () => {
    let getImageSize = sessionStorage.getItem('imageSize');
    let getSelectSize = JSON.parse(sessionStorage.getItem('selectSize'));
    let imgSelectSize = 0;
    for (i = 0; i < getSelectSize.length; i++) {
        imgSelectSize += getSelectSize[i].width * getSelectSize[i].height;
    }
    let imageSizePercent = Math.floor((imgSelectSize / getImageSize) * 100);
    if (imageSizePercent <= 20){
        goodResult.style.display = '';
        badResult.style.display = 'none';
    } else {
        badResult.style.display = '';
        goodResult.style.display = 'none';
    }
    let boxCount = JSON.parse(sessionStorage.getItem('selectSize'));
    boxCountResult.innerHTML = boxCount.length;
    result.innerHTML = imageSizePercent > 100 ? '100%' : imageSizePercent + '%';
}

function seeResult() {
    let boxs = JSON.parse(sessionStorage.getItem('selectSize'));
    if (boxs.length > 0){
        resultBox.style.display = '';
    } else {
        alert('Draw box that contain text or logo.')
    }
}

function backBox(){
    let select = document.getElementById('boxes');
    let boxData = JSON.parse(sessionStorage.getItem('selectSize'));
    boxData.pop();
    rectangles.pop();
    sessionStorage.setItem('selectSize', JSON.stringify(boxData))
    if (select.children.length > 0) {
        select.removeChild(select.lastChild);
    }

    if (select.children.length == 0) { 
        backBoxBtn.style.display = 'none'; 
        resultBox.style.display = 'none';
    }

    adsVerify();
}