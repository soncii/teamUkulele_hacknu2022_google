import { Loader } from '@googlemaps/js-api-loader';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

var parsedParams = {
  "lat": 27.9744586954417,
  "lng": 86.9327615931465,
  "alt": 0,
  "tmsp": 0,
  "hacc": 0,
  "vacc": 0,
  "act": 0
}
//var loader = new GLTFLoader();
const apiOptions = {
  "apiKey": "AIzaSyC67g8uQzj7e3wzTvGCpyGQ40IYZMCsGnw",
  "version": "beta"
};

const data = require("./data.json")

var mapOptions = {
  "tilt": 65,
  //"heading": ,
  "zoom": 19,
  "center": { lat: 35.65949450000000, lng: 139.6999859000000 },
  "mapId": "f67f84ca88367a26"
}
var form = document.forms['form'];
form.onsubmit = async function (e) {
  e.preventDefault();
  parsedParams.lat = parseFloat(document.getElementById("lat").value);
  parsedParams.lng = parseFloat(document.getElementById("lng").value);
  parsedParams.alt = parseFloat(document.getElementById("alt").value);
  mapOptions.center = { "lat": parsedParams.lat, "lng": parsedParams.lng };
  var map = await initMap();
  initWebGLOverlayView(map);
}

async function initMap() {
  const mapDiv = document.getElementById("map");
  const apiLoader = new Loader(apiOptions);
  await apiLoader.load();
  return new google.maps.Map(mapDiv, mapOptions);
}

function getSphere() {
  const geometry = new THREE.SphereGeometry(1, 64, 32); // (radius, widthSegments, heightSegments)
  const material = new THREE.MeshBasicMaterial({ color: 0x59a4e9, transparent: true, opacity: 0.5 });
  const sphere = new THREE.Mesh(geometry, material);
  return sphere;
}

function initWebGLOverlayView(map) {
  let scene, renderer, camera, loader;
  const webGLOverlayView = new google.maps.WebGLOverlayView();

  var dropdown = document.getElementById("select-profession devs");
  var button = document.getElementById("bnt");

  button.onclick = async (e) => {

    const source = {
      "walking": "./walk.glb",
      "UNKNOWN": "./pin.gltf",
      "cycling": "bike_green.glb",
      "running": "running.glb",
      "driving": "car_red.glb"
    };


    scene.children = scene.children.slice(0, 2)
    e.preventDefault();
    let devnumber = dropdown.value;
    parsedParams = {
      "lat": parseFloat(data[devnumber][0].Latitude),
      "lng": parseFloat(data[devnumber][0].Longitude),
      "alt": parseFloat(data[devnumber][0].Altitude),
      "tmsp": Math.floor(parseInt(data[devnumber][0]["Timestamp"]) / 1000),
      "hacc": parseFloat(data[devnumber][0]["Horizontal accuracy"]),
      "vacc": parseFloat(data[devnumber][0]["Vertical accuracy"]),
      "act": data[devnumber][0]["Activity"],
      "idt": data[devnumber][0]["Identifier"]
    }
    loader.load(
      source[parsedParams.act],
      gltf => {
        if (parsedParams.act === "running") {
          gltf.scene.scale.set(0.5, 0.5, 0.5);
          gltf.scene.rotation.y = 90 * Math.PI / 180;

        } else if (parsedParams.act === "driving") {
          gltf.scene.scale.set(10, 10, 10);
          gltf.scene.rotation.y = 90 * Math.PI / 180;
        }
        else {
          gltf.scene.scale.set(3, 3, 3);
        }

        if (parsedParams.act === "UNKNOWN") {
          gltf.scene.rotation.x = 180 * Math.PI / 180;
          gltf.scene.position.z = 10
        } else
          gltf.scene.rotation.x = 90 * Math.PI / 180; // rotations are in radians
        scene.add(gltf.scene);
      }
    );
    if (data[devnumber][0].Identifier === "null") {
      document.getElementById("identifier").innerHTML = "";
    } else document.getElementById("identifier").innerHTML = "Identifier: " + data[devnumber][0].Identifier + " | ";
    if (parsedParams.act === "UNKNOWN") {
      document.getElementById("activity").innerHTML = "";
    } else document.getElementById("activity").innerHTML = "activity: " + parsedParams.act + " | ";
    if (data[devnumber][0]["Floor label"] === "null") {
      document.getElementById("floor_l").innerHTML = "";
    } else document.getElementById("floor_l").innerHTML = "floor level: " + data[devnumber][0]["Floor label"] + " | ";


    var timestr = {
      "min": Math.floor(parseFloat(parsedParams.tmsp / 60)),
      "sec": parsedParams.tmsp % 60
    };

    var stringtime = "";
    if (timestr.min < 10) stringtime += '0';
    stringtime += timestr.min + ":";
    if (timestr.sec < 10) stringtime += '0';
    stringtime += timestr.sec;
    document.getElementById("timestamp").innerHTML = "time(min:sec): " + stringtime + " | ";

    mapOptions.center = { lat: parsedParams.lat, lng: parsedParams.lng };
    map.moveCamera({
      "tilt": 65,

      "zoom": mapOptions.zoom,
      "center": { lat: parsedParams["lat"], lng: parsedParams["lng"] }
    });

    var sphere = getSphere();

    sphere.scale.set(parsedParams["hacc"], parsedParams["hacc"], parsedParams["vacc"])

    scene.add(sphere)
    if (data[devnumber].length > 1) {
      var maxmintime = parseFloat(data[devnumber][data[devnumber].length - 1].Timestamp) - parseFloat(data[devnumber][0].Timestamp);

    }
    for (let i = 1; i < data[devnumber].length; i++) {
      let idtpr = parsedParams.idt;
      let tmsppr = parsedParams.tmsp * 1000;
      let latpr = parsedParams.lat;
      let lngpr = parsedParams.lng;
      parsedParams = {
        "lat": parseFloat(data[devnumber][i].Latitude),
        "lng": parseFloat(data[devnumber][i].Longitude),
        "alt": parseFloat(data[devnumber][i].Altitude),
        "tmsp": Math.floor(parseInt(data[devnumber][i]["Timestamp"]) / 1000),
        "hacc": parseFloat(data[devnumber][i]["Horizontal accuracy"]),
        "vacc": parseFloat(data[devnumber][i]["Vertical accuracy"]),
        "act": data[devnumber][i]["Activity"],
        "idt": data[devnumber][i]["Identifier"]
      };

      if (parsedParams.idt != idtpr) {
        alert("Change of actor: from " + idtpr + " to " + parsedParams.idt + " ");
      }
      if (data[devnumber][i].Identifier === "null") {
        document.getElementById("identifier").innerHTML = "";
      } else document.getElementById("identifier").innerHTML = "Identifier: " + data[devnumber][i].Identifier + " | ";
      if (parsedParams.act === "UNKNOWN") {
        document.getElementById("activity").innerHTML = "";
      } else document.getElementById("activity").innerHTML = "activity: " + parsedParams.act + " | ";
      if (data[devnumber][i]["Floor label"] === "null") {
        document.getElementById("floor_l").innerHTML = "";
      } else document.getElementById("floor_l").innerHTML = "floor level: " + data[devnumber][i]["Floor label"] + " | ";
      var timestr = {
        "min": Math.floor(parseFloat(parsedParams.tmsp / 60)),
        "sec": parsedParams.tmsp % 60
      };

      stringtime = "";
      if (timestr.min < 10) stringtime += '0';
      stringtime += timestr.min + ":";
      if (timestr.sec < 10) stringtime += '0';
      stringtime += timestr.sec;
      document.getElementById("timestamp").innerHTML = "time(min:sec): " + stringtime + " | ";
      mapOptions.center = { lat: parsedParams.lat, lng: parsedParams.lng };
      sphere.scale.set(parsedParams["hacc"], parsedParams["hacc"], parsedParams["vacc"])
      scene.add(sphere);
      let diffx = (parsedParams.lat - latpr) / 70;
      let diffy = (parsedParams.lng - lngpr) / 70;
      for (let j = 0; j < 70; j++) {
        latpr += diffx;
        lngpr += diffy;
        mapOptions.center = { lat: latpr, lng: lngpr };
        sphere.scale.set(parsedParams["hacc"], parsedParams["hacc"], parsedParams["vacc"]);
        map.moveCamera({
          "tilt": map.getTilt(),
          "heading": map.getHeading(),
          "zoom": map.getZoom(),
          "center": { lat: latpr, lng: lngpr }
        });
        await new Promise(r => setTimeout(r, 10));
      };
    }

  }


  webGLOverlayView.onAdd = () => {
    // set up the scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera();
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75); // soft white light
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.25);
    directionalLight.position.set(0.5, -1, 0.5);
    scene.add(directionalLight);
    loader = new GLTFLoader();

  }

  webGLOverlayView.onContextRestored = ({ gl }) => {
    // create the three.js renderer, using the
    // maps's WebGL rendering context.
    renderer = new THREE.WebGLRenderer({
      canvas: gl.canvas,
      context: gl,
      ...gl.getContextAttributes(),
    });
    renderer.autoClear = false;

    var sphere = getSphere();
    sphere.scale.set(1, 1, 1);
    scene.add(sphere);

    loader.manager.onLoad = () => {
      renderer.setAnimationLoop(() => {
        map.moveCamera({
          "tilt": map.getTilt(),
          "heading": map.getHeading(),
          "zoom": map.getZoom(),
          "center": mapOptions.center
        });

        renderer.setAnimationLoop(null)

      });
    }
  }

  webGLOverlayView.onDraw = ({ gl, transformer }) => {
    // update camera matrix to ensure the model is georeferenced correctly on the map
    var latLngAltitudeLiteral = {
      lat: mapOptions.center.lat,
      lng: mapOptions.center.lng,
      altitude: 0
    }

    const matrix = transformer.fromLatLngAltitude(latLngAltitudeLiteral);
    camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix);

    webGLOverlayView.requestRedraw();
    renderer.render(scene, camera);

    // always reset the GL state
    renderer.resetState();
  }
  webGLOverlayView.setMap(map);
}

(async () => {
  const map = await initMap();
  initWebGLOverlayView(map);
})();