function start() {
  common.openApp('闲鱼');
  common.waitTime(3, '等待闲鱼启动');

  common.consoleWrap('进入"消息"菜单', openMessageMenu, true);

  // common.consoleWrap('进入"我的"菜单', openMyMenu, true);
}

function openMessageMenu() {
  click('消息');
  common.waitTime(2, '进入"消息"界面');

  // 检查 等待卖家发货
  checkNeedSendByMsg()
}

function openMyMenu() {
  click('我的');
  common.waitTime(2, '进入"我的"界面');

  // 检查 去发货
  checkNeedSend()
}

function checkNeedSendByMsg () {
  descContains('清除未读').untilFind();
  let item = desc('等待卖家发货').findOne(1000);
  if (item != null) {
    common.clickXy(item, true, true);
    common.waitTime(2, '点击"等待卖家发货"文本');
  }
}

function checkNeedSend () {
  let wmcd = descContains('我卖出的').untilFind();
  let qfh = descContains('去发货').findOne(1000);
  if (qfh != null) {
    common.clickXy(wmcd[0], true, true);
    common.waitTime(2, '点击"我卖出的"文本');
    let dfh = descContains('待发货').untilFind();
    dfh[0].click();
    common.waitTime(1, '点击"待发货"标签页');
    let qfh2 = descContains('去发货').findOne(2000); // qfh2.contentDescription 正则判断是否需要自动发货
    if (qfh2 != null) {
      var qfh2Rect = qfh2.bounds();
      click(qfh2Rect.right - 150, qfh2Rect.bottom - 100); // 直接点击去发货按钮，而不是订单(会多进入一层页面)
      common.waitTime(2, '点击"去发货"按钮');
      descContains('已阅读并同意').untilFind();
      let wxjj = descContains('无需寄件').findOne(2000);
      if (wxjj != null) {
        var wxjjRect = wxjj.bounds();
        common.debugXy(wxjjRect.right - 100, 140);
        press(wxjjRect.right - 100, 140, 200);
        common.waitTime(2, '点击"无需寄件"文本');
        descContains('无需寄件提醒').untilFind();
        let qd = descContains('确定').findOne(1000);
        if (qd != null) {
          common.clickXy(qd, true, true);
        } else {
          console.log('执行失败：获取确定按钮失败');
        }
      }
    } else {
      console.log('待发货任务已全部完成');
    }
  } else {
    console.log('无待发货任务');
  }
}


