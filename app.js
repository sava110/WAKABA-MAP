const express = require("express");
const app = express();
const port = process.env.PORT || 3001;

app.get("/", (req, res) => res.type("html").send(html));

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
    <script type = "text/javascript" src = "apikey.js">const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;<script>
    <script src="https://maps.google.com/maps/api/js?key={googleMapsApiKey}&language=ja"></script>
    
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
        font-size: 32;
        height: 100%;
        margin: 0;
        padding: 0;
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
        padding: 1em;
        text-align: center;
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
    
    <!-- 地図の表示 -->
    <div id="map"></div>

    <script>
      var map;
      var marker = [];
      var infoWindow = [];
      var markerData = [
        { name: 'つくば市', lat: 36.11159009499647, lng: 140.1043326938361 },
        { name: '小川町駅', lat: 35.6951212, lng: 139.76610649999998 },
        { name: '淡路町駅', lat: 35.69496, lng: 139.76746000000003 },
        { name: '御茶ノ水駅', lat: 35.6993529, lng: 139.76526949999993 },
        { name: '神保町駅', lat: 35.695932, lng: 139.75762699999996 },
        { name: '新御茶ノ水駅', lat: 35.696932, lng: 139.76543200000003 }
      ];

      function initMap() {
        var mapLatLng = new google.maps.LatLng({
          lat: markerData[0]['lat'],
          lng: markerData[0]['lng']
        });
        map = new google.maps.Map(document.getElementById('map'), {
          center: mapLatLng,
          zoom: 15,
          mapTypeId: 'roadmap'
        });

        for (var i = 0; i < markerData.length; i++) {
          markerLatLng = new google.maps.LatLng({
            lat: markerData[i]['lat'],
            lng: markerData[i]['lng']
          });
          marker[i] = new google.maps.Marker({
            position: markerLatLng,
            map: map
          });

          infoWindow[i] = new google.maps.InfoWindow({
            content: '<div class="sample">' + markerData[i]['name'] + '</div>'
          });

          markerEvent(i);
        }
      }

      function markerEvent(i) {
        marker[i].addListener('click', function() {
          infoWindow[i].open(map, marker[i]);
        });
      }

      // 地図を初期化
      initMap();
    </script>
  </body>
</html>
`;
