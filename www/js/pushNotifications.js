// iOS
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
function onNotificationGCM(e) {
  if (e.event == "registered") {
    window.gcmRegistrationId = e.regid;
  }
  else {
    alert(e.payload.text);
  }
}