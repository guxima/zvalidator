q-validator
===========

可扩展性良好的表单验证器，通过简单配置即可完成自动化的表单元素校验。支持以下特性：

1. 自定义验证器
2. 向内遍历所有表单元素
3. 验证结果可配置
4. 支持验证器自定义依赖
5. 内置全套常见的验证库
6. 支持设置多个验证器
7. 模块化载入方式


使用方法
--------

指定一个验证容器，推荐设定为 Form 元素。设置容器中的表单域元素的自定义属性值，调用验证方法即可。

支持校验的表单域类型有 input、select、textarea

自定义属性有两个：

- data-validator：指定验证器，多个以逗号分隔
- data-validatorvalue：可选的验证器配置值，多个以逗号分隔

验证器扩展
----------

首先模块化载入 QValidator 对象,然后做如下扩展：

    var myValidator = QValidator.create({
        'methodOne': function(){

            this.depends = ['cnCharacterOnly', 'lengthLimit'];//支持多个依赖项

            /**
            * 验证方法
            * @param {String} value 表单域的值
            * @param {String} limit 可选的自定义参数值
            * @return {Mix} code 显示的布尔值 true 或未通过校验标识码，若没有返回值则该验证始终通过
            */

            this.check = function(value, limit){
                .....
                return 'VALIDATE_CODE';
            }
        }
    });

问题反馈
--------
使用建议和问题反馈请移步QQ群：254271610


