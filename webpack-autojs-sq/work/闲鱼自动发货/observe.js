var common = require("../../common/common.js");

export const observeNotification = function (callback) {
  events.observeNotification();
  events.onNotification((n) => {
    const packageName = n.getPackageName();
    if (!packageName || !packageName.includes('com.taobao.idlefish')) {
      return;
    }
    wakeUpDevice();
    n.click();
    sleep(2000);
    n.delete();
    callback && callback(n);
  });
}

function wakeUpDevice() {
  if (!device.isScreenOn()) {
    device.wakeUp(); // 唤醒手机屏幕
    sleep(2000);
  }
  common.swipeToTopRandom();
  sleep(1000);
}
