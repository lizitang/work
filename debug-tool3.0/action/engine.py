# -*- coding: utf-8 -*-
from .report import Reporter
from .report import ReportEvent
from .report import EventType
import asyncio
import aiohttp
import json

class ActionEngine(object):
    """ActionEngine to load action from configuration and handle request"""
    ### action engine start action
    startAction = None
    ### event loop for action engine
    loop = None
    ### connection session for engine
    session = None
    ### configuration loader
    configLoader = None
    ### create action flow chain function
    createFlowFunc = None

    def __init__(self, configLoader, createFlowFunc=None):
        super(ActionEngine, self).__init__()
        self.loop = asyncio.get_event_loop()
        self.session = aiohttp.ClientSession(loop=self.loop)
        self.configLoader = configLoader
        if createFlowFunc is not None and callable(createFlowFunc):
            self.createFlowFunc = createFlowFunc
            ## create flow start action chain by session and config loader
            self.startAction = createFlowFunc(self.session, self.configLoader)

    ### context manager enter
    def __enter__(self):
        if self.startAction:
            print('[Enter {name}]: Allocate loop and session'.format(name=self.startAction.name))
        return self

    ### context manager exist
    def __exit__(self, exc_type, exc_value, exc_tb):
        print('[Exit {name}]: Free resource.'.format(name=self.startAction.name))
        self.shutdown()
        if exc_tb is None:
            print('[Exit {name}]: Exited without exception'.format(name=self.startAction.name))
        else:
            print('[Exit {name}]: Exited with exception raised'.format(name=self.startAction.name))
            return False   # 可以省略，缺省的None也是被看做是False

    ### handle one request
    ### param is dictionary
    def handleRequest(self, params, timeout=2000.0):
        if self.startAction is None:
            return None
        ## report for each request
        reporter = Reporter()
        self.loop.run_until_complete(self.startAction.process(params, reporter))
        return reporter

    ### handle batch request in array
    def handleBatchRequest(self, paramsArray):
        pass

    ## restart engine to create action and service due to configuration change
    def restart(self):
        self.startAction = self.createFlowFunc(self.session, self.configLoader)

    ### shutdown engine
    def shutdown(self):
        try:
            if self.session:
                self.session.close()
        except Exception as e:
            raise
        try:
            if self.loop:
                self.loop.close()
        except Exception as e:
            raise

class Action(object):
    """define normal interface for Action."""
    name = ''
    ### next action to execute
    nextAction = None
    ### parser function
    parserFunc = None

    def __init__(self, name, action=None, parserFunc=None):
        super(Action, self).__init__()
        self.name = name
        self.nextAction = action
        ## parser function
        if callable(parserFunc):
            self.parserFunc = parserFunc


    ### preprocess params for current action
    ### extended action will overwrite this process
    ### parseFunc is parser function to parse params
    def preprocess(self, params, parseFunc=None):
        if parseFunc is not None:
            return parseFunc(params)
        return {}

    ### process action
    ### params is dictionary
    ### reporter to collect statistic information
    async def process(self, params, reporter):
        ## report action START
        reporter.collect(ReportEvent(self.name, EventType.START))
        processedParams = self.preprocess(params, self.parserFunc)
        ## report action RESULT
        reporter.collect(ReportEvent(self.name, EventType.RESULT, processedParams))
        ## report action END
        reporter.collect(ReportEvent(self.name, EventType.END))
        ## put result in params as fixed name "context", context is dictionary with result of each action name
        if 'context' in params:
            context = params['context']
            context[self.name] = processedParams
        else:
            context = {}
            context[self.name] = processedParams
            params['context'] = context
        if self.nextAction is not None:
            # params is modifyed each time by action and would pass to next action
            nextAction.process(processedParams, reporter)

class ServiceAction(Action):
    """service action to run web service by asyncio."""
    ### service to run
    service = None
    ### client session to reuse connection pool
    session = None

    def __init__(self, service, session, action=None, parserFunc=None):
        super(ServiceAction, self).__init__(service.service_name, action, parserFunc)
        self.service = service
        self.session = session

    ### may need to overwrite preprocess to prepare service parameters

    ### process action
    ### params is dictionary
    ### reporter to collect statistic information
    async def process(self, params, reporter):
        ## report action START
        reporter.collect(ReportEvent(self.name, EventType.START))
        ## process the params for service
        serviceParams = self.preprocess(params, self.parserFunc)
        ## get service response
        response = await self.service.fetch(self.session, serviceParams)
        jsonResponse = json.loads(response)
        ## report action RESULT
        reporter.collect(ReportEvent(self.name, EventType.RESULT, jsonResponse))
        ## report action END
        reporter.collect(ReportEvent(self.name, EventType.END))
        ## put result in params as fixed name "context", context is dictionary with result of each action name
        if 'context' in params:
            context = params['context']
            context[self.name] = jsonResponse
        else:
            context = {}
            context[self.name] = jsonResponse
            params['context'] = context
        ## execute next action
        if self.nextAction is not None:
            # params is modifyed each time by action and would pass to next action
            await self.nextAction.process(params, reporter)

class ServiceParallelAction(Action):
    """parallel service action to run multiple services."""
    ### service to run
    services = []
    ### client session to reuse connection pool
    session = None

    def __init__(self, services, session, name, action=None, parserFunc=None):
        super(ServiceParallelAction, self).__init__(name, action, parserFunc)
        if isinstance(services, list):
            self.services = services
        self.session = session

    ### extended action should overwrite this to assemble service parameters
    def preprocess(self, params, parseFunc=None):
        ## return service name and its task parameters
        tasks = {}
        for service in self.services:
            if parseFunc is not None:
                tasks[service.service_name] = parseFunc(params, service.service_name)
            else:
                tasks[service.service_name] = [params]
        return tasks

    ### merge request params and result in dictionary to return
    async def collectServiceResult(self, service, taskParam):
        ## get service result by taskParam dictionary
        result = await service.fetch(self.session,taskParam)
        ## task param is dictionary, clone it and append result
        taskParam['result'] = result
        taskParam['service'] = service.service_name
        return taskParam

    ### fork request to multiple tasks and collect result
    async def forkAndJoin(self, params, reporter):
        tasks = []
        taskParamsDic = self.preprocess(params, parseFunc=self.parserFunc)
        for service in self.services:
            ## get task param lists
            tasksParams = taskParamsDic[service.service_name]
            if isinstance(tasksParams, list):
                ## task should be dictionary
                for taskParam in tasksParams:
                    tasks.append(self.collectServiceResult(service,taskParam))
        if len(tasks) == 0:
            return ''
        return await asyncio.wait(tasks)

    ### process action
    ### params is dictionary
    ### reporter to collect statistic information
    async def process(self, params, reporter):
        ## report action START
        reporter.collect(ReportEvent(self.name, EventType.START))
        ## get multiple service response
        #loop = asyncio.get_event_loop()
        #done, pending = loop.run_until_complete(forkAndJoin(params, reporter))
        done, pending = await self.forkAndJoin(params, reporter)
        response = []
        for doneTask in done:
            data = doneTask.result()
            try:
                jsonResponse = json.loads(data)
                response.append(jsonResponse)
            except Exception as e:
                ## not json format
                response.append(data)
        ## report action RESULT
        reporter.collect(ReportEvent(self.name, EventType.RESULT, response))
        ## report action END
        reporter.collect(ReportEvent(self.name, EventType.END))
        ## put result in params as fixed name "context", context is dictionary with result of each action name
        if 'context' in params:
            context = params['context']
            context[self.name] = response
        else:
            context = {}
            context[self.name] = response
            params['context'] = context
        ## execute next action
        if self.nextAction is not None:
            # params is modifyed each time by action and would pass to next action
            await self.nextAction.process(params, reporter)
