const AV = require('leancloud-storage');
const axios = require('axios');
const fs = require("fs");
const ejs = require("ejs");
const {
    Query,
    User
} = AV;

var ct = steps.filter.$return_value;

//初始化
conslole.log('开始初始化LeanCloud')
try {
    var appInfo = new Array;
    appInfo.appId = process.env.APP_ID;
    appInfo.appKey = process.env.MASTER_KEY;
    if (!!process.env.SERVER_URL) {
        appInfo.serverURL = process.env.SERVER_URL;
    }
    AV.init(appInfo);
    AV.Cloud.useMasterKey(true);
} catch (error) {
    console.error("无法连接到LeanCloud");
    console.error(error);
    $send.email({
        subject: "您的评论系统崩坏了(っ °Д °;)っ",
        html: ejs.render(fs.readFileSync($attachments["error.ejs"]), {
            'site-Url': process.env.SITE_URL,
            'siteName': process.env.SITE_NAME,
            'error': `在步骤:step.storage中:${error}`,
            'action': "检查您的AppID和MasterKey"
        }),
        include_collaborators: false,
    });
    $end(`无法连接到LeanCloud,请检测你的AppID和MasterKey:${error.message}`);
}
console.log("成功连接到LeanCloud")

//构建对象并赋值
var comment = new AV.object('Comment');
for (item in ct) {
    comment.set(item, ct.item);
}

//保存对象
console.log("开始保存数据");
try {
    const result = await comment.save();
    console.log(result);
} catch (error) {
    await $respond({
        status: 500,
        immediate: true,
        body: 'Internal-Server-Error',
    })
    console.error("无法保存数据");
    console.error(error);
    $send.email({
        subject: "您的评论系统崩坏了(っ °Д °;)っ",
        html: ejs.render(fs.readFileSync($attachments["error.ejs"]), {
            'site-Url': process.env.SITE_URL,
            'siteName': process.env.SITE_NAME,
            'error': `在步骤:step.storage中:${error}`,
            'action': "请确认您是否输入了MasterKey而不是AppKey"
        }),
        include_collaborators: false,
    });
    $end(`成功连接到Leancloud,但无法保存数据,请确认您是否输入了MasterKey而不是AppKey:${error.message}`);
}
console.log("成功保存数据");

//返回结果
console.log("返回最终结果")
await $respond({
    status: 200,
    immediate: true,
    head: {
        "content-Type": "application/json"
    },
    body: result
})

//获取标题
console.log("在数据库中查找网页标题")
const query = new AV.query("Title");
query.equalTo('url',ct.url);
const title = await query.first();
if (!title) {
    console.log("找不到网页标题,开始获取")
    try {
        var url = ct.url;
        if (url.startsWith('/')) {
            url = process.env.SITE_URL + title_url;
        } else if (!url.smatch(/(^\w+:|^)\/\//)) {
            url = 'https://' + url;
        }
        const resp = await axios.get(url, {
            timeout: 1000
        });
        title=resp.data.match(/<title>(.+)<\/title>/);
        if (!title) {
            throw "无法在网页中找到标题";
        }
    } catch (error) {
        console.warn(`无法获取${url}的标题,使用网站描述`);
        console.warn(error);
        title= process.env.SITE_NAME;
    } finally {
        if (title.length>20) {
            title = title.slice(0,19)+'…';
        }
        const av_title = new AV.object("Title");
        av_title.set('url',ct.url);
        av_title.set('title',title);
        try {
            console.log(await av_title.save());
        } catch(error){
            console.warn('无法保存标题到LeanCloud');
            console.warn(error);
        }
    }
}
console.log(`网页标题为:${title}`);

//返回最终结果
return title;