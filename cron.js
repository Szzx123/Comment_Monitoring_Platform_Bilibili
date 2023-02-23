const {getCommentList} = require("./api");
const {commentSet, oidCommentMap} = require("./commentSet");
const CronJob = require('cron').CronJob;

let job;

const createJob = (socket) => {
    if (job) {
        return;
    }
    job = new CronJob(
        '0/10 * * * * * ',//crontab表达式
        async function() {
            const oidList = Object.keys(oidCommentMap);
            for (const oid of oidList){
                const data = await getCommentList(1, oid);
                const commentSet = oidCommentMap[oid];
                // 去重过后，没发送的数据列表
                const canSendDataList = [];
                if (!data){
                    continue;
                }
                console.log(data);
                for (const reply of data.dataList)   {
                    // 已经发送过则不处理
                    if (!commentSet[reply.rpid]) {
                        canSendDataList.push(reply);
                        commentSet[reply.rpid] = reply;
                    }
                }
                socket.broadcast.emit('sendData', {
                    ...data,
                    oid,
                    dataList: canSendDataList
                });
            }
        },
        null,
        true,
        'America/Los_Angeles'
    );
// Use this if the 4th param is default value(false)
    job.start()
}
// 导出方法
module.exports = {
    createJob
}
