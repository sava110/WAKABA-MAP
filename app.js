const express = require("express");
const app = express();
const port = process.env.PORT || 3001;

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
    <style>
      @import url("https://p.typekit.net/p.css?s=1&k=vnd5zic&ht=tk&f=39475.39476.39477.39478.39479.39480.39481.39482&a=18673890&app=typekit&e=css");
      @font-face {
        font-family: "neo-sans";
        src: url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("opentype");
        font-style: normal;
        font-weight: 700;
      }
      html {
        font-family: neo-sans;
        font-weight: 700;
        font-size: calc(62rem / 16);
      }
      body {
        background: white;
      }
      #map {
        height: 400px; /* 地図の高さを指定 */
        width: 90%; /* 幅を90%に */
        margin: 0 auto; /* 中央に寄せる */
      }
      section {
        border-radius: 1em;
        padding: 1em;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
        text-align: center;
      }
    </style>
  </head>
  <body>
    <section>
      「わかばのみち」は、通りにくい道や整備されていない道を知りたい免許を取ったばかりの大学生向けのMAPアプリです。
      これは、道に口コミを残したり、その口コミを見たりすることができ、既存のMAPアプリとは違って、運転手主観のリアルな評価が備わっているものです。
      from オタクは残酷だが正しい
    </section>

    <!-- 地図の表示 -->
    <div id="map"></div>
    <!-- マーカー保存用の決定ボタン -->
    <button id="saveButton">この場所を保存</button>

    <script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&callback=initMap"></script>
    <script>
      let map;
      const markers = []; // 複数マーカーを保存するための配列

      function initMap() {
        const initialLocation = { lat: 36.11159009499647, lng: 140.1043326938361 }; // 初期位置：つくば市

        map = new google.maps.Map(document.getElementById("map"), {
          center: initialLocation,
          zoom: 15,
          mapTypeId: "roadmap",
        });

        // マップをクリックしたときにマーカーを追加
        map.addListener("click", (event) => {
          placeMarker(event.latLng);
        });

        // 決定ボタンをクリックしたときにマーカーをリストに保存
        document.getElementById("saveButton").addEventListener("click", saveMarkers);
      }

      function placeMarker(location) {
        const marker = new google.maps.Marker({
          position: location,
          map: map,
        });

        markers.push(marker); // 配列にマーカーを追加
        map.panTo(location); // マーカー位置に地図を移動
      }

      function saveMarkers() {
        if (markers.length === 0) {
          alert("マーカーがまだありません。");
          return;
        }

        const savedMarkers = markers.map(marker => ({
          lat: marker.getPosition().lat(),
          lng: marker.getPosition().lng(),
        }));

        console.log("保存されたマーカー:", savedMarkers);
        alert("マーカーが保存されました。コンソールを確認してください。");
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
