import Feature from "ol/Feature.js";
import Map from "ol/Map.js";
import View from "ol/View.js";
import { OSM, Vector as VectorSource } from "ol/source.js";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer.js";
import Polygon from "ol/geom/Polygon.js";
import { fromLonLat, toLonLat } from "ol/proj.js";
import Style from "ol/style/Style.js";
import Stroke from "ol/style/Stroke.js";
import Fill from "ol/style/Fill.js";
import { getGeoJsonPolygonInfos } from "./geojson.js";

// マップとレイヤーの設定
const raster = new TileLayer({
  source: new OSM(),
});

const source = new VectorSource({ wrapX: false });

const vector = new VectorLayer({
  source: source,
});

const map = new Map({
  layers: [raster, vector],
  target: "map",
  view: new View({
    // 東京中心
    center: fromLonLat([139.6478, 35.738]),
    zoom: 15,
  }),
});

// カーソル位置に該当する座標を表示する関数
map.on("pointermove", function (event) {
  // 緯度経度に変換
  const coordinate = toLonLat(event.coordinate);
  const cursorPosition = document.getElementById("cursorPosition");
  cursorPosition.innerHTML = `Longitude: ${coordinate[0].toFixed(5)}, Latitude: ${coordinate[1].toFixed(5)}`;
});

// クリックしたポリゴンの座標をコンソールに出力する
map.on('click', function (event) {
  map.forEachFeatureAtPixel(event.pixel, function (feature) {
    const geometry = feature.getGeometry();
    if (geometry.getType() === 'Polygon') {
      // ポリゴンの座標を取得
      const coordinates = geometry.getCoordinates()[0];
      // exampleIdの取得
      const exampleId = feature.getProperties().exampleId;
      // 経度・緯度に変換
      const lonLatCoordinates = coordinates.map((coord) => toLonLat(coord));
      console.log("クリックされたポリゴン情報:", lonLatCoordinates);
      console.log("exampleId:", exampleId);
    }
  });
});

// 正方形のポリゴンを追加する関数
function addPolygon() {
  const geoJsonPolygonInfos = getGeoJsonPolygonInfos();

  let coordList = [];
  // 各ポリゴンの座標を適切に処理
  geoJsonPolygonInfos.features.forEach((featureInfo) => {
    let duplicateCoordinateFlg = null;
    const targetCoordinate = featureInfo.geometry.coordinates[0];
    const coords = targetCoordinate.map((coord) => fromLonLat(coord));

    if (coordList.length > 0) {
      coordList.map((coordInList) => {
        // console.log("比較用の座標 : " + coordInList);
        // console.log("対象座標 : " + targetCoordinate);
        if (JSON.stringify(targetCoordinate) == JSON.stringify(coordInList)) {
          duplicateCoordinateFlg = true;
        }
      });
    }

    const polygonFeature = new Polygon([coords]);
    const feature = new Feature(polygonFeature);
    // exampleIdをFeatureのプロパティとして設定
    feature.setProperties({
      exampleId: featureInfo.properties.exampleId,
    });

    // 重なった座標の色を変える
    if (duplicateCoordinateFlg) {
      feature.setStyle(
        new Style({
          fill: new Fill({
            color: "rgba(0, 0, 0)", // 黒
          }),
          stroke: new Stroke({
            color: "rgba(0, 0, 0)", // 黒
            width: 1,
          }),
        })
      );
    } else {
      if (featureInfo.properties.exampleId === "a001") {
        feature.setStyle(
          new Style({
            fill: new Fill({
              color: "rgba(255, 0, 0, 0.8)", // 赤色
            }),
            stroke: new Stroke({
              color: "rgba(0, 0, 0)", // 黒
              width: 1,
            }),
          })
        );
      } else if (featureInfo.properties.exampleId === "b001") {
        feature.setStyle(
          new Style({
            fill: new Fill({
              color: "rgba(35, 120, 250, 0.8)", // 青色
            }),
            stroke: new Stroke({
              color: "rgba(0, 0, 0)", // 黒
              width: 1,
            }),
          })
        );
      } else if (featureInfo.properties.exampleId === "c001") {
        feature.setStyle(
          new Style({
            fill: new Fill({
              color: "rgba(255, 250, 90, 0.8)", // 緑色
            }),
            stroke: new Stroke({
              color: "rgba(0, 0, 0)", // 黒
              width: 1,
            }),
          })
        );
      } else if (featureInfo.properties.exampleId === "r001") {
        feature.setStyle(
          new Style({
            fill: new Fill({
              color: "rgba(255, 50, 120, 0.2)", // ピンク
            }),
            stroke: new Stroke({
              color: "rgba(255, 50, 120, 0.4)", // ピンク
              width: 3,
            }),
          })
        );
      }
    }

    coordList.push(targetCoordinate);
    source.addFeature(feature);
  });
}

// 初期ロード時にポリゴンを追加
addPolygon();
