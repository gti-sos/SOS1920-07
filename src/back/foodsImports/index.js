module.exports = function (app) {
    console.log("Registering imports API...");



    const BASE_API_URL = "/api/v2";
    const dataStore = require("nedb");
    const path = require("path");
    const dbFileName = path.join(__dirname,"foodsImports.db")

    const db = new dataStore({
      filename : dbFileName,
      autoload : true
    });


    initialfoodsImports = [
      {name:"MEXICO",year:"2000",TVegANDPrep:1696.1,fruitJuice:75.1,TSweANDCndy:168.3,TLiveAnimal:292.2,FishFilletANDMince:0},
      {name:"MEXICO",year:"2001",TVegANDPrep:1924.5,fruitJuice:58.5,TSweANDCndy:198.1,TLiveAnimal:405.3,FishFilletANDMince:0},
      {name:"MEXICO",year:"2002",TVegANDPrep:1929.7,fruitJuice:68.2,TSweANDCndy:278,TLiveAnimal:407.9,FishFilletANDMince:0},
      {name:"MEXICO",year:"2003",TVegANDPrep:2283.8,fruitJuice:44.5,TSweANDCndy:260,TLiveAnimal:300.5,FishFilletANDMince:0},
      {name:"MEXICO",year:"2004",TVegANDPrep:2605.6,fruitJuice:66.9,TSweANDCndy:299.1,TLiveAnimal:469.9,FishFilletANDMince:0},
      {name:"MEXICO",year:"2005",TVegANDPrep:2806.6,fruitJuice:116.5,TSweANDCndy:439.8,TLiveAnimal:541,FishFilletANDMince:0},
      {name:"MEXICO",year:"2006",TVegANDPrep:3037.7,fruitJuice:124.7,TSweANDCndy:745.6,TLiveAnimal:515.5,FishFilletANDMince:0},
      {name:"MEXICO",year:"2007",TVegANDPrep:3299.2,fruitJuice:190.3,TSweANDCndy:465.1,TLiveAnimal:524.2,FishFilletANDMince:0},
      {name:"MEXICO",year:"2008",TVegANDPrep:3484.8,fruitJuice:206.2,TSweANDCndy:789.3,TLiveAnimal:475.4,FishFilletANDMince:0},
      {name:"MEXICO",year:"2009",TVegANDPrep:3400.9,fruitJuice:172.7,TSweANDCndy:895,TLiveAnimal:298.2,FishFilletANDMince:0},
      {name:"MEXICO",year:"2010",TVegANDPrep:4231.7,fruitJuice:199.8,TSweANDCndy:1163.1,TLiveAnimal:381,FishFilletANDMince:0},
      {name:"MEXICO",year:"2011",TVegANDPrep:4754.7,fruitJuice:217.1,TSweANDCndy:1717.5,TLiveAnimal:522.2,FishFilletANDMince:0},
      {name:"MEXICO",year:"2012",TVegANDPrep:4761.7,fruitJuice:189.7,TSweANDCndy:1350.4,TLiveAnimal:616.8,FishFilletANDMince:0},
      {name:"MEXICO",year:"2013",TVegANDPrep:5330.6,fruitJuice:242.6,TSweANDCndy:1671,TLiveAnimal:716.9,FishFilletANDMince:0},
      {name:"MEXICO",year:"2014",TVegANDPrep:5452.3,fruitJuice:266.1,TSweANDCndy:1375,TLiveAnimal:508.3,FishFilletANDMince:0},
      {name:"MEXICO",year:"2015",TVegANDPrep:5650.8,fruitJuice:301.2,TSweANDCndy:1427.5,TLiveAnimal:738.5,FishFilletANDMince:0},
      {name:"MEXICO",year:"2016",TVegANDPrep:6471.4,fruitJuice:334.4,TSweANDCndy:1368.1,TLiveAnimal:881.7,FishFilletANDMince:0},
      {name:"MEXICO",year:"2017",TVegANDPrep:6312,fruitJuice:483.8,TSweANDCndy:1295.5,TLiveAnimal:584.6,FishFilletANDMince:287},
      {name:"CANADA",year:"2000",TVegANDPrep:946,fruitJuice:21.9,TSweANDCndy:322.9,TLiveAnimal:714.7,FishFilletANDMince:298.3},
      {name:"CANADA",year:"2001",TVegANDPrep:1047.6,fruitJuice:25.5,TSweANDCndy:417.6,TLiveAnimal:995.9,FishFilletANDMince:315.7},
      {name:"CANADA",year:"2002",TVegANDPrep:1155.1,fruitJuice:29.8,TSweANDCndy:482.1,TLiveAnimal:1343.5,FishFilletANDMince:326.8},
      {name:"CANADA",year:"2003",TVegANDPrep:1341.8,fruitJuice:41.8,TSweANDCndy:609.9,TLiveAnimal:1394.8,FishFilletANDMince:315.7},
      {name:"CANADA",year:"2004",TVegANDPrep:1485.9,fruitJuice:43.3,TSweANDCndy:592.1,TLiveAnimal:784.3,FishFilletANDMince:294},
      {name:"CANADA",year:"2005",TVegANDPrep:1506.5,fruitJuice:41.9,TSweANDCndy:626.6,TLiveAnimal:560.1,FishFilletANDMince:276.1},
      {name:"CANADA",year:"2006",TVegANDPrep:1665.3,fruitJuice:38.8,TSweANDCndy:652.1,TLiveAnimal:1134.9,FishFilletANDMince:221.6},
      {name:"CANADA",year:"2007",TVegANDPrep:1731.1,fruitJuice:49.2,TSweANDCndy:699.8,TLiveAnimal:1616.5,FishFilletANDMince:215.1},
      {name:"CANADA",year:"2008",TVegANDPrep:1916.4,fruitJuice:60.2,TSweANDCndy:743.3,TLiveAnimal:2069.2,FishFilletANDMince:241.1},
      {name:"CANADA",year:"2009",TVegANDPrep:1841.5,fruitJuice:48.9,TSweANDCndy:662.1,TLiveAnimal:1920.7,FishFilletANDMince:221},
      {name:"CANADA",year:"2010",TVegANDPrep:1957.7,fruitJuice:43.6,TSweANDCndy:718.2,TLiveAnimal:1244.5,FishFilletANDMince:267.3},
      {name:"CANADA",year:"2011",TVegANDPrep:2120.6,fruitJuice:60.4,TSweANDCndy:793.7,TLiveAnimal:1444.8,FishFilletANDMince:247.3},
      {name:"CANADA",year:"2012",TVegANDPrep:2140.2,fruitJuice:65.8,TSweANDCndy:862.5,TLiveAnimal:1227.8,FishFilletANDMince:212.4},
      {name:"CANADA",year:"2013",TVegANDPrep:2411.5,fruitJuice:65.6,TSweANDCndy:847.8,TLiveAnimal:1432.1,FishFilletANDMince:225},
      {name:"CANADA",year:"2014",TVegANDPrep:2425.4,fruitJuice:61.8,TSweANDCndy:849.4,TLiveAnimal:1640.1,FishFilletANDMince:213},
      {name:"CANADA",year:"2015",TVegANDPrep:2401.8,fruitJuice:59.9,TSweANDCndy:860.4,TLiveAnimal:2207.4,FishFilletANDMince:224.6},
      {name:"CANADA",year:"2016",TVegANDPrep:2570.6,fruitJuice:61.4,TSweANDCndy:859,TLiveAnimal:1711.8,FishFilletANDMince:271.9},
      {name:"CANADA",year:"2017",TVegANDPrep:2811.4,fruitJuice:65.9,TSweANDCndy:840.5,TLiveAnimal:1406,FishFilletANDMince:272.3},
      {name:"CHINA",year:"2000",TVegANDPrep:97.4,fruitJuice:39.3,TSweANDCndy:61.1,TLiveAnimal:1228.1,FishFilletANDMince:255.2},
      {name:"CHINA",year:"2001",TVegANDPrep:114.6,fruitJuice:36.6,TSweANDCndy:54,TLiveAnimal:0,FishFilletANDMince:241.8},
      {name:"CHINA",year:"2002",TVegANDPrep:142.6,fruitJuice:54.9,TSweANDCndy:66.4,TLiveAnimal:0,FishFilletANDMince:330.7},
      {name:"CHINA",year:"2003",TVegANDPrep:171.7,fruitJuice:101.5,TSweANDCndy:101.5,TLiveAnimal:0,FishFilletANDMince:392.2},
      {name:"CHINA",year:"2004",TVegANDPrep:221.8,fruitJuice:166.2,TSweANDCndy:113.5,TLiveAnimal:0,FishFilletANDMince:517},
      {name:"CHINA",year:"2005",TVegANDPrep:253.1,fruitJuice:186.7,TSweANDCndy:123,TLiveAnimal:0,FishFilletANDMince:716},
      {name:"CHINA",year:"2006",TVegANDPrep:327.9,fruitJuice:206.2,TSweANDCndy:148.1,TLiveAnimal:0,FishFilletANDMince:941.2},
      {name:"CHINA",year:"2007",TVegANDPrep:429.9,fruitJuice:437.2,TSweANDCndy:157.4,TLiveAnimal:0,FishFilletANDMince:1116.4},
      {name:"CHINA",year:"2008",TVegANDPrep:425.7,fruitJuice:675.4,TSweANDCndy:161.7,TLiveAnimal:0,FishFilletANDMince:1210.5},
      {name:"CHINA",year:"2009",TVegANDPrep:376.3,fruitJuice:356.9,TSweANDCndy:151.1,TLiveAnimal:0,FishFilletANDMince:1165.8},
      {name:"CHINA",year:"2010",TVegANDPrep:493.9,fruitJuice:385.5,TSweANDCndy:168.2,TLiveAnimal:0,FishFilletANDMince:1319.7},
      {name:"CHINA",year:"2011",TVegANDPrep:551.3,fruitJuice:558.8,TSweANDCndy:186.2,TLiveAnimal:0,FishFilletANDMince:1466.4},
      {name:"CHINA",year:"2012",TVegANDPrep:579.5,fruitJuice:634.7,TSweANDCndy:173.5,TLiveAnimal:0,FishFilletANDMince:1472.5},
      {name:"CHINA",year:"2013",TVegANDPrep:565.6,fruitJuice:542.2,TSweANDCndy:199.2,TLiveAnimal:0,FishFilletANDMince:1449.4},
      {name:"CHINA",year:"2014",TVegANDPrep:511.2,fruitJuice:396,TSweANDCndy:224.8,TLiveAnimal:0,FishFilletANDMince:1583.2},
      {name:"CHINA",year:"2015",TVegANDPrep:573.8,fruitJuice:321.4,TSweANDCndy:231.6,TLiveAnimal:0,FishFilletANDMince:1404.5},
      {name:"CHINA",year:"2016",TVegANDPrep:665.5,fruitJuice:325.9,TSweANDCndy:226.7,TLiveAnimal:0,FishFilletANDMince:1245.8},
      {name:"CHINA",year:"2017",TVegANDPrep:736.7,fruitJuice:319.2,TSweANDCndy:214,TLiveAnimal:0,FishFilletANDMince:1277.3},
      {name:"PERU",year:"2000",TVegANDPrep:63.1,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"PERU",year:"2001",TVegANDPrep:86.2,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"PERU",year:"2002",TVegANDPrep:109.1,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"PERU",year:"2003",TVegANDPrep:129.9,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"PERU",year:"2004",TVegANDPrep:168.7,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"PERU",year:"2005",TVegANDPrep:221.5,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"PERU",year:"2006",TVegANDPrep:278.5,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"PERU",year:"2007",TVegANDPrep:329.5,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"PERU",year:"2008",TVegANDPrep:381.5,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"PERU",year:"2009",TVegANDPrep:382.3,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"PERU",year:"2010",TVegANDPrep:428.2,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"PERU",year:"2011",TVegANDPrep:475.9,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"PERU",year:"2012",TVegANDPrep:517,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"PERU",year:"2013",TVegANDPrep:550.6,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"PERU",year:"2014",TVegANDPrep:556.3,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"PERU",year:"2015",TVegANDPrep:587.9,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"PERU",year:"2016",TVegANDPrep:577.2,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"PERU",year:"2017",TVegANDPrep:576.3,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"SPAIN",year:"2000",TVegANDPrep:254.6,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"SPAIN",year:"2001",TVegANDPrep:257,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"SPAIN",year:"2002",TVegANDPrep:276.4,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"SPAIN",year:"2003",TVegANDPrep:305.7,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"SPAIN",year:"2004",TVegANDPrep:325.1,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"SPAIN",year:"2005",TVegANDPrep:300.8,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"SPAIN",year:"2006",TVegANDPrep:277.6,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"SPAIN",year:"2007",TVegANDPrep:293.2,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"SPAIN",year:"2008",TVegANDPrep:302.2,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"SPAIN",year:"2009",TVegANDPrep:279.4,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"SPAIN",year:"2010",TVegANDPrep:315.1,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"SPAIN",year:"2011",TVegANDPrep:288.5,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"SPAIN",year:"2012",TVegANDPrep:280,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"SPAIN",year:"2013",TVegANDPrep:282.5,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"SPAIN",year:"2014",TVegANDPrep:317.8,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"SPAIN",year:"2015",TVegANDPrep:340.8,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"SPAIN",year:"2016",TVegANDPrep:357.4,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"SPAIN",year:"2017",TVegANDPrep:349.6,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"GUATEMALA",year:"2000",TVegANDPrep:43.7,fruitJuice:0,TSweANDCndy:41.4,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"GUATEMALA",year:"2001",TVegANDPrep:39.2,fruitJuice:0,TSweANDCndy:30.7,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"GUATEMALA",year:"2002",TVegANDPrep:45.6,fruitJuice:0,TSweANDCndy:37.7,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"GUATEMALA",year:"2003",TVegANDPrep:54.2,fruitJuice:0,TSweANDCndy:72.8,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"GUATEMALA",year:"2004",TVegANDPrep:64.1,fruitJuice:0,TSweANDCndy:61.5,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"GUATEMALA",year:"2005",TVegANDPrep:67,fruitJuice:0,TSweANDCndy:87.1,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"GUATEMALA",year:"2006",TVegANDPrep:70.6,fruitJuice:0,TSweANDCndy:80.3,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"GUATEMALA",year:"2007",TVegANDPrep:88.6,fruitJuice:0,TSweANDCndy:72.6,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"GUATEMALA",year:"2008",TVegANDPrep:121.6,fruitJuice:0,TSweANDCndy:149.2,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"GUATEMALA",year:"2009",TVegANDPrep:121.9,fruitJuice:0,TSweANDCndy:63.5,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"GUATEMALA",year:"2010",TVegANDPrep:108.2,fruitJuice:0,TSweANDCndy:202.1,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"GUATEMALA",year:"2011",TVegANDPrep:148.3,fruitJuice:0,TSweANDCndy:119.7,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"GUATEMALA",year:"2012",TVegANDPrep:163.1,fruitJuice:0,TSweANDCndy:188,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"GUATEMALA",year:"2013",TVegANDPrep:172.1,fruitJuice:0,TSweANDCndy:56.1,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"GUATEMALA",year:"2014",TVegANDPrep:181.2,fruitJuice:0,TSweANDCndy:144.4,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"GUATEMALA",year:"2015",TVegANDPrep:192.1,fruitJuice:0,TSweANDCndy:134.4,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"GUATEMALA",year:"2016",TVegANDPrep:183.9,fruitJuice:0,TSweANDCndy:146.3,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"GUATEMALA",year:"2017",TVegANDPrep:198.2,fruitJuice:0,TSweANDCndy:115.7,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"NETHERLANDS",year:"2000",TVegANDPrep:125.8,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"NETHERLANDS",year:"2001",TVegANDPrep:126.9,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"NETHERLANDS",year:"2002",TVegANDPrep:128,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"NETHERLANDS",year:"2003",TVegANDPrep:122.2,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"NETHERLANDS",year:"2004",TVegANDPrep:105.6,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"NETHERLANDS",year:"2005",TVegANDPrep:85.1,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"NETHERLANDS",year:"2006",TVegANDPrep:84.3,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"NETHERLANDS",year:"2007",TVegANDPrep:63,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"NETHERLANDS",year:"2008",TVegANDPrep:56.6,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"NETHERLANDS",year:"2009",TVegANDPrep:70.6,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"NETHERLANDS",year:"2010",TVegANDPrep:78.2,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"NETHERLANDS",year:"2011",TVegANDPrep:106.9,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"NETHERLANDS",year:"2012",TVegANDPrep:130.5,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"NETHERLANDS",year:"2013",TVegANDPrep:126,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"NETHERLANDS",year:"2014",TVegANDPrep:137.8,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"NETHERLANDS",year:"2015",TVegANDPrep:154.6,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"NETHERLANDS",year:"2016",TVegANDPrep:166.8,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"NETHERLANDS",year:"2017",TVegANDPrep:184.1,fruitJuice:0,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"BRAZIL",year:"2000",TVegANDPrep:0,fruitJuice:134.1,TSweANDCndy:88.9,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"BRAZIL",year:"2001",TVegANDPrep:0,fruitJuice:89.9,TSweANDCndy:106.6,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"BRAZIL",year:"2002",TVegANDPrep:0,fruitJuice:93.4,TSweANDCndy:96.1,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"BRAZIL",year:"2003",TVegANDPrep:0,fruitJuice:175.4,TSweANDCndy:121.7,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"BRAZIL",year:"2004",TVegANDPrep:0,fruitJuice:127.6,TSweANDCndy:113.9,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"BRAZIL",year:"2005",TVegANDPrep:0,fruitJuice:185.5,TSweANDCndy:186.9,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"BRAZIL",year:"2006",TVegANDPrep:0,fruitJuice:230.7,TSweANDCndy:180.5,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"BRAZIL",year:"2007",TVegANDPrep:0,fruitJuice:419.5,TSweANDCndy:186.1,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"BRAZIL",year:"2008",TVegANDPrep:0,fruitJuice:302,TSweANDCndy:168.8,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"BRAZIL",year:"2009",TVegANDPrep:0,fruitJuice:238.1,TSweANDCndy:167.8,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"BRAZIL",year:"2010",TVegANDPrep:0,fruitJuice:277.8,TSweANDCndy:327.2,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"BRAZIL",year:"2011",TVegANDPrep:0,fruitJuice:320.8,TSweANDCndy:488,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"BRAZIL",year:"2012",TVegANDPrep:0,fruitJuice:242,TSweANDCndy:291.2,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"BRAZIL",year:"2013",TVegANDPrep:0,fruitJuice:303.3,TSweANDCndy:160.5,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"BRAZIL",year:"2014",TVegANDPrep:0,fruitJuice:428.7,TSweANDCndy:244.1,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"BRAZIL",year:"2015",TVegANDPrep:0,fruitJuice:347.8,TSweANDCndy:240.2,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"BRAZIL",year:"2016",TVegANDPrep:0,fruitJuice:342.6,TSweANDCndy:303.2,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"BRAZIL",year:"2017",TVegANDPrep:0,fruitJuice:398.9,TSweANDCndy:304.9,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"ARGENTINA",year:"2000",TVegANDPrep:0,fruitJuice:120.4,TSweANDCndy:81.4,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"ARGENTINA",year:"2001",TVegANDPrep:0,fruitJuice:110.9,TSweANDCndy:56,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"ARGENTINA",year:"2002",TVegANDPrep:0,fruitJuice:93.6,TSweANDCndy:86.5,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"ARGENTINA",year:"2003",TVegANDPrep:0,fruitJuice:101.1,TSweANDCndy:66.2,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"ARGENTINA",year:"2004",TVegANDPrep:0,fruitJuice:106.2,TSweANDCndy:58.5,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"ARGENTINA",year:"2005",TVegANDPrep:0,fruitJuice:146.7,TSweANDCndy:78.6,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"ARGENTINA",year:"2006",TVegANDPrep:0,fruitJuice:146.8,TSweANDCndy:110.5,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"ARGENTINA",year:"2007",TVegANDPrep:0,fruitJuice:179.2,TSweANDCndy:75,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"ARGENTINA",year:"2008",TVegANDPrep:0,fruitJuice:214.7,TSweANDCndy:70.1,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"ARGENTINA",year:"2009",TVegANDPrep:0,fruitJuice:141.5,TSweANDCndy:74,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"ARGENTINA",year:"2010",TVegANDPrep:0,fruitJuice:118.9,TSweANDCndy:148.4,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"ARGENTINA",year:"2011",TVegANDPrep:0,fruitJuice:305.8,TSweANDCndy:187.1,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"ARGENTINA",year:"2012",TVegANDPrep:0,fruitJuice:227.3,TSweANDCndy:205.3,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"ARGENTINA",year:"2013",TVegANDPrep:0,fruitJuice:229.6,TSweANDCndy:169.2,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"ARGENTINA",year:"2014",TVegANDPrep:0,fruitJuice:164.7,TSweANDCndy:174.3,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"ARGENTINA",year:"2015",TVegANDPrep:0,fruitJuice:165.7,TSweANDCndy:140.4,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"ARGENTINA",year:"2016",TVegANDPrep:0,fruitJuice:145.7,TSweANDCndy:138,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"ARGENTINA",year:"2017",TVegANDPrep:0,fruitJuice:112.6,TSweANDCndy:123.4,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"COSTA RICA",year:"2000",TVegANDPrep:0,fruitJuice:41.6,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"COSTA RICA",year:"2001",TVegANDPrep:0,fruitJuice:35.7,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"COSTA RICA",year:"2002",TVegANDPrep:0,fruitJuice:39.1,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"COSTA RICA",year:"2003",TVegANDPrep:0,fruitJuice:38.5,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"COSTA RICA",year:"2004",TVegANDPrep:0,fruitJuice:34.3,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"COSTA RICA",year:"2005",TVegANDPrep:0,fruitJuice:28.3,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"COSTA RICA",year:"2006",TVegANDPrep:0,fruitJuice:42.1,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"COSTA RICA",year:"2007",TVegANDPrep:0,fruitJuice:85.8,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"COSTA RICA",year:"2008",TVegANDPrep:0,fruitJuice:48.2,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"COSTA RICA",year:"2009",TVegANDPrep:0,fruitJuice:50,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"COSTA RICA",year:"2010",TVegANDPrep:0,fruitJuice:56.4,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"COSTA RICA",year:"2011",TVegANDPrep:0,fruitJuice:48.5,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"COSTA RICA",year:"2012",TVegANDPrep:0,fruitJuice:75.7,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"COSTA RICA",year:"2013",TVegANDPrep:0,fruitJuice:74.7,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"COSTA RICA",year:"2014",TVegANDPrep:0,fruitJuice:64.4,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"COSTA RICA",year:"2015",TVegANDPrep:0,fruitJuice:55.8,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"COSTA RICA",year:"2016",TVegANDPrep:0,fruitJuice:92.9,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"COSTA RICA",year:"2017",TVegANDPrep:0,fruitJuice:77.7,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"CHILE",year:"2000",TVegANDPrep:0,fruitJuice:62,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:377},
      {name:"CHILE",year:"2001",TVegANDPrep:0,fruitJuice:59.8,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:395.9},
      {name:"CHILE",year:"2002",TVegANDPrep:0,fruitJuice:55.5,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:422.8},
      {name:"CHILE",year:"2003",TVegANDPrep:0,fruitJuice:67.9,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:546.3},
      {name:"CHILE",year:"2004",TVegANDPrep:0,fruitJuice:74.6,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:551.7},
      {name:"CHILE",year:"2005",TVegANDPrep:0,fruitJuice:70.6,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:635.4},
      {name:"CHILE",year:"2006",TVegANDPrep:0,fruitJuice:89.4,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:816},
      {name:"CHILE",year:"2007",TVegANDPrep:0,fruitJuice:61.5,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:881.9},
      {name:"CHILE",year:"2008",TVegANDPrep:0,fruitJuice:104.1,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:846.8},
      {name:"CHILE",year:"2009",TVegANDPrep:0,fruitJuice:85.8,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:591.3},
      {name:"CHILE",year:"2010",TVegANDPrep:0,fruitJuice:54.6,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:468.2},
      {name:"CHILE",year:"2011",TVegANDPrep:0,fruitJuice:76.5,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:751.3},
      {name:"CHILE",year:"2012",TVegANDPrep:0,fruitJuice:71.5,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:884.8},
      {name:"CHILE",year:"2013",TVegANDPrep:0,fruitJuice:63.7,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:1219.5},
      {name:"CHILE",year:"2014",TVegANDPrep:0,fruitJuice:100.5,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:1459.7},
      {name:"CHILE",year:"2015",TVegANDPrep:0,fruitJuice:96.3,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:1214.6},
      {name:"CHILE",year:"2016",TVegANDPrep:0,fruitJuice:75.8,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:1385.8},
      {name:"CHILE",year:"2017",TVegANDPrep:0,fruitJuice:67.1,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:1652.3},
      {name:"TURKEY",year:"2000",TVegANDPrep:0,fruitJuice:9.6,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"TURKEY",year:"2001",TVegANDPrep:0,fruitJuice:9.9,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"TURKEY",year:"2002",TVegANDPrep:0,fruitJuice:4.2,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"TURKEY",year:"2003",TVegANDPrep:0,fruitJuice:2.9,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"TURKEY",year:"2004",TVegANDPrep:0,fruitJuice:7.5,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"TURKEY",year:"2005",TVegANDPrep:0,fruitJuice:6.4,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"TURKEY",year:"2006",TVegANDPrep:0,fruitJuice:31.3,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"TURKEY",year:"2007",TVegANDPrep:0,fruitJuice:50.5,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"TURKEY",year:"2008",TVegANDPrep:0,fruitJuice:41.5,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"TURKEY",year:"2009",TVegANDPrep:0,fruitJuice:25.1,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"TURKEY",year:"2010",TVegANDPrep:0,fruitJuice:22.2,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"TURKEY",year:"2011",TVegANDPrep:0,fruitJuice:31.2,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"TURKEY",year:"2012",TVegANDPrep:0,fruitJuice:37.6,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"TURKEY",year:"2013",TVegANDPrep:0,fruitJuice:33.4,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"TURKEY",year:"2014",TVegANDPrep:0,fruitJuice:49.5,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"TURKEY",year:"2015",TVegANDPrep:0,fruitJuice:60.7,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"TURKEY",year:"2016",TVegANDPrep:0,fruitJuice:60.1,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"TURKEY",year:"2017",TVegANDPrep:0,fruitJuice:61.9,TSweANDCndy:0,TLiveAnimal:0,FishFilletANDMince:0},
      {name:"WORLD",year:"2000",TVegANDPrep:544.5,fruitJuice:263,TSweANDCndy:732.8,TLiveAnimal:0.1,FishFilletANDMince:765.1},
      {name:"WORLD",year:"2001",TVegANDPrep:560.6,fruitJuice:233,TSweANDCndy:648.6,TLiveAnimal:0.1,FishFilletANDMince:661.3},
      {name:"WORLD",year:"2002",TVegANDPrep:604.4,fruitJuice:243.2,TSweANDCndy:736.2,TLiveAnimal:0,FishFilletANDMince:696.8},
      {name:"WORLD",year:"2003",TVegANDPrep:673.1,fruitJuice:228.6,TSweANDCndy:811.2,TLiveAnimal:0.4,FishFilletANDMince:680.2},
      {name:"WORLD",year:"2004",TVegANDPrep:753.2,fruitJuice:217.3,TSweANDCndy:786.3,TLiveAnimal:0.2,FishFilletANDMince:746},
      {name:"WORLD",year:"2005",TVegANDPrep:802.3,fruitJuice:218.2,TSweANDCndy:839.7,TLiveAnimal:0.5,FishFilletANDMince:759.6},
      {name:"WORLD",year:"2006",TVegANDPrep:877.3,fruitJuice:235.1,TSweANDCndy:973.3,TLiveAnimal:0.3,FishFilletANDMince:754.4},
      {name:"WORLD",year:"2007",TVegANDPrep:1021.6,fruitJuice:262.5,TSweANDCndy:835.2,TLiveAnimal:0.3,FishFilletANDMince:821.1},
      {name:"WORLD",year:"2008",TVegANDPrep:1111.9,fruitJuice:267.8,TSweANDCndy:813.8,TLiveAnimal:0.1,FishFilletANDMince:817},
      {name:"WORLD",year:"2009",TVegANDPrep:1052.4,fruitJuice:237,TSweANDCndy:939.5,TLiveAnimal:0.1,FishFilletANDMince:843.1},
      {name:"WORLD",year:"2010",TVegANDPrep:1092.6,fruitJuice:246.6,TSweANDCndy:1262.5,TLiveAnimal:0.1,FishFilletANDMince:924.5},
      {name:"WORLD",year:"2011",TVegANDPrep:1220.4,fruitJuice:313.3,TSweANDCndy:1372.2,TLiveAnimal:0.3,FishFilletANDMince:1026.6},
      {name:"WORLD",year:"2012",TVegANDPrep:1373.6,fruitJuice:291.2,TSweANDCndy:1529.5,TLiveAnimal:0.1,FishFilletANDMince:1242.4},
      {name:"WORLD",year:"2013",TVegANDPrep:1294.5,fruitJuice:291.5,TSweANDCndy:1095.3,TLiveAnimal:0.1,FishFilletANDMince:1080.9},
      {name:"WORLD",year:"2014",TVegANDPrep:1347.7,fruitJuice:358.9,TSweANDCndy:1417.4,TLiveAnimal:0,FishFilletANDMince:1180.3},
      {name:"WORLD",year:"2015",TVegANDPrep:1388.5,fruitJuice:393,TSweANDCndy:1528.5,TLiveAnimal:0,FishFilletANDMince:1238.9},
      {name:"WORLD",year:"2016",TVegANDPrep:1476.3,fruitJuice:360.2,TSweANDCndy:1449.5,TLiveAnimal:0.1,FishFilletANDMince:1249.8},
      {name:"WORLD",year:"2017",TVegANDPrep:1574.5,fruitJuice:371.9,TSweANDCndy:1572.9,TLiveAnimal:0.1,FishFilletANDMince:1309.4}
      ];





    //Creador de Inicial
    app.get(BASE_API_URL+"/foodsImports/loadInitialData", (req,res) =>{

      db.insert(initialfoodsImports);
      res.send(JSON.stringify(initialfoodsImports,null,2));
      console.log("Data sent:"+JSON.stringify(initialfoodsImports,null,2));

    });




    // GET FOOD IMPORTS

    app.get(BASE_API_URL+"/foodsImports", (req,res) =>{
      var peperoni=0;
      console.log("Get /foodsImports...");
      console.log("Nombre: "+req.query.name);
      console.log("Año: "+req.query.year);
      var offst=req.query.offset;
      var limit=req.query.limit;
      var flag=0;
      console.log("offset  : "+offst);
      console.log("limit   :"+ limit);


      //Comprobación de los parametros de entrada en una posible búsqueda
      if(req.query.name!=undefined){
        if(req.query.year!=undefined){
          peperoni=1;//?name and year
        }else{
          peperoni=2;//?name			
        }
      }else{
        if(req.query.year!=undefined){
          peperoni=3;//?year
        }
      }
      console.log("PEPERONI:   "+peperoni);

      switch(peperoni){

        case 0:
          db.find({}, {_id: 0 },(err,foodsImports)=>{
            if(offst!=undefined){
              foodsImports=foodsImports.slice(offst,);
            }
            if(limit!=undefined){
              foodsImports=foodsImports.slice(0,limit);
            }
            res.send(foodsImports);
            console.log("Data sent:"+JSON.stringify(foodsImports,null,2));
          });
          break;

        case 1:
          var name= req.query.name;
          var year= req.query.year;
          db.find({ $and: [{name:name}, {year:year}] }, {_id: 0 },(err,foodsImports)=>{
            if(offst!=undefined){
              foodsImports=foodsImports.slice(offst,);
            }
            if(limit!=undefined){
              foodsImports=foodsImports.slice(0,limit);
            }
            res.send(foodsImports);
          });
          break;
        case 2:
          var name= req.query.name;
          db.find({name:name}, {_id: 0 },(err,foodsImports)=>{
            if(offst!=undefined){
              foodsImports=foodsImports.slice(offst,);
            }
            if(limit!=undefined){
              foodsImports=foodsImports.slice(0,limit);
            }
            res.send(foodsImports);
            console.log("Data sent:"+JSON.stringify(foodsImports,null,2));});
          break;
        case 3: 
          var year= req.query.year;
          console.log("Año dentro: "+year);
          db.find({year:year}, {_id: 0 },(err,foodsImports)=>{
            if(offst!=undefined){
              foodsImports=foodsImports.slice(offst,);
            }
            if(limit!=undefined){
              foodsImports=foodsImports.slice(0,limit);
            }
            res.send(foodsImports);
            console.log("Data sent:"+JSON.stringify(foodsImports,null,2));});
          break;

        default: break;


      }


    });


    // POST FOOD IMPORTS

    app.post(BASE_API_URL+"/foodsImports",(req,res) =>{

      var newfoodsImports = req.body;


      if((newfoodsImports == "") 
        || (newfoodsImports.name == null)
        || (newfoodsImports.year == null)
        || (newfoodsImports.TVegANDPrep == null)
        || (newfoodsImports.fruitJuice == null)
        || (newfoodsImports.TSweANDCndy == null)
        || (newfoodsImports.TLiveAnimal == null)
        || (newfoodsImports.FishFilletANDMince == null)
        || (newfoodsImports._id != null)){
        res.sendStatus(400,"BAD REQUEST");
      } else {
        db.insert(newfoodsImports, function (err, foodsImports) {}); 	
        res.sendStatus(201,"CREATED");
      }
    });

    // DELETE FOOD IMPORTS
    app.delete(BASE_API_URL+"/foodsImports",(req,res) =>{
      var elimin = "Fue eliminado";
      db.remove({}, { multi: true }, function (err, elimin) {});
      res.sendStatus(200,"OK")

    });

    // GET FOOD IMPORTS/XXX

    app.get(BASE_API_URL+"/foodsImports/:name/:year",(req,res) =>{
      console.log("Múltiple valor");
      var name = req.params.name;
      var year = req.params.year;
      db.find({ $and: [{name:name}, {year:year}] },(err,foodsImports)=>{
        if(err){
          res.sendStatus(500);
        }else{
          if(foodsImports.length > 0){
            res.send(foodsImports[0]);
          }else{
            res.sendStatus(404);
          }  

        }
    });});


    app.get(BASE_API_URL+"/foodsImports/:name",(req,res) =>{

      var name = req.params.name;
      console.log("Unico valor");
      
      if(Number.isInteger(parseInt(name))){
        console.log(name);
        db.find( {year:name.toString()} ,(err,foodsImports)=>{
          if(err){
            res.sendStatus(500);
          }else{
            if(foodsImports.length > 0){
              res.send(foodsImports);
            }else{
              res.sendStatus(404);
            }  
          }
        });
      }else{
        console.log("No pasa");
        db.find( {name:name} ,(err,foodsImports)=>{
          if(err){
            res.sendStatus(500);
          }else{
            if(foodsImports.length > 0){
              res.send(foodsImports);
            }else{
              res.sendStatus(404);
            }  
          }
        });

      }
    });
/*
    app.get(BASE_API_URL+"/foodsImports/:year",(req,res) =>{

      var year = req.params.year;
      db.find( {year:year} ,(err,foodsImports)=>{
        if(err){
          res.sendStatus(500);
        }else{
          if(foodsImports.length > 0){
            res.send(foodsImports);
          }else{
            res.sendStatus(404);
          }  

        }
    });});

*/
    //POST FOOD IMPORTS

    app.post(BASE_API_URL+"/foodsImports/:name/:year",(req,res) =>{	

      res.sendStatus(405,"METHOD NOT ALLOWED");
    });

    app.put(BASE_API_URL+"/foodsImports",(req,res) =>{	
      res.sendStatus(405,"METHOD NOT ALLOWED");
    });

    // PUT FOOD IMPORTS/XXX


    app.put(BASE_API_URL+"/foodsImports/:name/:year",(req,res) =>{

      var name = req.params.name;
      var year = req.params.year;
      var ident;

      db.remove({ name:name,year:year});

      var newfoodsImports = req.body;

      if((newfoodsImports == "") || (newfoodsImports.name == null)){
        res.sendStatus(400,"BAD REQUEST");
      } else {
        db.insert(newfoodsImports, function (err, foodsImports) {}); 	
        res.sendStatus(201,"UPDATED");
      }
    });

    // DELETE FOOD IMPORTS/XXX
    app.delete(BASE_API_URL+"/foodsImports/:name/:year",(req,res) =>{
      var name = req.params.name;
      var year= req.params.year;

      db.remove({ name:name,year:year});

      res.sendStatus(200,"OK")
    });
    console.log("OK.");
}
