const crypto = require('crypto')

//创建对象
var ct = steps.trigger.event.body;

//给对象赋值
ct.ip = steps.trigger.raw_event.client_ip;
ct.ua = steps.trigger.event.headers["user-agent"];
ct.email = ct.email.toLowerCase().match();

//计算邮件md5
if (!!ct.email) {
    ct.md5 = crypto.createHash('md5').update(ct.email, 'utf8').digest('hex');
}

//返回comment对象
return ct;