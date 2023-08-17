"ui";

ui.layout(
  <vertical>
      <text textSize="18sp" textColor="red" gravity="center" margin="20" textStyle="bold">
          请输入抢票信息
      </text>
      <ScrollView>
        <vertical>
          <text textSize="16sp" margin="8">抢票类型</text>
          <RadioGroup android:orientation="horizontal" >
            <RadioButton id="yuding" text="预定" checked="true"/>
            <RadioButton id="goumai" text="购买"/>
            <RadioButton id="jianlou" text="捡漏"/>
          </RadioGroup>
          <linear>
            <text textSize="16sp" margin="8">场次</text>
            <input id="ccArr" text="" margin="0 16" w="*"/>
          </linear>
          <linear>
            <text textSize="16sp" margin="8">票档</text>
            <input id="pdArr" text="" margin="0 16" w="*"/>
          </linear>
          <linear>
            <text textSize="16sp" margin="8">张数</text>
            <input id="needNum" text="2" inputType="number" margin="0 16" w="*"/>
          </linear>
          <linear gravity="center">
            <button id="runBtn" margin="16" textColor="red">开始抢票</button>
            <button id="cancelBtn" margin="16">取消</button>
          </linear>
        </vertical>
      </ScrollView>
  </vertical>
);

ui.runBtn.click(function() {
  ui.run(function() {
    const ops = {
      method: ui.yuding.isChecked() ? ui.yuding.text : (ui.goumai.isChecked() ? ui.goumai.text : ui.jianlou.text),
      ccArr: ui.ccArr.text() ? ui.ccArr.text().trim().replace(/，/g, ',').split(',') : [],
      pdArr: ui.pdArr.text() ? ui.pdArr.text().trim().replace(/，/g, ',').split(',') : [],
      needNum: Number(ui.needNum.text())
    }
    // 隐藏UI界面
    activity.moveTaskToBack(true)
    // 重启一个线程，否则会卡死
    threads.start(() => {
      main(ops)
    })
  });
});
ui.cancelBtn.click(() => {
  engines.myEngine().forceStop()
});

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
  
  start(options);
}

function start(options) {
  // common.openApp('大麦');
  // common.waitTime(10, '等待大麦启动');

  switch (options.method) {
    case '预定':
      common.consoleWrap(options.method + '1', yuding, true);
      break;
    case '购买':
      common.consoleWrap(options.method + '1',
        () => goumai(options.ccArr, options.pdArr, options.needNum), true);
      break;
    case '捡漏':
      common.consoleWrap(options.method + '1',
        () => jianlou(options.ccArr, options.pdArr, options.needNum), true);
      break;
    default:
      console.error('未知的执行方法')
      break;
  }

  // common.closeApp('大麦');
}

// eslint-disable-next-line no-unused-vars
function yuding(runCount = 1) {
  if(runCount == 1) {
    let btn = textMatches(/(立即购买|立即预定)/).untilFind()
    common.clickXy(btn[0])
  }

  log('确定...')
  let qdBtn = text('确定').untilFind()
  common.clickXy(qdBtn[0])
  sleep(200)

  log('提交订单...')
  clickBtnUntilNotFind(text('提交订单'), 100)

  device.vibrate(1000*60)
}

// eslint-disable-next-line no-unused-vars
function goumai(ccArr, pdArr, needNum, runCount = 1) {
  const retryFunc = () => goumai(ccArr, pdArr, needNum, runCount)

  if(runCount == 1) {
    let btn = textMatches(/(立即购买|立即预定)/).untilFind()
    common.clickXy(btn[0])
  }
  
  xuanpiao(ccArr, pdArr, needNum, runCount, retryFunc, '购买')
  
  log('提交订单...')
  clickBtnUntilNotFind(text('提交订单'), 100)

  device.vibrate(1000*60)
}

// eslint-disable-next-line no-unused-vars
function jianlou(ccArr, pdArr, needNum, runCount = 1) {
  const retryFunc = () => jianlou(ccArr, pdArr, needNum, runCount)
  
  xuanpiao(ccArr, pdArr, needNum, runCount, retryFunc, '捡漏')
  
  log('提交订单...')
  let pass = clickBtnUntilNotFind(text('提交订单'))
  if(!pass) {
    common.consoleWrap('捡漏' + (++runCount), retryFunc, true);
  }

  device.vibrate(1000*60)
}

function xuanpiao(ccArr, pdArr, needNum, runCount, retryFunc, retryName) {
  // 场次      
  // id('layout_perform_view').untilFind() 会导致卡死永远找不到
  let tagCcParent = common.parents(text('场次').findOne(), 2)
  let tagCcArr = tagCcParent.children()[1].children().filter(x => x.find(id('ll_perform_item')))
  if(tagCcArr.length > 1) {
    // 点击场次进行刷新
    let tagCcObj = clickBtnArrToRefresh(tagCcArr, () => {
      // 有预售标记的说明有票
      let ysTag = text('预售').findOne(100)
      if (!ysTag) {
        return null
      }
      // 匹配场次
      let matchCc = false
      if (ccArr && ccArr.length > 0) {
        let dateArr = common.parents(ysTag, 3).children()
        let ccTarget = dateArr.filter(x => x.findOne(text('/('+ ccArr.map(cc => cc.trim()).join('|') +')/')))[0]
          if (ccTarget) {
            matchCc = true
          }
      } else {
        // 所有场次都接受
        matchCc = true
      }
      return matchCc ? ysTag : null
    }, 0)
    common.clickXy(tagCcObj)
  } else {
    common.clickXy(tagCcArr[0])

    // 点击票档进行刷新
    let tagPdParent = id('layout_price').untilFind()
    let tagPdArr = tagPdParent[0].find(id('ll_perform_item'))
    clickBtnArrToRefresh(tagPdArr, item => {
      let itemMatch = !pdArr || pdArr.length <= 0 || item.findOne(text('/('+ pdArr.map(cc => cc.trim()).join('|') +')/'))
      if (itemMatch) {
        // 无缺货登记的才表示有票
        let qhItem = item.findOne(text('缺货登记'))
        if (!qhItem) {
          return item
        }
      }
      return null
    }, 0)
  }
  
  // 匹配票档
  let tagPdParent = id('layout_price').untilFind()
  let tagPdArr = tagPdParent[0].find(id('ll_perform_item'))
  let tagPdObj = tagPdArr.filter(x => {
    let itemMatch = !pdArr || pdArr.length <= 0 || x.findOne(text('/('+ pdArr.map(cc => cc.trim()).join('|') +')/'))
    if (itemMatch) {
      let qhItem = x.findOne(text('缺货登记'))
      if (!qhItem) {
        return true
      }
    }
    return false
  })[0]
  if (tagPdObj) {
    common.clickXy(tagPdObj)
    sleep(200)
  } else {
    // 重新刷新
    common.consoleWrap(retryName + (++runCount), retryFunc, true);
  }

  // 需要抢几张票(默认是1张)
  for (let index = 1; index < needNum; index++) {
    let btnAdd = id('img_jia').findOne()
    common.clickXy(btnAdd)
  }

  log('确定...')
  let qdBtn = text('确定').untilFind()
  common.clickXy(qdBtn[0])
  sleep(200)
  
  let userArr = text('身份证').untilFind()
  for(let item of userArr) {
    common.clickXy(item)
  }
  sleep(100)
}

/**
 * 点击按钮直至此按钮消失.
 * 场景: 大麦抢票，点击提交订单按钮，直至进入到支付页面
 * @param {*} uiSelector 如: text('提交订单')
 * @param {*} retryCount 当查找此按钮存在的时候，进行几次重试查找直至找不到
 * @param {*} clickSleep 每次点击后过多久再查找此按钮，可能页面需要跳转等待
 * @returns true(此按钮已消失) false(此按钮仍然存在)
 */
function clickBtnUntilNotFind(uiSelector, retryCount = 3, clickSleep = 500) {
  let count = 0
  let btn = uiSelector.untilFind()
  while (btn) {
    common.clickXy(btn[0])
    // 点击完之后等待一会再找此按钮
    sleep(random(clickSleep - 100, clickSleep + 100))
    btn = uiSelector.findOne()
    if (!btn) {
      // 没有找到此按钮，如提交订单成功跳转到下一个页面了
      return true
    }
    if (count >= retryCount) {
      return false
    }
    count++
  }
}

/**
 * 切换点击一批按钮，进行页面刷新，直到找到某个元素
 * 场景: 大麦抢票，缺货登记时，点击切换场次或票档来刷新
 * @param {*} btnArr 按钮组UiCollection
 * @param {*} checkSelectorFunc 寻找需要元素的方法
 * @param {*} retryCount 重试次数. 0表示一直寻址直到找到
 * @param {*} clickSleep 点击按钮后等待多久才去寻址元素
 * @returns UiObject(找到此元素) NULL(未找到此元素)
 */
function clickBtnArrToRefresh(btnArr, checkSelectorFunc, retryCount = 3, clickSleep = 500) {
  let count = 0
  let clickIndex = 0
  while (count < retryCount || retryCount == 0) {
    let item = btnArr[clickIndex]
    // console.log(clickIndex, item)
    common.clickXy(item)
    sleep(random(clickSleep - 100, clickSleep + 100))
    let uiObj = checkSelectorFunc(item)
    if (uiObj) {
      return uiObj
    }
    clickIndex++
    if (clickIndex > btnArr.length - 1) {
      clickIndex = 0
    }
  }
  return null
}

// main();
