const express = require("express");
const app = express();
const port = process.env.PORT || 3001;

app.get("/", (req, res) => res.type("html").send(html));

//APIキー
//AIzaSyD1NN1tlXmPBxyHPvkgkVE4-NMiAyNj1Bo
const server = app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>わかばのみち</title>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
    <script>
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          disableForReducedMotion: true
        });
      }, 500);
    </script>
    <script src="https://maps.google.com/maps/api/js?key=AIzaSyD1NN1tlXmPBxyHPvkgkVE4-NMiAyNj1Bo&language=ja"></script>
    <style>
      @import url("https://p.typekit.net/p.css?s=1&k=vnd5zic&ht=tk&f=39475.39476.39477.39478.39479.39480.39481.39482&a=18673890&app=typekit&e=css");
      @font-face {
        font-family: "neo-sans";
        src: url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("opentype");
        font-style: normal;
        font-weight: 700;
      }
      html, body {
        font-family: neo-sans;
        font-weight: 700;
        font-size: calc(62rem / 16);
        height: 100%;
        margin: 0;
        padding: 0;
      }
      body {
        background: white;
      }
      #map { height: 90%; width: 90% }
      section {
        border-radius: 1em;
        padding: 1em;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
      }
    </style>
  </head>
  <body>
    <a>
      「わかばのみち」は、通りにくい道や整備されていない道を知りたい免許を取ったばかりの大学生向けのMAPアプリです。
      これは、道に口コミを残したり、その口コミを見たりすることができ、既存のMAPアプリとは違って、運転手主観のリアルな評価が備わっているものです。
      from オタクは残酷だが正しい
    </a>
    <div id="map"></div>

    <script>
    /*
      var MyLatLng = new google.maps.LatLng(36.11159009499647, 140.1043326938361);
      var Options = {
        zoom: 15,      //地図の縮尺値
        center: MyLatLng,    //地図の中心座標
        mapTypeId: 'roadmap'   //地図の種類
      };
      var map = new google.maps.Map(document.getElementById('map'), Options);
    */
      </script>

    <script>
    var map;
    var marker = [];
    var infoWindow = [];
    var markerData = [ // マーカーを立てる場所名・緯度・経度
      {
          name: 'つくば市',
          lat: 36.11159009499647,
            lng: 140.1043326938361,
            //icon: 'tam.png' // TAM 東京のマーカーだけイメージを変更する
    }, {
            name: '小川町駅',
        lat: 35.6951212,
            lng: 139.76610649999998
    }, {
            name: '淡路町駅',
        lat: 35.69496,
          lng: 139.76746000000003
    }, {
            name: '御茶ノ水駅',
            lat: 35.6993529,
            lng: 139.76526949999993
    }, {
            name: '神保町駅',
        lat: 35.695932,
        lng: 139.75762699999996
    }, {
            name: '新御茶ノ水駅',
          lat: 35.696932,
        lng: 139.76543200000003
    }
    ];
    
    function initMap() {
    // 地図の作成
        var mapLatLng = new google.maps.LatLng({lat: markerData[0]['lat'], lng: markerData[0]['lng']}); // 緯度経度のデータ作成
      map = new google.maps.Map(document.getElementById('map'), { // #mapに地図を埋め込む
        center: mapLatLng, // 地図の中心を指定
          zoom: 15 // 地図のズームを指定
          mapTypeId: 'roadmap'   //地図の種類
      });
    
    // マーカー毎の処理
    for (var i = 0; i < markerData.length; i++) {
            markerLatLng = new google.maps.LatLng({lat: markerData[i]['lat'], lng: markerData[i]['lng']}); // 緯度経度のデータ作成
            marker[i] = new google.maps.Marker({ // マーカーの追加
            position: markerLatLng, // マーカーを立てる位置を指定
                map: map // マーカーを立てる地図を指定
          });
    
        infoWindow[i] = new google.maps.InfoWindow({ // 吹き出しの追加
            content: '<div class="sample">' + markerData[i]['name'] + '</div>' // 吹き出しに表示する内容
          });
    
        markerEvent(i); // マーカーにクリックイベントを追加
    }
    /*
      marker[0].setOptions({// TAM 東京のマーカーのオプション設定
            icon: {
            url: markerData[0]['icon']// マーカーの画像を変更
          }
      });*/
    }
    
    // マーカーにクリックイベントを追加
    function markerEvent(i) {
        marker[i].addListener('click', function() { // マーカーをクリックしたとき
          infoWindow[i].open(map, marker[i]); // 吹き出しの表示
      });
    }
    </script>
  </body>
</html>
`;
