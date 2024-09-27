const express = require("express");
require("dotenv").config();

const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY; // .env縺九ｉAPI繧ｭ繝ｼ繧貞叙蠕�
const { google } = require("googleapis"); // 菫ｮ豁｣: require縺ｫ謌ｻ縺励∪縺励◆
const app = express();
const port = process.env.PORT || 3001;

const html = `<!DOCTYPE html>
<html>
  <head>
    <title>繧上°縺ｰ縺ｮ縺ｿ縺｡</title>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
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
        font-size: 32px; /* 菫ｮ豁｣: font-size縺ｫ蜊倅ｽ阪ｒ霑ｽ蜉� */
        height: 100%;
        margin: 0;
        padding: 0;
      }
      body {
        background: white;
      }
      #map {
        height: 400px; /* 蝨ｰ蝗ｳ縺ｮ鬮倥＆繧呈欠螳� */
        width: 90%; /* 蟷�繧�90%縺ｫ */
        margin: 0 auto; /* 荳ｭ螟ｮ縺ｫ蟇�縺帙ｋ */
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
        縲後ｏ縺九�ｰ縺ｮ縺ｿ縺｡縲阪�ｯ縲�騾壹ｊ縺ｫ縺上＞驕薙ｄ謨ｴ蛯吶＆繧後※縺�縺ｪ縺�驕薙ｒ遏･繧翫◆縺�蜈崎ｨｱ繧貞叙縺｣縺溘�ｰ縺九ｊ縺ｮ螟ｧ蟄ｦ逕溷髄縺代�ｮMAP繧｢繝励Μ縺ｧ縺吶ゅ％繧後�ｯ縲�驕薙↓蜿｣繧ｳ繝溘ｒ谿九＠縺溘ｊ縲√◎縺ｮ蜿｣繧ｳ繝溘ｒ隕九◆繧翫☆繧九％縺ｨ縺後〒縺阪∵里蟄倥�ｮMAP繧｢繝励Μ縺ｨ縺ｯ驕輔▲縺ｦ縲�驕玖ｻ｢謇倶ｸｻ隕ｳ縺ｮ繝ｪ繧｢繝ｫ縺ｪ隧穂ｾ｡縺悟ｙ繧上▲縺ｦ縺�繧九ｂ縺ｮ縺ｧ縺吶�
      </p>
      <p>from 繧ｪ繧ｿ繧ｯ縺ｯ谿矩�ｷ縺�縺梧ｭ｣縺励＞</p>
    </section>
    
    <!-- 蝨ｰ蝗ｳ縺ｮ陦ｨ遉ｺ -->
    <div id="map"></div>
    <!-- 繝槭�ｼ繧ｫ繝ｼ菫晏ｭ倡畑縺ｮ豎ｺ螳壹�懊ち繝ｳ -->
    <button id="saveButton">縺薙�ｮ蝣ｴ謇繧剃ｿ晏ｭ�</button>

    <!-- Google Maps API縺ｮ繧ｹ繧ｯ繝ｪ繝励ヨ繧ｿ繧ｰ繧貞沂繧∬ｾｼ繧 -->
    <script async defer src="https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&callback=initMap"></script>

    <script>
      let map;
      let marker = null; // 迴ｾ蝨ｨ縺ｮ繝槭�ｼ繧ｫ繝ｼ繧剃ｿ晏ｭ倥☆繧句､画焚
      const markerData = []; // 菫晏ｭ倥＆繧後◆繝槭�ｼ繧ｫ繝ｼ縺ｮ繝ｪ繧ｹ繝�

      function initMap() {
        const mapLatLng = new google.maps.LatLng(36.11159009499647, 140.1043326938361); // 蛻晄悄菴咲ｽｮ�ｼ壹▽縺上�ｰ蟶�

        map = new google.maps.Map(document.getElementById("map"), {
          center: mapLatLng,
          zoom: 15,
          mapTypeId: "roadmap",
        });

        // 蛻晄悄繝槭�ｼ繧ｫ繝ｼ繧定｡ｨ遉ｺ
        for (let i = 0; i < markerData.length; i++) {
          placeMarker(new google.maps.LatLng(markerData[i].lat, markerData[i].lng), markerData[i].name);
        }

        // 繝槭ャ繝励ｒ繧ｯ繝ｪ繝�繧ｯ縺励◆縺ｨ縺阪↓繝槭�ｼ繧ｫ繝ｼ繧定ｿｽ蜉�
        map.addListener("click", (e) => {
          placeMarker(e.latLng);
        });

        // 豎ｺ螳壹�懊ち繝ｳ繧偵け繝ｪ繝�繧ｯ縺励◆縺ｨ縺阪↓繝槭�ｼ繧ｫ繝ｼ繧偵Μ繧ｹ繝医↓菫晏ｭ�
        document.getElementById("saveButton").addEventListener("click", saveMarker);
      }

      function placeMarker(latLng, title) {
        if (marker) {
          marker.setMap(null); // 譌｢縺ｫ縺ゅｋ繝槭�ｼ繧ｫ繝ｼ繧貞炎髯､
        }

        marker = new google.maps.Marker({
          position: latLng,
          map: map,
          title: title || '譁ｰ縺励＞繝槭�ｼ繧ｫ繝ｼ', // 繧ｿ繧､繝医Ν繧定ｨｭ螳�
        });

        // 繝槭�ｼ繧ｫ繝ｼ菴咲ｽｮ縺ｫ蝨ｰ蝗ｳ繧堤ｧｻ蜍�
        map.panTo(latLng);
      }

      function saveMarker() {
        if (marker) {
          // 繝槭�ｼ繧ｫ繝ｼ縺ｮ菴咲ｽｮ諠�蝣ｱ繧偵Μ繧ｹ繝医↓菫晏ｭ�
          const markerPosition = marker.getPosition();
          markerData.push({
            lat: markerPosition.lat(),
            lng: markerPosition.lng(),
          });

          console.log("Marker saved:", markerData);

          // 繝槭�ｼ繧ｫ繝ｼ繧偵Μ繧ｻ繝�繝�
          marker.setMap(null);
          marker = null;
        } else {
          alert("縺ｾ縺壹�槭�ｼ繧ｫ繝ｼ繧堤ｽｮ縺�縺ｦ縺上□縺輔＞縲�");
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
