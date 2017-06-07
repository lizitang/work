from action.engine import ServiceAction
from action.report import Reporter
from service.service import Service
from action.engine import ServiceParallelAction
from action.engine import ActionEngine
from action.engine import Action
import json
import sys

segmentService = Service("segment", "http://sta1.emotibot.com.cn:13901/", {"f":"segment", "appid":"1"})
solrServiceConfg = {}
solrServiceConfg['fq']='database:716ef4dafc0e14665bbdd08138e48904_edit'
solrServiceConfg['wt']='json'
solrServiceConfg['indent']='true'
solrServiceConfg['rows']=30
solrService = Service("solr", "http://192.168.1.127:8081/solr/3rd_core/select", solrServiceConfg)
word2vecService= Service("word2vec", "http://dev1.emotibot.com:11501/customQA_w2v")

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
            print(segments)
            q = ' '.join(segments)
            print(q)
            result['q'] = q
    return result

def getRankerParams(params, serviceName):
    tasks = []
    ## source segments
    sourceSegs = []
    ## solr resulr
    solrDoc = []
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

    print(sourceSegs)
    if len(sourceSegs) == 0:
        return tasks
    src_seg = ','.join(sourceSegs)
    print(src_seg)
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

    return tasks

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
                ## summarize the score by expression
                finalScore = scores['word2vec']
                item = {}
                item['query'] = solrDoc['sentence_original']
                standQ = json.loads(solrDoc['related_sentences'][0])
                item['standardQuery'] = standQ['answer']
                item['score'] = finalScore
                result.append(item)
    ## sort result desc
    result = sorted(result, key=lambda x:x['score'], reverse=True)
    return result

def config(client):
    summaryAction = Action('summary', parserFunc=summary)
    rankAction= ServiceParallelAction([word2vecService], client, "ranker", action=summaryAction, parserFunc=getRankerParams)
    solrAction = ServiceAction(solrService, client,action=rankAction, parserFunc=getSolrParams)
    segmentAction = ServiceAction(segmentService, client, action=solrAction, parserFunc=getSegmentParams)
    return segmentAction

if __name__ == '__main__':
    # get parameters
    size = len(sys.argv)
    # python scriptFileName inputSentence
    if size == 2:
        inputSentence = sys.argv[1]
        with ActionEngine(config) as engine:
            params = {};
            params['UniqueID'] = "123"
            params['UserID'] = "100"
            params['Text1'] = inputSentence
            params['robot'] = "proactive"
            reporter = engine.handleRequest(params)
            summaryEvents = filter(lambda x:x.actionName == 'summary',reporter.events)
            for event in summaryEvents:
                print(event.actionName)
                print(event.eventType)
                print(event.eventContent)
