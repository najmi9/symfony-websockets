export const notify = (title, body, icon) => {
    Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, {
              body,
              icon,
              tag:'message',
              vibrate:true
          });
        }
      });
}