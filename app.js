const express = require("express");
require("dotenv").config();

const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY; // .envからAPIキーを取得
const { google } = require("googleapis");
const app = express();
const port = process.env.PORT || 3001;

const html = `<!DOCTYPE html>
<html>
  <head>
    <title>わかばのみち</title>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
    <style>
      @import url("https://p.typekit.net/p.css?s=1&k=vnd5zic&ht=tk&f=39475.39476.39477.39478.39479.39480.39481.39482&a=18673890&app=typekit&e=css");
      @font-face {
        font-family: "neo-sans";
        src: url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"),
            url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff"),
            url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("opentype");
        font-style: normal;
        font-weight: 700;
      }
      html, body {
        font-family: neo-sans;
        font-weight: 700;
        font-size: 32px;
        height: 100%;
        margin: 0;
        padding: 0;
      }
      body {
        background: white;
      }
      #map {
        height: 400px;
        width: 90%;
        margin: 0 auto;
      }
      section {
        padding: 1em;
        text-align: center;
      }
      #saveButton {
        display: block;
        margin: 1em auto;
        padding: 0.5em 1em;
        font-size: 1em;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
      }
      #saveButton:hover {
        background-color: #45a049;
      }
    </style>
  </head>
  <body>
    <section>
      <p>
        「わかばのみち」は、通りにくい道や整備されていない道を知りたい免許を取ったばかりの大学生向けのMAPアプリです。これは、道に口コミを残したり、その口コミを見たりすることができ、既存のMAPアプリとは違って、運転手主観のリアルな評価が備わっているものです。
      </p>
      <p>from オタクは残酷だが正しい</p>
    </section>
    
    <div id="map"></div>
    <button id="saveButton">この場所を保存</button>

    <script async defer src="https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&callback=initMap"></script>

    <script>
      let map;
      let currentMarker = null; // 現在のマーカーを保持
      const markerData = [
        { name: 'つくば市', lat: 36.11159009499647, lng: 140.1043326938361 },
        { name: '小川町駅', lat: 35.6951212, lng: 139.76610649999998 },
        { name: '淡路町駅', lat: 35.69496, lng: 139.76746000000003 },
        { name: '御茶ノ水駅', lat: 35.6993529, lng: 139.76526949999993 },
        { name: '神保町駅', lat: 35.695932, lng: 139.75762699999996 },
        { name: '新御茶ノ水駅', lat: 35.696932, lng: 139.76543200000003 }
      ];

      function initMap() {
        const mapLatLng = new google.maps.LatLng(36.11159009499647, 140.1043326938361);

        map = new google.maps.Map(document.getElementById("map"), {
          center: mapLatLng,
          zoom: 15,
          mapTypeId: "roadmap",
        });

        // 初期マーカーを表示
        markerData.forEach(data => {
          placeMarker(new google.maps.LatLng(data.lat, data.lng), data.name);
        });

        // マップをクリックしたときにマーカーを移動
        map.addListener("click", (e) => {
          if (currentMarker) {
            currentMarker.setPosition(e.latLng); // 現在のマーカーを新しい位置に移動
          } else {
            currentMarker = placeMarker(e.latLng); // 新しいマーカーを作成
          }
        });

        // 決定ボタンをクリックしたときにマーカーを保存
        document.getElementById("saveButton").addEventListener("click", saveMarker);
      }

      function placeMarker(latLng, title) {
        const marker = new google.maps.Marker({
          position: latLng,
          map: map,
          title: title || '新しいマーカー',
        });

        return marker; // 作成したマーカーを返す
      }

      function saveMarker() {
        if (currentMarker) {
          const markerPosition = currentMarker.getPosition();
          markerData.push({
            lat: markerPosition.lat(),
            lng: markerPosition.lng(),
          });

          console.log("Markers saved:", markerData);

          // 現在のマーカーをリセット
          currentMarker.setMap(null);
          currentMarker = null;
        } else {
          alert("まずマーカーを置いてください。");
        }
      }
    </script>
  </body>
</html>
`;

app.get("/", (req, res) => res.type("html").send(html));

const server = app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
