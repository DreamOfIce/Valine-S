const axios = require("axios");
const fs = require("fs");
const ejs = require("ejs");
var ct = steps.check_format.$return_value;

//检测IP
try {
    const resp = await axios.get(`https://api.ipdata.co/${steps.trigger.event.client_ip}/?api-key=${auths.ipdata_co.api_key}`, {
        timeout: 1000
    });
    console.log(resp);
    if (!!process.env.BLACKLIST_CONTROY && process.env.BLACKLIST_CONTROY.split(',').includes(resp.data.country_code)) {
        await $respond({
            status: 403,
            immediate: true,
            body: 'Country-Not-Available',
        });
        $end(`黑名单国家:${resp.data.country_code}.`);
    } else if (resp.data.threat.is_anonymous && process.env.BLOCK_ANONYMOUS == 'true') {
        await $respond({
            status: 403,
            immediate: true,
            body: 'Fuck-IP',
        })
        $end(`虚假IP.使用代理:${resp.data.threat.is_proxy},使用Tor:${resp.data.threat.is_tor}.`);
    } else if (resp.data.threat.is_threat && process.env.BLOCK_THREAT != 'false') {
        await $respond({
            status: 403,
            immediate: true,
            body: 'Threat-Request',
        })
        $end(`恶意请求.已知威胁:${resp.data.is_known_attacker},已知滥用:${resp.data.is_known_abuser}.`);
    }
} catch (error) {
    await $respond({
        status: 500,
        immediate: true,
        body: 'Internal-Server-Error',
    })
    console.error(error);
    $send.email({
        subject: "您的评论系统崩坏了(っ °Д °;)っ",
        html: ejs.render(fs.readFileSync($attachments["error.ejs"]), {
            'site-Url': process.env.SITE_URL,
            'siteName': process.env.SITE_NAME,
            'error': `在步骤:step.check_ip中:${error.message}`,
            'action': "检查您的IPdata密钥是否填写正确"
        }),
        include_collaborators: false,
    });
    $end(`无法获取IP ${ct.ip}的信息:${err}.`);
}

//返回最终对象
return ct;