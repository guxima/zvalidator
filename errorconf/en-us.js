/**
 * Desc: 错误提示配置文件
 * User: guxima@gmail.com
 * Date: 2014/6/12
 */
'use strict';
define(function(){
	return {
		UNKNOWN: 'unknown error',
		NOT_NULL: '不能为空',
        CN_CHARACTER_ONLY: '只能为汉字',
        NUM_ONLY: '只能为数字',
        LENGTH_FIXED: '长度和限定长度不一致',
        LENGTH_LIMIT_MIN: '长度小于最小长度',
        LENGTH_LIMIT_MAX: '长度大于最大长度',
        RANGE_LIMIT_MIN: '值小于最小限制',
        RANGE_LIMIT_MAX: '值大于最大限制',
        CELLPHONENO_INVALID: '手机号不符合要求',
        IDCARDNO_UNEXPECT_CHAR: '身份证号码中有不能识别的字符',
        IDCARDNO_INVALID: '身份证信息错误'
	}
});
