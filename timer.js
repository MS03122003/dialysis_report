        let timerInterval;
        let seconds = 0;
        let isRunning = false;
        let isPaused = false;
        const maxTime = 600; // 10 minutes in seconds
        let processLog = [];
        let tickedActions = new Set();
        let sectionCounters = {
            ps1: 0,
            chemical: 0,
            tank: 0,
            dialyzer: 0,
            process: 0,
            ps2: 0
        };
        let tankLevel = 0;
        let pendingAction = null;

        // Audio context for clock sound
        let audioContext;
        let clockSound = null;

        function initializeAudio() {
            try {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                createClockSound();
            } catch (e) {
                console.log('Audio not supported');
            }
        }

        function createClockSound() {
            if (!audioContext) return;
            
            clockSound = () => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
            };
        }

        function playClockSound() {
            if (clockSound && audioContext) {
                clockSound();
            }
        }

        function updateTimerDisplay() {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            const display = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
            document.getElementById('timerText').textContent = display;
            
            // Update circular fill
            const percentage = (seconds / maxTime) * 360;
            document.getElementById('timerFill').style.background = 
                `conic-gradient(from 0deg, #32cd32 ${percentage}deg, transparent ${percentage}deg)`;
        }

        function toggleTimer() {
            const startBtn = document.getElementById('startBtn');
            const timerDisplay = document.getElementById('timerDisplay');
            
            if (!audioContext) {
                initializeAudio();
            }
            
            if (!isRunning && !isPaused) {
                // Start new timer
                startTimer();
                startBtn.textContent = 'Stop';
                timerDisplay.classList.add('timer-running');
                logProcess('Timer started');
            } else if (isRunning) {
                // Stop timer
                stopTimer();
                startBtn.textContent = 'Start';
                timerDisplay.classList.remove('timer-running');
                logProcess('Timer stopped');
            } else if (isPaused) {
                // Resume timer
                resumeTimer();
                startBtn.textContent = 'Stop';
                timerDisplay.classList.add('timer-running');
                logProcess('Timer resumed');
            }
        }

        function startTimer() {
            isRunning = true;
            isPaused = false;
            showAllTickButtons();
            timerInterval = setInterval(() => {
                seconds++;
                updateTimerDisplay();
                playClockSound();
                autoCompleteActions();
                
                if (seconds >= maxTime) {
                    stopTimer();
                    alert('Timer completed! 10 minutes elapsed.');
                    logProcess('Timer completed - 10 minutes elapsed');
                }
            }, 1000);
        }

        function stopTimer() {
            clearInterval(timerInterval);
            isRunning = false;
            isPaused = false;
            hideAllTickButtons();
        }

        function pauseTimer() {
            if (isRunning) {
                clearInterval(timerInterval);
                isRunning = false;
                isPaused = true;
                document.getElementById('startBtn').textContent = 'Resume';
                document.getElementById('timerDisplay').classList.remove('timer-running');
                logProcess('Timer paused');
            }
        }

        function resumeTimer() {
            if (isPaused) {
                startTimer();
                document.getElementById('startBtn').textContent = 'Stop';
                document.getElementById('timerDisplay').classList.add('timer-running');
            }
        }

        function showResetConfirmation() {
            pendingAction = 'reset';
            document.getElementById('dialogTitle').textContent = 'Reset Timer';
            document.getElementById('dialogMessage').textContent = 'Are you sure you want to reset the timer? This will stop the current session and reset all progress.';
            document.getElementById('confirmationDialog').style.display = 'flex';
        }

        function resetTimer() {
            stopTimer();
            seconds = 0;
            updateTimerDisplay();
            document.getElementById('startBtn').textContent = 'Start';
            document.getElementById('timerDisplay').classList.remove('timer-running');
            resetAllTicks();
            logProcess('Timer reset');
        }

        function showAllTickButtons() {
            const tickButtons = document.querySelectorAll('.tick-button');
            tickButtons.forEach((button, index) => {
                setTimeout(() => {
                    button.classList.add('visible');
                }, index * 200); // Stagger the appearance
            });
        }

        function hideAllTickButtons() {
            const tickButtons = document.querySelectorAll('.tick-button');
            tickButtons.forEach(button => {
                button.classList.remove('visible');
                button.classList.remove('ticked');
            });
        }

        function resetAllTicks() {
            const tickButtons = document.querySelectorAll('.tick-button');
            const stationButtons = document.querySelectorAll('.station-button');
            
            tickButtons.forEach(button => {
                button.classList.remove('visible');
                button.classList.remove('ticked');
            });
            
            stationButtons.forEach(button => {
                button.classList.remove('completed');
            });
            
            tickedActions.clear();
            
            // Reset counters
            Object.keys(sectionCounters).forEach(key => {
                sectionCounters[key] = 0;
                const counter = document.getElementById(key + 'Counter');
                if (counter) {
                    counter.textContent = '0';
                }
            });
            
            // Reset tank level
            tankLevel = 0;
            document.getElementById('tankFill').style.height = '0%';
        }

        function autoCompleteActions() {
            const totalActions = 10; // 5 actions per station
            const actionsToComplete = Math.floor((seconds / maxTime) * totalActions);
            const actionList = [
                'bloodPortCheck1', 'rinse1', 'clean1', 'tbv1', 'affution1',
                'bloodPortCheck2', 'rinse2', 'clean2', 'tbv2', 'affution2'
            ];
            
            // Auto-complete actions based on timer progress
            for (let i = 0; i < actionsToComplete; i++) {
                const action = actionList[i];
                if (!tickedActions.has(action)) {
                    autoTickAction(action);
                }
            }
        }

        function autoTickAction(action) {
            tickedActions.add(action);
            
            // Find the corresponding tick button and mark as ticked
            const stationButton = document.querySelector(`[data-action="${action}"]`);
            if (stationButton) {
                const tickButton = stationButton.querySelector('.tick-button');
                if (tickButton) {
                    tickButton.classList.add('ticked');
                    stationButton.classList.add('completed');
                }
            }
            
            // Increment relevant section counters
            if (action.includes('blood') || action.includes('rinse') || action.includes('clean')) {
                sectionCounters.chemical++;
                document.getElementById('chemicalCounter').textContent = sectionCounters.chemical;
            } else if (action.includes('tbv')) {
                sectionCounters.process++;
                document.getElementById('processCounter').textContent = sectionCounters.process;
            } else if (action.includes('affution')) {
                sectionCounters.dialyzer++;
                document.getElementById('dialyzerCounter').textContent = sectionCounters.dialyzer;
            }
            
            // Increase tank level
            tankLevel = Math.min(tankLevel + 10, 100);
            document.getElementById('tankFill').style.height = tankLevel + '%';
            sectionCounters.tank = Math.floor(tankLevel / 10);
            document.getElementById('tankCounter').textContent = sectionCounters.tank;
            
            logProcess(`Action auto-completed: ${action}`);
        }

        function toggleTick(tickButton, action) {
            event.stopPropagation();
            
            // Manual toggle only works when timer is running
            if (!isRunning) {
                alert('Start the timer first to enable manual actions');
                return;
            }
            
            if (tickedActions.has(action)) {
                // Untick
                tickedActions.delete(action);
                tickButton.classList.remove('ticked');
                tickButton.parentElement.classList.remove('completed');
                logProcess(`Action manually unchecked: ${action}`);
            } else {
                // Tick
                tickedActions.add(action);
                tickButton.classList.add('ticked');
                tickButton.parentElement.classList.add('completed');
                
                // Increment relevant section counters
                if (action.includes('blood') || action.includes('rinse') || action.includes('clean')) {
                    sectionCounters.chemical++;
                    document.getElementById('chemicalCounter').textContent = sectionCounters.chemical;
                } else if (action.includes('tbv')) {
                    sectionCounters.process++;
                    document.getElementById('processCounter').textContent = sectionCounters.process;
                } else if (action.includes('affution')) {
                    sectionCounters.dialyzer++;
                    document.getElementById('dialyzerCounter').textContent = sectionCounters.dialyzer;
                }
                
                // Increase tank level
                tankLevel = Math.min(tankLevel + 10, 100);
                document.getElementById('tankFill').style.height = tankLevel + '%';
                sectionCounters.tank = Math.floor(tankLevel / 10);
                document.getElementById('tankCounter').textContent = sectionCounters.tank;
                
                logProcess(`Action manually completed: ${action}`);
            }
        }

        function accessSection(sectionName) {
            sectionCounters[sectionName.toLowerCase().replace(' ', '')] = 
                (sectionCounters[sectionName.toLowerCase().replace(' ', '')] || 0) + 1;
            
            const counterId = sectionName.toLowerCase().replace(' ', '') + 'Counter';
            const counter = document.getElementById(counterId);
            if (counter) {
                counter.textContent = sectionCounters[sectionName.toLowerCase().replace(' ', '')];
            }
            
            alert(`${sectionName} section accessed`);
            logProcess(`${sectionName} section accessed`);
        }

        function showConfirmation(title, message, action) {
            pendingAction = action;
            document.getElementById('dialogTitle').textContent = title;
            document.getElementById('dialogMessage').textContent = message;
            document.getElementById('confirmationDialog').style.display = 'flex';
        }

        function confirmAction() {
            if (pendingAction === 'reset') {
                resetTimer();
            } else if (pendingAction === 'home') {
                resetTimer();
                alert('Returned to home screen');
                logProcess('Returned to home screen');
            }
            cancelAction();
        }

        function cancelAction() {
            document.getElementById('confirmationDialog').style.display = 'none';
            pendingAction = null;
        }

        function goHome() {
            if (isRunning || isPaused) {
                pendingAction = 'home';
                document.getElementById('dialogTitle').textContent = 'Return to Home';
                document.getElementById('dialogMessage').textContent = 'Return to home? This will stop the current session and reset all progress.';
                document.getElementById('confirmationDialog').style.display = 'flex';
            } else {
                alert('Returned to home screen');
                logProcess('Returned to home screen');
            }
        }

        function continueProcess() {
            alert('Process continued');
            logProcess('Process continued');
        }

        function logProcess(message) {
            const timestamp = new Date().toLocaleTimeString();
            processLog.push(`${timestamp}: ${message}`);
            
            // Keep only last 50 entries
            if (processLog.length > 50) {
                processLog = processLog.slice(-50);
            }
        }


         function printFormattedReceipt() {
                const data = JSON.parse(localStorage.getItem('dialyzerFormData'));

                if (!data) {
                    alert("No receipt data found!");
                    return;
                }

                const [date, time] = data.dateTime.split('T');

                const receipt = `
                Amvin Aqua products
                -----------------------------
                    Dialyzer Reprocessing Record
                -----------------------------
                Date: ${date}    ${time}
                Machine ID: ${data.station}
                Operator ID: ${data.techID}
                Patient ID: ${data.patientID}
                Dialyzer Type: ${data.dialyzerType}
                -----------------------------
                Processing Details:
                Previous Uses: ${data.previousUses} ✓
                Fiber Bundle Volume: ${data.tbv} mL ✓
                Pressure Leak Test: ${data.pressureLeakTest} ✓
                Blood Leak Test: ${data.bloodLeakTest} ✓
                Final Rinse: ${data.finalRinse} ✓
                Storage Result: ${data.storageResult}
                Reprocessing #: ${data.reprocessingNo}
                Storage Date: ${data.storageDate}
                Next Due: ${data.nextDueDate}
                -----------------------------
                `;

                // Open new window for print preview
                win = window.open('', '_blank');
                win.document.write(
                    "<html><head><title>Print Receipt</title><style>" +
                    "@page { size: 80mm auto; margin: 0; }" +
                    "body { font-family: 'Courier New', monospace; font-size: 12px; padding: 0; margin: 0; }" +
                    "pre { white-space: pre-wrap; word-break: break-word; margin: 0; padding: 5px; }" +
                    "</style></head><body><pre>" + receipt + "</pre></body></html>"
                );
                win.document.close();
                win.focus();
                win.print();
                }

        // Initialize
        updateTimerDisplay();
        logProcess('Advanced dialysis machine interface initialized');
        
        // Welcome message
        setTimeout(() => {
            alert('Advanced Dialysis Machine Interface Ready\n\n🚀 NEW FEATURES:\n• Tick buttons (✓) appear automatically when timer starts\n• Actions complete automatically based on timer progress\n• Manual tick override available when timer is running\n• Reset shows confirmation and clears all progress\n• Clock sound plays every second during timer\n• Tank level and counters update automatically\n\nClick START to begin!');
        }, 500);

        // Initialize audio on first user interaction
        document.addEventListener('click', function initAudio() {
            if (!audioContext) {
                initializeAudio();
            }
            document.removeEventListener('click', initAudio);
        }, { once: true });