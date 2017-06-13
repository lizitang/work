from action.engine import ServiceAction
from action.report import Reporter
from service.service import Service
from action.engine import ServiceParallelAction
from action.engine import ActionEngine
from action.engine import Action
import json
import sys
from config import ConfigLoader

#def getSegmentParams(params):
#    result = {}
#    result['q'] = params['Text1']
#    return result

## function to assemble segment parameters
## support add solr extended sentence manually
def getSegmentParams(params, serviceName):
    # each segment is one task
    tasks = []
    if serviceName == "segment":
        result = {}
        result['q'] = params['Text1']
        # add identifier for task
        result['id'] = 'userQuery'
        # add original user query as one task
        tasks.append(result)
        # if there is extended solr question
        if 'SolrExtended' in params and isinstance(params['SolrExtended'], list):
            extendId = 0
            for solrExtendedQ in params['SolrExtended']:
                extendResult = {}
                extendResult['q'] = solrExtendedQ
                # add identifier for task
                extendResult['id'] = 'solrExtended_' + str(extendId)
                extendId += 1
                tasks.append(extendResult)
    return tasks

## function to assemle solr request parameters
def getSolrParams(params):
    result = {}
    ## get previous segment result
    if not 'context' in params:
        return result
    context = params['context']
    if 'segment' in context:
        # segment results is array of multiple segment tasks
        taskResults = context['segment']
        userSegmentResult = None
        # get user query segments
        for taskResult in taskResults:
            if taskResult['id'] == 'userQuery':
                userSegmentResult = taskResult['result']
                break
        # get user query segment, result is text, should convert to JSON
        segmentResult = json.loads(userSegmentResult)
        segmentArray = segmentResult[0]['segment']
        if segmentArray and segmentArray != "None":
            segments = []
            for wordPos in segmentArray:
                segments.append(wordPos['word'])
            q = ' '.join(segments)
            result['q'] = q
    return result

## function to assemble ranker task lists for each ranker services
## support to add solr extended sentence manually
## this function will be executed each time for service in ranker actions
def getRankerParams(params, serviceName):
    tasks = []
    ## source segments
    sourceSegs = []
    ## solr resulr
    solrDoc = []
    userQ = params['Text1']
    ## user provided solr extended question
    solrExtendedResults = []
    solrExtendDocs = []
    ## get previous segment result
    if not 'context' in params:
        return result
    context = params['context']
    ## extract segment results
    if 'segment' in context:
        # segment results is array of multiple segment tasks
        segmentResults = context['segment']
        userQuerySegmentResult = None
        # extract user query segment and solr extended query segments
        for segmentResult in segmentResults:
            if segmentResult['id'] == 'userQuery':
                userQuerySegmentResult = segmentResult['result']
            else:
                solrExtendedResults.append(segmentResult)
        segmentArray = json.loads(userQuerySegmentResult)[0]['segment']
        if segmentArray and segmentArray != "None":
            for wordPos in segmentArray:
                sourceSegs.append(wordPos['word'])

    # if there is solr extened query, append it as solr document
    # when there already exists then ignore to make sure execute only once
    if len(solrExtendedResults) > 0 and not 'solrExtendedDoc' in context:
        for solrExtendedResult in solrExtendedResults:
            segmentArray = json.loads(solrExtendedResult['result'])[0]['segment']
            if segmentArray and segmentArray != "None":
                # get segments
                segs = []
                for wordPos in segmentArray:
                    segs.append(wordPos['word'])
                # create solr extend document
                solrExtendDoc = {}
                solrExtendDoc['sentence'] = " ".join(segs)
                solrExtendDoc['id'] = solrExtendedResult['id']
                solrExtendDoc['sentence_original'] = solrExtendedResult['q']
                solrExtendDoc['related_sentences'] = ['{"answer": "扩写问题"}']
                solrExtendDocs.append(solrExtendDoc)

    if 'solr' in context:
        solrResult = context['solr']
        if 'response' in solrResult:
            response = solrResult['response']
            ## if there is already solr docs
            if 'docs' in response:
                solrDoc = response['docs']
                if isinstance(solrDoc, list) and len(solrExtendDocs) > 0 and not 'solrExtendedDoc' in context:
                    ## extend solr extend docs
                    solrDoc.extend(solrExtendDocs)
            elif not 'solrExtendedDoc' in context and len(solrExtendDocs) > 0:
                ## set solr extended docs
                response['docs'] = solrExtendDocs
            ## put solr extend docs
            if len(solrExtendDocs) > 0:
                context['solrExtendedDoc'] = solrExtendDocs

    ## there is no segments for user query then return
    if len(sourceSegs) == 0:
        return tasks
    src_seg = ','.join(sourceSegs)
    if serviceName == "word2vec":
        if isinstance(solrDoc, list):
            for doc in solrDoc:
                result = {}
                result['src_seg'] = src_seg
                sentence = doc['sentence']
                tar_seg = ','.join(sentence.split(" "))
                result['tar_seg'] = tar_seg
                ## add solr doc id for further summary
                ## set doc id as task identifier
                result['solrDoc'] = doc['id']
                tasks.append(result)
    elif serviceName == "embedding_similarity":
        if isinstance(solrDoc, list):
            for doc in solrDoc:
                result = {}
                result['user_q'] = userQ
                sentence = doc['sentence_original']
                result['match_q'] = sentence
                ## add solr doc id for further summary
                result['solrDoc'] = doc['id']
                tasks.append(result)
    return tasks

## function to summarize score
def summary(params):
    result = []
    rankResult = None
    solrDocs = None
    if not 'context' in params:
        return result
    context = params['context']
    if 'ranker' in context:
        rankResult = context['ranker']
    if 'solr' in context:
        solrResult = context['solr']
        if 'response' in solrResult:
            response = solrResult['response']
            if 'docs' in response:
                solrDocs = response['docs']

    if isinstance(solrDocs, list) and isinstance(rankResult, list):
        ## organize result by service name and solrDoc id
        rankerSocreResult = {}
        for e in rankResult:
            id = e['solrDoc']
            if id in rankerSocreResult:
                scores = rankerSocreResult[id]
                ## scores is dictionary of service result
                scores[e['service']] = e['result']
            else:
                scores = {}
                ## scores is dictionary of service result
                scores[e['service']] = e['result']
                rankerSocreResult[id] = scores
        for solrDoc in solrDocs:
            ## get each ranker result for solr Doc
            id = solrDoc['id']
            if id in rankerSocreResult:
                scores = rankerSocreResult[id]
                finalScore = 0.00
                ## summarize the score by weight of each service
                for service in scores:
                    ## get score weight
                    weight = params['serviceweight'][service]
                    score = scores[service]
                    finalScore += float(score) * float(weight)
                item = {}
                item['query'] = solrDoc['sentence_original']
                standQ = json.loads(solrDoc['related_sentences'][0])
                item['standardQuery'] = standQ['answer']
                item['score'] = finalScore
                result.append(item)
    ## sort result desc
    result = sorted(result, key=lambda x:x['score'], reverse=True)
    return result

def initAction(client, configLoader):
    ## get all services
    services = configLoader.loadServices()
    summaryAction = Action('summary', parserFunc=summary)
    rankerservices = []
    if 'services' in configLoader.config['ranker']:
        items = configLoader.config['ranker']['services'].split(',')
        for serviceName in items:
            rankerservices.append(services[serviceName.strip()])
    rankAction= ServiceParallelAction(rankerservices, client, "ranker", action=summaryAction, parserFunc=getRankerParams)
    solrAction = ServiceAction(services['solr'], client,action=rankAction, parserFunc=getSolrParams)
    ## support to add solr extended questions to compare with original user input, then all input need to be segmented
    ##segmentAction = ServiceAction(services['segment'], client, action=solrAction, parserFunc=getSegmentParams)
    segmentAction = ServiceParallelAction([services['segment']], client, "segment", action=solrAction, parserFunc=getSegmentParams)
    return segmentAction

if __name__ == '__main__':
    # get parameters
    size = len(sys.argv)
    # python scriptFileName configFile inputSentence
    if size == 3:
        configFile = sys.argv[1]
        inputSentence = sys.argv[2]
        ## load configuration
        configLoader = ConfigLoader(configFile=configFile)
        with ActionEngine(configLoader, initAction) as engine:
            params = {};
            params['Text1'] = inputSentence
            ## could add solr extend question manually in process
            ## params['SolrExtended'] = ['白条干嘛的', '白条是什么']
            params['robot'] = "proactive"
            params['serviceweight'] = configLoader.getServiceWeight()
            reporter = engine.handleRequest(params)
            summaryEvents = filter(lambda x:x.actionName == 'summary',reporter.events)
            for event in summaryEvents:
                print(event.actionName)
                print(event.eventType)
                print(event.eventContent)
