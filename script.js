
class RunningTimer {
    constructor() {
        this.programs = {
            1: {
                title: "Semana 1",
                description: "1 minuto correr + 4 minutos caminar",
                intervals: [
                    { type: "run", duration: 60 },
                    { type: "walk", duration: 240 }
                ],
                cycles: 4,
                hasWarmup: false
            },
            2: {
                title: "Semana 2", 
                description: "2 minutos correr + 3 minutos caminar",
                intervals: [
                    { type: "run", duration: 120 },
                    { type: "walk", duration: 180 }
                ],
                cycles: 4,
                hasWarmup: false
            },
            3: {
                title: "Semana 3",
                description: "3 minutos correr + 2 minutos caminar",
                intervals: [
                    { type: "run", duration: 180 },
                    { type: "walk", duration: 120 }
                ],
                cycles: 4,
                hasWarmup: true
            },
            4: {
                title: "Semana 4",
                description: "4 minutos correr + 1 minuto caminar", 
                intervals: [
                    { type: "run", duration: 240 },
                    { type: "walk", duration: 60 }
                ],
                cycles: 4,
                hasWarmup: true
            },
            5: {
                title: "Semana 5",
                description: "20 minutos trote suave + 3 minutos recuperación",
                intervals: [
                    { type: "jog", duration: 1200 },
                    { type: "recovery", duration: 180 }
                ],
                cycles: 1,
                hasWarmup: true
            }
        };

        this.currentWeek = 1;
        this.isRunning = false;
        this.isPaused = false;
        this.currentCycle = 0;
        this.currentInterval = 0;
        this.timeRemaining = 0;
        this.totalTime = 0;
        this.isWarmup = false;
        this.warmupTime = 300; // 5 minutos
        this.warmupExercises = [
            "Rotar cabeza",
            "Rotar hombros", 
            "Rotar brazos",
            "Girar tronco",
            "Troncos lateral",
            "Rotación cadera",
            "Rotación rodillas",
            "Rotación tobillos",
            "Elevación rodillas",
            "Balanceo piernas adelante/atrás",
            "Balanceo piernas lateral"
        ];
        this.currentExerciseIndex = 0;
        this.exerciseDuration = 15; // 15 segundos por ejercicio
        this.isInteractiveWarmup = false;
        this.isStandaloneWarmup = false;
        
        this.timer = null;
        this.audioContext = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.updateProgram();
    }

    initializeElements() {
        this.weekSelectionScreen = document.getElementById('week-selection-screen');
        this.timerScreen = document.getElementById('timer-screen');
        this.warmupScreen = document.getElementById('warmup-screen');
        this.weekButtons = document.querySelectorAll('.week-btn');
        this.warmupOnlyBtn = document.getElementById('warmup-only-btn');
        this.backBtn = document.getElementById('back-btn');
        this.backFromWarmupBtn = document.getElementById('back-from-warmup-btn');
        this.programTitle = document.getElementById('program-title');
        this.programDetails = document.getElementById('program-details');
        this.timeDisplay = document.getElementById('time');
        this.phaseDisplay = document.getElementById('phase');
        this.intervalInfo = document.getElementById('interval-info');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        
        // Standalone warmup elements
        this.startWarmupStandaloneBtn = document.getElementById('start-warmup-standalone');
        this.warmupInteractiveStandalone = document.getElementById('warmup-interactive-standalone');
        this.warmupListStandalone = document.getElementById('warmup-list-standalone');
        this.currentExerciseNameStandalone = document.getElementById('current-exercise-name-standalone');
        this.exerciseTimerStandalone = document.getElementById('exercise-timer-standalone');
        this.exerciseCounterStandalone = document.getElementById('exercise-counter-standalone');
        this.totalExercisesStandalone = document.getElementById('total-exercises-standalone');
        this.pauseWarmupStandaloneBtn = document.getElementById('pause-warmup-standalone');
        this.skipExerciseStandaloneBtn = document.getElementById('skip-exercise-standalone');
        
        this.progressFill = document.getElementById('progress-fill');
        this.stats = document.getElementById('stats');
    }

    setupEventListeners() {
        // Event listeners para botones de semana
        this.weekButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentWeek = parseInt(btn.dataset.week);
                this.showTimerScreen();
                this.updateProgram();
                this.reset();
            });
        });

        // Event listener para botón de volver
        this.backBtn.addEventListener('click', () => {
            this.showWeekSelectionScreen();
            this.reset();
        });

        // Event listener para botón de calentamiento independiente
        this.warmupOnlyBtn.addEventListener('click', () => {
            this.showWarmupScreen();
        });

        // Event listener para botón de volver desde calentamiento
        this.backFromWarmupBtn.addEventListener('click', () => {
            this.showWeekSelectionScreen();
            this.resetStandaloneWarmup();
        });

        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.startWarmupStandaloneBtn.addEventListener('click', () => this.startStandaloneWarmup());
        this.pauseWarmupStandaloneBtn.addEventListener('click', () => this.pauseStandaloneWarmup());
        this.skipExerciseStandaloneBtn.addEventListener('click', () => this.skipStandaloneExercise());
    }

    showWeekSelectionScreen() {
        this.weekSelectionScreen.style.display = 'block';
        this.timerScreen.style.display = 'none';
        this.warmupScreen.style.display = 'none';
    }

    showTimerScreen() {
        this.weekSelectionScreen.style.display = 'none';
        this.timerScreen.style.display = 'block';
        this.warmupScreen.style.display = 'none';
    }

    showWarmupScreen() {
        this.weekSelectionScreen.style.display = 'none';
        this.timerScreen.style.display = 'none';
        this.warmupScreen.style.display = 'block';
    }

    updateProgram() {
        const program = this.programs[this.currentWeek];
        this.programTitle.textContent = program.title;
        this.programDetails.innerHTML = `
            <p><strong>Rutina:</strong> ${program.description}</p>
            <p><strong>Duración total:</strong> 20 minutos</p>
            <p><strong>Repeticiones:</strong> ${program.cycles} ciclos</p>
        `;
        
        
        
        this.calculateTotalTime();
    }

    calculateTotalTime() {
        const program = this.programs[this.currentWeek];
        this.totalTime = 0;
        
        for (let cycle = 0; cycle < program.cycles; cycle++) {
            for (let interval of program.intervals) {
                this.totalTime += interval.duration;
            }
        }
    }

    startInteractiveWarmup() {
        this.isInteractiveWarmup = true;
        this.currentExerciseIndex = 0;
        this.timeRemaining = this.exerciseDuration;
        
        // Mostrar interfaz interactiva
        this.warmupInteractive.style.display = 'block';
        this.warmupList.style.display = 'none';
        this.startWarmupBtn.style.display = 'none';
        
        // Configurar interfaz
        this.totalExercises.textContent = this.warmupExercises.length;
        this.updateCurrentExercise();
        
        // Iniciar timer
        this.isRunning = true;
        this.timer = setInterval(() => {
            this.tickWarmup();
        }, 1000);
    }

    updateCurrentExercise() {
        this.currentExerciseName.textContent = this.warmupExercises[this.currentExerciseIndex];
        this.exerciseCounter.textContent = this.currentExerciseIndex + 1;
        this.exerciseTimer.textContent = this.timeRemaining;
    }

    tickWarmup() {
        this.timeRemaining--;
        this.exerciseTimer.textContent = this.timeRemaining;
        
        if (this.timeRemaining <= 0) {
            this.playSound();
            this.nextExercise();
        }
    }

    nextExercise() {
        this.currentExerciseIndex++;
        
        if (this.currentExerciseIndex >= this.warmupExercises.length) {
            this.completeInteractiveWarmup();
            return;
        }
        
        this.timeRemaining = this.exerciseDuration;
        this.updateCurrentExercise();
    }

    skipExercise() {
        this.nextExercise();
    }

    pauseWarmup() {
        if (this.isRunning) {
            this.isRunning = false;
            clearInterval(this.timer);
            this.pauseWarmupBtn.textContent = "Continuar";
        } else {
            this.isRunning = true;
            this.timer = setInterval(() => {
                this.tickWarmup();
            }, 1000);
            this.pauseWarmupBtn.textContent = "Pausar";
        }
    }

    startStandaloneWarmup() {
        this.isStandaloneWarmup = true;
        this.currentExerciseIndex = 0;
        this.timeRemaining = this.exerciseDuration;
        
        // Mostrar interfaz interactiva
        this.warmupInteractiveStandalone.style.display = 'block';
        this.warmupListStandalone.style.display = 'none';
        this.startWarmupStandaloneBtn.style.display = 'none';
        
        // Configurar interfaz
        this.totalExercisesStandalone.textContent = this.warmupExercises.length;
        this.updateCurrentExerciseStandalone();
        
        // Iniciar timer
        this.isRunning = true;
        this.timer = setInterval(() => {
            this.tickStandaloneWarmup();
        }, 1000);
    }

    updateCurrentExerciseStandalone() {
        this.currentExerciseNameStandalone.textContent = this.warmupExercises[this.currentExerciseIndex];
        this.exerciseCounterStandalone.textContent = this.currentExerciseIndex + 1;
        this.exerciseTimerStandalone.textContent = this.timeRemaining;
    }

    tickStandaloneWarmup() {
        this.timeRemaining--;
        this.exerciseTimerStandalone.textContent = this.timeRemaining;
        
        if (this.timeRemaining <= 0) {
            this.playSound();
            this.nextStandaloneExercise();
        }
    }

    nextStandaloneExercise() {
        this.currentExerciseIndex++;
        
        if (this.currentExerciseIndex >= this.warmupExercises.length) {
            this.completeStandaloneWarmup();
            return;
        }
        
        this.timeRemaining = this.exerciseDuration;
        this.updateCurrentExerciseStandalone();
    }

    skipStandaloneExercise() {
        this.nextStandaloneExercise();
    }

    pauseStandaloneWarmup() {
        if (this.isRunning) {
            this.isRunning = false;
            clearInterval(this.timer);
            this.pauseWarmupStandaloneBtn.textContent = "Continuar";
        } else {
            this.isRunning = true;
            this.timer = setInterval(() => {
                this.tickStandaloneWarmup();
            }, 1000);
            this.pauseWarmupStandaloneBtn.textContent = "Pausar";
        }
    }

    completeStandaloneWarmup() {
        this.isStandaloneWarmup = false;
        this.isRunning = false;
        clearInterval(this.timer);
        
        // Restaurar interfaz
        this.warmupInteractiveStandalone.style.display = 'none';
        this.warmupListStandalone.style.display = 'block';
        this.startWarmupStandaloneBtn.style.display = 'block';
        this.pauseWarmupStandaloneBtn.textContent = "Pausar";
        
        this.playSound();
        alert("🎉 ¡Calentamiento completado! Estás listo para entrenar.");
    }

    resetStandaloneWarmup() {
        this.isStandaloneWarmup = false;
        this.isRunning = false;
        this.currentExerciseIndex = 0;
        this.timeRemaining = this.exerciseDuration;
        
        clearInterval(this.timer);
        
        // Restaurar interfaz
        this.warmupInteractiveStandalone.style.display = 'none';
        this.warmupListStandalone.style.display = 'block';
        this.startWarmupStandaloneBtn.style.display = 'block';
        this.pauseWarmupStandaloneBtn.textContent = "Pausar";
    }

    completeInteractiveWarmup() {
        this.isInteractiveWarmup = false;
        this.isRunning = false;
        clearInterval(this.timer);
        
        this.phaseDisplay.textContent = "✅ Calentamiento completado";
        this.intervalInfo.textContent = "¡Listo para el entrenamiento!";
        this.playSound();
    }

    startWarmup() {
        this.isWarmup = true;
        this.timeRemaining = this.warmupTime;
        this.phaseDisplay.textContent = "🔥 Calentamiento";
        this.intervalInfo.textContent = "Realiza todos los ejercicios de calentamiento";
        this.startWarmupBtn.disabled = true;
        this.start();
    }

    start() {
        if (!this.isRunning && !this.isWarmup) {
            // Iniciar entrenamiento normal
            const program = this.programs[this.currentWeek];
            this.currentCycle = 0;
            this.currentInterval = 0;
            this.timeRemaining = program.intervals[0].duration;
            this.updatePhaseDisplay();
        }
        
        this.isRunning = true;
        this.isPaused = false;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        
        this.timer = setInterval(() => {
            this.tick();
        }, 1000);
    }

    pause() {
        this.isRunning = false;
        this.isPaused = true;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        clearInterval(this.timer);
    }

    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.isWarmup = false;
        this.isInteractiveWarmup = false;
        this.isStandaloneWarmup = false;
        this.currentCycle = 0;
        this.currentInterval = 0;
        this.currentExerciseIndex = 0;
        this.timeRemaining = 0;
        
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        
        clearInterval(this.timer);
        
        this.timeDisplay.textContent = "20:00";
        this.phaseDisplay.textContent = "Listo para empezar";
        this.intervalInfo.textContent = "";
        this.progressFill.style.width = "0%";
        this.stats.textContent = "";
    }

    tick() {
        this.timeRemaining--;
        this.updateDisplay();
        
        if (this.timeRemaining <= 0) {
            if (this.isWarmup) {
                this.completeWarmup();
            } else {
                this.nextInterval();
            }
        }
    }

    completeWarmup() {
        this.isWarmup = false;
        this.playSound();
        this.phaseDisplay.textContent = "✅ Calentamiento completado";
        this.intervalInfo.textContent = "¡Listo para el entrenamiento!";
        this.pause();
    }

    nextInterval() {
        const program = this.programs[this.currentWeek];
        
        this.playSound();
        this.currentInterval++;
        
        if (this.currentInterval >= program.intervals.length) {
            this.currentInterval = 0;
            this.currentCycle++;
            
            if (this.currentCycle >= program.cycles) {
                this.completeWorkout();
                return;
            }
        }
        
        this.timeRemaining = program.intervals[this.currentInterval].duration;
        this.updatePhaseDisplay();
    }

    completeWorkout() {
        this.isRunning = false;
        this.phaseDisplay.textContent = "🎉 ¡Entrenamiento completado!";
        this.intervalInfo.textContent = "¡Excelente trabajo!";
        this.timeDisplay.textContent = "00:00";
        this.progressFill.style.width = "100%";
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        clearInterval(this.timer);
        this.playSound();
    }

    updatePhaseDisplay() {
        const program = this.programs[this.currentWeek];
        const currentIntervalData = program.intervals[this.currentInterval];
        
        let phaseText = "";
        let emoji = "";
        
        switch (currentIntervalData.type) {
            case "run":
                phaseText = "Corriendo";
                emoji = "🏃‍♂️";
                break;
            case "walk":
                phaseText = "Caminando";
                emoji = "🚶‍♂️";
                break;
            case "jog":
                phaseText = "Trote suave";
                emoji = "🏃‍♂️";
                break;
            case "recovery":
                phaseText = "Recuperación";
                emoji = "🧘‍♂️";
                break;
        }
        
        this.phaseDisplay.textContent = `${emoji} ${phaseText}`;
        this.intervalInfo.textContent = `Ciclo ${this.currentCycle + 1}/${program.cycles} - Intervalo ${this.currentInterval + 1}/${program.intervals.length}`;
    }

    updateDisplay() {
        // Actualizar tiempo
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        this.timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Actualizar progreso
        if (!this.isWarmup) {
            const program = this.programs[this.currentWeek];
            let elapsedTime = 0;
            
            // Tiempo de ciclos completos
            for (let c = 0; c < this.currentCycle; c++) {
                for (let interval of program.intervals) {
                    elapsedTime += interval.duration;
                }
            }
            
            // Tiempo de intervalos completos en el ciclo actual
            for (let i = 0; i < this.currentInterval; i++) {
                elapsedTime += program.intervals[i].duration;
            }
            
            // Tiempo transcurrido en el intervalo actual
            const currentIntervalDuration = program.intervals[this.currentInterval].duration;
            elapsedTime += (currentIntervalDuration - this.timeRemaining);
            
            const progress = (elapsedTime / this.totalTime) * 100;
            this.progressFill.style.width = `${progress}%`;
            
            // Actualizar estadísticas
            const totalMinutes = Math.floor(elapsedTime / 60);
            const totalSeconds = elapsedTime % 60;
            this.stats.textContent = `Tiempo transcurrido: ${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
        }
    }

    playSound() {
        // Crear sonido de notificación largo para cambios de intervalo
        if (this.audioContext === null) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Sonido principal - tono largo
        const oscillator1 = this.audioContext.createOscillator();
        const gainNode1 = this.audioContext.createGain();
        
        oscillator1.connect(gainNode1);
        gainNode1.connect(this.audioContext.destination);
        
        oscillator1.frequency.value = 800;
        oscillator1.type = 'sine';
        
        gainNode1.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode1.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 2);
        
        oscillator1.start(this.audioContext.currentTime);
        oscillator1.stop(this.audioContext.currentTime + 2);
        
        // Segundo tono para hacer el sonido más distintivo
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode2 = this.audioContext.createGain();
        
        oscillator2.connect(gainNode2);
        gainNode2.connect(this.audioContext.destination);
        
        oscillator2.frequency.value = 1000;
        oscillator2.type = 'sine';
        
        gainNode2.gain.setValueAtTime(0.3, this.audioContext.currentTime + 0.5);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 2.5);
        
        oscillator2.start(this.audioContext.currentTime + 0.5);
        oscillator2.stop(this.audioContext.currentTime + 2.5);
    }
}

// Inicializar la aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new RunningTimer();
});

// Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
