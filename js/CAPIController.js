// The game is now server-authoritative. All game logic is handled by the server.
var TOTAL_MONEY;
var _aPaylineCombo;
var PAYTABLE_VALUES;

// Function to get or create a device ID
function getDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
        deviceId = 'device-' + Date.now() + '-' + Math.floor(Math.random() * 1e9);
        localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
}

// Get initial game info from the server
async function APIgetSlotInfos(oCallback, oCallbackOwner) {
    const deviceId = getDeviceId();
    try {
        const response = await fetch('/api/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deviceId })
        });
        const user = await response.json();
        TOTAL_MONEY = user.credits;
        
        // These values are now static on the client, but still needed for the game engine
        var _iCoinBets = [5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000];
        PAYTABLE_VALUES = [
            [0,0,5,20,100], [0,0,5,20,100], [0,0,5,20,100], [0,0,10,30,150],
            [0,0,20,50,200], [0,0,25,70,300], [0,0,25,100,500]
        ];

        oCallback.call(oCallbackOwner, {
            start_money: TOTAL_MONEY,
            bets: _iCoinBets,
            start_bet: _iCoinBets[0],
            paytable: PAYTABLE_VALUES
        });
    } catch (error) {
        console.error("Error getting user info:", error);
    }
}

// Handle a spin attempt by calling the server
async function APIAttemptSpin(iCurBet, iCoin, iNumBettingLines, oCallback, oCallbackOwner) {
    console.log("APIAttemptSpin called with bet:", iCurBet);
    const deviceId = getDeviceId();

    if (iCurBet > TOTAL_MONEY) {
        _dieError("INVALID BET: " + iCurBet + ", money:" + TOTAL_MONEY, oCallback, oCallbackOwner);
        return;
    }

    try {
        const response = await fetch('/api/spin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deviceId, bet: iCurBet })
        });

        if (!response.ok) {
            const errorText = await response.text();
            _dieError(errorText, oCallback, oCallbackOwner);
            return;
        }

        const data = await response.json();
        
        TOTAL_MONEY = data.credits;
        
        // The server response needs to be adapted to the game's expected format.
        // For now, we'll mock a simple win/loss pattern. A full implementation
        // would require the server to send the final reel pattern.

        // Mock pattern generation for visual feedback
        let pattern;
        if (data.win) {
            // A real implementation would get the winning pattern from the server
            pattern = generateMockWinningPattern();
        } else {
            pattern = generateMockLosingPattern();
        }

        const oData = {
            res: true,
            win: data.win,
            pattern: pattern,
            win_lines: data.win ? [{line:1, amount: data.winAmount, num_win:3, value:0, list:[]}] : {}, // Mock win line
            money: TOTAL_MONEY,
            tot_win: data.winAmount,
            freespin: false,
            num_freespin: 0,
            bonus: false,
            bonus_prize: -1
        };

        oCallback.call(oCallbackOwner, oData);

    } catch (error) {
        console.error("Error during spin:", error);
        _dieError("Server communication error", oCallback, oCallbackOwner);
    }
}

// This is a placeholder. In a real server-authoritative game, the server would send the final symbols.
function generateMockLosingPattern(){
    var aFirstCol = [1, 2, 3]; // Example symbols
    var _aFinalSymbols = [];
    for(var i=0; i<3; i++){
        _aFinalSymbols[i] = [];
        for(var j=0; j<5; j++){
            if(j === 0){
                _aFinalSymbols[i][j] = aFirstCol[i];
            } else {
                _aFinalSymbols[i][j] = Math.floor(Math.random() * 7); // Random symbols for other reels
            }
        }
    }
    return _aFinalSymbols;
}

function generateMockWinningPattern() {
    // Create a pattern that is guaranteed to have a winning line (e.g., three 0s on the middle row)
    let pattern = generateMockLosingPattern();
    pattern[1][0] = 0;
    pattern[1][1] = 0;
    pattern[1][2] = 0;
    return pattern;
}


function formatEntries(iValue) {
    return iValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function _dieError(szReason, oCallback, oCallbackOwner) {
    // The original function expected a string, but the game callback expects an object.
    console.error("Game Error:", szReason);
    const oData = { res: false, desc: szReason };
    if (oCallback && oCallbackOwner) {
        oCallback.call(oCallbackOwner, oData);
    }
}

// Initialize paylines (still needed for the game's CSlot class)
function _initPaylines() {
    _aPaylineCombo = [];
    _aPaylineCombo[0] = [{row:1,col:0},{row:1,col:1},{row:1,col:2},{row:1,col:3},{row:1,col:4}];
    _aPaylineCombo[1] = [{row:0,col:0},{row:0,col:1},{row:0,col:2},{row:0,col:3},{row:0,col:4}];
    _aPaylineCombo[2] = [{row:2,col:0},{row:2,col:1},{row:2,col:2},{row:2,col:3},{row:2,col:4}];
    _aPaylineCombo[3] = [{row:0,col:0},{row:1,col:1},{row:2,col:2},{row:1,col:3},{row:0,col:4}];
    _aPaylineCombo[4] = [{row:2,col:0},{row:1,col:1},{row:0,col:2},{row:1,col:3},{row:2,col:4}];
    _aPaylineCombo[5] = [{row:1,col:0},{row:0,col:1},{row:0,col:2},{row:0,col:3},{row:1,col:4}];
    _aPaylineCombo[6] = [{row:1,col:0},{row:2,col:1},{row:2,col:2},{row:2,col:3},{row:1,col:4}];
    _aPaylineCombo[7] = [{row:0,col:0},{row:0,col:1},{row:1,col:2},{row:2,col:3},{row:2,col:4}];
    _aPaylineCombo[8] = [{row:2,col:0},{row:2,col:1},{row:1,col:2},{row:0,col:3},{row:0,col:4}]; 
    _aPaylineCombo[9] = [{row:1,col:0},{row:2,col:1},{row:1,col:2},{row:0,col:3},{row:1,col:4}];
    _aPaylineCombo[10] = [{row:1,col:0},{row:0,col:1},{row:1,col:2},{row:2,col:3},{row:1,col:4}];
    _aPaylineCombo[11] = [{row:0,col:0},{row:1,col:1},{row:1,col:2},{row:1,col:3},{row:0,col:4}];
    _aPaylineCombo[12] = [{row:2,col:0},{row:1,col:1},{row:1,col:2},{row:1,col:3},{row:2,col:4}];
    _aPaylineCombo[13] = [{row:0,col:0},{row:1,col:1},{row:0,col:2},{row:1,col:3},{row:0,col:4}]; 
    _aPaylineCombo[14] = [{row:2,col:0},{row:1,col:1},{row:2,col:2},{row:1,col:3},{row:2,col:4}];
    _aPaylineCombo[15] = [{row:1,col:0},{row:1,col:1},{row:0,col:2},{row:1,col:3},{row:1,col:4}];
    _aPaylineCombo[16] = [{row:1,col:0},{row:1,col:1},{row:2,col:2},{row:1,col:3},{row:1,col:4}];
    _aPaylineCombo[17] = [{row:0,col:0},{row:0,col:1},{row:2,col:2},{row:0,col:3},{row:0,col:4}];
    _aPaylineCombo[18] = [{row:2,col:0},{row:2,col:1},{row:0,col:2},{row:2,col:3},{row:2,col:4}];
    _aPaylineCombo[19] = [{row:0,col:0},{row:2,col:1},{row:2,col:2},{row:2,col:3},{row:0,col:4}];
}

function _init() {
    _initPaylines();
}

_init();
