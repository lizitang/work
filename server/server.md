### Chat Bot Debug Tool Backend

### Description
```
chat bot 聊天后台服务，包括session ID生成和QA pair的CRUD操作。
```
### Dependency Configuration/Database
Mongodb -- 对话QA Pair的数据存储

### Owner
```
RD: 熊耀华
PM: 童旭平
GIT: https://gitlab.emotibot.com/yaohuaxiong/sales-bot-backend.git
```
### Session ID Gernerate API
```
GET http://<IP>:<Port>/session
```
参数说明

	Param           | Format         | Default | Description
	----------------| -------------- | ----    | -----
	无需参数           |          |    |
	
输出说明


Param           | Format         | Default | Description
----------------| -------------- | ----    | -----
id            | String       | None    | 9位的ID
timestamp         | long         | None    | 当前时间戳

范例

```
# Response
{
"id": "ryCQAyDlZ",
"timestamp": 1494838821951
}
```

### QA Pair Query API
```
1.查询session中一轮对话： GET http://<IP>:<Port>/qa?session_id=By0qo0IgW&sequence=1
2.查询session中全部对话： GET http://<IP>:<Port>/qa?session_id=By0qo0IgW
3.查询session中全部对话： GET http://<IP>:<Port>/qa/all?session_id=By0qo0IgW

```
参数说明

	Param           | Format         | Default | Description
	----------------| -------------- | ----    | -----
	session_id           | String         | None    |9位的ID,可以通过添加URL parameter的方式或者通过cookie "sessionID"传递
	sequence      | Number         | None    | 对话轮数的顺序ID，通过URL Parameter传递
输出说明


Param           | Format         | Default | Description
----------------| -------------- | ----    | -----
status            | String         | None    | 数据返回状态，正常为"OK”
result         | Array         | None    | QA Pair的数组
范例

```
# Input
http://<IP>:<Port>/qa?session_id=By0qo0IgW&sequence=1
# Response
{
	"status":"OK",
	"result"[{
	"_id":"5919712227eb8911c669f37e",
	"session_id":"By0qo0IgW",
	"sequence":1,
	"__v":0,
	"date":"2017-05-15T09:13:06.744Z",
	"robot_answer":{
		"content":"贝玲妃反孔精英毛孔清透随心面膜，也叫爆珠面膜，使用时挤压蓝色爆珠按钮，精华液就会渗透到面膜上，新颖好玩哟~",
		"refined_content":"",
		"act":"request+product(category=面膜)",
		"refined_act":""},
	"user_question":{
		"content":"恩恩",
		"act":"accept",
		"refined_act":"accept+product"
		}
	}]
}
```
### QA Pair Create API
```
POST http://<IP>:<Port>/qa

```
参数说明

	Param           | Format         | Default | Description
	----------------| -------------- | ----    | -----
	session_id           | String         | None    |9位的ID
	sequence      | Number         | None    | 对话轮数的顺序ID
	user_question      | JSON         | None    | 用户输入的JSON
	robot_answer      | JSON         | None    | Robot回复的JSON
输出说明


Param           | Format         | Default | Description
----------------| -------------- | ----    | -----
status            | String         | None    | 数据返回状态，正常为"OK”，失败为"Fail"
msg         | String         | None    | 返回的提示信息
范例

```
# Input
POST http://<IP>:<Port>/qa
# Input
{
	"session_id":"By0qo0IgW",
	"sequence":1,
	"robot_answer":{
		"content":"贝玲妃反孔精英毛孔清透随心面膜，也叫爆珠面膜，使用时挤压蓝色爆珠按钮，精华液就会渗透到面膜上，新颖好玩哟~",
		"refined_content":"",
		"act":"request+product(category=面膜)",
		"refined_act":""
	},
	"user_question":{
		"content":"恩恩",
		"act":"accept",
	}
}

# Response
{
"status": "Fail",
"msg": "sessionID:By0qo0IgW sequence:1 already exists."
}

```
### QA Pair Update API
```
PUT http://<IP>:<Port>/qa

```
参数说明

	Param           | Format         | Default | Description
	----------------| -------------- | ----    | -----
	session_id           | String         | None    |9位的ID
	sequence      | Number         | None    | 对话轮数的顺序ID
	user_question      | JSON         | None    | 用户输入的JSON
	robot_answer      | JSON         | None    | Robot回复的JSON
输出说明


Param           | Format         | Default | Description
----------------| -------------- | ----    | -----
status            | String         | None    | 数据返回状态，正常为"OK”，失败为"Fail"
result         | JSON         | None    | 返回更新后的QA Pair数据
范例

```
# Input
POST http://<IP>:<Port>/qa
# Input
{
	"session_id":"By0qo0IgW",
	"sequence":1,
	"robot_answer":{
		"content":"贝玲妃反孔精英毛孔清透随心面膜，也叫爆珠面膜，使用时挤压蓝色爆珠按钮，精华液就会渗透到面膜上，新颖好玩哟~",
		"refined_content":"",
		"act":"request+product(category=面膜)",
		"refined_act":""
	},
	"user_question":{
		"content":"恩恩",
		"act":"accept",
		refined_act": "accept+product"
	}
}

# Response
{
"status": "OK",
"result": {
	"_id":"5919712227eb8911c669f37e",
	"session_id":"By0qo0IgW",
	"sequence":1,
	"__v":0,
	"date":"2017-05-15T09:13:06.744Z",
	"robot_answer":{
		"content":"贝玲妃反孔精英毛孔清透随心面膜，也叫爆珠面膜，使用时挤压蓝色爆珠按钮，精华液就会渗透到面膜上，新颖好玩哟~",
		"refined_content":"",
		"act":"request+product(category=面膜)",
		"refined_act":""},
	"user_question":{
		"content":"恩恩",
		"act":"accept",
		"refined_act":"accept+product"
		}
	}
}

```
### QA Pair Delete API
```
Delete http://<IP>:<Port>/qa

```
参数说明

	Param           | Format         | Default | Description
	----------------| -------------- | ----    | -----
	session_id           | String         | None    |9位的ID
	sequence      | Number         | None    | 对话轮数的顺序ID，如果未提供则删除整个session的纪录	
输出说明


Param           | Format         | Default | Description
----------------| -------------- | ----    | -----
status            | String         | None    | 数据返回状态，正常为"OK”，失败为"Fail"
msg         | String         | None    | 提示信息
范例

```
# Input
DELETE http://<IP>:<Port>/qa
# Input
{
	"session_id":"By0qo0IgW",
	"sequence":1,
}

# Response
{
"status": "OK"
}

```


#### Framework

Nodejs v7.9.0 + Express + MongoDB

### Health Check API
GET http://<ip>:11201/memory/rest/cache/get?userId=xxxx&count=1
