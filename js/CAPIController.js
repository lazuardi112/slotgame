function APIgetSlotInfos(oCallback, oCallbackOwner){
    // Di dunia nyata, ini akan menjadi panggilan API, tetapi untuk saat ini,
    // kita akan tetap menggunakan data statis untuk info awal.
    const coinBets = [5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000];
    const paytableValues = [
        [0,0,5,20,100], [0,0,5,20,100], [0,0,5,20,100],
        [0,0,10,30,150], [0,0,20,50,200], [0,0,25,70,300],
        [0,0,25,100,500]
    ];
    
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
            coin: iCoin,
            lines: iNumBettingLines,
            playerId: s_sPlayerId
        })
    });

    const data = await response.json();
    oCallback.call(oCallbackOwner, data);
}

// Fungsi bonus dapat dipindahkan ke sisi server juga, tetapi untuk saat ini kita akan membiarkannya
function apiAttemptBonus(iCoin,oCallback, oCallbackOwner){
     const BONUS_PRIZE = [10,30,60,90,100];
     const BONUS_PRIZE_OCCURRENCE = [40,25,20,10,5];
     const MAX_PRIZES_BONUS = 5;
    var aPrizeLength = new Array();
    for(var k=0; k<BONUS_PRIZE_OCCURRENCE.length; k++){
            var iCount = BONUS_PRIZE_OCCURRENCE[k];
            for(var j=0;j<iCount;j++){
                    aPrizeLength.push(k);
            }
    }

                    
    var iRandNumMultipliers = Math.floor(Math.random() * MAX_PRIZES_BONUS) + 1;
    var aPrizeList = new Array();
    var iTotWin = 0;
  
    for(var k=0;k<iRandNumMultipliers;k++){
        
        var iRandIndex = Math.floor(Math.random()*(aPrizeLength.length));
        var iPrizeReceived = aPrizeLength[iRandIndex];
        var iBonusWin = (BONUS_PRIZE[iPrizeReceived]*iCoin);
        
        iTotWin += iBonusWin;
        aPrizeList.push(iBonusWin);
    }
 
    if(aPrizeList.length === 0){
        aPrizeList = [0];
        iTotWin = 0;
    }

    var oData = {res:true,money:TOTAL_MONEY,bonus_win:iTotWin,prize_list:JSON.stringify(aPrizeList)};                
    oCallback.call(oCallbackOwner,oData);
}
