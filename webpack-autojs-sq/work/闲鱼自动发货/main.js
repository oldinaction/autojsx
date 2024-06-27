var common = require("../../common/common.js");
import { observeNotification } from './observe'

/**
 * 定义主函数，入口函数
 * @param {*} options 服务器端穿过来的参数，在本地测试的是 options 是没有值的。
 */
function main(options) {
  common.resetConsole();

  // common.init(options);
  options = options || {};
  console.log('options-->', options);

  observeNotification(function (n) {
    console.log('n-->', n);
    start();
  });

  start();
}

function start() {
  let item = descContains('个订单').findOne(2000);
  console.log(33, item)

  let qfh = descContains('去发货').boundsInside(0, 0, device.width, 500).findOne(2000);
  console.log(111, qfh)
  if (qfh != null) {
    console.log('找到去发货按钮');
    var qfhRect = qfh.bounds();
    click(qfhRect.right - 150, qfhRect.bottom);
    // TODO 判断商品类型
    // 点击无需寄件
    // clickWxjj();
  } else {
    // 2个订单交易中
    let dd = descContains('个订单').boundsInside(0, 0, device.width, 500).findOne(2000);
    console.log(222, dd)
    if (dd != null) {
      console.log('找到交易中的订单按钮');
      var ddRect = dd.bounds();
      click(ddRect.right - 150, ddRect.bottom); // 点击"2个订单交易中"
      let goods = descContains('PDF全能转换工具').findOne(500);
      if (goods) {
        let qfhArr = goods.children().filter(x => x.findOne(desc('去发货')));
        if (qfhArr && qfhArr.length > 0) {
          let qfh = qfhArr[0];
          var qfhRect = qfh.bounds();
          click(qfhRect.right - 150, qfhRect.bottom); // 点击底部弹框"去发货"
          // 点击无需寄件
          clickWxjj();
          // TODO 多个去发货的情况
        } else {
          console.log('无待发货任务，返回聊天界面');
          click(ddRect.right - 150, ddRect.bottom);
        }
      } else {
        console.log('非自动发货商品，返回聊天界面');
        click(ddRect.right - 150, ddRect.bottom);
      }
    } else {
      // 普通聊天消息
      console.log('收到普通消息');
    }
  }
}

function clickWxjj() {
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
}

main();
