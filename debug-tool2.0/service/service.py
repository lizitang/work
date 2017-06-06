# -*- coding: utf-8 -*-
import urllib.parse
import aiohttp
import asyncio

### service defination
class Service(object):
    """defination for Service."""
    ### service name
    service_name = ''
    ### service url
    service_url = ''
    ### request method, defult is GET
    request_method = 'GET'
    ### configuration is fixed params and would be add to service request parameters
    ### dynamic parameters should load from request
    config = None

    def __init__(self, service_name, service_url, config={}):
        super(Service, self).__init__()
        self.service_name = service_name
        self.service_url = service_url
        self.config = config

    def setMethod(self, method):
        self.request_method = method

    ### method to fetch service result
    async def fetch(self, client, params):
        if self.request_method == 'GET':
            params.update(self.config)
            async with client.get(self.service_url, params=params) as resp:
                assert resp.status == 200
                ## to support all kinds of response, use external JSON decoder
                return await resp.text()
        else:
            return ""

## main function for test
async def main(loop, service, params):
    async with aiohttp.ClientSession(loop=loop) as client:
        result = await service.fetch(client, params)
        print(result)

if __name__ == '__main__':
    testService = Service("session", "http://192.168.2.197:8081/cu")
    params = {};
    params['UniqueID'] = "123"
    params['UserID'] = "100"
    params['Text1'] = "我喜欢谁"
    params['robot'] = "proactive"
    loop = asyncio.get_event_loop()
    loop.run_until_complete(asyncio.wait([main(loop, testService, params), main(loop, testService, params)]))
    loop.close()
