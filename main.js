// Service Workerの登録
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js') // sw.jsのパス（ルートからの絶対パス）
      .then((registration) => {
        console.log('Service Worker registered: ', registration);
      })
      .catch((error) => {
        console.log('Service Worker registration failed: ', error);
      });
  });
}

// ストレージの永続化をリクエスト
if (navigator.storage && navigator.storage.persist) {
  // 現在の永続化状態を確認
  navigator.storage.persisted().then((isPersisted) => {

    if (isPersisted) {
      console.log('ストレージは既に永続化されています。');

    } else {
      console.log('ストレージが永続化されていません。永続化をリクエストします...');

      // 永続化をリクエスト
      navigator.storage.persist().then((wasGranted) => {
        if (wasGranted) {
          console.log('ストレージの永続化が許可されました。');
        } else {
          console.log('ストレージの永続化は許可されませんでした。');
        }
      });

    }
  });
}

var mapConfig = {
    //画像のピクセルサイズ
    imgWidth: 9216,
    imgHeight: 6144,

    //初期リスのピクセル座標
    anchorPixelY: 3327,
    anchorPixelX: 5758,

    //初期リスのゲーム内座標
    anchorGameZ: 255,
    anchorGameX: 126
};

var anchorLeafletY = mapConfig.anchorGameZ;
var anchorLeafletX = mapConfig.anchorGameX;

var transformation = new L.Transformation(
    1, // a (Xスケール)
    mapConfig.anchorPixelX - mapConfig.anchorGameX, // b (Xオフセット)
    -1, // c (Yスケール, L.CRS.Simple 標準)
    mapConfig.anchorPixelY - mapConfig.anchorGameZ  // d (Yオフセット)
);

var MyCRS = L.extend({}, L.CRS.Simple, {
  // transformation: new L.Transformation(1, 0, -1, 0)
  transformation: transformation
});

var renderers = L.svg({ padding: 0.5 });

//Leafletマップの初期化
var map = L.map('map', {
    crs: MyCRS,
    minZoom: -2,
    maxZoom: 2,
    zoomSnap: 0.25,
    zoomDelta: 0.25,
    wheelPxPerZoomLevel: 120,
    renderer: renderers,
    maxBoundsViscosity: 1.0
});

//四隅のLeaflet座標を計算
var topLeftY = anchorLeafletY - mapConfig.anchorPixelY;
var topLeftX = anchorLeafletX - mapConfig.anchorPixelX;
var bottomRightY = anchorLeafletY + (mapConfig.imgHeight - mapConfig.anchorPixelY);
var bottomRightX = anchorLeafletX + (mapConfig.imgWidth - mapConfig.anchorPixelX);

// var bounds = [ [topLeftY, topLeftX], [bottomRightY, bottomRightX] ];
var bounds = [ [bottomRightY, topLeftX], [topLeftY, bottomRightX] ];
// L.imageOverlay('images/2025-11-12_23.10.12_x-5632_z-3072.png', bounds).addTo(map);

var tileMaxNativeZoom = 6;

// タイルレイヤーの追加
var attribution = `崎島経済サーバーマップ
  <br>Icon made by Freepik from <a href="https://www.flaticon.com/" target="_blank" rel="noopener noreferrer">www.flaticon.com</a>
  <br><span id="notuse">崎島経済サーバーに関わる場所以外での利用を禁止します</span>`;

var tileLayer = L.tileLayer('tiles/{z}/{x}/{y}.webp', {
  attribution: attribution,
  // bounds: bounds,
  noWrap: true,

  minZoom: map.minZoom,
  maxZoom: map.maxZoom,

  minNativeZoom: 0,
  maxNativeZoom: 4,

  // tms: true,

  keepBuffer: 10,

  tileSize: 1024,

  zoomOffset: 4
}).addTo(map);

var inZoomTileLayer = L.tileLayer('tiles/{z}/{x}/{y}.webp', {
  attribution: attribution,
  // bounds: bounds,
  noWrap: true,

  minZoom: map.minZoom,
  maxZoom: map.maxZoom,

  minNativeZoom: 0,
  maxNativeZoom: 5,

  // tms: true,

  keepBuffer: 10,

  tileSize: 512,

  zoomOffset: 5
});

map.fitBounds(bounds);

map.setView(convertCoord(anchorLeafletY, anchorLeafletX), -1);

map.setMaxBounds(bounds);

//ピン
{
  //色設定
  //青
  var blueIcon = new L.Icon.Default({
      className: 'icon-blue'
  });
  //赤
  var redIcon = new L.Icon.Default({
      className: 'icon-red'
  });
  //緑
  var greenIcon = new L.Icon.Default({
      className: 'icon-green'
  });
  //黄
  var orangeIcon = new L.Icon.Default({
      className: 'icon-orange'
  });
  //紫
  var purpleIcon = new L.Icon.Default({
      className: 'icon-purple'
  });
  //灰
  var grayIcon = new L.Icon.Default({
      className: 'icon-gray',
      shadowUrl: null,
      shadowSize: [0, 0],
  });

  //original
  //スポーン地点アイコン
  var spawnIcon = new L.Icon({
    iconUrl: './images/icon/spawn-point.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -16],
  });
  //自動車学校アイコン
  var drivingSchoolIcon = new L.Icon({
    iconUrl: './images/icon/driving-school_offical.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
  //白木蔵アイコン
  var shirakiKuraIcon = new L.Icon({
    iconUrl: './images/icon/warehouse_user.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
  //白木台盤所アイコン
  var shirakiKitchenIcon = new L.Icon({
    iconUrl: './images/icon/kitchen_user.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
  //白木スポナー施設アイコン
  var shirakiSpawnerIcon = new L.Icon({
    iconUrl: './images/icon/role-play_user.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });

  //offical
  //公共駅アイコン
  var stationOfficalIcon = new L.Icon({
    iconUrl: './images/icon/train-station_offical.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
  //ゲート施設アイコン
  var gatewayIcon = new L.Icon({
    iconUrl: './images/icon/gateway_offical.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
  //アドミンショップアイコン
  var adminShopIcon = new L.Icon({
    iconUrl: './images/icon/store_offical.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
  //公共ガソリンスタンドアイコン
  var gasStationOfficalIcon = new L.Icon({
    iconUrl: './images/icon/gas-pump_offical.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
  //公共高速ICアイコン
  var highwayICOfficalIcon = new L.Icon({
    iconUrl: './images/icon/toll_offical.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
  //公共飛行場アイコン
  var airportOfficalIcon = new L.Icon({
    iconUrl: './images/icon/air-port_offical.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
  //公共フェリーターミナルアイコン
  var ferryTerminalOfficalIcon = new L.Icon({
    iconUrl: './images/icon/ship_offical.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
  //公共宿屋アイコン
  var innOfficalIcon = new L.Icon({
    iconUrl: './images/icon/bed_offical.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });

  //user
  //私設駅アイコン
  var stationUserIcon = new L.Icon({
    iconUrl: './images/icon/train-station_user.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
  //ユーザー運営空港アイコン
  var airportUserIcon = new L.Icon({
    iconUrl: './images/icon/air-port_user.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });

  //special occupation
  //魔法店アイコン
  var magicShopIcon = new L.Icon({
    iconUrl: './images/icon/store_magic.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
  //自動車工場アイコン
  var carGarageIcon = new L.Icon({
    iconUrl: './images/icon/car-garage_car.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
  //機械工場アイコン
  var machineFactoryIcon = new L.Icon({
    iconUrl: './images/icon/factory_machine.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
  //貿易所アイコン
  var tradeCenterIcon = new L.Icon({
    iconUrl: './images/icon/user-basket_trade.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });

  //ピン立て
  {
    var markerDataList = [

      //黒輪

      {
        name: "初期スポーン地点",
        x: 126,
        z: 255,
        icon: spawnIcon,
        image: "./images/screenshot/spawn_point.webp",
        description: "このサーバーの初期スポーン地点。<br>スポーン後、後ろを向くとチュートリアルを開始するための書見台が置いてある。",
        url: "https://www.youtube.com/watch?v=1t1O0_adZkY&pp=2AYB"
      },
      {
        name: "黒輪駅",
        x: -10,
        z: 161,
        icon: stationOfficalIcon,
        image: "./images/screenshot/kurowa_station.webp",
        description: "黒輪の鉄道駅。<br>多数の路線が発着している。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E9%BB%92%E8%BC%AA?authuser=0#h.2ittt159tlo0"
      },
      {
        name: "黒輪アドミンショップ",
        x: -12,
        z: 240,
        icon: adminShopIcon,
        image: "./images/screenshot/adminshop_kurowa.webp",
        description: "黒輪に設置されているアドミンショップ。<br>各種冒険で採取できる用品を売却したり、報酬を受け取ることが可能。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E9%BB%92%E8%BC%AA?authuser=0#h.gjrjie4ofs42"
      },
      {
        name: "黒輪ゲート施設",
        x: 39,
        z: 174,
        icon: gatewayIcon,
        image: "./images/screenshot/kurowa_gateway.webp",
        description: "黒輪に設置されているゲート施設。<br>すべてのディメンジョンゲートが設置されている。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E9%BB%92%E8%BC%AA?authuser=0#h.m3i4c2782x2u"
      },
      {
        name: "黒輪飛行場",
        x: 336,
        z: 462,
        icon: airportOfficalIcon,
        image: "./images/screenshot/airport_kurowa.webp",
        description: "黒輪に設置されている飛行場。<br>広大な土地を有しているが現在未稼働。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E9%BB%92%E8%BC%AA?authuser=0#h.cplwypycellr"
      },
      {
        name: "高速道路 黒輪IC",
        x: -89,
        z: 93,
        icon: highwayICOfficalIcon,
        image: "./images/screenshot/kurowa_ic.webp",
        description: "高速道路の黒輪インターチェンジ。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E9%BB%92%E8%BC%AA?authuser=0#h.xqcnmbrtg2jn"
      },
      {
        name: "CESSO Express 黒輪店",
        x: -115,
        z: 311,
        icon: gasStationOfficalIcon,
        image: "./images/screenshot/cesso_kurowa.webp",
        description: "公共インフラとして運営されているガソリンスタンド。<br>セルフサービス式で24時間営業。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E9%BB%92%E8%BC%AA?authuser=0#h.9vyzz3eatn32"
      },
      {
        name: "DOSMO ドスモ石油 黒輪店",
        x: -228,
        z: 347,
        icon: gasStationOfficalIcon,
        image: "./images/screenshot/dosmo_kurowa.webp",
        description: "公共インフラとして運営されているガソリンスタンド。<br>小型車のみが使用できる。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E9%BB%92%E8%BC%AA?authuser=0#h.z2jbs4cpj6zw"
      },
      {
        name: "黒輪フェリーターミナル",
        x: -295,
        z: -19,
        icon: ferryTerminalOfficalIcon,
        image: "./images/screenshot/ferry_kurowa.webp",
        description: "黒輪に設置されているフェリーターミナル。<br>現在新天台行きの小型船が発着している。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E9%BB%92%E8%BC%AA?authuser=0#h.ccfidan7s1ko"
      },
      {
        name: "天狗の酒場 人狩行こうぜ!!",
        x: 48,
        z: 256,
        icon: innOfficalIcon,
        image: "./images/screenshot/tengu_hotel.webp",
        description: "黒輪にある無料宿泊場。<br>酒場の入り口は道路沿いに、宿泊所の入り口は裏手の公園にある。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E9%BB%92%E8%BC%AA?authuser=0#h.tzu2noneovyg"
      },
      {
        name: "雑貨店 pono",
        x: -119,
        z: 258,
        icon: magicShopIcon,
        image: "./images/screenshot/pono.webp",
        description: "ポノポノ/ponopono1103 が運営する雑貨店。<br>飲食品やその他消耗品の他、魔法関係の対応も行っている。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E9%BB%92%E8%BC%AA?authuser=0#h.xb2tod6gly58"
      },
      {
        name: "白猫だんぼーる るなるんらいと",
        x: -190,
        z: 300,
        icon: magicShopIcon,
        image: "./images/screenshot/lunalu'n_light.webp",
        description: "クラフちゃん/Crafchan が運営する魔法店。<br>魔法依頼チケットを取り扱っている他、冒険で拾ってきたであろうアイテムの販売ガチャが置いてある。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E9%BB%92%E8%BC%AA?authuser=0#h.ig9el33phgts"
      },
      {
        name: "cafe&magic shop aomochi",
        x: 63,
        z: 194,
        icon: magicShopIcon,
        image: "./images/screenshot/aomochi.webp",
        description: "みずもち/ao_mochi が運営するカフェ兼魔法店。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E9%BB%92%E8%BC%AA?authuser=0#h.dsovuubm4j8m"
      },

      //白木

      {
        name: "白木駅",
        x: -32,
        z: 876,
        icon: stationOfficalIcon,
        image: "./images/screenshot/shiraki_station.webp",
        description: "白木の鉄道駅。<br>町長が寝落ちした時のためのコマンドブロックがある。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E7%99%BD%E6%9C%A8?authuser=0#h.dp84rfipnbm4"
      },
      {
        name: "白木アドミンショップ",
        x: -21,
        z: 886,
        icon: adminShopIcon,
        image: "./images/screenshot/adminshop_shiraki.webp",
        description: "白木に設置されているアドミンショップ。<br>バニラ作物、Farmer's Delightの作物、漆modの作物を売却することができる。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E7%99%BD%E6%9C%A8?authuser=0#h.2eee0aimnfe1"
      },
      {
        name: "高速道路 白木IC",
        x: 353,
        z: 1367,
        icon: highwayICOfficalIcon,
        image: "./images/screenshot/shiraki_ic.webp",
        description: "高速道路の白木インターチェンジ。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E7%99%BD%E6%9C%A8?authuser=0#h.3s77mcgs8lf5"
      },
      {
        name: "CESSO Express 白木店",
        x: 29,
        z: 847,
        icon: gasStationOfficalIcon,
        image: "./images/screenshot/cesso_shiraki.webp",
        description: "公共インフラとして運営されているガソリンスタンド。<br>セルフサービス式で24時間営業。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E7%99%BD%E6%9C%A8?authuser=0#h.rd46v4dqph7n"
      },
      {
        name: "白木蔵",
        x: -101,
        z: 1020,
        icon: shirakiKuraIcon,
        image: "./images/screenshot/shiraki_kura.webp",
        description: "白木町が運営する一次生産品の保管用蔵。<br>町民であれば誰でも保管、消費が可能。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E7%99%BD%E6%9C%A8?authuser=0#h.jvbtgxi7n9vt"
      },
      {
        name: "白木台盤所",
        x: -72,
        z: 1019,
        icon: shirakiKitchenIcon,
        image: "./images/screenshot/shiraki_kitchen.webp",
        description: "白木町が運営する公共キッチン。<br>一回300円で利用可能で、町民は無料。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E7%99%BD%E6%9C%A8?authuser=0#h.m4qvd1fzyg8w"
      },
      {
        name: "白木スポナー施設",
        x: 100,
        z: 975,
        icon: shirakiSpawnerIcon,
        image: "./images/screenshot/spawner_shiraki.webp",
        description: "白木町が運営するスポナー施設。<br>一般公開されている。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E7%99%BD%E6%9C%A8?authuser=0#h.nui55p6xor2c"
      },
      {
        name: "Tricorne とんがり帽子",
        x: -74,
        z: 979,
        icon: magicShopIcon,
        image: "./images/screenshot/tricorne.webp",
        description: "こけ/k0kesam が運営する魔法店。<br>様々な魔道具を取り扱っている。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E7%99%BD%E6%9C%A8?authuser=0#h.lksu0rremc30"
      },

      //穂樽

      {
        name: "穂樽駅",
        x: -456,
        z: 835,
        icon: stationOfficalIcon,
        image: "./images/screenshot/hotaru_station.webp",
        description: "穂樽の鉄道駅。<br>地下鉄のみが発着する。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E7%A9%82%E6%A8%BD?authuser=0#h.zceocpxvgojd"
      },
      {
        name: "穂樽ゲート施設",
        x: -486,
        z: 840,
        icon: gatewayIcon,
        image: "./images/screenshot/hotaru_gateway.webp",
        description: "穂樽に設置されているゲート施設。<br>ミラーオーバーワールド、ネザーのゲートが設置されている。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E7%A9%82%E6%A8%BD?authuser=0#h.qftbfdqrphlt"
      },
      {
        name: "穂樽アドミンショップ",
        x: -418,
        z: 906,
        icon: adminShopIcon,
        image: "./images/screenshot/adminshop_hotaru.webp",
        description: "穂樽に設置されているアドミンショップ。<br>高額商品の購入が可能。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E7%A9%82%E6%A8%BD?authuser=0#h.gjnn6rdqrdph"
      },
      {
        name: "SNP本社工場",
        x: -797,
        z: 652,
        icon: machineFactoryIcon,
        image: "./images/screenshot/factory_snp.webp",
        description: "SNP株式会社の本社工場。<br>多数の機械を使用した巨大自動粉砕精錬ラインを構築している。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E7%A9%82%E6%A8%BD?authuser=0#h.evczq2yjtowf"
      },

      //猫ノ原

      {
        name: "猫ノ原アドミンショップ",
        x: -625,
        z: 1390,
        icon: adminShopIcon,
        image: "./images/screenshot/adminshop_nekonohara.webp",
        description: "猫ノ原に設置されているアドミンショップ。<br>各種鉱石を売却することが可能。<br>なお、<b>売却回数には制限がある。</b>",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E7%8C%AB%E3%83%8E%E5%8E%9F?authuser=0#h.yg6w0xp70z73"
      },
      {
        name: "猫草精工本社工場",
        x: -720,
        z: 1325,
        icon: machineFactoryIcon,
        image: "./images/screenshot/factory_nekokusa.webp",
        description: "猫草精工の本社工場。<br>IE機械を用いた鉱石粉砕をメイン業務として、様々な仕事を行っている。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E7%8C%AB%E3%83%8E%E5%8E%9F?authuser=0#h.jjmilo5nwr7i"
      },

      //蔵太

      {
        name: "蔵太駅",
        x: -622,
        z: 2026,
        icon: stationOfficalIcon,
        image: "./images/screenshot/kurafuto_station.webp",
        description: "蔵太の鉄道駅。<br>湾を挟んで向こう岸に渡る路線が発着している。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E8%94%B5%E5%A4%AA?authuser=0#h.lzgbu2janvsz"
      },
      {
        name: "プロスタック",
        x: -523,
        z: 1999,
        icon: adminShopIcon,
        image: "./images/screenshot/adminshop_prostack.webp",
        description: "蔵太に設置されているアドミンショップ。<br>石材や自然由来のブロックを売却することが可能。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E8%94%B5%E5%A4%AA?authuser=0#h.mq56khkcmwpa"
      },
      {
        name: "カメリ",
        x: -488,
        z: 1962,
        icon: adminShopIcon,
        image: "./images/screenshot/adminshop_kameri.webp",
        description: "蔵太に設置されているアドミンショップ。<br>各種苗木を売却可能。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E8%94%B5%E5%A4%AA?authuser=0#h.ekkp4emd12ku"
      },

      //南成田

      {
        name: "南成田駅",
        x: 1146,
        z: -1486,
        icon: stationOfficalIcon,
        image: "./images/screenshot/minaminarita_station.webp",
        description: "南成田の鉄道駅。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E5%8D%97%E6%88%90%E7%94%B0?authuser=0#h.e4cn5qenb9vk"
      },
      {
        name: "アドミンショップ南成田店",
        x: 1079,
        z: -1465,
        icon: adminShopIcon,
        image: "./images/screenshot/adminshop_minaminarita.webp",
        description: "南成田に設置されているアドミンショップ。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E5%8D%97%E6%88%90%E7%94%B0?authuser=0#h.im6qcai1wci"
      },
      {
        name: "南成田ゲート施設",
        x: 1080,
        z: -1495,
        icon: gatewayIcon,
        image: "./images/screenshot/minaminarita_gateway.webp",
        description: "南成田に設置されているゲート施設。<br>ミラーオーバーワールドゲートが設置されている。<br><b>ホワイトリスト制になっており、ホワイトリストに入っていない人は利用できない。</b>",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E5%8D%97%E6%88%90%E7%94%B0?authuser=0#h.ujas2fc9pzzz"
      },
      {
        name: "高速道路 南成田IC",
        x: 1124,
        z: -1572,
        icon: highwayICOfficalIcon,
        image: "./images/screenshot/minaminarita_ic.webp",
        description: "高速道路の南成田インターチェンジ。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E5%8D%97%E6%88%90%E7%94%B0?authuser=0#h.pkhf7ydx3745"
      },
      {
        name: "糀浜駅",
        x: 1034,
        z: -1621,
        icon: stationUserIcon,
        image: "./images/screenshot/minaminarita_koujihama_station.webp",
        description: "南成田の鉄道駅。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E5%8D%97%E6%88%90%E7%94%B0?authuser=0#h.w0ekix12ghf5"
      },
      {
        name: "穴持稲荷駅",
        x: 1320,
        z: -1770,
        icon: stationUserIcon,
        image: "./images/screenshot/minaminarita_anamochiinari_station.webp",
        description: "南成田の鉄道駅。<br>ホームのみ存在し、駅舎は未完成。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E5%8D%97%E6%88%90%E7%94%B0?authuser=0#h.ysxii6yvwqra"
      },
      {
        name: "天空橋駅",
        x: 1431,
        z: -1657,
        icon: stationUserIcon,
        image: "./images/screenshot/minaminarita_tenkubashi_station.webp",
        description: "南成田の鉄道駅。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E5%8D%97%E6%88%90%E7%94%B0?authuser=0#h.elag4jzeuxn8"
      },
      {
        name: "白浜横丁駅",
        x: 1017,
        z: -1260,
        icon: stationUserIcon,
        image: "./images/screenshot/minaminarita_shirahamayokocho_station.webp",
        description: "南成田の鉄道駅。<br>ホームのみ存在し、駅舎は未完成。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E5%8D%97%E6%88%90%E7%94%B0?authuser=0#h.223f3u4ckwj3"
      },
      {
        name: "南成田飛行場",
        x: 1525,
        z: -1756,
        icon: airportUserIcon,
        image: "./images/screenshot/airport_minaminarita.webp",
        description: "南成田に設置されている飛行場。<br>広大な土地を有しているが現在未稼働。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E5%8D%97%E6%88%90%E7%94%B0?authuser=0#h.gw5nwdyjkdh8"
      },
      {
        name: "成田重工業株式会社 車輛整備工場",
        x: 1196,
        z: -1699,
        icon: carGarageIcon,
        image: "./images/screenshot/car_garage_narita.webp",
        description: "成田重工業株式会社が運営する車輛整備工場。<br>車輛の修理、改造を行っている。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E5%8D%97%E6%88%90%E7%94%B0?authuser=0#h.9uyg9ndwywzd"
      },
      {
        name: "kig貿易店",
        x: 1207,
        z: -1538,
        icon: tradeCenterIcon,
        image: "./images/screenshot/kigtrade.webp",
        description: "きぐ/kig16 が運営する貿易店。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E5%8D%97%E6%88%90%E7%94%B0?authuser=0#h.becnr8d6tqlv"
      },
      {
        name: "黒レンガ魔法店",
        x: 1082,
        z: -1448,
        icon: magicShopIcon,
        image: "./images/screenshot/black_brick_magic.webp",
        description: "しらす/cirrus9289 が運営する魔法店。<br>様々な魔道具を取り扱っているほか、竜鋼の受注も行っている。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E5%8D%97%E6%88%90%E7%94%B0?authuser=0#h.e83vqsruhxpn"
      },
      {
        name: "霊力研究所",
        x: 1200,
        z: -1450,
        icon: magicShopIcon,
        image: "./images/screenshot/element_raboratory.webp",
        description: "しらす/cirrus9289 が運営する漆魔法研究所。<br>店内に霊力充填機が設置されている。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E5%8D%97%E6%88%90%E7%94%B0?authuser=0#h.p4635ao37hsp"
      },

      //轟谷
      {
        name: "轟谷駅",
        x: 609,
        z: 601,
        icon: stationOfficalIcon,
        image: "./images/screenshot/gouya_station.webp",
        description: "轟谷の鉄道駅。<br>生命線の終着点。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E8%BD%9F%E8%B0%B7?authuser=0#h.tnckicmzchke"
      },

      //新天台

      {
        name: "新天台フェリーターミナル",
        x: -1900,
        z: 368,
        icon: ferryTerminalOfficalIcon,
        image: "./images/screenshot/ferry_shintendai.webp",
        description: "新天台に設置されているフェリーターミナル。<br>現在黒輪行きの小型船が発着している。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E5%90%84%E7%94%BA%E6%83%85%E5%A0%B1/%E6%96%B0%E5%A4%A9%E5%8F%B0?authuser=0#h.qn3cqxfbf4l5"
      },

      //町域外

      {
        name: "春野駅",
        x: -55,
        z: 559,
        icon: stationOfficalIcon,
        image: "./images/screenshot/haruno_station.webp",
        description: "生命線の停車駅の一つ。<br>どの町域にも属さない小規模な駅。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E7%94%BA%E5%9F%9F%E5%A4%96%E6%96%BD%E8%A8%AD?authuser=0#h.nmmjii3xlwc1"
      },
      {
        name: "ぽの農場前駅",
        x: -356,
        z: 473,
        icon: stationOfficalIcon,
        image: "./images/screenshot/ponofarm_station.webp",
        description: "海岸線の停車駅の一つ。<br>目の前にぽの農場がある小規模な駅。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E7%94%BA%E5%9F%9F%E5%A4%96%E6%96%BD%E8%A8%AD?authuser=0#h.i30okxrtmjn2"
      },
      {
        name: "穂樽海岸駅",
        x: -527,
        z: 525,
        icon: stationOfficalIcon,
        image: "./images/screenshot/hotarusea_station.webp",
        description: "海岸線の停車駅の一つ。<br>下の砂浜にはカメがたくさんいる。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E7%94%BA%E5%9F%9F%E5%A4%96%E6%96%BD%E8%A8%AD?authuser=0#h.v8rppz69zh2v"
      },
      {
        name: "汐見入口駅",
        x: -896,
        z: 700,
        icon: stationOfficalIcon,
        image: "./images/screenshot/shiomien_station.webp",
        description: "海岸線の停車駅の一つ。<br>汐見と穂樽の間に位置する。",
        url: "https://sites.google.com/view/yosenabekeizai-wiki/%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E6%83%85%E5%A0%B1/%E3%83%9E%E3%83%83%E3%83%97%E6%83%85%E5%A0%B1/%E7%94%BA%E5%9F%9F%E5%A4%96%E6%96%BD%E8%A8%AD?authuser=0#h.14zlofo53sx8"
      }
    ];

    var allMarker = [];

    markerDataList.forEach(function (data) {

      var popupHTML = `
          <image src="${data.image}" alt="${data.name}" style="max-width:100%;height:auto;"><br>
          <h3>${data.name}</h3>
          <p>${data.description}<br></p>
          <div class="coord"><span><b>座標: X=${data.x}, Z=${data.z}</b></span><a href=${data.url} target="_blank" class="right">wikiで詳細を見る</a></div>
        `

      var marker = L.marker(convertCoord(data.x, data.z), {icon: data.icon} )
        .addTo(map)
        .bindPopup(popupHTML)
        .bindTooltip(data.name, {
          direction: 'right',
          offset: [10, 0],
          sticky: true
        })

      allMarker.push(marker);
    });

  }
}

//ライン
{

  //ラインの太さ
  var lineWeight = 5;
  //ラインの透明度
  var lineOpacity = 0.9;
  //塗りつぶしの透明度
  var fillOpacity = 0.1;

  //黒輪

  var kurowaPoly = L.polygon([
      convertCoord(-255, -76),
      convertCoord(-477, -76),
      convertCoord(-477, 45),
      convertCoord(-310, 45),
      convertCoord(-310, 372),
      convertCoord(200, 372),
      convertCoord(200, 575),
      convertCoord(331, 575),
      convertCoord(331, 894),
      convertCoord(440, 894),
      convertCoord(440, -23),
      convertCoord(-255, -23)
    ], {
      color: 'red',
      weight: lineWeight,
      opacity: lineOpacity,
      fillOpacity: fillOpacity,
      noClip: true,
      smoothFactor: 2.0
    }).addTo(map);
  kurowaPoly.bindTooltip("<b>黒輪</b>", {
    permanent: true,
    direction: "center",
    className: "line-label"
  });

  //白木

  var shirakiPoly = L.polygon([
      convertCoord(-186, 822),
      convertCoord(323, 822),
      convertCoord(323, 1010),
      convertCoord(402, 1010),
      convertCoord(402, 1401),
      convertCoord(-186, 1401)
    ], {
      color: 'white',
      weight: lineWeight,
      opacity: lineOpacity,
      fillOpacity: fillOpacity,
      noClip: true,
      smoothFactor: 2.0
    }).addTo(map);
  shirakiPoly.bindTooltip("<b>白木</b>", {
    permanent: true,
    direction: "center",
    className: "line-label"
  });

  //穂樽

  var hotaruPoly = L.polygon([
      convertCoord(-399, 1027),
      convertCoord(-875, 1027),
      convertCoord(-875, 583),
      convertCoord(-401, 583)
    ], {
      color: 'lime',
      weight: lineWeight,
      opacity: lineOpacity,
      fillOpacity: fillOpacity,
      noClip: true,
      smoothFactor: 2.0
    }).addTo(map);
  hotaruPoly.bindTooltip("<b>穂樽</b>", {
    permanent: true,
    direction: "center",
    className: "line-label"
  });

  //猫ノ原

  var nekonoharaPoly = L.polygon([
      convertCoord(-797, 1247),
      convertCoord(-560, 1247),
      convertCoord(-560, 1415),
      convertCoord(-797, 1415)
    ], {
      color: 'black',
      weight: lineWeight,
      opacity: lineOpacity,
      fillOpacity: fillOpacity,
      noClip: true,
      smoothFactor: 2.0
    }).addTo(map);
  nekonoharaPoly.bindTooltip("<b>猫ノ原</b>", {
    permanent: true,
    direction: "center",
    className: "line-label"
  });

  //蔵太

  var kurafutoPoly = L.polygon([
      convertCoord(-964, 1733),
      convertCoord(-964, 2293),
      convertCoord(-306, 2293),
      convertCoord(-306, 1733),
    ], {
      color: 'dodgerblue',
      weight: lineWeight,
      opacity: lineOpacity,
      fillOpacity: fillOpacity,
      noClip: true,
      smoothFactor: 2.0
    }).addTo(map);
  kurafutoPoly.bindTooltip("<b>蔵太</b>", {
    permanent: true,
    direction: "center",
    className: "line-label"
  });

  //南成田

  var minaminaritaPoly = L.polygon([
      convertCoord(938, -1113),
      convertCoord(938, -1450),
      convertCoord(776, -1450),
      convertCoord(776, -2634),
      convertCoord(1762, -2634),
      convertCoord(1762, -1113),
    ], {
      color: 'limegreen',
      weight: lineWeight,
      opacity: lineOpacity,
      fillOpacity: fillOpacity,
      noClip: true,
      smoothFactor: 2.0
    }).addTo(map);
  minaminaritaPoly.bindTooltip("<b>南成田</b>", {
    permanent: true,
    direction: "center",
    className: "line-label"
  });

  //汐見

  var shiomiPoly = L.polygon([
      convertCoord(-1285, 616),
      convertCoord(-957, 616),
      convertCoord(-957, 961),
      convertCoord(-1285, 961)
    ], {
      color: 'darkblue',
      weight: lineWeight,
      opacity: lineOpacity,
      fillOpacity: fillOpacity,
      noClip: true,
      smoothFactor: 2.0
    }).addTo(map);
  shiomiPoly.bindTooltip("<b>汐見</b>", {
    permanent: true,
    direction: "center",
    className: "line-label"
  });

  //轟谷

  var gouyaPoly = L.polygon([
      convertCoord(457, 844),
      convertCoord(457, 388),
      convertCoord(1018, 388),
      convertCoord(1018, 844)
    ], {
      color: 'darkred',
      weight: lineWeight,
      opacity: lineOpacity,
      fillOpacity: fillOpacity,
      noClip: true,
      smoothFactor: 2.0
    }).addTo(map);
  gouyaPoly.bindTooltip("<b>轟谷</b>", {
    permanent: true,
    direction: "center",
    className: "line-label"
  });

  //新天台

  var shintendaiPoly = L.polygon([
      convertCoord(-1858, 471),
      convertCoord(-2077, 471),
      convertCoord(-2077, 310),
      convertCoord(-1858, 310)
    ], {
      color: 'yellow',
      weight: lineWeight,
      opacity: lineOpacity,
      fillOpacity: fillOpacity,
      noClip: true,
      smoothFactor: 2.0
    }).addTo(map);
  shintendaiPoly.bindTooltip("<b>新天台</b>", {
    permanent: true,
    direction: "center",
    className: "line-label"
  });
}

map.on('click', function(e) {
  var gameZ = Math.floor(e.latlng.lat) * -1;
  var gameX = Math.floor(e.latlng.lng);

    // ブラウザの「開発者ツール」の「コンソール」に座標が表示されます
    console.log("クリックした座標: X=" + gameX + ", Z=" + gameZ);
});

var displayZoom = 0;
var mapContainer = map.getContainer();
var changedPin = true;

function updatePinVisibility()
{
  var zoomLevel = map.getZoom();
  console.log(zoomLevel);
  //ズーム倍率がdisplayZoom以上時の処理
  if (zoomLevel >= displayZoom)
  {
      console.log("false");
      changedPin = true;
      //ピンを表示
      allMarker.forEach(marker =>
      {
        if (!map.hasLayer(marker))
        {
          map.addLayer(marker);
        }
      });
      L.DomUtil.addClass(mapContainer, 'zoom-labels-hidden');
      L.DomUtil.addClass(mapContainer, 'map-pixelated');

  }
  //ズーム倍率がdisplayZoom未満時の処理
  else
  {
      console.log("true");
      changedPin = false;
      //ピンを非表示
      allMarker.forEach(marker =>
      {
        if (map.hasLayer(marker))
        {
          map.removeLayer(marker);
        }
      });
      //ラインラベルを表示
      L.DomUtil.removeClass(mapContainer, 'zoom-labels-hidden');
      L.DomUtil.removeClass(mapContainer, 'map-pixelated');
  }
}

function convertCoord(x, z)
{
  return [z * -1, x]
}

//スピナー要素を取得
var loader = L.DomUtil.get('loader');
var loadTimer = null;

//ローダーの状態を強制リセットする関数
function resetLoader() {
  if (loadTimer) {
    clearTimeout(loadTimer);
    loadTimer = null;
  }
  loader.style.display = 'none';
}

//読み込み開始時の処理
function handleLoading() {
  //既にタイマーが動いていたらリセット（重複防止）
  if (loadTimer) {
    clearTimeout(loadTimer);
  }
  //指定秒後にスピナーを表示するタイマーをセット
  loadTimer = setTimeout(function() {
    loader.style.display = 'flex';
  }, 3000); //ミリ秒単位
}

//読み込み完了時の処理
function handleLoad() {
  resetLoader(); //完了したらタイマー解除して非表示
}

tileLayer.on('loading', handleLoading);
tileLayer.on('load', handleLoad);

inZoomTileLayer.on('loading', handleLoading);
inZoomTileLayer.on('load', handleLoad);

// タイル切り替えのズーム倍率
var zoomTileLayer = 0;

function updateTileLayer() {
  var zoomLevel = map.getZoom();
  console.log("Zoom Level:", zoomLevel);

  //ズーム倍率が zoomTileLayer 以上の場合
  if (zoomLevel >= zoomTileLayer) {
    //既にinZoomTileLayerが表示されているなら何もしない（無駄な処理防止）
    if (map.hasLayer(inZoomTileLayer)) return;

    console.log("Switching to High-Res Layer");

    //切り替え前にローダーをリセット
    resetLoader();

    map.removeLayer(tileLayer);
    inZoomTileLayer.addTo(map);
  }
  //ズーム倍率がzoomTileLayer未満の場合
  else {
    //既にtileLayerが表示されているなら何もしない
    if (map.hasLayer(tileLayer)) return;

    console.log("Switching to Low-Res Layer");

    //切り替え前にローダーをリセット
    resetLoader();

    map.removeLayer(inZoomTileLayer);
    tileLayer.addTo(map);
  }
}

//マップがズームされた時にピンの表示/非表示を更新
map.on('zoomend', updatePinVisibility);
map.on('zoomend', updateTileLayer);

// 初期表示時にピンの表示/非表示を設定
updatePinVisibility();
updateTileLayer();


// 右上 ('topright') に配置する空のコントロールを作成
var coordControl = L.control({ position: 'topright' });

// コントロールが地図に追加される時の処理
coordControl.onAdd = function() {
    // div要素を作成し、style.cssで定義したクラス 'coordinate-box' を付与
    this._div = L.DomUtil.create('div', 'coordinate-box');

    // 初期表示のテキスト
    this.update();
    return this._div;
};

// 中身を更新する関数を定義
coordControl.update = function(htmlContent) {
    if (htmlContent) {
        this._div.innerHTML = htmlContent;
        this._div.style.display = 'block'; // 内容がある時は表示
    } else {
        this._div.innerHTML = 'マウスをマップに合わせてください'; // 案内文（お好みで）
        // または this._div.style.display = 'none'; // マウスが外れたら消す場合
    }
};

// マップに追加
coordControl.addTo(map);

// 連続して呼ばれる関数を、指定した時間（limit）に1回だけ実行するように制限する
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

//マウスの移動を検知し座標を表示
map.on('mousemove', throttle(function(e) {
    // 座標を計算 (Y=Z, X=X のルール)
    var gameZ = Math.floor(e.latlng.lat) * -1;
    var gameX = Math.floor(e.latlng.lng);

    // 表示するHTMLを作成
        var html = 'Z=' + gameZ + ', X=' + gameX;

    // ★右上のコントロールを更新
    coordControl.update(html);
}), 250); // 指定ミリ秒に1回だけ実行
