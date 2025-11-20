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

var tileLayer = L.tileLayer('tiles/{z}/{x}/{y}.webp', {
  attribution: '崎島経済サーバーマップ',
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
  attribution: '崎島経済サーバーマップ',
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

  //ピン立て
  {
    var markerDataList = [

      //黒輪

      {
        name: "初期スポーン地点",
        x: 126,
        z: 255,
        icon: grayIcon,
        image: "./images/spawn_point.webp",
        description: "このサーバーの初期スポーン地点。<br>\
                      スポーン後、後ろを向くとチュートリアルを開始するための書見台が置いてある。"
      },
      {
        name: "黒輪駅",
        x: -10,
        z: 161,
        icon: grayIcon,
        description: "黒輪の鉄道駅。<br>多数の路線が発着している。"
      },
      {
        name: "黒輪ゲート施設",
        x: 39,
        z: 174,
        icon: grayIcon,
        description: "黒輪に設置されているゲート施設。<br>すべてのディメンジョンゲートが設置されている。"
      },
      {
        name: "黒輪飛行場",
        x: 336,
        z: 462,
        icon: grayIcon,
        description: "黒輪に設置されている飛行場。<br>広大な土地を有しているが現在未稼働。"
      },
      {
        name: "黒輪自動車学校",
        x: -30,
        z: 103,
        icon: grayIcon,
        description: "黒輪に設置されている自動車学校。<br>免許試験を受けることができ、練習も自由に行える。"
      },
      {
        name: "高速道路 黒輪IC",
        x: -89,
        z: 93,
        icon: grayIcon,
        description: "高速道路の黒輪インターチェンジ。"
      },
      {
        name: "CESSO Express 黒輪店",
        x: -115,
        z: 311,
        icon: grayIcon,
        description: "公共インフラとして運営されているガソリンスタンド。<br>セルフサービス式で24時間営業。"
      },
      {
        name: "DOSMO ドスモ石油 黒輪店",
        x: -228,
        z: 347,
        icon: grayIcon,
        description: "公共インフラとして運営されているガソリンスタンド。<br>小型車のみが使用できる。"
      },
      {
        name: "黒輪フェリーターミナル",
        x: -295,
        z: -19,
        icon: grayIcon,
        description: "黒輪に設置されているフェリーターミナル。<br>現在新天台行きの小型船が発着している。"
      },
      {
        name: "天狗の酒場 人狩行こうぜ!!",
        x: 48,
        z: 256,
        icon: grayIcon,
        description: "黒輪にある無料宿泊場。<br>人狩りを推奨しているが、実際には普通の酒場である。"
      },
      {
        name: "雑貨店 pono",
        x: -119,
        z: 258,
        icon: purpleIcon,
        description: "ポノポノ/ponopono1103 が運営する雑貨店。<br>飲食品やその他消耗品の他、魔法関係の対応も行っている。"
      },
      {
        name: "白猫だんぼーる るなるんらいと",
        x: -190,
        z: 300,
        icon: purpleIcon,
        description: "クラフちゃん/Crafchan が運営する魔法店。<br>魔法依頼チケットを取り扱っている他、冒険で拾ってきたであろうアイテムの販売ガチャが置いてある。"
      },
      {
        name: "cafe&magic shop aomochi",
        x: 63,
        z: 194,
        icon: purpleIcon,
        description: "みずもち/ao_mochi が運営するカフェ兼魔法店。"
      },

      //白木

      {
        name: "白木駅",
        x: -32,
        z: 876,
        icon: grayIcon,
        description: "白木の鉄道駅。<br>町長が寝落ちした時のためのコマンドブロックがある。"
      },
      {
        name: "白木アドミンショップ",
        x: -21,
        z: 886,
        icon: grayIcon,
        description: "白木に設置されているアドミンショップ。<br>バニラ作物、Farmer's Delightの作物、漆modの作物を売却することができる。"
      },
      {
        name: "CESSO Express 白木店",
        x: 29,
        z: 847,
        icon: grayIcon,
        description: "公共インフラとして運営されているガソリンスタンド。<br>セルフサービス式で24時間営業。"
      },
      {
        name: "白木蔵",
        x: -101,
        z: 1020,
        icon: greenIcon,
        description: "白木町が運営する一次生産品の保管用蔵。<br>町民であれば誰でも保管、消費が可能。"
      },
      {
        name: "白木台盤所",
        x: -72,
        z: 1019,
        icon: greenIcon,
        description: "白木町が運営する公共キッチン。<br>一回300円で利用可能で、町民は無料。"
      },
      {
        name: "Tricorne とんがり帽子",
        x: -74,
        z: 979,
        icon: purpleIcon,
        description: "こけ/k0kesam が運営する魔法店。<br>様々な魔道具を取り扱っている。"
      },

      //穂樽

      {
        name: "穂樽駅",
        x: -456,
        z: 835,
        icon: grayIcon,
        description: "穂樽の鉄道駅。<br>地下鉄のみが発着する。"
      },
      {
        name: "穂樽ゲート施設",
        x: -486,
        z: 840,
        icon: grayIcon,
        description: "穂樽に設置されているゲート施設。<br>ミラーオーバーワールド、ネザーのゲートが設置されている。"
      },
      {
        name: "穂樽アドミンショップ",
        x: -418,
        z: 906,
        icon: grayIcon,
        description: "穂樽に設置されているアドミンショップ。<br>高額商品の購入が可能。"
      },

      //猫ノ原

      {
        name: "猫ノ原アドミンショップ",
        x: -625,
        z: 1390,
        icon: grayIcon,
        description: "猫ノ原に設置されているアドミンショップ。<br>各種鉱石を売却することが可能。<br>なお、<b>売却回数には制限がある。</b>"
      },
      {
        name: "猫草精工本社工場",
        x: -720,
        z: 1325,
        icon: grayIcon,
        description: "猫草精工の本社工場。<br>IE機械を用いた鉱石粉砕をメイン業務として、様々な仕事を行っている。"
      },

      //蔵太

      {
        name: "蔵太駅",
        x: -622,
        z: 2026,
        icon: grayIcon,
        description: "蔵太の鉄道駅。<br>湾を挟んで向こう岸に渡る路線が発着している。"
      },
      {
        name: "プロスタック",
        x: -523,
        z: 1999,
        icon: grayIcon,
        description: "蔵太に設置されているアドミンショップ。<br>石材や自然由来のブロックを売却することが可能。"
      },
      {
        name: "カメリ",
        x: -488,
        z: 1962,
        icon: grayIcon,
        description: "蔵太に設置されているアドミンショップ。<br>各種苗木を売却可能。"
      },

      //南成田

      {
        name: "南成田駅",
        x: 1146,
        z: -1486,
        icon: grayIcon,
        description: "南成田の鉄道駅。"
      },
      {
        name: "アドミンショップ南成田店",
        x: 1079,
        z: -1465,
        icon: grayIcon,
        description: "南成田に設置されているアドミンショップ。"
      },
      {
        name: "南成田ゲート施設",
        x: 1080,
        z: -1495,
        icon: grayIcon,
        description: "南成田に設置されているゲート施設。<br>ミラーオーバーワールドゲートが設置されている。<br><b>ホワイトリスト制になっており、ホワイトリストに入っていない人は利用できない。</b>"
      },
      {
        name: "高速道路 南成田IC",
        x: 1260,
        z: -1677,
        icon: grayIcon,
        description: "高速道路の南成田インターチェンジ。"
      },
      {
        name: "麹浜駅",
        x: 1034,
        z: -1621,
        icon: greenIcon,
        description: "南成田の鉄道駅。"
      },
      {
        name: "穴餅稲荷駅",
        x: 1320,
        z: -1770,
        icon: greenIcon,
        description: "南成田の鉄道駅。<br>ホームのみ存在し、駅舎は未完成。"
      },
      {
        name: "天空橋駅",
        x: 1431,
        z: -1657,
        icon: greenIcon,
        description: "南成田の鉄道駅。"
      },
      {
        name: "白浜横丁駅",
        x: 1017,
        z: -1260,
        icon: greenIcon,
        description: "南成田の鉄道駅。<br>ホームのみ存在し、駅舎は未完成。"
      },
      {
        name: "南成田飛行場",
        x: 1525,
        z: -1756,
        icon: greenIcon,
        description: "南成田に設置されている飛行場。<br>広大な土地を有しているが現在未稼働。"
      },
      {
        name: "成田重工業株式会社 車輛整備工場",
        x: 1196,
        z: -1699,
        icon: blueIcon,
        description: "成田重工業株式会社が運営する車輛整備工場。<br>車輛の修理、改造を行っている。"
      },

      //新天台

      {
        name: "新天台フェリーターミナル",
        x: -1900,
        z: 368,
        icon: grayIcon,
        description: "新天台に設置されているフェリーターミナル。<br>現在黒輪行きの小型船が発着している。"
      }
    ];

    var allMarker = [];

    markerDataList.forEach(function (data) {

      var popupHTML = `
          <image src="${data.image}" alt="${data.name}" style="max-width:100%;height:auto;"><br>
          <h3>${data.name}</h3>
          <p>${data.description}<br><b>座標: Z=${data.z}, X=${data.x}</b></p>
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
      convertCoord(323, 1345),
      convertCoord(-186, 1345)
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
      convertCoord(-808, 1247),
      convertCoord(-581, 1247),
      convertCoord(-581, 1415),
      convertCoord(-808, 1415)
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
      convertCoord(938, -1230),
      convertCoord(938, -1450),
      convertCoord(776, -1450),
      convertCoord(776, -2635),
      convertCoord(1076, -2635),
      convertCoord(1076, -2228),
      convertCoord(1773, -2228),
      convertCoord(1773, -1803),
      convertCoord(1614, -1803),
      convertCoord(1614, -1237),
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

    // 表示するHTML文字列を作成 (step2 で定義したクラス名)
    var coordHtml = '<span class="map-coordinates">' + 'X=' + gameX + ', Z=' + gameZ + '</span>';

    // ★帰属表示コントロール（"Leaflet" の文字）の「前」にHTMLを設定
    map.attributionControl.setPrefix(coordHtml);
}), 250); // 指定ミリ秒に1回だけ実行

//マウスがマップから外れたら表示をリセット
map.on('mouseout', function(e) {
    // ★テキストを空に設定
    map.attributionControl.setPrefix('');
});
