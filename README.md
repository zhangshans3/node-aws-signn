# node-aws-sign
/*aws是业务流程管理开发平台,node-业务流程管理开发标志 */

Simple module to calculate `Authorization` header for Amazon AWS REST requests.

简单的模块为Amazon AWS REST计算`Authorization`头部。


Simple it is:

简单的是:
```javascript
var AwsSign = require('aws-sign');
/*创建一个用户*/
var signer = new AwsSign({ 
	accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
	secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
});

var opts = {
	method: 'PUT',
	host: 'johnsmith.s3.amazonaws.com',
	path: '/photos/puppy.jpg',
	headers: { ... },
	... // Other request options, ignored by AwsSign.
};
signer.sign(opts);
https.request(opts, ...);
```

The following keys are mandatory: 

以下密钥是强制性的:

* `method`
* `host`
* `path`

Others are optional. A date header (`headers.date`) will be added for you if it is not already set.

其他都是可选的。如果还没有设置日期头(header . date)，则将为您添加日期。

## Non-goals

Node.js has no legacy ;-) so there is no need to support some legacy features of Amazon API for older software. I.e. there is no support for path-style bucket access.

Node.js没有遗留问题;-)因此，没有必要为旧的软件支持Amazon API的一些遗留特性。也就是说，没有对路径样式的bucket访问的支持。

`x-amz-date` substitution is not supported because Node's http module has no problems setting `Date` header.

不支持x - amz日期替换，因为Node的http模块没有设置日期头的问题。

Multiple `x-amz-` keys are not supported. I.e. the following part of the example won't work: 

不支持多个x - amz键。例如，以下部分的例子不起作用:

	X-Amz-Meta-ReviewedBy: joe@johnsmith.net
	X-Amz-Meta-ReviewedBy: jane@johnsmith.net

Use a single header instead: 

用一个标题代替:

	X-Amz-Meta-ReviewedBy: joe@johnsmith.net,jane@johnsmith.net

## 0.0.x to 0.1.x migration guide(x迁移指南)

0.1.x supports the same options as http.request (thanks to Ben Trask). 

0.1.x支持与相同的选项如http.request

Before:

```javascript
	auth = signer.sign({
		method: 'PUT', 
		bucket: 'johnsmith', 
		path: '/photos/puppy.jpg', 
		date: 'Tue, 27 Mar 2007 21:15:45 +0000', 
		contentType: 'image/jpeg'
	});
	http.request({
		…
		headers: {
			…,
			Authorization: auth
		}
	});
```

After: 

```javascript
	var opts = {
		method: 'PUT', 
		host: 'johnsmith.s3.amazonaws.com',
		path: '/photos/puppy.jpg', 
		headers: {
			date: 'Tue, 27 Mar 2007 21:15:45 +0000', 
			contentType: 'image/jpeg'
		}
	};
	signer.sign(opts);
	http.request(opts);
```


## Testing(检验)

	nodeunit test/
	
## Installation(安装)

	npm install aws-sign

## Author

Egor Egorov, me@egorfine.com.

## License

MIT.
