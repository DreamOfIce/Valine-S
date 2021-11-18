const nodemailer=require('nodemailer');
const ejs=require('ejs');
const fs=require('fs');
var ct=steps.filter.$return_value;

//加载模版文件
const templates = await promise.all([fs.readfile(),fs.readfile()]);