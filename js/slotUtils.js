var PAYTABLE_VALUES = [ [0,0,5,20,100], [0,0,5,20,100], [0,0,5,20,100], [0,0,10,30,150], [0,0,20,50,200], [0,0,25,70,300], [0,0,25,100,500] ];
var NUM_FREESPIN = [3,4,5];
var BONUS_PRIZE = [10,30,60,90,100];
var BONUS_PRIZE_OCCURRENCE = [40,25,20,10,5];
var MAX_PRIZES_BONUS = 5;
var FREESPIN_OCCURRENCE = 10;
var BONUS_OCCURRENCE = 10;

var s_aRandSymbols;

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function generateRandomSymbols(bFreespin){
    var _aFinalSymbols = new Array();
    for(var i=0;i<3;i++){
        _aFinalSymbols[i] = new Array();
        for(var j=0;j<5;j++){
            do{
                var iRandIndex = Math.floor(Math.random()*s_aRandSymbols.length);
                var iRandSymbol = s_aRandSymbols[iRandIndex];
                _aFinalSymbols[i][j] = iRandSymbol;
            }while(iRandSymbol === 9 || iRandSymbol === 8);
        }
    }

    if(bFreespin){
        var aTmp = new Array();
        for(i=0;i<[50,30,20].length;i++){
            for(j=0;j<[50,30,20][i];j++){
                aTmp.push(i);
            }
        }

        var iRand =  Math.floor(Math.random()*aTmp.length);
        var _iNumSymbolFreeSpin = 3 + aTmp[iRand];

        var aCurReel = [0,1,2,3,4];
        aCurReel = shuffle ( aCurReel );
        for(var k=0;k<_iNumSymbolFreeSpin;k++){
            var iRandRow = Math.floor(Math.random()*3);
            _aFinalSymbols[iRandRow][aCurReel[k]] = 8;
        }
    }else if(Math.random() < 0.1){
        aCurReel = [0,1,2,3,4];
        aCurReel = shuffle ( aCurReel );
        var iNumBonusSymbol = Math.floor(Math.random()*3+3);
        for(var k=0;k<iNumBonusSymbol;k++){
            iRandRow = Math.floor(Math.random()*3);
            _aFinalSymbols[iRandRow][aCurReel[k]] = 9;
        }
    }

    return _aFinalSymbols;
}

function generLosingPattern(){
    var aFirstCol = new Array();
    for(var i=0;i<3;i++){
        do{
            var iRandIndex = Math.floor(Math.random()*(s_aRandSymbols.length));
        }while(s_aRandSymbols[iRandIndex] === 9 || s_aRandSymbols[iRandIndex] === 8 || s_aRandSymbols[iRandIndex] === 7);

        var iRandSymbol = s_aRandSymbols[iRandIndex];
        aFirstCol[i] = iRandSymbol;
    }

    var iNumBonus = 0;
    var iNumFreeSpins = 0;
    var _aFinalSymbols = new Array();
    for(var i=0;i<3;i++){
        _aFinalSymbols[i] = new Array();
        for(var j=0;j<5;j++){
            if(j == 0){
                _aFinalSymbols[i][j] = aFirstCol[i];
            }else{
                do{
                    iRandIndex =  Math.floor(Math.random()*s_aRandSymbols.length);
                    iRandSymbol = s_aRandSymbols[iRandIndex];
                }while(aFirstCol[0] === iRandSymbol || aFirstCol[1] === iRandSymbol || aFirstCol[2] === iRandSymbol ||
                        (iRandSymbol === 9 && iNumBonus===2) || (iRandSymbol === 8 && iNumFreeSpins === 2) ||  iRandSymbol === 7);

                _aFinalSymbols[i][j] = iRandSymbol;
                if(iRandSymbol === 9){
                    iNumBonus++;
                }else if(iRandSymbol === 8){
                    iNumFreeSpins++;
                }
            }
        }
    }

    return _aFinalSymbols;
};

function checkWin(bFreespin,iNumBettingLines, _aFinalSymbols){
    var _aWinningLine = new Array();

    for(var k=0;k<iNumBettingLines;k++){
        var aCombos = _aPaylineCombo[k];
        var aCellList = new Array();
        var iValue = _aFinalSymbols[aCombos[0]['row']][aCombos[0]['col']];
        var iNumEqualSymbol = 1;
        var iStartIndex = 1;
        aCellList.push({row:aCombos[0]['row'],col:aCombos[0]['col'],value:_aFinalSymbols[aCombos[0]['row']][aCombos[0]['col']]} );

        while(iValue === 7 && iStartIndex<5){
            iNumEqualSymbol++;
            iValue = _aFinalSymbols[aCombos[iStartIndex]['row']][aCombos[iStartIndex]['col']];
            aCellList.push( {row: aCombos[iStartIndex]['row'] ,col:aCombos[iStartIndex]['col'] ,value:_aFinalSymbols[aCombos[iStartIndex]['row']][aCombos[iStartIndex]['col']]} );
            iStartIndex++;
        }

        for(var t=iStartIndex;t<aCombos.length;t++){
            if(_aFinalSymbols[aCombos[t]['row']][aCombos[t]['col']] === iValue ||
                                        _aFinalSymbols[aCombos[t]['row']][aCombos[t]['col']] === 7){
                iNumEqualSymbol++;
                aCellList.push({row:aCombos[t]['row'],col:aCombos[t]['col'],value:_aFinalSymbols[aCombos[t]['row']][aCombos[t]['col']]} );
            }else{
                break;
            }
        }

        if(PAYTABLE_VALUES[iValue][iNumEqualSymbol-1] > 0 && !(bFreespin && iValue === 8) && !(Math.random() < 0.1 && iValue === 9) ){
            aCellList.sort((a,b) => a.col - b.col);
            _aWinningLine.push({line:k+1,amount:PAYTABLE_VALUES[iValue][iNumEqualSymbol-1],num_win:iNumEqualSymbol,value:iValue,list:aCellList});
        }
    }

    if(bFreespin){
        aCellList = new Array();
        for(var i=0;i<3;i++){
            for(var j=0;j<5;j++){
                if(_aFinalSymbols[i][j] === 8){
                    aCellList.push({row:i,col:j,value:8});
                }
            }
        }

        aCellList.sort((a,b) => a.col - b.col);
        _aWinningLine.push({line:0,amount:0,num_win:aCellList.length,value:8,list:aCellList});

    }else if(Math.random() < 0.1){
        var aCellList = new Array();
        for(var i=0;i<3;i++){
            for(j=0;j<5;j++){
                if(_aFinalSymbols[i][j] === 9){
                    aCellList.push({row:i,col:j,value:9});
                }
            }
        }

        aCellList.sort((a,b) => a.col - b.col);
        _aWinningLine.push({line:0,amount:0,num_win:aCellList.length,value:9,list:aCellList});
    }

    return _aWinningLine;
}

module.exports = {
    generateRandomSymbols,
    checkWin,
    generLosingPattern,
    PAYTABLE_VALUES,
    NUM_FREESPIN,
    BONUS_PRIZE,
    BONUS_PRIZE_OCCURRENCE,
    MAX_PRIZES_BONUS,
    FREESPIN_OCCURRENCE,
    BONUS_OCCURRENCE
};
