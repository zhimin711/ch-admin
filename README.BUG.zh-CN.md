
## 简介

## 其它

```bash
# 预览发布环境效果
npm run preview

# 预览发布环境效果 + 静态资源分析
npm run preview -- --report

# 代码格式检查
npm run lint

# 代码格式检查并自动修复
npm run lint -- --fix
```

更多信息请参考 [使用文档](https://panjiachen.github.io/vue-element-admin-site/zh/)

## Plugins Changelog
cropperjs change
```
搜索 responseType，open方法添加第三参数true
#cropper.js 
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
#cropper.min.js
        n.open("GET",t,true)
```


## Donate

## License

[MIT](https://github.com/PanJiaChen/vue-element-admin/blob/master/LICENSE)

Copyright (c) 2019-present zhimin.ma
