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
        let playerTable = '<table><thead><tr><th>Player ID</th><th>Total Bet</th><th>Total Win</th><th>Profit/Loss</th><th>Actions</th></tr></thead><tbody>';
        data.players.forEach(player => {
            const profitLoss = player.total_win - player.total_bet;
            playerTable += `<tr>
                <td>${player.player_id}</td>
                <td>${player.total_bet}</td>
                <td>${player.total_win}</td>
                <td>${profitLoss}</td>
                <td>
                    <input type="number" id="credit-amount-${player.player_id}" placeholder="Amount">
                    <button class="adjust-credit-btn" data-player-id="${player.player_id}" data-action="add">Add</button>
                    <button class="adjust-credit-btn" data-player-id="${player.player_id}" data-action="subtract">Subtract</button>
                </td>
            </tr>`;
        });
        playerTable += '</tbody></table>';
        playerTableContainer.innerHTML = playerTable;

        // Isi pengaturan RTP
        data.rtpSettings.forEach(setting => {
            if (setting.setting_key === 'global') {
                globalRtpSlider.value = setting.setting_value;
                globalRtpValue.textContent = setting.setting_value;
            } else if (setting.setting_key.startsWith('user_')) {
                const playerId = setting.setting_key.replace('user_', '');
                const userRtpSlider = `<div class="rtp-group">
                    <label for="user-rtp-${playerId}">RTP for ${playerId}: <span id="user-rtp-value-${playerId}">${setting.setting_value}</span>%</label>
                    <input type="range" id="user-rtp-${playerId}" data-player-id="${playerId}" min="1" max="100" value="${setting.setting_value}">
                </div>`;
                userRtpContainer.innerHTML += userRtpSlider;
            }
        });
    }

    async function loadMidtransConfig() {
        const response = await fetch('/api/midtrans-config');
        const config = await response.json();
        midtransConfigForm.server_key.value = config.server_key;
        midtransConfigForm.is_production.checked = config.is_production;
        midtransConfigForm.notification_url.value = config.notification_url;
    }

    globalRtpSlider.addEventListener('input', () => {
        globalRtpValue.textContent = globalRtpSlider.value;
    });

    saveRtpButton.addEventListener('click', async () => {
        await fetch('/api/rtp-settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'global', value: globalRtpSlider.value })
        });

        const userRtpInputs = userRtpContainer.querySelectorAll('input[type="range"]');
        for (const input of userRtpInputs) {
            await fetch('/api/rtp-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: `user_${input.dataset.playerId}`, value: input.value })
            });
        }
        alert('Pengaturan RTP disimpan!');
    });

    midtransConfigForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(midtransConfigForm);
        const config = Object.fromEntries(formData.entries());
        await fetch('/api/midtrans-config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });
        alert('Pengaturan Midtrans disimpan!');
    });

    playerTableContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('adjust-credit-btn')) {
            const playerId = e.target.dataset.playerId;
            const action = e.target.dataset.action;
            let amount = parseInt(document.getElementById(`credit-amount-${playerId}`).value, 10);

            if (isNaN(amount)) {
                alert('Silakan masukkan jumlah yang valid.');
                return;
            }

            if (action === 'subtract') {
                amount = -amount;
            }

            await fetch('/api/adjust-credit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerId, amount })
            });

            loadDashboardData();
        }
    });


    loadDashboardData();
    loadMidtransConfig();
});
