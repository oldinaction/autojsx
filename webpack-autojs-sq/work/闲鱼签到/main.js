var common = require("../../common/common.js");

/**
 * 定义主函数，入口函数
 * @param {*} options 服务器端穿过来的参数，在本地测试的是 options 是没有值的。
 */
function main(options) {
  common.resetConsole();

  // common.init(options);
  options = options || {};
  console.log('options-->', options);
  
  start();
}

function start() {
  common.openApp('闲鱼');
  common.waitTime(3, '等待闲鱼启动');

  common.consoleWrap('我的闲鱼币', openWdxyb, true);

  common.closeApp('闲鱼');
}

function openWdxyb() {
  click('我的');
  common.waitTime(1, '我的');

  descStartsWith('我的闲鱼币').findOne(1000).click();
  common.waitTime(2, '打开我的闲鱼币');

  common.consoleWrap('领取昨日奖励', startLqjl, true);
  common.consoleWrap('打开签到页', openQd);
  common.consoleWrap('签到', startQd, true);
  common.consoleWrap('浏览指定频道好物', startLnhw, true);
  common.consoleWrap('开启一件抵扣商品', startDksp, true);
  common.consoleWrap('升级小店', startSjxd, true);
}

function openQd() {
  let btn = desc('签到').findOne(1000)
  if (btn == null) {
    btn = desc('待领取').findOne(1000)
  }
  if (btn != null) {
    btn.click();
  } else if(descStartsWith('我的经验').findOne(1000) != null) {
    // 安卓7.0以上触摸模拟
    click(900, 1200);
  } else {
    console.warn('打开签到页失败')
    return
  }
  common.waitTime(1, '打开签到页');
  // 有奖励就领取
  common.clickDescAll('领取奖励');
}

function startTask(taskName, fn) {
  let item = descStartsWith(taskName).findOne(1000)
  if (item == null) {
    console.log(`无${taskName}任务`);
    return
  }

  // UiOobject.findOne(selector) 查找子孙控件
  let btn = item.findOne(desc('去完成'))
  if (btn != null) {
    btn.click()
    common.waitTime(3, `进入${taskName}`);
    fn && fn()
  }
}

function startLqjl() {
  let item = desc('点击领取').findOne(1000);
  if (item != null) {
    item.click();
    common.waitTime(2, '点击领取按钮');

    item = desc('知道了').findOne(1000);
    if (item != null) {
      item.click();
      common.waitTime(2, '点击知道了按钮');
    }
  }
}

function startQd() {
  let item = desc('签到').findOne(1000);
  if (item == null) {
    console.log('无签到任务');
    return
  }

  item.click();
  common.waitTime(1, '点击签到');
}

function startLnhw() {
  startTask('浏览指定频道好物', () => {
    // 模拟手指滑动
    common.swipeRandom(500, 1800, 900, 1200, 1500);
    let qlqBtn = desc('去领取').untilFind();
    if (qlqBtn != null) {
      qlqBtn.click();
      common.waitTime(1, '点击去领取');
    }
  })
}

function startDksp() {
  startTask('开启一件抵扣商品', () => {
    text('已开启抵扣宝贝').findOne(1000).click()
    let parent = common.parents(text('抵扣比例').findOne(1000), 1)
    if (!parent) {
      console.warn('未找到抵扣商品')
      return
    }

    // 无法直接click()
    common.clickXy(parent.findOne(text('5%')))
    let btn = text('确定').findOne(1000)
    if (!btn) {
      common.clickXy(parent.findOne(text('10%')))
      btn = text('确定').findOne(1000)
    }
    if (!btn) {
      console.warn('未找到确定按钮')
      return
    }
    common.clickXy(btn)
  })
}

function startSjxd() {
  // 在一定区域内查找 android.view.View 类型元素
  let box = className('android.view.View').boundsInside(500, 1000, device.width - 150, device.height / 2).find();
  if(!box || box.size() <= 0) {
    return
  }
  let target = null
  for (const item of box) {
    // 判断为1-20以内的数字
    if (/^[0-9]+.?[0-9]*/.test(item.contentDescription)
      && parseInt(item.contentDescription) > 0
      && parseInt(item.contentDescription) <= 20) {
      target = item
      console.log('-----', target)
      break
    }
  }
  if (target) {
    common.clickXy(target)
    common.waitTime(2, '点击升级小店按钮');
    // let over = desc('知道了').findOne(1000);
    // if (over != null) {
    //   over.click();
    //   common.waitTime(2, '点击知道了按钮');
    // }
    startSjxd()
  }
}

main();
