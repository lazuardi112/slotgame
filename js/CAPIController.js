var TOTAL_MONEY;
var START_MONEY;
var FREESPIN_OCCURRENCE = 10;
var BONUS_OCCURRENCE = 10;

var _iCoinBets = [5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000];

function APIgetSlotInfos(oCallback, oCallbackOwner){
    oCallback.call(oCallbackOwner,{start_money:TOTAL_MONEY,bets:_iCoinBets,start_bet:_iCoinBets[0]});
}

function APIAttemptSpin(iCurBet, iCoin, iNumBettingLines, oCallback, oCallbackOwner){
    const uniqueId = localStorage.getItem('slot_user_id');

    $.post('/api/spin', { unique_id: uniqueId, bet: iCurBet, coin: iCoin, lines: iNumBettingLines })
        .done(function(data) {
            TOTAL_MONEY = data.money;
            oCallback.call(oCallbackOwner, data);
        })
        .fail(function() {
            // Handle error
        });
}

function formatEntries(iValue){
    return Math.floor(iValue).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
