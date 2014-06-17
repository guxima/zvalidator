/**
 * Desc: 自定义方法工具
 * User: guxima@gmail.com
 * Date: 2014/6/11
 */
'use strict';
define(function(){
	var utils = {
        trim: function(str, rep){
            return str.replace(/^\s+|\s+$/g, rep||'');
        },
        type: function(any){
            return Object.prototype.toString.call(any).match(/^\[object\s+([^\]]+)\]$/i)[1].toLowerCase();
        },
        each: function(any, fn, ctx){
            for(var k in any){
                if(any.hasOwnProperty(k) && (ctx ? fn.call(ctx, k, any[k]) : fn(k, any[k]) ) === false) {
                    break;
                }
            }
        },
        extend: function(first, second){
            for(var k in second){
                second.hasOwnProperty(k) && (first[k]=second[k]);
            }
            return first;
        },
        $: function(any){
            return this.type(any) === 'string' ? document.getElementById(any) : any;
        },
        getChildByTagName: function(ele, tag){
            var all = [],
                tmp;

            this.type(tag) !== 'array' && (tag=[tag]);
            for(var i= 0, len=tag.length; i<len;){
                tmp = ele.getElementsByTagName(tag[i++]);
                if(tmp.length>0){
					for (var k=0, ken=tmp.length; k<ken; k++){
						all.push(tmp[k]);
					}
				}
            }
            return all;
        },
        arrayFilter: function(arr, fn){
            var ret = [],
                len = arr.length;

            while(len--){
                fn(arr[len], len) && ret.push(arr[len]);
            }
            return ret;
        },
        getDataset: function(ele, dataName){
            return ele.dataset ? ele.dataset[dataName] : ele.getAttribute('data-' + dataName);
        },
		bind: function(fn, ctx){
			return function(){
				return fn.apply(ctx, arguments);
			}
		},
		//null, undefined, '', 这些返回真
		isEmpty: function(any){
			return this.isNull(any) || this.isUndefined(any) || (utils.isString(any) && this.trim(any)==='');
		}
    };

	utils.each(['Object', 'Array', 'Number', 'String', 'Boolean', 'Null', 'Undefined'], function(idx, value){
		this['is'+value] = function(any){
			return this.type(any) === value.toLowerCase();
		}
	}, utils);

	return utils;
});