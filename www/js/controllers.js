angular.module('starter.controllers', [])
.controller("appController", function ($http, $scope, $rootScope, $geotrigger, $window, $cordovaCamera, $cordovaSocialSharing) {
  $scope.loading = false;
  $rootScope.currentLocation = { latitude: 0, longitude: 0 };

  $rootScope.youwin = false;
  $rootScope.clues = JSON.parse(window.localStorage.getItem("clues"));
  if (!$rootScope.clues)
    $rootScope.clues = [];

  $rootScope.route = window.localStorage.getItem("route");

  $scope.item = JSON.parse($window.localStorage.getItem("user_profile"));
  $window.localStorage.setItem("user_profile", JSON.stringify($scope.item));

  var watchID = navigator.geolocation.watchPosition(
    function (position) {
      $scope.$apply(function () { $rootScope.currentLocation = position.coords; });
      if ($geotrigger.arcgis)
        $geotrigger.updateLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: 0,
        });
    }, function () { }, { enableHighAccuracy: true });

  $scope.restart = function () {
    $rootScope.route = "route" + Math.floor((Math.random() * 5) + 1);
    window.localStorage.setItem("route", $rootScope.route);
    window.localStorage.setItem("apptags", JSON.stringify([$rootScope + "_clue0"]));
    window.localStorage.removeItem("clues");

    $geotrigger.updateTags([$rootScope.route + "_clue0"]);
    $rootScope.clues = [];
  };

  $scope.test = function () {
    $geotrigger.arcgis.request("trigger/run", {
      "tags": [$rootScope.route + "_clue0",
                $rootScope.route + "_clue1",
                $rootScope.route + "_clue2",
                $rootScope.route + "_clue3",
                $rootScope.route + "_clue4",
                $rootScope.route + "_clue5"]
    }, function (error, result) {
      console.log(result);
    });
  };

  $scope.updateposition = function () {
    $scope.loading = true;

    navigator.geolocation.getCurrentPosition(function (position) {
      $scope.$apply(function () {
        $rootScope.currentLocation = position.coords;
        $scope.loading = false;
      });

      $geotrigger.updateLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        altitude: 0,
      });

    }, function (error) { alert(error); }, { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
  };

  $rootScope.takeaSelfie = function () {
    var options = {
      quality: 75,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: true,
      encodingType: Camera.EncodingType.JPEG,
      saveToPhotoAlbum: false
    };

    $cordovaCamera.getPicture(options).then(function (imageData) {
      $cordovaSocialSharing.shareViaTwitter("Caccia al tesoro #gisday #ciuffelli #todi ", "data:image/jpeg;base64," + imageData, "")
        .then(function (result) {
        }, function (err) { });
    }, function (err) { });
  };
})
.controller("mapController", function ($scope, $rootScope) {
  var featureCollection = {
    "layerDefinition": null,
    "featureSet": {
      "features": [],
      "geometryType": "esriGeometryPoint"
    }
  };

  featureCollection.layerDefinition = {
    "geometryType": "esriGeometryPoint",
    "objectIdField": "ObjectID",
    "drawingInfo": {
      "renderer": {
        "type": "simple",
        "symbol": {
          "type": "esriSMS",
          "style": "esriSMSCircle",
          "color": [200, 62, 62],
          "size": 10
        }
      }
    },
    "fields": [{
      "name": "ObjectID",
      "alias": "ObjectID",
      "type": "esriFieldTypeOID"
    }, {
      "name": "some_other_field",
      "alias": "some_other_field",
      "type": "esriFieldTypeString"
    }
    ]
  };

  $scope.ready = function () {
    initMap(12.4118538, 42.778917, $rootScope.clues);
    //navigator.geolocation.getCurrentPosition(function (position) {
      
    //});

    //require(["esri/map", "esri/layers/FeatureLayer",
    //         "esri/request", "esri/geometry/Point",
    //         "esri/graphic", "dojo/on", "dojo/_base/array", "dojo/domReady!"],
    //         function (Map, FeatureLayer, esriRequest, Point, Graphic, on, array) {
    //           $scope.map = new Map("map", {
    //             center: [$scope.currentLocation.latitude, $scope.currentLocation.longitude],
    //             zoom: 10,
    //             basemap: "osm"
    //           });

    //           var featureLayer = new FeatureLayer(featureCollection, {
    //             id: 'myFeatureLayer',
    //             mode: FeatureLayer.MODE_SNAPSHOT
    //           });

    //           $scope.map.addLayer(featureLayer);

    //           //scope.map.centerAt(new Point(result.coords.longitude, result.coords.latitude));

    //           //$http.get(config.serverUrl + "api/deals/get/" + $scope.lastposition[0] + "/" + $scope.lastposition[1] + "?radius=30000")
    //           //     .success(function (response) {
    //           //       //loop through the items and add to the feature layer
    //           //       var features = [];
    //           //       array.forEach(response, function (item) {
    //           //         var attr = {};
    //           //         //pull in any additional attributes if required
    //           //         attr["some_other_field"] = "";// item.properties.<some_chosen_f;

    //           //         var geometry = new Point(item.geometry.coordinates[0], item.geometry.coordinates[1]);

    //           //         var graphic = new Graphic(geometry);
    //           //         graphic.setAttributes(attr);
    //           //         features.push(graphic);
    //           //       });

    //           //       featureLayer.applyEdits(features, null, null);
    //           //     });

    //           //$scope.requestData();
    //         });
  };
  //$scope.ready();
  //orientationChanged();
});

