const { createApp } = Vue;

const SessionTracker = {

    data() {
        return {
            taskName: '',
            currentTimeStr: '00:00:00',
            sessions: [],
            

            timerInterval: null,
            secondsElapsed: 0,
            isTimerRunning: false,
            startTimeStr: ''
        }
    },


    methods: {

        formatTime(totalSeconds) {
            const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
            const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
            const seconds = String(totalSeconds % 60).padStart(2, '0');
            return `${hours}:${minutes}:${seconds}`;
        },
        
        getCurrentTimeStr() {
            const now = new Date();
            const h = String(now.getHours()).padStart(2, '0');
            const m = String(now.getMinutes()).padStart(2, '0');
            return `${h}:${m}`;
        },


        startTimer() {
            if (this.isTimerRunning) return;

            if (this.secondsElapsed === 0) {
                this.startTimeStr = this.getCurrentTimeStr();
            }

            this.isTimerRunning = true;
            this.timerInterval = setInterval(() => {
                this.secondsElapsed++;
                this.currentTimeStr = this.formatTime(this.secondsElapsed);
            }, 1000);
        },

        pauseTimer() {
            if (!this.isTimerRunning) return;
            clearInterval(this.timerInterval);
            this.isTimerRunning = false;
        },


        async stopTimer() {
            if (this.secondsElapsed === 0) return;

            clearInterval(this.timerInterval);
            this.isTimerRunning = false;

            const newSession = {
                name: this.taskName.trim() || 'Без назви',
                startTime: this.startTimeStr,
                endTime: this.getCurrentTimeStr(),
                duration: this.formatTime(this.secondsElapsed)
            };


            try {
                const response = await fetch('http://localhost:3000/api/sessions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newSession)
                });

                if (response.ok) {

                    this.fetchSessions();
                } else {
                    console.error("Помилка збереження на сервері");
                }
            } catch (error) {
                console.error("Помилка з'єднання з сервером:", error);
            }


            this.secondsElapsed = 0;
            this.currentTimeStr = '00:00:00';
            this.taskName = '';
        },


        async fetchSessions() {
            try {
                const response = await fetch('http://localhost:3000/api/sessions');
                if (response.ok) {
                    const data = await response.json();
                    this.sessions = data;
                }
            } catch (error) {
                console.error("Не вдалося завантажити сеанси:", error);
            }
        },


        async deleteSession(id) {

            if (!confirm('Ви впевнені, що хочете видалити цей запис?')) {
                return;
            }

            try {

                const response = await fetch(`http://localhost:3000/api/sessions/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {

                    this.fetchSessions(); 
                } else {
                    console.error("Помилка видалення на сервері");
                }
            } catch (error) {
                console.error("Помилка з'єднання з сервером:", error);
            }
        }

    },


    mounted() {

        this.fetchSessions();
    }
}

createApp(SessionTracker).mount('#app');