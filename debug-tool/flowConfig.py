from action.engine import ServiceAction
from action.report import Reporter
from service.service import Service
from action.engine import ServiceParallelAction
from action.engine import ActionEngine
from action.engine import Action
import json
import sys
from config import ConfigLoader

def getSegmentParams(params):
    result = {}
    result['q'] = params['Text1']
    return result

def getSolrParams(params):
    result = {}
    ## get previous segment result
    if not 'context' in params:
        return result
    context = params['context']
    if 'segment' in context:
        segmentResult = context['segment']
        segmentArray = segmentResult[0]['segment']
        if segmentArray and segmentArray != "None":
            segments = []
            for wordPos in segmentArray:
                segments.append(wordPos['word'])
            q = ' '.join(segments)
            result['q'] = q
    return result

def getRankerParams(params, serviceName):
    tasks = []
    ## source segments
    sourceSegs = []
    ## solr resulr
    solrDoc = []
    userQ = params['Text1']
    ## get previous segment result
    if not 'context' in params:
        return result
    context = params['context']
    if 'segment' in context:
        segmentResult = context['segment']
        segmentArray = segmentResult[0]['segment']
        if segmentArray and segmentArray != "None":
            for wordPos in segmentArray:
                sourceSegs.append(wordPos['word'])
    if 'solr' in context:
        solrResult = context['solr']
        if 'response' in solrResult:
            response = solrResult['response']
            if 'docs' in response:
                solrDoc = response['docs']
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
    segmentAction = ServiceAction(services['segment'], client, action=solrAction, parserFunc=getSegmentParams)
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
            params['robot'] = "proactive"
            params['serviceweight'] = configLoader.getServiceWeight()
            reporter = engine.handleRequest(params)
            summaryEvents = filter(lambda x:x.actionName == 'summary',reporter.events)
            for event in summaryEvents:
                print(event.actionName)
                print(event.eventType)
                print(event.eventContent)
