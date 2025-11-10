document.addEventListener('DOMContentLoaded', () => {
    const playerTableContainer = document.getElementById('player-table-container');
    const globalRtpSlider = document.getElementById('global-rtp');
    const globalRtpValue = document.getElementById('global-rtp-value');
    const userRtpContainer = document.getElementById('user-rtp-container');
    const saveRtpButton = document.getElementById('save-rtp');
    const midtransConfigForm = document.getElementById('midtrans-config-form');

    async function loadDashboardData() {
        const response = await fetch('/api/dashboard-data');
        const data = await response.json();

        // Isi data pemain
        let playerTable = '<table><thead><tr><th>Player ID</th><th>Balance</th><th>Actions</th></tr></thead><tbody>';
        data.players.forEach(player => {
            playerTable += `<tr>
                <td>${player.deviceId}</td>
                <td>${player.balance}</td>
                <td>
                    <input type="number" id="credit-amount-${player.id}" placeholder="Amount">
                    <button class="adjust-credit-btn" data-player-id="${player.id}" data-action="add">Add</button>
                    <button class="adjust-credit-btn" data-player-id="${player.id}" data-action="subtract">Subtract</button>
                </td>
            </tr>`;
        });
        playerTable += '</tbody></table>';
        playerTableContainer.innerHTML = playerTable;

        // Isi pengaturan RTP
        data.settings.forEach(setting => {
            if (setting.key === 'global_rtp') {
                globalRtpSlider.value = setting.value;
                globalRtpValue.textContent = setting.value;
            } else if (setting.key.startsWith('user_rtp_')) {
                const playerId = setting.key.replace('user_rtp_', '');
                const userRtpSlider = `<div class="rtp-group">
                    <label for="user-rtp-${playerId}">RTP for ${playerId}: <span id="user-rtp-value-${playerId}">${setting.value}</span>%</label>
                    <input type="range" id="user-rtp-${playerId}" data-player-id="${playerId}" min="1" max="100" value="${setting.value}">
                </div>`;
                userRtpContainer.innerHTML += userRtpSlider;
            }
        });
    }

    async function loadMidtransConfig() {
        // Logika untuk memuat konfigurasi Midtrans akan ditambahkan di sini
    }

    // ... (event listener lainnya)

    loadDashboardData();
    loadMidtransConfig();
});
