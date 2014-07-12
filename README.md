z-validator
===========

前后端通用的Javascript表单验证器，通过简单配置即可完成表单域有效性校验。主要特性如下：

1. 支持使用时动态绑定自定义的验证器
2. 验证器可以配置依赖项
3. 错误提示可以配置，支持国际化多语言
4. 可以实例化多个验证器，支持不同粒度的业务
5. 采用模块化载入方式


使用方法
--------

###前端校验

指定一个验证容器，推荐设定为 Form 元素。设置容器中的表单域元素的自定义属性值，调用验证方法即可。

支持校验的表单域类型有 input、select、textarea

自定义属性：

data-validator：指定验证器，和对应的验证器参数

支持两种设定方式：

- data-validator="['validatorA',['validatorB', vbParam1, vbParam2], 'validatorC', ...]"
- data-validator="{'validatorA' : '', 'validatorB' : [2, 10], ...}"


###后端校验


验证器扩展
----------

首先模块化载入 ZValidator 对象,然后做如下扩展：

    var myValidator = ZValidator.create({
        validatorA : {

            deps : ['validatorA',['validatorB', vbParam1, vbParam2], 'validatorC', ...],//支持多个依赖项

            /**
            * 验证方法
            * @param {String} value 表单域的值
            * @param {String} opt 传递的自定义参数值
            * @return {Mix} code 明确的布尔值 true 或未通过校验标识码，若没有返回值则该验证始终通过
            */

            check = function(value, opt){
                var code = true;
                .....
                code = 'VALIDATE_CODE';
                ....
                return code;
            }
        }
    });

问题反馈
--------
使用建议和问题反馈请加入QQ群：254271610


