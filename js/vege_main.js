const countDescription = document.getElementById('count-description');
const progressBar = document.getElementById('progress-bar');
const incrementFullBtn = document.getElementById('increment-full');
const incrementHalfBtn = document.getElementById('increment-half');
const timeScaleSelect = document.getElementById('time-scale');
const encouragementMessage = document.getElementById('encouragement-message');
const encouragementModal = document.getElementById('encouragement-modal');
const settingsIcon = document.getElementById('settings-icon');
const settingsModal = document.getElementById('settings-modal');
const decrementOneBtn = document.getElementById('decrement-one');
const resetCountBtn = document.getElementById('reset-count');
const closeBtns = document.getElementsByClassName('close');
const closeModalBtn = document.getElementById('close-modal');

let smokingData = JSON.parse(localStorage.getItem('smokingData')) || {
  count: 0,
  records: []
};

const encouragementMessages = [
  "吃素加油",
];

function saveData() {
  localStorage.setItem('smokingData', JSON.stringify(smokingData));
}

function updateDisplay() {
  countDescription.textContent = `我已經吃了 ${smokingData.count.toFixed(1)} 餐素食`;
  const progress = (smokingData.count / 80) * 100;
  progressBar.style.width = `${progress}%`;
  updateChart();
}

function incrementCount(amount) {
  smokingData.count += amount;
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const hour = now.getHours();
  const existingRecord = smokingData.records.find(record => record.date === today && record.hour === hour);
  if (existingRecord) {
    existingRecord.count += amount;
  } else {
    smokingData.records.push({
      date: today,
      hour: hour,
      count: amount
    });
  }
  saveData();
  updateDisplay();
}

function updateChart() {
  const ctx = document.getElementById('habit-chart').getContext('2d');
  const timeScale = timeScaleSelect.value;

  let labels, data;
  if (timeScale === 'hour') {
    const today = new Date().toISOString().split('T')[0];
    labels = Array.from({ length: 24 }, (_, i) => i);
    data = labels.map(hour => {
      const record = smokingData.records.find(r => r.date === today && r.hour === hour);
      return record ? record.count : 0;
    });
  } else {
    const recordsByDate = smokingData.records.reduce((acc, record) => {
      if (!acc[record.date]) {
        acc[record.date] = 0;
      }
      acc[record.date] += record.count;
      return acc;
    }, {});
    labels = Object.keys(recordsByDate).sort();
    data = labels.map(date => recordsByDate[date]);
  }

  if (window.myChart) {
    window.myChart.destroy();
  }

  window.myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: '吃了幾餐',
        data: data,
        backgroundColor: 'rgba(76, 175, 80, 0.6)',
        borderColor: 'rgba(76, 175, 80, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: 10,
          title: {
            display: true,
            text: '餐數'
          }
        },
        x: {
          title: {
            display: true,
            text: timeScale === 'hour' ? '小時' : '日期'
          }
        }
      }
    }
  });
}

function showRandomEncouragement() {
  const randomIndex = Math.floor(Math.random() * encouragementMessages.length);
  encouragementMessage.textContent = encouragementMessages[randomIndex];
  encouragementModal.style.display = "block";
}

function decrementOne() {
  incrementCount(-1);
}

function resetCount() {
  smokingData.count = 0;
  smokingData.records = [];
  saveData();
  updateDisplay();
  settingsModal.style.display = "none";
}

// const incrementFullBtn = document.getElementById('incrementFullBtn');
// const incrementHalfBtn = document.getElementById('incrementHalfBtn');
// const timeScaleSelect = document.getElementById('timeScaleSelect');
// const settingsIcon = document.getElementById('settingsIcon');
// const settingsModal = document.getElementById('settingsModal');
// const decrementOneBtn = document.getElementById('decrementOneBtn');
// const resetCountBtn = document.getElementById('resetCountBtn');

incrementFullBtn.addEventListener('click', () => incrementCount(1));
incrementHalfBtn.addEventListener('click', () => incrementCount(0.5));
timeScaleSelect.addEventListener('change', updateChart);
settingsIcon.addEventListener('click', () => settingsModal.style.display = "block");
decrementOneBtn.addEventListener('click', decrementOne);
resetCountBtn.addEventListener('click', resetCount);

Array.from(closeBtns).forEach(btn => {
  btn.onclick = function () {
    encouragementModal.style.display = "none";
    settingsModal.style.display = "none";
  }
});

closeModalBtn.onclick = function () {
  encouragementModal.style.display = "none";
}

window.onclick = function (event) {
  if (event.target == encouragementModal) {
    encouragementModal.style.display = "none";
  }
  if (event.target == settingsModal) {
    settingsModal.style.display = "none";
  }
}

updateDisplay();
showRandomEncouragement();
