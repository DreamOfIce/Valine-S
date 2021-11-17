const xss = require('xss');
var ct = steps.check_ip.$return_value;

//限制用户名和评论的长度
if (ct.nick.length > 24) {
  ct.nick = ct.nick.slice(0, 23);
  conslole.warn("昵称过长,十有八九是偷偷盗用接口的啦(￣y▽,￣)╭ ");
}
if (ct.comment.length > 512) {
  ct.comment = ct.comment.slice(0, 511);
  console.warn("评论过长,去查查他怎么绕过长度限制的吧(っ °Д °;)っ");
}

//进行XSS过滤
ct.nick = xss(ct.nick, {
  whiteList: {},
  tripIgnoreTag: true
});

whiteList = xss.whiteList;
whiteList.audio = ['controls', 'crossorigin', 'muted', 'src'];
whiteList.video = ['controls', 'crossorigin', 'muted', 'playsinline', 'poster', 'src', 'height', 'width'];
ct.comment = xss(ct.comment, {
  whiteList: whiteList
});

//进行屏蔽词过滤
try {
  if (!!process.env.BLACKLIST_WORD) {
    ct.comment = ct.comment.replace(new RegExp(process.env.BLACKLIST_WORD, 'gi'), () => new Array("富强", "民主", "文明", "和谐", "自由", "平等", "公正", "法治", "爱国", "敬业", "诚信", "友善")[Math.floor(Math.random() * 12)]);
  }
} catch (error) {
  console.warn(error);
  console.warn("请检测您的屏蔽词是否符合正则语法!");
}

//返回最终对象
return ct;