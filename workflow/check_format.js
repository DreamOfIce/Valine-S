var ct = steps.init_ct.$return_value;

//屏蔽不符合要求的请求
if (steps.trigger.event.method != 'POST') {
    await $respond({
        status: 405,
        immediate: true,
        body: 'Wrong-Request-Mode'
    })
    console.error("请求方式都不对,估计不是正经评论的ヾ(≧▽≦*)o");
    $end(`错误的请求方式:${steps.trigger.event.method}.`);
} else if (!ct.nick || !ct.comment || (!ct.email && !!(process.env.EMAIL_SERVER || !!process.env.EMAIL_HOST))) {
    await $respond({
        status: 400,
        immediate: true,
        body: 'Invalid-Input.',
    })
    console.error("似乎没填必填项ψ(._. )>是不是RequiredFields前后台配置不同?");
    $end("未填写必填选项.");
} else if (!!process.env.BLACKLIST_IP && process.env.BLACKLIST_IP.split(',').includes(steps.trigger.event.ip_address)) {
    await $respond({
        status: 403,
        immediate: true,
        body: 'Block-IP',
    })
    $end(`黑名单IP:${steps.trigger.event.ip_address}.`);
}

//返回comment对象
return ct;