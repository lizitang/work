from action.engine import ServiceAction
from action.report import Reporter
from service.service import Service
from action.engine import ServiceParallelAction
from action.engine import ActionEngine


testService1 = Service("test1", "http://192.168.2.197:8081/cu")
testService2 = Service("test2", "http://sta1.emotibot.com.cn:10701/cu")

def getParams(params):
    result = {}
    result['UniqueID'] = params['UniqueID']
    result['UserID'] = params['UserID']
    result['Text1'] = params['Text1']
    result['robot'] = params['robot']
    return result

def getParams2(params, serviceName):
    if serviceName == "test1":
        result = {}
        result['UniqueID'] = params['UniqueID']
        result['UserID'] = params['UserID']
        result['Text1'] = params['Text1']
        result['robot'] = params['robot']
    elif serviceName == "test2":
        result = {}
        result['UniqueID'] = params['UniqueID']
        result['UserID'] = params['UserID']
        result['Text1'] = "我好讨厌你"
        result['robot'] = params['robot']
    return [result]

def config(client):
    action2 = ServiceParallelAction([testService1, testService2], client, "multiple-service", serviceParserFunc=getParams2)
    action1 = ServiceAction(testService1, client, action=action2, serviceParserFunc=getParams)
    action3 = ServiceAction(testService1, client, action=action1, serviceParserFunc=getParams)
    return action3

if __name__ == '__main__':
    with ActionEngine(config) as engine:
        params = {};
        params['UniqueID'] = "123"
        params['UserID'] = "100"
        params['Text1'] = "我喜欢谁"
        params['robot'] = "proactive"
        reporter = engine.handleRequest(params)
        for event in reporter.events:
            print(event.actionName)
            print(event.eventType)
            print(event.eventContent)
        reporter = engine.handleRequest(params)
        for event in reporter.events:
            print(event.actionName)
            print(event.eventType)
            print(event.eventContent)
