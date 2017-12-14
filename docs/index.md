### aws 
指Amazon AWS
### sign
签名：Amazon S3 REST API 使用基于密钥 HMAC (Hash Message Authentication Code) 的自定义 HTTP 方案进行身份验证。
要对请求进行身份验证，您首先需要合并请求的选定元素以形成一个字符串。
然后，您可以使用 AWS 秘密访问密钥来计算该字符串的 HMAC。通常我们将此过程称为“签署请求”并且我们将输出 HMAC 算法称为“签名”，
因为它会模拟真实签名的安全属性。最后，您可以使用本部分中介绍的语法，作为请求的参数添加此签名。

系统收到经身份验证的请求时，将提取您申领的 AWS 秘密访问密钥，并以相同的使用方式将它用于计算已收到的消息的签名。
然后，它会将计算出的签名与请求者提供的签名进行对比。如果两个签名相匹配，则系统认为请求者必须拥有对 AWS 秘密访问密钥的访问权限，
因此充当向其颁发密钥的委托人的颁发机构。如果两个签名不匹配，那么请求将被丢弃，同时系统将返回错误消息。

#### 参考文档
http://docs.aws.amazon.com/zh_cn/AmazonS3/latest/dev/RESTAuthentication.html

# node-aws-sign

Simple module to calculate `Authorization` header for Amazon AWS REST requests.

简单的模块为Amazon AWS REST计算 身份验证标头。

//Amazon S3 REST API 使用标准的 HTTP Authorization 标头来传递身份验证信息。 (标准标头的名称是不可取的，因为它承载的是身份认证信息，而不是授权信息。)注册后，会向开发人员颁发 AWS 访问密钥 ID 和 AWS 秘密访问密钥

Simple it is:
简单的是:

```javascript
var AwsSign = require('aws-sign');

var signer = new AwsSign({ 
	accessKeyId: 'AKIAIOSFODNN7EXAMPLE',// AWS 访问密钥 ID 
	secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY' // AWS 秘密访问密钥
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

//构建CanonicalizedHeaders元素
//所有以“x-amz-”为前缀的HTTP Header被称为CanonicalizedHeaders。

`x-amz-date` substitution is not supported because Node's http module has no problems setting `Date` header.

不支持x-amz-date替换，因为Node的http模块没有设置日期头的问题。

Multiple `x-amz-` keys are not supported. I.e. the following part of the example won't work: 

不支持多个x - amz键。例如，以下部分的例子不起作用:

	X-Amz-Meta-ReviewedBy: joe@johnsmith.net
	X-Amz-Meta-ReviewedBy: jane@johnsmith.net

Use a single header instead: 

用一个标题代替:

	X-Amz-Meta-ReviewedBy: joe@johnsmith.net,jane@johnsmith.net

## 0.0.x to 0.1.x migration guide( 迁移指南)

0.1.x supports the same options as http.request (thanks to Ben Trask). 

0.1.x支持相同的选项如http.request

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
#### index.js
https://github.com/zhangshans3/node-aws-signn/blob/master/index.js
#### test
https://github.com/zhangshans3/node-aws-signn/blob/master/test/SignTest.js#L11
