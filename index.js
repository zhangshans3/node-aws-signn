var 
	crypto = require('crypto'),//加密模块
	querystring = require('querystring');//查询字符串模块


function AWSRestSigner(credentials) {
	this.accessKeyId = credentials.accessKeyId; //AWS 访问密钥 ID
	this.secretAccessKey = credentials.secretAccessKey; //AWS 秘密访问密钥
	this.debug = false;//调试
}

AWSRestSigner.subResources = ['acl', 'lifecycle', 'location', 'logging', 'notification', 'partNumber', 'policy', 'requestPayment', 'torrent', 'uploadId', 'uploads', 'versionId', 'versioning', 'versions', 'website'];
                             /*“acl”，“生命周期”， “位置”，      “日志”，    “通知”，    “零件编号”，   “政策”，  “请求付款”，     “流”，     “上传ID”，   “上传”  ，“版本Id”    ，“版本”，      “版本”，    “网站”*/
AWSRestSigner.prototype.canonizeAwzHeaders = function(xAmzHeaders) {
	if (xAmzHeaders) {
		var lcHeaders = {};
		Object.keys(xAmzHeaders).forEach(function(header) {
			//对xAmzHeaders可枚举属性和方法的名称进行遍历
			var h = header.toLowerCase();//转换为小写
			if (h!='x-amz-date')  {
				lcHeaders[h]=xAmzHeaders[header];
			}
		});
		//创建lcHeaders;对xAmzHeader可枚举属性和方法的名称进行遍历，并将其转换为小写复制给h，如果h不是x-amz-date，
		//则将xAmzHeaders[header]赋值给lcHeaders[h]

		return Object.keys(lcHeaders)
			.map(function(header) {
				return header.toLowerCase();
			})//遍历
			.sort()//排序
			.map(function(header) {
				return header+':'+lcHeaders[header]+"\n";
			})//遍历
			.join('');
	} else { 
		return '';
	}
}

AWSRestSigner.prototype.extractSubResources = function(queryString) {
//提取子资源
	var query = querystring.parse(queryString);
	//将字符串转成对象

	var subresources = [];
	Object.keys(query).forEach(function(param) {
		if (AWSRestSigner.subResources.indexOf(param)>=0) {
			//param中每一位都大于等于0；
			subresources.push(param);
			//在subresources末尾添加param；
		}
	});

	if (subresources.length) {
		//subresources 不为空
		subresources = subresources.sort();
		var queryToSign = subresources.map(function(param) {
			var result = param;
			if (query[param]!='') {
				result+="="+query[param];
			}
			return result;
		});
		return "?"+queryToSign.join("&")
	}

	return '';
}

AWSRestSigner.prototype.sign = function(opts) {
	var
		method = opts.method,
		host = opts.host || '',
		path = opts.path || opts.pathname,
		xAmzHeaders = {},
		date, contentType, contentMd5,
		bucket = "";//桶

	var _match = host.match(/^(.*)\.s3\.amazonaws\.com/); //检索
	if (_match) {
		bucket = _match[1];
	} else {
		bucket = host;
	}

	if (!opts.headers) {
		opts.headers = {};
	}

	Object.keys(opts.headers).forEach(function(key) {
		var lcKey = key.toLowerCase();
		switch(lcKey) {
			case "date": 
				date = opts.headers[key]; 
				break;
			case "content-type": 
				contentType = opts.headers[key]; 
				break;
			case "content-md5": 
				contentMd5 = opts.headers[key]; 
				break;
			default:
				if("x-amz-" === lcKey.slice(0, 6)) {
					xAmzHeaders[lcKey] = opts.headers[key];
				}
				break;
		}
	});

	if (!date) {
		date = new Date().toUTCString();//根据世界时 (UTC) 把 Date 对象转换为字符串，并返回结果。
		opts.headers.date = date;
	}
	
	opts.headers["Authorization"] = this._sign(method, bucket, path, date, contentType, contentMd5, xAmzHeaders);
}


AWSRestSigner.prototype._sign = function(method, bucket, path, date, contentType, contentMd5, xAmzHeaders) {
	var qPos = path.indexOf('?'), //返回第一次出现？的位置
	    queryToSign='';
	if (qPos>=0) {
		var queryPart = path.substr(qPos+1, path.length);//截取？之后内容
		path = path.substr(0,qPos);//截取？及之前内容
		queryToSign = this.extractSubResources(queryPart);//提取子资源
	}

	var canonicalizedAmzHeaders = this.canonizeAwzHeaders(xAmzHeaders);

	var canonicalizedResource = '';//规范化资源
	if (bucket!='') {
		canonicalizedResource += '/'+bucket;
	}
	canonicalizedResource += path + queryToSign;

	var stringToSign = method + "\n";
	if (contentMd5) { 
		stringToSign += contentMd5;
	} 
	stringToSign += "\n";

	if (contentType) {
		stringToSign += contentType;
	}
	stringToSign += "\n";

	stringToSign +=  
		date + "\n" +
		canonicalizedAmzHeaders +
		canonicalizedResource;

	if (this.debug) { 
		console.log("-----------")
		console.log(stringToSign.replace(/\n/g, "\\n\n"));
		console.log("-----------")
	}

	return 'AWS ' + this.accessKeyId + ':' + crypto.createHmac('sha1', this.secretAccessKey).update(stringToSign).digest('base64'); 
}

module.exports = AWSRestSigner;
//暴露模块

