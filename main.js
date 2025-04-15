// Login credentials
const VALID_USERNAME = 'user';
const VALID_PASSWORD = 'pass123';

// Handle sign out
function handleSignOut() {
    if (confirm('Are you sure you want to sign out?')) {
        sessionStorage.removeItem('isLoggedIn');
        checkLoginStatus();
        document.getElementById('loginForm').reset();
        showNotification('info', 'You have been signed out.');
    }
}

// Toggle password visibility
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('togglePassword');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        passwordInput.type = 'password';
        toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

// Check if user is logged in
function checkLoginStatus() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        document.getElementById('loginModal').classList.remove('hidden');
        document.getElementById('app').classList.add('hidden');
    } else {
        document.getElementById('loginModal').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
    }
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginError = document.getElementById('loginError');
    
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
        sessionStorage.setItem('isLoggedIn', 'true');
        document.getElementById('loginModal').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        loginError.textContent = '';
        showNotification('success', 'Login successful! Welcome back.');
    } else {
        loginError.textContent = 'Invalid username or password';
        document.getElementById('password').value = '';
    }
}

// Add event listeners for login-related functionality
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signOutBtn').addEventListener('click', handleSignOut);
    document.getElementById('togglePassword').addEventListener('click', togglePasswordVisibility);
    
    // Check login status on page load
    checkLoginStatus();
});

// Self-care tips array
const selfCareTips = [
    "Take a 5-minute breathing break",
    "Drink a glass of water",
    "Stretch your body",
    "Practice gratitude - write down three things you're thankful for",
    "Take a short walk",
    "Listen to your favorite song",
    "Do a quick meditation session",
    "Write down your thoughts",
    "Give yourself a compliment",
    "Take a moment to tidy your space"
  ];
  
// State management
let state = {
    reminders: [],
    habits: [],
    streaks: {},
    lastActive: '',
    waterIntake: {
        current: 0,
        goal: 8
    },
    moodHistory: [],
    currentMood: null
};

// Load data from localStorage
function loadStoredData() {
    try {
        state.reminders = JSON.parse(localStorage.getItem('reminders')) || [];
        state.habits = JSON.parse(localStorage.getItem('habits')) || [];
        state.streaks = JSON.parse(localStorage.getItem('streaks')) || {};
        state.lastActive = localStorage.getItem('lastActive') || new Date().toDateString();
        state.waterIntake = JSON.parse(localStorage.getItem('waterIntake')) || { current: 0, goal: 8 };
        state.moodHistory = JSON.parse(localStorage.getItem('moodHistory')) || [];
        state.currentMood = localStorage.getItem('currentMood') || null;
    } catch (error) {
        console.error('Error loading stored data:', error);
        showNotification('error', 'Error loading saved data');
    }
}

// Save data to localStorage
function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error saving ${key}:`, error);
        showNotification('error', 'Error saving data');
    }
}
  
  // Initialize the application
  function init() {
    loadStoredData();
    checkAndResetDaily();
    generateNewTip();
    displayReminders();
    initializeHabitTracker();
    setupEventListeners();
    initializeWaterTracker();
    initializeMoodTracker();
    checkReminders();
    requestNotificationPermission();
    updateWaterVisual();
    displayMoodHistory();
  }
  
  // Setup event listeners
  function setupEventListeners() {
    const reminderForm = document.getElementById('reminderForm');
    if (reminderForm) {
    reminderForm.addEventListener('submit', handleNewReminder);
    }

    // Setup filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterReminders(btn.dataset.type);
        });
    });

    // Setup time input validation
    const timeInput = document.getElementById('reminderTime');
    if (timeInput) {
        timeInput.addEventListener('change', validateTimeInput);
    }

    // Water tracker events
    document.getElementById('increaseWater')?.addEventListener('click', () => updateWaterIntake(1));
    document.getElementById('decreaseWater')?.addEventListener('click', () => updateWaterIntake(-1));
    document.getElementById('updateWaterGoal')?.addEventListener('click', updateWaterGoal);

    // Mood tracker events
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const mood = btn.getAttribute('data-mood');
            updateMood(mood);
            
            // Visual feedback
            document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });

    // Modal events
    document.getElementById('snoozeReminder')?.addEventListener('click', handleSnoozeReminder);
    document.getElementById('dismissReminder')?.addEventListener('click', hideReminderModal);

    // Mood history dropdown
    const moodHistoryHeader = document.getElementById('moodHistoryHeader');
    if (moodHistoryHeader) {
        moodHistoryHeader.addEventListener('click', toggleMoodHistory);
    }
}

// Validate time input
function validateTimeInput(e) {
    const timeInput = e.target;
    const currentTime = new Date();
    const [hours, minutes] = timeInput.value.split(':');
    const selectedTime = new Date();
    selectedTime.setHours(hours, minutes);

    if (selectedTime < currentTime) {
        showNotification('warning', 'Please select a future time');
        timeInput.value = '';
    }
  }
  
  // Handle new reminder submission
  function handleNewReminder(e) {
    e.preventDefault();
    
    try {
        const title = document.getElementById('reminderTitle').value.trim();
    const type = document.getElementById('reminderType').value;
    const time = document.getElementById('reminderTime').value;
        const notes = document.getElementById('reminderNotes').value.trim();

        if (!title || !type || !time) {
            showNotification('error', 'Please fill in all required fields');
            return;
        }
  
    const reminder = {
      id: Date.now(),
      title,
      type,
      time,
            notes,
            active: true,
            created: new Date().toISOString()
    };
  
        state.reminders.push(reminder);
        saveData('reminders', state.reminders);
    displayReminders();
        showNotification('success', 'Reminder added successfully!');
    e.target.reset();
    } catch (error) {
        console.error('Error adding reminder:', error);
        showNotification('error', 'Error adding reminder');
    }
}

// Filter reminders by type
function filterReminders(type) {
    const filteredReminders = type === 'all' 
        ? state.reminders 
        : state.reminders.filter(r => r.type === type);
    displayReminders(filteredReminders);
}

// Sort reminders by time
function sortReminders(remindersToSort) {
    return remindersToSort.sort((a, b) => {
        const timeA = new Date(`1970/01/01 ${a.time}`);
        const timeB = new Date(`1970/01/01 ${b.time}`);
        return timeA - timeB;
    });
}

// Display reminders
function displayReminders(remindersToShow = state.reminders) {
    const remindersList = document.getElementById('remindersList');
    if (!remindersList) return;

    remindersList.innerHTML = '';
  
    if (remindersToShow.length === 0) {
        remindersList.innerHTML = '<p class="no-reminders">No reminders yet. Add one above!</p>';
        return;
    }

    const sortedReminders = sortReminders(remindersToShow);
    
    sortedReminders.forEach(reminder => {
      const reminderElement = document.createElement('div');
        reminderElement.className = `reminder-card fade-in ${reminder.active ? 'active' : 'inactive'}`;
        
        const icon = getIconForType(reminder.type);
      reminderElement.innerHTML = `
            <div class="reminder-info">
                <div class="reminder-type-icon">
                    <i class="${icon}"></i>
                </div>
        <div>
                    <h3>${escapeHtml(reminder.title)}</h3>
          <p>${reminder.time} - ${reminder.type}</p>
                    ${reminder.notes ? `<p class="reminder-notes">${escapeHtml(reminder.notes)}</p>` : ''}
                </div>
            </div>
            <div class="reminder-actions">
                <button onclick="toggleReminder(${reminder.id})" class="${reminder.active ? 'active' : ''}" title="${reminder.active ? 'Deactivate' : 'Activate'} reminder">
                    <i class="fas ${reminder.active ? 'fa-bell' : 'fa-bell-slash'}"></i>
                </button>
                <button onclick="deleteReminder(${reminder.id})" class="delete-btn" title="Delete reminder">
                    <i class="fas fa-trash"></i>
                </button>
        </div>
      `;
      remindersList.appendChild(reminderElement);
    });
  }
  
// Escape HTML to prevent XSS
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Get icon for reminder type
function getIconForType(type) {
    const icons = {
        hydration: 'fas fa-glass-water',
        meditation: 'fas fa-spa',
        exercise: 'fas fa-dumbbell',
        break: 'fas fa-coffee',
        medicine: 'fas fa-pills',
        sleep: 'fas fa-moon'
    };
    return icons[type] || 'fas fa-bell';
}

// Toggle reminder active state
window.toggleReminder = function(id) {
    try {
        const reminder = state.reminders.find(r => r.id === id);
        if (reminder) {
            reminder.active = !reminder.active;
            saveData('reminders', state.reminders);
            displayReminders();
            showNotification(
                reminder.active ? 'success' : 'warning',
                `Reminder ${reminder.active ? 'activated' : 'deactivated'}`
            );
        }
    } catch (error) {
        console.error('Error toggling reminder:', error);
        showNotification('error', 'Error updating reminder');
    }
};

// Delete reminder
  window.deleteReminder = function(id) {
    try {
        if (confirm('Are you sure you want to delete this reminder?')) {
            state.reminders = state.reminders.filter(reminder => reminder.id !== id);
            saveData('reminders', state.reminders);
    displayReminders();
            showNotification('info', 'Reminder deleted');
        }
    } catch (error) {
        console.error('Error deleting reminder:', error);
        showNotification('error', 'Error deleting reminder');
    }
};

// Generate new tip
  window.generateNewTip = function() {
    const tipText = document.getElementById('tipText');
    if (!tipText) return;

    const currentTip = tipText.textContent;
    let randomTip;
    
    do {
        randomTip = selfCareTips[Math.floor(Math.random() * selfCareTips.length)];
    } while (randomTip === currentTip && selfCareTips.length > 1);

    tipText.textContent = randomTip;
    tipText.classList.remove('fade-in');
    void tipText.offsetWidth; // Trigger reflow
    tipText.classList.add('fade-in');
};

// Check and reset daily habits
function checkAndResetDaily() {
    const today = new Date().toDateString();
    if (state.lastActive !== today) {
        state.habits = [];
        state.waterIntake.current = 0;
        saveData('habits', state.habits);
        saveData('waterIntake', state.waterIntake);
        localStorage.setItem('lastActive', today);
        updateCompletionRate();
        updateWaterDisplay();
    }
}
  
  // Initialize habit tracker
  function initializeHabitTracker() {
    const habitsGrid = document.getElementById('habitsGrid');
    if (!habitsGrid) return;

    const habitTypes = ['Water', 'Exercise', 'Meditation', 'Sleep', 'Reading', 'Journaling'];
  
    habitsGrid.innerHTML = '';
    habitTypes.forEach((habit) => {
        const streak = state.streaks[habit] || 0;
      const habitCell = document.createElement('div');
        habitCell.className = `habit-cell ${isHabitCompleted(habit) ? 'completed' : ''} fade-in`;
        habitCell.innerHTML = `
            <i class="${getHabitIcon(habit)}"></i>
            <span>${habit}</span>
            <span class="streak-count">${streak} day streak</span>
        `;
      habitCell.onclick = () => toggleHabit(habit);
      habitsGrid.appendChild(habitCell);
    });

    updateCompletionRate();
}

// Get icon for habit
function getHabitIcon(habit) {
    const icons = {
        Water: 'fas fa-droplet',
        Exercise: 'fas fa-dumbbell',
        Meditation: 'fas fa-spa',
        Sleep: 'fas fa-moon',
        Reading: 'fas fa-book',
        Journaling: 'fas fa-pen'
    };
    return icons[habit] || 'fas fa-check';
  }
  
  // Check if habit is completed
  function isHabitCompleted(habit) {
    return state.habits.includes(habit);
}

// Update completion rate
function updateCompletionRate() {
    const totalHabits = 6;
    const completedHabits = state.habits.length;
    const rate = Math.round((completedHabits / totalHabits) * 100);
    
    const completionRate = document.getElementById('completionRate');
    const currentStreak = document.getElementById('currentStreak');
    
    if (completionRate) {
        completionRate.textContent = `${rate}%`;
    }
    
    if (currentStreak) {
        const maxStreak = Math.max(...Object.values(state.streaks), 0);
        currentStreak.textContent = `${maxStreak} days`;
    }
  }
  
  // Toggle habit completion
  function toggleHabit(habit) {
    try {
        const index = state.habits.indexOf(habit);
    if (index === -1) {
            state.habits.push(habit);
            state.streaks[habit] = (state.streaks[habit] || 0) + 1;
            showNotification('success', `${habit} habit completed! Streak: ${state.streaks[habit]} days`);
    } else {
            state.habits.splice(index, 1);
            state.streaks[habit] = 0;
            showNotification('warning', `${habit} habit unchecked`);
        }
        
        saveData('habits', state.habits);
        saveData('streaks', state.streaks);
        initializeHabitTracker();
    } catch (error) {
        console.error('Error toggling habit:', error);
        showNotification('error', 'Error updating habit');
    }
}

// Show notification
function showNotification(type, message) {
    const notification = document.getElementById('notification');
    if (!notification) return;

    const icon = notification.querySelector('.notification-icon');
    const text = notification.querySelector('.notification-text');

    const icons = {
        success: 'fas fa-check-circle',
        warning: 'fas fa-exclamation-triangle',
        error: 'fas fa-times-circle',
        info: 'fas fa-info-circle'
    };

    icon.className = `notification-icon ${icons[type]}`;
    text.textContent = message;
    notification.className = `notification ${type} fade-in`;

    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
  }
  
  // Check reminders
  function checkReminders() {
    setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
        state.reminders.forEach(reminder => {
        if (reminder.time === currentTime && reminder.active) {
          notifyUser(reminder);
        }
      });
    }, 60000); // Check every minute
  }
  
  // Notify user
  function notifyUser(reminder) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Self-Care Reminder', {
        body: `Time for ${reminder.title}!`,
        icon: '/vite.svg'
      });
    }
    
    showReminderModal(reminder);
}

// Water Tracker Functions
function initializeWaterTracker() {
    updateWaterDisplay();
}

function updateWaterIntake(change) {
    const newValue = state.waterIntake.current + change;
    if (newValue >= 0) {
        state.waterIntake.current = newValue;
        saveData('waterIntake', state.waterIntake);
        updateWaterDisplay();
        
        if (change > 0) {
            showNotification('success', 'Water intake recorded! 💧');
        }
    }
}

function updateWaterDisplay() {
    const waterCount = document.getElementById('waterCount');
    const waterGoal = document.getElementById('waterGoal');
    const glassCount = document.getElementById('glassCount');
    
    if (waterCount) waterCount.textContent = state.waterIntake.current;
    if (waterGoal) waterGoal.textContent = state.waterIntake.goal;
    if (glassCount) glassCount.textContent = state.waterIntake.current;
    
    updateWaterVisual();
}

function updateWaterVisual() {
    const waterLevel = document.getElementById('waterLevel');
    if (waterLevel) {
        const percentage = (state.waterIntake.current / state.waterIntake.goal) * 100;
        waterLevel.style.width = `${Math.min(percentage, 100)}%`;
    }
}

function updateWaterGoal() {
    const newGoal = prompt('Enter new daily water goal (glasses):', state.waterIntake.goal);
    const goal = parseInt(newGoal);
    
    if (!isNaN(goal) && goal > 0) {
        state.waterIntake.goal = goal;
        saveData('waterIntake', state.waterIntake);
        updateWaterDisplay();
        showNotification('success', 'Water goal updated!');
    }
}

// Mood Tracker Functions
function initializeMoodTracker() {
    updateMoodDisplay();
    renderMoodHistory();
}

function updateMood(selectedMood) {
    const timestamp = new Date();
    const moodEntry = {
        mood: selectedMood,
        timestamp: timestamp.toISOString()
    };
    
    state.moodHistory.unshift(moodEntry);
    // Keep only last 7 days of mood entries
    state.moodHistory = state.moodHistory.slice(0, 7);
    
    saveData('currentMood', selectedMood);
    saveData('moodHistory', state.moodHistory);
    
    updateMoodDisplay();
    renderMoodHistory();
    showNotification('success', 'Mood updated! 😊');
}

function updateMoodDisplay() {
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.mood === state.currentMood);
    });
}

function renderMoodHistory() {
    const moodChart = document.getElementById('moodChart');
    if (!moodChart) return;

    // Implementation of mood history visualization
    // You can implement a simple chart or visualization here
    const moodEmojis = {
        great: '😄',
        good: '🙂',
        okay: '😐',
        bad: '😞',
        awful: '😢'
    };

    moodChart.innerHTML = state.moodHistory
        .map(entry => `<div class="mood-entry">${moodEmojis[entry.mood]}</div>`)
        .join('');
}

function displayMoodHistory() {
    const moodHistoryContainer = document.getElementById('moodHistory');
    if (!moodHistoryContainer) return;

    moodHistoryContainer.innerHTML = '';
    
    if (state.moodHistory.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'mood-entry empty-state';
        emptyState.innerHTML = `
            <div class="mood-emoji">📝</div>
            <div class="mood-details">
                <div>No mood entries yet</div>
                <div class="mood-time">Start tracking your mood above</div>
            </div>
        `;
        moodHistoryContainer.appendChild(emptyState);
        return;
    }
    
    state.moodHistory.forEach(entry => {
        const date = new Date(entry.timestamp);
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateStr = date.toLocaleDateString([], { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
        
        const moodEmoji = getMoodEmoji(entry.mood);
        
        const entryElement = document.createElement('div');
        entryElement.className = 'mood-entry';
        entryElement.innerHTML = `
            <div class="mood-emoji">${moodEmoji}</div>
            <div class="mood-details">
                <div>Feeling ${entry.mood}</div>
                <div class="mood-time">${timeStr}</div>
                <div class="mood-date">${dateStr}</div>
            </div>
        `;
        
        moodHistoryContainer.appendChild(entryElement);
    });
}

function getMoodEmoji(mood) {
    const emojis = {
        'great': '😄',
        'good': '🙂',
        'okay': '😐',
        'bad': '😞',
        'awful': '😢'
    };
    return emojis[mood.toLowerCase()] || '😐';
}

// Enhanced Notification System
function showReminderModal(reminder) {
    const modal = document.getElementById('reminderModal');
    const message = document.getElementById('modalMessage');
    
    if (modal && message) {
        message.textContent = `Time for ${reminder.title}!`;
        modal.classList.remove('hidden');
        modal.classList.add('show');
        
        // Play notification sound
        playNotificationSound();
    }
}

function hideReminderModal() {
    const modal = document.getElementById('reminderModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }
}

function handleSnoozeReminder() {
    hideReminderModal();
    showNotification('info', 'Reminder snoozed for 5 minutes');
    
    // Schedule a new notification in 5 minutes
    setTimeout(() => {
        showNotification('warning', 'Snoozed reminder: Time to complete your task!');
    }, 5 * 60 * 1000);
}

function playNotificationSound() {
    // Create and play a notification sound
    const audio = new Audio('data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=');
    audio.play().catch(e => console.log('Error playing sound:', e));
}

// Add this new function
function toggleMoodHistory() {
    const header = document.getElementById('moodHistoryHeader');
    const history = document.getElementById('moodHistory');
    
    if (header && history) {
        header.classList.toggle('active');
        history.classList.toggle('collapsed');
    }
  }
  
  // Initialize the application
  init();