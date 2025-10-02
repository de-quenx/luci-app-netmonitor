let buttonsVisible = localStorage.getItem('buttonsVisible') !== 'false';
let currentTheme = localStorage.getItem('theme') || 'light';
let activeChart = 'summary';
let showHijri = false;
let chartLoadedOnce = {};

const themes = {
  light: 'Light',
  dark: 'Dark',
  ocean: 'Ocean',
  purple: 'Purple',
  gradient: 'Gradient',
  transparent: 'Glass'
};

const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

document.addEventListener('DOMContentLoaded', function() {
  document.body.setAttribute('data-theme', currentTheme);
  document.getElementById('themeText').textContent = themes[currentTheme];
  
  const ctrlButtons = document.getElementById('ctrlButtons');
  if (!buttonsVisible) ctrlButtons.classList.add('hidden');
  
  // Preload all chart images
  preloadChartImages();
  
  document.getElementById('ctrlToggle').addEventListener('click', () => {
    buttonsVisible = !buttonsVisible;
    ctrlButtons.classList.toggle('hidden', !buttonsVisible);
    localStorage.setItem('buttonsVisible', buttonsVisible);
  });
  
  document.getElementById('themeBtn').addEventListener('click', () => {
    const themeKeys = Object.keys(themes);
    const currentIndex = themeKeys.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    currentTheme = themeKeys[nextIndex];
    document.body.setAttribute('data-theme', currentTheme);
    document.getElementById('themeText').textContent = themes[currentTheme];
    localStorage.setItem('theme', currentTheme);
    showToast(`Theme: ${themes[currentTheme]}`, 'success');
  });
  
  document.getElementById('statsBtn').addEventListener('click', toggleModal);
  document.getElementById('closeBtn').addEventListener('click', closeModal);
  document.getElementById('blurOverlay').addEventListener('click', closeAllModals);
  
  document.getElementById('infoBtn').addEventListener('click', toggleInfoModal);
  document.getElementById('closeInfoBtn').addEventListener('click', closeInfoModal);
  
  document.querySelectorAll('.chart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const chart = e.target.getAttribute('data-chart');
      if (chart) switchChart(chart);
    });
  });
  
  updateDateTime();
  setInterval(updateDateTime, 1000);
  
  // Auto refresh charts setiap 5 menit (bukan setiap kali modal dibuka)
  setInterval(() => {
    if (document.getElementById('statsModal').classList.contains('show')) {
      refreshChart(activeChart, true);
    }
  }, 300000); // 5 menit
});

function preloadChartImages() {
  const charts = ['summary', 'minutes', 'hourly', 'daily', 'monthly', 'yearly'];
  charts.forEach(chart => {
    const img = document.getElementById(chart);
    if (img && !chartLoadedOnce[chart]) {
      const tempImg = new Image();
      tempImg.onload = () => {
        chartLoadedOnce[chart] = true;
      };
      tempImg.src = img.src;
    }
  });
}

function toggleModal() {
  const modal = document.getElementById('statsModal');
  const overlay = document.getElementById('blurOverlay');
  const statsBtn = document.getElementById('statsBtn');
  const isVisible = modal.classList.contains('show');
  
  // Close info modal if open
  closeInfoModal();
  
  if (isVisible) {
    closeModal();
  } else {
    modal.classList.add('show');
    overlay.classList.add('active');
    statsBtn.classList.add('active');
    // Hanya refresh jika belum pernah di-load
    if (!chartLoadedOnce[activeChart]) {
      refreshChart(activeChart, false);
    }
  }
}

function closeModal() {
  document.getElementById('statsModal').classList.remove('show');
  document.getElementById('blurOverlay').classList.remove('active');
  document.getElementById('statsBtn').classList.remove('active');
}

function toggleInfoModal() {
  const modal = document.getElementById('infoModal');
  const overlay = document.getElementById('blurOverlay');
  const infoBtn = document.getElementById('infoBtn');
  const isVisible = modal.classList.contains('show');
  
  // Close stats modal if open
  closeModal();
  
  if (isVisible) {
    closeInfoModal();
  } else {
    modal.classList.add('show');
    overlay.classList.add('active');
    infoBtn.classList.add('active');
  }
}

function closeInfoModal() {
  document.getElementById('infoModal').classList.remove('show');
  document.getElementById('blurOverlay').classList.remove('active');
  document.getElementById('infoBtn').classList.remove('active');
}

function closeAllModals() {
  closeModal();
  closeInfoModal();
}

function toHijri(date) {
  const HIJRI_EPOCH = new Date(622, 6, 16);
  const daysDiff = Math.floor((date - HIJRI_EPOCH) / (1000 * 60 * 60 * 24));
  const hijriYear = Math.floor(daysDiff / 354.367) + 1;
  const dayOfYear = Math.floor(daysDiff - ((hijriYear - 1) * 354.367));
  
  const monthDays = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
  const leapYears = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];
  if (leapYears.includes(hijriYear % 30)) {
    monthDays[11] = 30;
  }
  
  let currentDay = dayOfYear;
  let month = 1;
  
  for (let i = 0; i < 12; i++) {
    if (currentDay <= monthDays[i]) {
      month = i + 1;
      break;
    }
    currentDay -= monthDays[i];
  }
  
  return {
    year: hijriYear,
    month: month,
    day: Math.max(1, Math.min(currentDay, monthDays[month - 1]))
  };
}

function updateDateTime() {
  const now = new Date();
  const currentMinute = now.getMinutes();
  showHijri = currentMinute % 2 === 1;
  
  if (showHijri) {
    const hijriDate = toHijri(now);
    const hijriMonths = [
      'Muharram', 'Safar', 'Rabiul Awwal', 'Rabiul Akhir',
      'Jumadil Awwal', 'Jumadil Akhir', 'Rajab', 'Syaban',
      'Ramadhan', 'Syawal', 'Dzulqaidah', 'Dzulhijjah'
    ];
    document.getElementById('currentDate').textContent = 
      `${hijriDate.day} ${hijriMonths[hijriDate.month - 1]} ${hijriDate.year}H`;
  } else {
    document.getElementById('currentDate').textContent = 
      now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'Asia/Jakarta'
      });
  }
  
  document.getElementById('currentTime').textContent = 
    now.toLocaleTimeString('en-US', {
      hour12: false,
      timeZone: 'Asia/Jakarta'
    });
  document.getElementById('currentDay').textContent = dayNames[now.getDay()];
}

function switchChart(chartType) {
  document.querySelectorAll('.chart-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-chart') === chartType);
  });
  
  document.querySelectorAll('.chart-img').forEach(img => {
    img.style.display = 'none';
  });
  
  const targetImg = document.getElementById(chartType);
  if (targetImg) {
    activeChart = chartType;
    targetImg.style.display = 'block';
    // Hanya refresh jika belum pernah di-load
    if (!chartLoadedOnce[chartType]) {
      refreshChart(chartType, false);
    }
  }
}

function refreshChart(chartType, forceRefresh = false) {
  const container = document.getElementById('imageContainer');
  const img = document.getElementById(chartType);
  if (!img) return;
  
  // Jangan refresh jika sudah di-load kecuali dipaksa
  if (chartLoadedOnce[chartType] && !forceRefresh) {
    return;
  }
  
  container.classList.add('loading');
  const timestamp = Date.now();
  const baseSrc = img.src.split('?')[0];
  
  // Gunakan cache buster hanya saat force refresh
  const newSrc = forceRefresh ? `${baseSrc}?t=${timestamp}` : baseSrc;
  
  // Cek apakah src berbeda sebelum update
  if (img.src === newSrc) {
    container.classList.remove('loading');
    chartLoadedOnce[chartType] = true;
    return;
  }
  
  const handleLoad = () => {
    container.classList.remove('loading');
    chartLoadedOnce[chartType] = true;
    img.removeEventListener('load', handleLoad);
    img.removeEventListener('error', handleError);
  };
  
  const handleError = () => {
    container.classList.remove('loading');
    showToast('Failed to load chart', 'error');
    img.removeEventListener('load', handleLoad);
    img.removeEventListener('error', handleError);
  };
  
  img.addEventListener('load', handleLoad);
  img.addEventListener('error', handleError);
  
  img.src = newSrc;
}

function showToast(message, type, duration = 3000) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  
  if (toast.timeoutId) clearTimeout(toast.timeoutId);
  
  toastMsg.textContent = message;
  toast.className = `toast show ${type}`;
  
  toast.timeoutId = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeAllModals();
  if ((e.key === 't' || e.key === 'T') && !e.ctrlKey && !e.altKey) {
    document.getElementById('themeBtn').click();
  }
  if ((e.key === 's' || e.key === 'S') && !e.ctrlKey && !e.altKey) {
    toggleModal();
  }
  if ((e.key === 'i' || e.key === 'I') && !e.ctrlKey && !e.altKey) {
    toggleInfoModal();
  }
  if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.altKey) {
    if (document.getElementById('statsModal').classList.contains('show')) {
      refreshChart(activeChart, true);
      showToast('Chart refreshed', 'success');
    }
  }
});