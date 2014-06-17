requirejs.config({
    baseUrl: '../',
    paths: {
      'jquery': 'demo/lib/jquery-1.11.0.min'
    }
});

require(['zvalidator', 'jquery'], function(zv){
    $('#regInfo').on('submit', function(e){
        var isValid = zv.create().traverseContainer('regInfo');
        console.log(isValid);
        /**
         * traverseContainer()返回验证结果
         * 验证通过时返回 true
         * 不通过时返回
         * Object{
         *     code: "CELLPHONENO_INVALID",//结果标识码
         *     invalidElement: inputElement,//未通过验证的元素节点
         *     msg: "手机号不符合要求",//自定义返回信息
         *     validatorName: "cellphoneNo"//当前的验证方法
         * }
         */
        if(isValid !== true){
            isValid.invalidElement.focus();
            alert(isValid.msg)
        }else{
			alert('good')
		}
    });

});