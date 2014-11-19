// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

document.addEventListener("deviceready", function () {
  setTimeout(function () {
    navigator.splashscreen.hide();
  }, 2000);
});



var bgGeo;

angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', "geotrigger.service", "ngCordova"])

.run(function ($ionicPlatform, $geotrigger, $rootScope) {

  $rootScope.clues = JSON.parse(window.localStorage.getItem("clues"));
  if (!$rootScope.clues)
    $rootScope.clues = [];

  $ionicPlatform.ready(function () {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    $rootScope.route = window.localStorage.getItem("route");
    if (!$rootScope.route) {
      $rootScope.route = "route" + Math.floor((Math.random() * 5) + 1);
      window.localStorage.setItem("route", $rootScope.route);
      window.localStorage.setItem("apptags", JSON.stringify([$rootScope + "_clue0"]));
      window.localStorage.removeItem("clues");
    }

    var apptags = JSON.parse(window.localStorage.getItem("apptags"));

    $geotrigger.registerGCM("<your GCM project ID>", function () {
      $geotrigger.registerDevice("<your arcGIS application id>", function () {

        $geotrigger.updateTags(apptags);

        //var tt = $geotrigger.arcgis.token;
        //bgGeo = window.plugins.backgroundGeoLocation;
        //bgGeo.configure(function () { }, function () { }, {
        //  url: "https://geotrigger.arcgis.com/location/update",
        //  params: {
        //    token: tt,
        //    nearbyTriggerScope: 5000,
        //    nearbyTriggerLimit: 5,
        //    previous: {
        //      "timestamp": new Date().toISOString().replace("Z", "-00:05"),
        //      "latitude": 42,
        //      "longitude": 12,
        //      "accuracy": 10.0,
        //      "speed": null,
        //      "altitude": 0,
        //      "bearing": null,
        //      "verticalAccuracy": null,
        //      "battery": 80,
        //      "batteryState": "charging",
        //      "trackingProfile": "adaptive"
        //    }
        //  },
        //  headers: {},
        //  desiredAccuracy: 10,
        //  stationaryRadius: 10,
        //  distanceFilter: 10,
        //  notificationTitle: 'Caccia al tesoro!', // <-- android only, customize the title of the notification
        //  notificationText: 'Cacciatori al lavoro!', // <-- android only, customize the text of the notification
        //  activityType: 'AutomotiveNavigation',
        //  debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
        //  stopOnTerminate: true // <-- enable this to clear background location settings when the app terminates
        //});

        //if (window.localStorage.getItem("backgroundTracking")) {
        //  bgGeo.start();
        //}
      });
    });

    $geotrigger.onNotification = function (e) {
      if (e.event == "message")
        alert(e.payload.text);
      else
        alert("push:");

      if (e.payload.data.tags) {
        $rootScope.$apply(function () {
          $rootScope.clues.push({ text: e.payload.text, latitude: $rootScope.currentLocation.latitude, longitude: $rootScope.currentLocation.longitude });
        });
        $geotrigger.updateTags(e.payload.data.tags);

        window.localStorage.setItem("clues", JSON.stringify($rootScope.clues));
        window.localStorage.setItem("apptags", JSON.stringify(e.payload.data.tags));
      }
    };

    // Init Geolocation and ask user to geolocation permission. 
    window.navigator.geolocation.getCurrentPosition(function (location) {
      $geotrigger.updateLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude,
      });
    });
  });
})

.config(function ($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    // setup an abstract state for the tabs directive
    .state('tab', {
      url: "/tab",
      abstract: true,
      controller: 'appController',
      templateUrl: "templates/tabs.html"
    })

    // Each tab has its own nav history stack:

    .state('tab.clues', {
      url: '/clues',
      views: {
        'tab-clues': {
          templateUrl: 'templates/clue.html',
        }
      }
    })

    .state('tab.map', {
      url: '/map',
      views: {
        'tab-map': {
          templateUrl: 'templates/map.html',
          controller: 'mapController',
        }
      }
    })
    .state('tab.stats', {
      url: '/stats',
      views: {
        'tab-stats': {
          templateUrl: 'templates/stats.html',
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/clues');

});

