timers.addDailyTask({
    path: '/sdcard/脚本/每日任务.js',
    time: '10:00'
}, task => {
    toastLog("定时任务执行成功: " + task);
});
// 可以到任务管理中查看这个定时任务