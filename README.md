z-validator
===========

前后端通用的Javascript表单验证器，通过简单配置即可完成表单域有效性校验。主要特性如下：

1. 支持在运行时动态绑定自定义的验证器
2. 验证器可以配置依赖的其它验证器，最大化复用验证方法
3. 错误提示可以配置，支持国际化多语言
4. 可以实例化多个验证器，支持不同粒度的校验业务


前端使用方法
----------------

1. 设定一个标识验证范围的HTML容器，推荐设定为 Form 元素。
2. 设置容器中的待检测表单域的 **data-validator**属性值。
3. 业务逻辑中调用验证方法。

支持校验的表单域类型有 input、select、textarea

自定义属性设置
---------------

属性名：data-validator

属性值：指定验证器，和对应的验证器参数，支持两种设定方式：

- data-validator=" **[ 'validatorA', [ 'validatorB', vbParam1, vbParam2], 'validatorC', ...]** "，多维数组格式
- data-validator=" **{ 'validatorA' : '', 'validatorB' : [2, 10], ...}** "，JSON对象格式

html代码示例：

    <form id="regInfo" onsubmit="return false">
    	<ul>
    		<li><label>姓名（2-10个汉字）：</label><input type="text" name="name" data-validator="['cnCharacterOnly',['lengthLimit', 2, 10]]"/></li>
    		<li><label>年龄（5-10）：</label><input type="number" name="age" data-validator="{'rangeLimit':[5,10]}"/></li>
    		<li><label for="cellphoneno">手机号：</label><input id="cellphoneno" type="number" name="cellphoneNo" data-validator="['cellphoneNo']"/></li>
    		<li><label>身份证：</label><input type="text" name="idcard" data-validator="['IDCardNo']"/></li>
    		<li><label>选择一个爱好（两字）：</label><select name="hobit" data-validator="{'lengthFixed':2}">
    			<option value="无">无</option>
    			<option value="吃饭">吃饭</option>
    			<option value="睡觉">睡觉</option>
    			<option value="打豆豆">打豆豆</option>
    		</select></li>
    		<li><input type="submit" value="submit"/></li>
    	</ul>
    </form>

内置验证器列表
--------------
required

- 必填项

numOnly

- 只能为数字

lengthFixed

- 固定长度

- 参数类型：Int，默认为0

cnCharacterOnly

- 只能为汉字

lengthLimit

- 长度限制

- 参数类型：Array，[minLength, maxLength]

ip

- IPV4

email

- Email

url

- URL

rangeLimit

- 数值范围

- 参数类型：Array，[minValue, maxValue]

cellphoneNo

- 手机号（“1”开头的11位数字）

IDCardNo

- 身份证号

验证器扩展
----------

载入 ZValidator 脚本文件后参考如下代码：

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


