function getDeviceId() {
    let deviceId = localStorage.getItem('slot_device_id');
    if (!deviceId) {
        deviceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('slot_device_id', deviceId);
    }
    return deviceId;
}

async function APIgetSlotInfos(oCallback, oCallbackOwner){
    const coinBets = [5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000];
    const paytableValues = [
        [0,0,5,20,100], [0,0,5,20,100], [0,0,5,20,100],
        [0,0,10,30,150], [0,0,20,50,200], [0,0,25,70,300],
        [0,0,25,100,500]
    ];
    
    // Di masa mendatang, Anda dapat mengambil saldo pemain dari server di sini

    oCallback.call(oCallbackOwner, {
        start_money: 10000,
        bets: coinBets,
        start_bet: coinBets[0],
        paytable: paytableValues
    });
}

async function APIAttemptSpin(iCurBet, iCoin, iNumBettingLines, oCallback, oCallbackOwner){
    const response = await fetch('/api/spin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            bet: iCurBet,
            deviceId: getDeviceId()
        })
    });

    const data = await response.json();
    oCallback.call(oCallbackOwner, data);
}
