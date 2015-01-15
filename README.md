z-validator
===========

前后端通用的Javascript表单验证器，通过简单配置即可完成表单域有效性校验。主要特性如下：

1. 支持在运行时动态绑定自定义的验证器
2. 验证器可以配置依赖的其它验证器，最大化复用验证方法
3. 错误提示可以配置，支持国际化多语言
4. 可以实例化多个验证器，支持不同粒度的校验业务
5. 支持给表单项添加 optional 属性，标识为选填项


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
    		<li><label>姓名：</label><input type="text" name="name" data-validator="['cnCharacterOnly',['lengthLimit', 2, 10]]"/></li>
    		<li><label>年龄5-10：</label><input type="number" name="age" data-validator="{'rangeLimit':[5,10]}"/></li>
    		<li><label for="cellphoneno">手机号：</label><input id="cellphoneno" type="number" name="cellphoneNo" data-validator="['cellphoneNo']"/></li>
    		<li><label>身份证：</label><input type="text" name="idcard" data-validator="['IDCardNo']"/></li>
    		<li><label for="hobit">选择一个爱好：</label><select id="hobit" name="hobit" data-validator="{'lengthFixed':2}">
    			<option value="无">无</option>
    			<option value="吃饭">吃饭</option>
    			<option value="睡觉">睡觉</option>
    			<option value="打豆豆">打豆豆</option>
    		</select></li>
    		<li><label>IP：</label><input type="text" name="ip" data-validator="['ip']" readonly  value="只读表单项不检测"/></li>
    		<li><label>email：</label><input type="text" name="email" data-validator="['email']" disabled value="不可用表单项不检测"/></li>
    		<li><label>url：</label><input type="text" name="url" data-validator="['url']"/></li>
    		<li><label>选填的url：</label><input type="text" name="url" data-validator="['url']" optional/></li>
    		<li><input type="submit" value="submit"/></li>
    	</ul>
    </form>

内置验证器列表
--------------
**required**

- 必填项，空格不能通过校验

**numOnly**

- 只能为整型数字

**lengthFixed**

- 字符串长度固定

- 参数类型：Int，默认为0

**cnCharacterOnly**

- 只能为汉字

**lengthLimit**

- 字符串长度限制

- 参数类型：Array，[minLength, maxLength] 如[3, 8]表示 3<= 字符串长度 <=8

**ip**

- IPV4，如 114.114.114.114

**email**

- Email，如 hi@domain.suffix

**url**

- URL, 如 http://www.github.com or https://www.github.com

**rangeLimit**

- 数值范围

- 参数类型：Array，[minValue, maxValue] 如[5, 10]表示 5<= 数值 <= 10

**cellphoneNo**

- 手机号（“1”开头的11位数字）

**IDCardNo**

- 身份证号

自定义验证器
----------

载入 ZValidator 脚本文件后参考如下代码：

    var myValidator = ZValidator.create({
        validatorA : {

            deps : ['validatorA',['validatorB', vbParam1, vbParam2], 'validatorC', ...],//支持多个依赖项

            /**
            * 验证方法
            * @param {String} value 表单域的值
            * @param {String} opt 传递的自定义参数值
            * @return {Mix} 所有返回值都表示未通过校验，并作为错误标识码从语言文件中读取提示信息
                            没有返回值该验证通过
            */
            check = function(value, opt){
                .....
                if(true){
                    return 'VALIDATE_CODE';
                }
            }
        }
    });

问题反馈
--------
使用建议和问题反馈请加入QQ群： **254271610**


