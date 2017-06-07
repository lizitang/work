from action.engine import ServiceAction
from action.report import Reporter
from service.service import Service
from action.engine import ServiceParallelAction
import asyncio
import aiohttp

testService1 = Service("test1", "http://192.168.2.197:8081/cu")
testService2 = Service("test2", "http://sta1.emotibot.com.cn:10701/cu")

def getParams(params):
    result = {}
    result['UniqueID'] = params['UniqueID']
    result['UserID'] = params['UserID']
    result['Text1'] = params['Text1']
    result['robot'] = params['robot']
    return result

async def main(loop):
    params = {};
    params['UniqueID'] = "123"
    params['UserID'] = "100"
    params['Text1'] = "我喜欢谁"
    params['robot'] = "proactive"
    async with aiohttp.ClientSession(loop=loop) as client:
        action1 = ServiceAction(testService1, client, serviceParserFunc=getParams)
        action2 = ServiceParallelAction([testService1, testService2], client, "multiple-service")
        action3 = ServiceAction(testService1, client, action=action1, serviceParserFunc=getParams)
        reporter = Reporter()
        await action3.process(params, reporter)
        for event in reporter.events:
            print(event.actionName)
            print(event.eventType)
            print(event.eventContent)

loop = asyncio.get_event_loop()
loop.run_until_complete(main(loop))
