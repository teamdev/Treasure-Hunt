var geotriggerService = {
  arcgis: null, // geotrigger session
  AONclientId: null, // ArcGis Application Client ID
  AndroidSenderId: null, // Android SenderId
  pushNotification: null, // GCM PushNotiifcation Service
  gcmRegistrationId: null, //GCM registration ID
  tags: [],
  $http: null,
  $ionicPlatform: null

  , onGCMRegistration: function () { }
  , onNotification: function (arg) { console.log(arg); }
  , registerDevice: function (applicationClientId, onCompleted) {
    var self = geotriggerService;
    self.AONclientId = applicationClientId;
    self.arcgis = new Geotrigger.Session({
      clientId: self.AONclientId
    });

    if (!self.arcgis.authenticated()) {
      console.log("autenticating in AON");
      delete self.arcgis.token;
      self.arcgis.refresh();
    }

    if (self.arcgis && self.arcgis.token)
      delete self.arcgis.token;

    self.arcgis.refresh();

    self.arcgis.queue(function () {
      console.log("registeringDevice");
      self.$http.post("https://portalette.geotrigger.arcgis.com/oauth2/apps/" + self.arcgis.clientId + "/devices/" + self.arcgis.deviceId + "/update",
      {
        f: "json",
        token: self.arcgis.token,
        client_id: self.arcgis.clientId,
        gcmRegistrationId: self.gcmRegistrationId
      }).success(function (e) { console.log(e) }).error(function (e) { console.log(e); });
      if (onCompleted)
        onCompleted();
    });
  }
  , updateLocation: function (location) {
    var self = geotriggerService;

    if (self.arcgis) {
      delete self.arcgis.token;
      self.arcgis.refresh();

      self.arcgis.request("location/update",
      {
        "locations": [{
          "latitude": location.latitude,
          "longitude": location.longitude,
          "altitude": 0,
          "speed": null,
          "bearing": null,
          "verticalAccuracy": null,
          "accuracy": 10,
          "trackingProfile": "adaptive",
          "timestamp": new Date().toISOString().replace("Z", "+00:00")
        }],
        "previous": {
          "latitude": 42,
          "longitude": 12,
          "altitude": 0,
          "speed": null,
          "bearing": null,
          "verticalAccuracy": null,
          "accuracy": 10,
          "trackingProfile": "adaptive",
          "timestamp": new Date().toISOString().replace("Z", "-00:05")
        },
        "nearbyTriggersScope": 5000,
        "nearbyTriggersLimit": 5,
      }, function (err, result) {
        console.log("location update");
        console.log(result);
        console.log(err);
      });
    }
  }
  , registerGCM: function (senderId, success) {
    var self = geotriggerService;
    self.AndroidSenderId = senderId;

    if (success)
      self.onGCMRegistration = success;

    if (window.plugins && window.plugins.pushNotification) {
      self.pushNotification = window.plugins.pushNotification;
      try {
        self.pushNotification.register(
          function (result) { console.log("error:" + result); },
          function (result) { console.log(result); },
          {
            "senderID": self.AndroidSenderId,
            "badge": "true",
            "sound": "true",
            "alert": "true",
            "ecb": "onNotification"
          });
      } catch (e) {
        console.log("Exception during GCM Registration process");
        console.log(result);
      }
    }
  }
  , updateTags: function (tags) {
    var self = geotriggerService;
    if (tags)
      self.tags = tags;

    console.log("UpdatingTags");
    if (self.arcgis) {
      self.arcgis.request("device/update",
        {
          "setTags": self.tags,
          "trackingProfile": "adaptive"
        }, function (err, result) {
          console.log("device update");
          console.log(result);
          console.log(err);
        });
    }
  }
};

angular.module("geotrigger.service", ["ionic"])
.factory("$geotrigger", function ($http, $ionicPlatform) {
  geotriggerService.$http = $http;
  geotriggerService.$ionicPlatform = $ionicPlatform;

  return geotriggerService;
});

//IOS
function onNotificationAPN(event) {
  alert(e);
  if (event.alert) {
    navigator.notification.alert(event.alert);
  }

  if (event.sound) {
    var snd = new Media(event.sound);
    snd.play();
  }

  if (event.badge) {
    pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
  }
}

// Android
function onNotification(e) {
  switch (e.event) {
    case "registered":
      geotriggerService.gcmRegistrationId = e.regid;
      geotriggerService.onGCMRegistration(e);
      break;
    default:
      geotriggerService.onNotification(e);
      break;
  }
}

