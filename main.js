document.addEventListener('DOMContentLoaded', () => {
  const SECONDS_IN_MINUTE = 60;
  
  const timeDisplay = document.getElementById('time');
  const pauseButton = document.getElementById('pause-btn');
  const modeSwitcher = document.querySelector('.mode-switcher');
  const settingsButton = document.querySelector('.settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const closeModalButton = document.querySelector('.close-modal-btn');
  const pomodoroInput = document.getElementById('pomodoro-input');
  const shortBreakInput = document.getElementById('shortBreak-input');
  const longBreakInput = document.getElementById('longBreak-input');
  const fontOptionsContainer = document.getElementById('font-options-container');
  const colorOptionsContainer = document.getElementById('color-options-container');
  const timeInputsContainer = document.getElementById('time-inputs-container');
  const applyButton = document.getElementById('apply-btn');
  const progressCircleBar = document.querySelector('.progress-ring-bar');
  
  let timerInterval;
  let currentMode = 'pomodoro';
  let isRunning = false;
  
  let settings = {
    pomodoro: 25 * SECONDS_IN_MINUTE,
    shortBreak: 5 * SECONDS_IN_MINUTE,
    longBreak: 15 * SECONDS_IN_MINUTE,
    font: 'Kumbh Sans',
    color: '#F87070'
  };
  
  let timeLeft = settings.pomodoro;
  const circumference = progressCircleBar.r.baseVal.value * 2 * Math.PI;
  progressCircleBar.style.strokeDasharray = circumference;
  
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / SECONDS_IN_MINUTE);
    const remainingSeconds = seconds % SECONDS_IN_MINUTE;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  }
  
  function updateProgressBar(percentage) {
    const offset = circumference - (percentage / 100) * circumference;
    progressCircleBar.style.strokeDashoffset = offset;
  }
  
  function playSound() {
    console.log('Timer finished sound!');
  }
  
  function loadSettings() {
    const savedSettings = localStorage.getItem('pomodoroSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      settings.pomodoro = parseInt(parsedSettings.pomodoro) || (25 * SECONDS_IN_MINUTE);
      settings.shortBreak = parseInt(parsedSettings.shortBreak) || (5 * SECONDS_IN_MINUTE);
      settings.longBreak = parseInt(parsedSettings.longBreak) || (15 * SECONDS_IN_MINUTE);
      settings.font = parsedSettings.font || 'Kumbh Sans';
      settings.color = parsedSettings.color || '#F87070';
    }
    applyCurrentSettings();
    updateTimerDisplay();
  }
  
  function saveSettings() {
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
  }
  
  function applyCurrentSettings() {
    document.body.style.fontFamily = `"${settings.font}", sans-serif`;
    document.querySelectorAll('.font-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.font === settings.font);
    });
    
    document.documentElement.style.setProperty('--primary-color', settings.color);
    
    document.querySelectorAll('.color-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.color === settings.color);
    });
    
    const activeModeButton = modeSwitcher.querySelector('.mode-btn.active');
    if (activeModeButton) {
      activeModeButton.style.backgroundColor = settings.color;
    }
    
    pomodoroInput.value = settings.pomodoro / SECONDS_IN_MINUTE;
    shortBreakInput.value = settings.shortBreak / SECONDS_IN_MINUTE;
    longBreakInput.value = settings.longBreak / SECONDS_IN_MINUTE;
    
    resetTimer();
  }
  
  function updateTimerDisplay() {
    timeDisplay.textContent = formatTime(timeLeft);
    const totalTimeForMode = settings[currentMode];
    const percentage = (timeLeft / totalTimeForMode) * 100;
    updateProgressBar(percentage);
  }
  
  function startTimer() {
    if (isRunning) return;
    isRunning = true;
    pauseButton.textContent = 'PAUSE';
    
    timerInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft < 0) {
        clearInterval(timerInterval);
        isRunning = false;
        playSound();
        if (currentMode === 'pomodoro') {
          switchMode('shortBreak');
        } else if (currentMode === 'shortBreak') {
          switchMode('pomodoro');
        } else if (currentMode === 'longBreak') {
          switchMode('pomodoro');
        }
      }
      updateTimerDisplay();
    }, 1000);
  }
  
  function pauseTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    pauseButton.textContent = 'START';
  }
  
  function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    timeLeft = settings[currentMode];
    pauseButton.textContent = 'START';
    updateTimerDisplay();
  }
  
  function switchMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(button => {
      button.classList.toggle('active', button.dataset.mode === mode);
      button.style.backgroundColor = button.dataset.mode === mode ? settings.color : '';
    });
    resetTimer();
  }
  
  pauseButton.addEventListener('click', () => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  });
  
  modeSwitcher.addEventListener('click', (event) => {
    const targetButton = event.target.closest('.mode-btn');
    if (targetButton) {
      switchMode(targetButton.dataset.mode);
    }
  });
  
  settingsButton.addEventListener('click', () => {
    settingsModal.showModal();
  });
  
  closeModalButton.addEventListener('click', () => {
    settingsModal.close();
  });
  
  timeInputsContainer.addEventListener('click', (event) => {
    const targetArrow = event.target.closest('.arrow-up, .arrow-down');
    if (targetArrow) {
      const targetInputId = targetArrow.dataset.target;
      const input = document.getElementById(targetInputId);
      if (input) {
        let value = parseInt(input.value);
        if (targetArrow.classList.contains('arrow-up')) {
          value++;
        } else if (targetArrow.classList.contains('arrow-down')) {
          value = Math.max(1, value - 1);
        }
        input.value = value;
      }
    }
  });
  
  fontOptionsContainer.addEventListener('click', (event) => {
    const targetButton = event.target.closest('.font-btn');
    if (targetButton) {
      document.querySelectorAll('.font-btn').forEach(btn => btn.classList.remove('active'));
      targetButton.classList.add('active');
      settings.font = targetButton.dataset.font;
    }
  });
  
  colorOptionsContainer.addEventListener('click', (event) => {
    const targetButton = event.target.closest('.color-btn');
    if (targetButton) {
      document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
      targetButton.classList.add('active');
      settings.color = targetButton.dataset.color;
    }
  });
  
  applyButton.addEventListener('click', () => {
    settings.pomodoro = parseInt(pomodoroInput.value) * SECONDS_IN_MINUTE;
    settings.shortBreak = parseInt(shortBreakInput.value) * SECONDS_IN_MINUTE;
    settings.longBreak = parseInt(longBreakInput.value) * SECONDS_IN_MINUTE;
    
    saveSettings();
    applyCurrentSettings();
    settingsModal.close();
  });
  
  loadSettings();
  switchMode(currentMode);
});