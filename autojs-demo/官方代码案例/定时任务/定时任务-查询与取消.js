console.show();

// 预定一个任务
let task = timers.addDisposableTask({
    path: '/sdcard/脚本/随便预定一个任务.js',
    date: '2019-10-1T20:00:00'
});
log("预定成功:", task);
// 获取任务id
let id = task.id;
log("根据id查询定时任务: id = %d: ", id, timers.getTimedTask(id));
// 取消定时任务
log("删除该任务: ", timers.removeTimedTask(id));
log("[删除任务后]根据id查询定时任务: id = %d: ", id, timers.getTimedTask(id));

// 查询所有任务
log("所有定时任务: ", timers.queryTimedTasks({}));

// 查询所有意图（广播）任务
log("所有意图任务: ", timers.queryIntentTasks({}));

// 按路径查询任务
timers.queryTimedTasks({
    path: '/sdcard/脚本/随便预定一个任务.js'
}, tasks => {
    log("按路径查询任务: ", tasks);
});

// 按意图Action查询任务
log("按意图Action查询任务: ", timers.queryIntentTasks({
    action: 'android.intent.action.BATTERY_CHANGED'
}));

// 保持脚本运行
setInterval(()=>{}, 100000);
