

module.exports = function (app) {
    console.log("Registering imports API...");

     //CONSTANTES

    const path = require("path");
    const dataStore = require("nedb");
    const BASE_API_URL = "/api/v2";
    const request = require('request');
    const express = require("express");
    const dbFileName = path.join(__dirname,"imports.db");
    const db = new dataStore({
        filename: dbFileName,
        autoload:true
    });

    //VARIABLE API JORGE

    
    var importsInit = [];

    //PROXY

    const paht1 = "/api/v2/foodsImports";
    var apiServerHost = 'https://sos1920-07.herokuapp.com/';

    app.use(paht1, function(req, res) {
        var url = apiServerHost + req.baseUrl + req.url;
        console.log('piped: '+req.baseUrl + req.url);
        req.pipe(request(url)).pipe(res);
      });

      app.use(express.static('.'));

    // LOAD INIT IMPORT


    app.get(BASE_API_URL+"/imports/loadInitialData", (req,res) =>{
        console.log("New GET .../loadInitialData")
        importsInit = [
            {"country":"canada","year":2000,"gdamalt":584620,"gdabarley":50979,"gdaoat":1466303,"gdawaste":26325,"gdaethylalcohol":99284},
            {"country":"canada","year":2001,"gdamalt":488462,"gdabarley":31908,"gdaoat":1138407,"gdawaste":26864,"gdaethylalcohol":52767},
            {"country":"canada","year":2002,"gdamalt":317164,"gdabarley":41790,"gdaoat":842973,"gdawaste":32931,"gdaethylalcohol":79943},
            {"country":"canada","year":2003,"gdamalt":320449,"gdabarley":49551,"gdaoat":1206623,"gdawaste":46689,"gdaethylalcohol":112032},
            {"country":"canada","year":2004,"gdamalt":183120,"gdabarley":58835,"gdaoat":1223385,"gdawaste":116633,"gdaethylalcohol":97932},
            {"country":"canada","year":2005,"gdamalt":88201,"gdabarley":27999,"gdaoat":1366587,"gdawaste":113895,"gdaethylalcohol":104688},
            {"country":"canada","year":2006,"gdamalt":232338,"gdabarley":30658,"gdaoat":1818169,"gdawaste":190373,"gdaethylalcohol":275900},
            {"country":"canada","year":2007,"gdamalt":551320,"gdabarley":81688,"gdaoat":2081173,"gdawaste":583361,"gdaethylalcohol":550070},
            {"country":"canada","year":2008,"gdamalt":573278,"gdabarley":57906,"gdaoat":1935712,"gdawaste":713553,"gdaethylalcohol":236869},
            {"country":"canada","year":2009,"gdamalt":316816,"gdabarley":30582,"gdaoat":1563267,"gdawaste":1077586,"gdaethylalcohol":320270},
            {"country":"canada","year":2010,"gdamalt":174724,"gdabarley":30698,"gdaoat":1393293,"gdawaste":882157,"gdaethylalcohol":902357},
            {"country":"canada","year":2011,"gdamalt":263660,"gdabarley":89274,"gdaoat":1556498,"gdawaste":547184,"gdaethylalcohol":1156986},
            {"country":"canada","year":2012,"gdamalt":342052,"gdabarley":160962,"gdaoat":1590667,"gdawaste":524147,"gdaethylalcohol":1253496},
            {"country":"canada","year":2013,"gdamalt":242489,"gdabarley":162060,"gdaoat":1503030,"gdawaste":330253,"gdaethylalcohol":1324872},
            {"country":"canada","year":2014,"gdamalt":333532,"gdabarley":147444,"gdaoat":1730807,"gdawaste":548366,"gdaethylalcohol":1166378},
            {"country":"canada","year":2015,"gdamalt":285036,"gdabarley":115635,"gdaoat":1378407,"gdawaste":548719,"gdaethylalcohol":1184855},
            {"country":"canada","year":2016,"gdamalt":102380,"gdabarley":88954,"gdaoat":1506857,"gdawaste":569247,"gdaethylalcohol":1258545},
            {"country":"canada","year":2017,"gdamalt":87517,"gdabarley":109720,"gdaoat":1480159,"gdawaste":553993,"gdaethylalcohol":1269131},
            {"country":"european-union-27","year":2000,"gdamalt":581,"gdabarley":25,"gdaoat":360042,"gdawaste":551417,"gdaethylalcohol":18233},
            {"country":"european-union-27","year":2001,"gdamalt":386,"gdabarley":21,"gdaoat":513464,"gdawaste":725387,"gdaethylalcohol":4277},
            {"country":"european-union-27","year":2002,"gdamalt":25990,"gdabarley":3,"gdaoat":795585,"gdawaste":530454,"gdaethylalcohol":8241},
            {"country":"european-union-27","year":2003,"gdamalt":51634,"gdabarley":92,"gdaoat":339932,"gdawaste":581022,"gdaethylalcohol":16031},
            {"country":"european-union-27","year":2004,"gdamalt":576,"gdabarley":4,"gdaoat":332590,"gdawaste":563875,"gdaethylalcohol":49561},
            {"country":"european-union-27","year":2005,"gdamalt":574,"gdabarley":26,"gdaoat":204079,"gdawaste":480550,"gdaethylalcohol":35113},
            {"country":"european-union-27","year":2006,"gdamalt":29,"gdabarley":395,"gdaoat":12190,"gdawaste":203709,"gdaethylalcohol":56205},
            {"country":"european-union-27","year":2007,"gdamalt":2915,"gdabarley":30,"gdaoat":42914,"gdawaste":167993,"gdaethylalcohol":84876},
            {"country":"european-union-27","year":2008,"gdamalt":533,"gdabarley":23,"gdaoat":30043,"gdawaste":117044,"gdaethylalcohol":40718},
            {"country":"european-union-27","year":2009,"gdamalt":20,"gdabarley":13652,"gdaoat":72536,"gdawaste":265115,"gdaethylalcohol":288663},
            {"country":"european-union-27","year":2010,"gdamalt":5,"gdabarley":160,"gdaoat":74017,"gdawaste":722928,"gdaethylalcohol":866965},
            {"country":"european-union-27","year":2011,"gdamalt":245,"gdabarley":10,"gdaoat":53866,"gdawaste":138299,"gdaethylalcohol":936493},
            {"country":"european-union-27","year":2012,"gdamalt":56,"gdabarley":149,"gdaoat":7883,"gdawaste":285523,"gdaethylalcohol":252786},
            {"country":"european-union-27","year":2013,"gdamalt":0,"gdabarley":16,"gdaoat":165762,"gdawaste":381991,"gdaethylalcohol":151458},
            {"country":"european-union-27","year":2014,"gdamalt":27801,"gdabarley":1136,"gdaoat":138300,"gdawaste":472041,"gdaethylalcohol":172866},
            {"country":"european-union-27","year":2015,"gdamalt":81,"gdabarley":2589,"gdaoat":96215,"gdawaste":551368,"gdaethylalcohol":77048},
            {"country":"european-union-27","year":2016,"gdamalt":16922,"gdabarley":822,"gdaoat":48403,"gdawaste":902447,"gdaethylalcohol":113428},
            {"country":"european-union-27","year":2017,"gdamalt":587,"gdabarley":29,"gdaoat":56698,"gdawaste":792876,"gdaethylalcohol":365068},
            {"country":"china","year":2000,"gdamalt":3,"gdabarley":13,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":37990},
            {"country":"china","year":2001,"gdamalt":0,"gdabarley":16,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":36397},
            {"country":"china","year":2002,"gdamalt":0,"gdabarley":33,"gdaoat":19,"gdawaste":18,"gdaethylalcohol":36850},
            {"country":"china","year":2003,"gdamalt":1,"gdabarley":73,"gdaoat":0,"gdawaste":3774,"gdaethylalcohol":13898},
            {"country":"china","year":2004,"gdamalt":4,"gdabarley":427,"gdaoat":2,"gdawaste":29281,"gdaethylalcohol":743},
            {"country":"china","year":2005,"gdamalt":3,"gdabarley":15,"gdaoat":0,"gdawaste":73126,"gdaethylalcohol":834},
            {"country":"china","year":2006,"gdamalt":2,"gdabarley":50,"gdaoat":0,"gdawaste":127422,"gdaethylalcohol":508},
            {"country":"china","year":2007,"gdamalt":4,"gdabarley":24,"gdaoat":0,"gdawaste":177123,"gdaethylalcohol":927},
            {"country":"china","year":2008,"gdamalt":0,"gdabarley":127,"gdaoat":0,"gdawaste":276803,"gdaethylalcohol":418},
            {"country":"china","year":2009,"gdamalt":0,"gdabarley":19,"gdaoat":0,"gdawaste":2326116,"gdaethylalcohol":1236},
            {"country":"china","year":2010,"gdamalt":0,"gdabarley":592,"gdaoat":0,"gdawaste":1779581,"gdaethylalcohol":5163},
            {"country":"china","year":2011,"gdamalt":0,"gdabarley":506,"gdaoat":7,"gdawaste":2467684,"gdaethylalcohol":501},
            {"country":"china","year":2012,"gdamalt":0,"gdabarley":1037,"gdaoat":4,"gdawaste":3020224,"gdaethylalcohol":515},
            {"country":"china","year":2013,"gdamalt":0,"gdabarley":1359,"gdaoat":50,"gdawaste":5426763,"gdaethylalcohol":26870},
            {"country":"china","year":2014,"gdamalt":0,"gdabarley":565,"gdaoat":5,"gdawaste":5570200,"gdaethylalcohol":59555},
            {"country":"china","year":2015,"gdamalt":0,"gdabarley":226,"gdaoat":55,"gdawaste":3549241,"gdaethylalcohol":792266},
            {"country":"china","year":2016,"gdamalt":0,"gdabarley":52,"gdaoat":5,"gdawaste":997081,"gdaethylalcohol":186043},
            {"country":"china","year":2017,"gdamalt":0,"gdabarley":366,"gdaoat":4,"gdawaste":378798,"gdaethylalcohol":413071},
            {"country":"argentina","year":2000,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":141},
            {"country":"argentina","year":2001,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":36},
            {"country":"argentina","year":2002,"gdamalt":16800,"gdabarley":0,"gdaoat":3,"gdawaste":0,"gdaethylalcohol":159},
            {"country":"argentina","year":2003,"gdamalt":27250,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":269},
            {"country":"argentina","year":2004,"gdamalt":20934,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":1},
            {"country":"argentina","year":2005,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":0},
            {"country":"argentina","year":2006,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":112},
            {"country":"argentina","year":2007,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":1008},
            {"country":"argentina","year":2008,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":476},
            {"country":"argentina","year":2009,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":543},
            {"country":"argentina","year":2010,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":452},
            {"country":"argentina","year":2011,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":814},
            {"country":"argentina","year":2012,"gdamalt":0,"gdabarley":1893,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":513},
            {"country":"argentina","year":2013,"gdamalt":0,"gdabarley":2099,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":593},
            {"country":"argentina","year":2014,"gdamalt":0,"gdabarley":1655,"gdaoat":136,"gdawaste":0,"gdaethylalcohol":348},
            {"country":"argentina","year":2015,"gdamalt":59,"gdabarley":524,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":133},
            {"country":"argentina","year":2016,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":328},
            {"country":"argentina","year":2017,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":51},
            {"country":"mexico","year":2000,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":41105,"gdaethylalcohol":57463},
            {"country":"mexico","year":2001,"gdamalt":0,"gdabarley":22,"gdaoat":25,"gdawaste":27895,"gdaethylalcohol":56058},
            {"country":"mexico","year":2002,"gdamalt":0,"gdabarley":3,"gdaoat":2,"gdawaste":41325,"gdaethylalcohol":71063},
            {"country":"mexico","year":2003,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":59374,"gdaethylalcohol":55737},
            {"country":"mexico","year":2004,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":92500,"gdaethylalcohol":11200},
            {"country":"mexico","year":2005,"gdamalt":0,"gdabarley":0,"gdaoat":3,"gdawaste":280602,"gdaethylalcohol":11361},
            {"country":"mexico","year":2006,"gdamalt":0,"gdabarley":0,"gdaoat":102,"gdawaste":507848,"gdaethylalcohol":5822},
            {"country":"mexico","year":2007,"gdamalt":0,"gdabarley":0,"gdaoat":5,"gdawaste":1000936,"gdaethylalcohol":4442},
            {"country":"mexico","year":2008,"gdamalt":0,"gdabarley":0,"gdaoat":16,"gdawaste":1387312,"gdaethylalcohol":8435},
            {"country":"mexico","year":2009,"gdamalt":0,"gdabarley":0,"gdaoat":5,"gdawaste":1613182,"gdaethylalcohol":39329},
            {"country":"mexico","year":2010,"gdamalt":0,"gdabarley":0,"gdaoat":3,"gdawaste":1823366,"gdaethylalcohol":116121},
            {"country":"mexico","year":2011,"gdamalt":0,"gdabarley":0,"gdaoat":3,"gdawaste":1538720,"gdaethylalcohol":127255},
            {"country":"mexico","year":2012,"gdamalt":0,"gdabarley":0,"gdaoat":2,"gdawaste":1273047,"gdaethylalcohol":114339},
            {"country":"mexico","year":2013,"gdamalt":0,"gdabarley":0,"gdaoat":81,"gdawaste":1495984,"gdaethylalcohol":107189},
            {"country":"mexico","year":2014,"gdamalt":0,"gdabarley":0,"gdaoat":21,"gdawaste":1591540,"gdaethylalcohol":126602},
            {"country":"mexico","year":2015,"gdamalt":0,"gdabarley":0,"gdaoat":2,"gdawaste":1900979,"gdaethylalcohol":112070},
            {"country":"mexico","year":2016,"gdamalt":0,"gdabarley":0,"gdaoat":22,"gdawaste":2063793,"gdaethylalcohol":104490},
            {"country":"mexico","year":2017,"gdamalt":0,"gdabarley":0,"gdaoat":2,"gdawaste":2126783,"gdaethylalcohol":107728},
            {"country":"south-korea","year":2000,"gdamalt":0,"gdabarley":4,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":3740},
            {"country":"south-korea","year":2001,"gdamalt":0,"gdabarley":8,"gdaoat":0,"gdawaste":14,"gdaethylalcohol":3818},
            {"country":"south-korea","year":2002,"gdamalt":0,"gdabarley":3,"gdaoat":0,"gdawaste":50,"gdaethylalcohol":3468},
            {"country":"south-korea","year":2003,"gdamalt":0,"gdabarley":5,"gdaoat":0,"gdawaste":106,"gdaethylalcohol":1671},
            {"country":"south-korea","year":2004,"gdamalt":0,"gdabarley":14,"gdaoat":0,"gdawaste":2111,"gdaethylalcohol":3038},
            {"country":"south-korea","year":2005,"gdamalt":0,"gdabarley":2,"gdaoat":0,"gdawaste":11497,"gdaethylalcohol":1541},
            {"country":"south-korea","year":2006,"gdamalt":0,"gdabarley":7,"gdaoat":0,"gdawaste":87730,"gdaethylalcohol":727},
            {"country":"south-korea","year":2007,"gdamalt":0,"gdabarley":5,"gdaoat":0,"gdawaste":175515,"gdaethylalcohol":2705},
            {"country":"south-korea","year":2008,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":278873,"gdaethylalcohol":1674},
            {"country":"south-korea","year":2009,"gdamalt":0,"gdabarley":56,"gdaoat":0,"gdawaste":351440,"gdaethylalcohol":19905},
            {"country":"south-korea","year":2010,"gdamalt":0,"gdabarley":37,"gdaoat":0,"gdawaste":385228,"gdaethylalcohol":8079},
            {"country":"south-korea","year":2011,"gdamalt":0,"gdabarley":15,"gdaoat":0,"gdawaste":377243,"gdaethylalcohol":52709},
            {"country":"south-korea","year":2012,"gdamalt":0,"gdabarley":17,"gdaoat":0,"gdawaste":376496,"gdaethylalcohol":1453},
            {"country":"south-korea","year":2013,"gdamalt":0,"gdabarley":1,"gdaoat":0,"gdawaste":519267,"gdaethylalcohol":95012},
            {"country":"south-korea","year":2014,"gdamalt":0,"gdabarley":1,"gdaoat":0,"gdawaste":520871,"gdaethylalcohol":224083},
            {"country":"south-korea","year":2015,"gdamalt":0,"gdabarley":119,"gdaoat":4,"gdawaste":822577,"gdaethylalcohol":179019},
            {"country":"south-korea","year":2016,"gdamalt":0,"gdabarley":302,"gdaoat":5,"gdawaste":967740,"gdaethylalcohol":176574},
            {"country":"south-korea","year":2017,"gdamalt":0,"gdabarley":1,"gdaoat":8,"gdawaste":1177720,"gdaethylalcohol":289273},
            {"country":"india","year":2000,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":18},
            {"country":"india","year":2001,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":0},
            {"country":"india","year":2002,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":146},
            {"country":"india","year":2003,"gdamalt":0,"gdabarley":0,"gdaoat":7,"gdawaste":0,"gdaethylalcohol":10},
            {"country":"india","year":2004,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":17517},
            {"country":"india","year":2005,"gdamalt":0,"gdabarley":0,"gdaoat":33,"gdawaste":377,"gdaethylalcohol":37},
            {"country":"india","year":2006,"gdamalt":0,"gdabarley":0,"gdaoat":7,"gdawaste":0,"gdaethylalcohol":378},
            {"country":"india","year":2007,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":721,"gdaethylalcohol":508},
            {"country":"india","year":2008,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":520,"gdaethylalcohol":140},
            {"country":"india","year":2009,"gdamalt":0,"gdabarley":5,"gdaoat":5,"gdawaste":372,"gdaethylalcohol":51087},
            {"country":"india","year":2010,"gdamalt":0,"gdabarley":3,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":58391},
            {"country":"india","year":2011,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":38728},
            {"country":"india","year":2012,"gdamalt":0,"gdabarley":200,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":546},
            {"country":"india","year":2013,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":116235},
            {"country":"india","year":2014,"gdamalt":0,"gdabarley":3,"gdaoat":49,"gdawaste":0,"gdaethylalcohol":203617},
            {"country":"india","year":2015,"gdamalt":0,"gdabarley":11,"gdaoat":18,"gdawaste":1131,"gdaethylalcohol":282366},
            {"country":"india","year":2016,"gdamalt":0,"gdabarley":0,"gdaoat":15,"gdawaste":812,"gdaethylalcohol":526585},
            {"country":"india","year":2017,"gdamalt":0,"gdabarley":0,"gdaoat":152,"gdawaste":1604,"gdaethylalcohol":513274},
            {"country":"brazil","year":2000,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":21681},
            {"country":"brazil","year":2001,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":102},
            {"country":"brazil","year":2002,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":5},
            {"country":"brazil","year":2003,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":180},
            {"country":"brazil","year":2004,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":421},
            {"country":"brazil","year":2005,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":553},
            {"country":"brazil","year":2006,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":54},
            {"country":"brazil","year":2007,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":116},
            {"country":"brazil","year":2008,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":278,"gdaethylalcohol":51},
            {"country":"brazil","year":2009,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":58501},
            {"country":"brazil","year":2010,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":596423},
            {"country":"brazil","year":2011,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":1189378},
            {"country":"brazil","year":2012,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":123808},
            {"country":"brazil","year":2013,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":350190},
            {"country":"brazil","year":2014,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":529737},
            {"country":"brazil","year":2015,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":491212},
            {"country":"brazil","year":2016,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":1820806},
            {"country":"brazil","year":2017,"gdamalt":0,"gdabarley":0,"gdaoat":0,"gdawaste":0,"gdaethylalcohol":1750959},
            {"country":"total","year":2000,"gdamalt":585201,"gdabarley":51046,"gdaoat":1826736,"gdawaste":782501,"gdaethylalcohol":315107},
            {"country":"total","year":2001,"gdamalt":488855,"gdabarley":31998,"gdaoat":1654067,"gdawaste":855891,"gdaethylalcohol":181510},
            {"country":"total","year":2002,"gdamalt":359956,"gdabarley":41856,"gdaoat":1639644,"gdawaste":752236,"gdaethylalcohol":212932},
            {"country":"total","year":2003,"gdamalt":399335,"gdabarley":49766,"gdaoat":1546659,"gdawaste":737865,"gdaethylalcohol":216991},
            {"country":"total","year":2004,"gdamalt":204635,"gdabarley":59300,"gdaoat":1556649,"gdawaste":967388,"gdaethylalcohol":215559},
            {"country":"total","year":2005,"gdamalt":88778,"gdabarley":28064,"gdaoat":1571750,"gdawaste":1229335,"gdaethylalcohol":187329},
            {"country":"total","year":2006,"gdamalt":232370,"gdabarley":31157,"gdaoat":1830849,"gdawaste":1779878,"gdaethylalcohol":375440},
            {"country":"total","year":2007,"gdamalt":554237,"gdabarley":82213,"gdaoat":2125098,"gdawaste":3920663,"gdaethylalcohol":564751},
            {"country":"total","year":2008,"gdamalt":573915,"gdabarley":58117,"gdaoat":1974517,"gdawaste":4968594,"gdaethylalcohol":392061},
            {"country":"total","year":2009,"gdamalt":316836,"gdabarley":44493,"gdaoat":1636014,"gdawaste":8278867,"gdaethylalcohol":987530},
            {"country":"total","year":2010,"gdamalt":174731,"gdabarley":31986,"gdaoat":1467649,"gdawaste":8287149,"gdaethylalcohol":3135540},
            {"country":"total","year":2011,"gdamalt":263905,"gdabarley":90031,"gdaoat":1621427,"gdawaste":7584710,"gdaethylalcohol":4111998},
            {"country":"total","year":2012,"gdamalt":342118,"gdabarley":164961,"gdaoat":1600595,"gdawaste":8182001,"gdaethylalcohol":2097592},
            {"country":"total","year":2013,"gdamalt":242489,"gdabarley":165710,"gdaoat":1673999,"gdawaste":12004477,"gdaethylalcohol":2977102},
            {"country":"total","year":2014,"gdamalt":361584,"gdabarley":151572,"gdaoat":1876295,"gdawaste":11626894,"gdaethylalcohol":3450540},
            {"country":"total","year":2015,"gdamalt":285240,"gdabarley":119312,"gdaoat":1474705,"gdawaste":11631097,"gdaethylalcohol":3857559},
            {"country":"total","year":2016,"gdamalt":119302,"gdabarley":90468,"gdaoat":1555554,"gdawaste":11057322,"gdaethylalcohol":5159686},
            {"country":"total","year":2017,"gdamalt":88236,"gdabarley":110616,"gdaoat":1537024,"gdawaste":11631185,"gdaethylalcohol":5146999}
            ];
        
        db.insert(importsInit);

        res.sendStatus(201,"CREATED");
    });


    // GET IMPORT

    app.get(BASE_API_URL+"/imports", (req,res) =>{

        var options = ['limit','offset','fields','country','year','gdamalt','gdabarley','gdaoat','gdawaste','gdaethylalcohol'];
        var valid = true;
        for (var i in req.query){
            if(!options.includes(i)){
                valid = false;
            }
        }
        
        if (valid){
            var fields = String(req.query.fields).split(",");
            if(req.query.offset !=null){ var offset = parseInt(req.query.offset)};
            if(req.query.limit !=null){ var limit = parseInt(req.query.limit)}; 
            var busqueda = {};
            if(req.query.year !=null){ busqueda.year = parseInt(req.query.year)}; 
            if(req.query.country !=null){ busqueda.country = String(req.query.country)};
            if(req.query.gdamalt !=null){ busqueda.gdamalt = parseFloat(req.query.gdamalt)};
            if(req.query.gdabarley !=null){ busqueda.gdabarley = parseFloat(req.query.gdabarley)};
            if(req.query.gdaoat !=null){ busqueda.gdaoat = parseFloat(req.query.gdaoat)};
            if(req.query.gdawaste !=null){ busqueda.gdawaste = parseFloat(req.query.gdawaste)};
            if(req.query.gdaethylalcohol !=null){ busqueda.gdaethylalcohol = parseFloat(req.query.gdaethylalcohol)};
            
            db.find( busqueda, (err,imports) =>{
                
                if(offset != null){
                    imports = imports.slice(offset,);
                }

                if(limit != null){
                    imports = imports.slice(0,limit);
                }
                
                
                if(imports[0] != null){
                    var attributes = Object.keys(imports[0]);
                }

                
                imports.forEach( (c) =>{
                    if(req.query.fields !=null){
                        attributes.forEach((d)=>{
                            if(fields.indexOf(d) == -1){
                                delete c[d];
                            }
                        });
                    }else{
                        delete c._id;
                    }    
                });


                res.send(JSON.stringify(imports,null,2));
            });
        }else{
            res.sendStatus(400);
        }

        
    });


    // POST IMPORT

    app.post(BASE_API_URL+"/imports",(req,res) =>{

        var opciones = [ 'country','year','gdamalt','gdabarley','gdaoat','gdawaste','gdaethylalcohol'];
        var valid = true;
        for (var i in req.body){
            if(!opciones.includes(i)){
                valid = false;
            }
        }
        
        var newImport = req.body;

        var exists = true;
        db.find({ $and: [{ country: newImport.country }, { year: newImport.year }] },function(err,doc){

            if(doc.length == 0){exists =false};
            
            if((newImport == "") || (newImport.country == null) || (newImport.year == null) || (valid == false) || (exists == true)){
                console.log("Error");
                res.sendStatus(400,"BAD REQUEST");
            } else {
                db.insert(newImport);	
                res.sendStatus(201,"CREATED");
            }
        });
    });

    // PUT IMPORTS

    app.put(BASE_API_URL+"/imports",(req,res) =>{
        res.sendStatus(405,"Method Not Allowed");
    });


    // DELETE CONTACTS

    app.delete(BASE_API_URL+"/imports", (req,res) =>{
        console.log("DELETE .../imports");
        db.remove({},{ multi: true });
        res.sendStatus(200,"OK");
    });



    // GET IMPORTS/XXX

    app.get(BASE_API_URL+"/imports/:country/:year", (req,res)=>{
        console.log("GET IMPORTS/XXX");
        var countryParam = req.params.country;
        var yearParam = req.params.year;

        db.find({country:countryParam, year:parseInt(yearParam)}, (err,imports) =>{
            imports.forEach( (c) =>{
                delete c._id;
            });

            
            if(imports.length >= 1){
                res.send(JSON.stringify(imports[0],null,2));
            }else{
                res.sendStatus(404,"CONTACT NOT FOUND");
            }

        });
        
        
        
    });


    // POST IMPORTS

    app.post(BASE_API_URL+"/imports/:country/:year",(req,res) =>{
        res.sendStatus(405,"Method Not Allowed");
    });



    // PUT CONTACT/XXX

    app.put(BASE_API_URL+"/imports/:country/:year",(req,res) =>{

        var opciones = [ 'country','year','gdamalt','gdabarley','gdaoat','gdawaste','gdaethylalcohol'];
        var valid = true;
        for (var i in req.body){
            if(!opciones.includes(i)){
                valid = false;
            }  
        }

        var newContact = req.body;
        
        var countryParam = req.params.country;
        var yearParam = req.params.year;

        if((newContact == "") || (newContact.country == null) || (newContact.year == null) || (valid == false) ){
            res.sendStatus(400,"BAD REQUEST");
        } else {
            db.update({country:countryParam, year:parseInt(yearParam)},newContact,(err, numReplaced)=>{
                if(numReplaced >= 1){
                    res.sendStatus(201,"CREATED");
                }
            });    
        }
    });



    // DELETE CONTACT/XXX

    app.delete(BASE_API_URL+"/imports/:country/:year", (req,res)=>{
        
        var countryParam = req.params.country;
        var yearParam = req.params.year;
        console.log(countryParam)
        db.remove({country:countryParam, year:parseInt(yearParam)},{},(err, numRemoved)=>{
            console.log(numRemoved);
            if(numRemoved >= 1){
                res.sendStatus(200,"OK");
            }else{
                res.sendStatus(404,"CONTACT NOT FOUND");
            }
        });
  
    });

    console.log("OK.");
}