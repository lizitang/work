# -*- coding: utf-8 -*-
from flask import Flask
from flask import abort
from flask import request
from flask import jsonify
from flask_cors import CORS
from config import ConfigLoader
from action.engine import ActionEngine
from action.report import Reporter
from action.report import EventType
import flowConfig
import os
import sys

# start flask
app = Flask(__name__)
# allow access orgin
CORS(app)
# run app with options
def flaskrun(app, default_debug=True, default_host="127.0.0.1", default_port="5000"):
    app.run(
        debug=default_debug,
        host=default_host,
        port=int(default_port)
    )

def initApp(initFile='test.ini'):
    # action configuration
    global configLoader
    # acction engine
    global actionEngine

    if os.environ.get('APP_CONFIG'):
        # load app configuration from enviroment
        app.config.from_envvar('APP_CONFIG')
    if app.config and 'CONFIG_FILE' in app.config:
        # get engine configuration file
        configFile = app.config['CONFIG_FILE']
        # load configuration
        configLoader = ConfigLoader(configFile=configFile)
    else:
        print('Load config from {name}'.format(name = initFile))
        configLoader = ConfigLoader(configFile=initFile)

# get engine configuration
@app.route('/rest/config/get', methods=['GET'])
def getConfig():
    # if configuration not found
    if configLoader is None:
        abort(404)
    # return configuration
    return jsonify({'config': configLoader.config._sections})

# update engine configuration one section
@app.route('/rest/config/section/update', methods=['POST'])
def updateSection():
    # if configuration not found
    if configLoader is None:
        abort(404)
    # if request is not json and has no section config then abort
    if not request.json or not 'section' in request.json or not 'config' in request.json:
        abort(400)
    # get section and params
    params = request.json.get('config', {})
    section = request.json.get('section', '')
    try:
        ## update configuration
        configLoader.update(section, params)
        ## restart action engine to reload actions
        actionEngine.restart()
    except Exception as e:
        return jsonify({'status': 'fail', "error": str(e)})
    # return status OK
    return jsonify({'status': 'OK', 'section' : section,'config': configLoader.config._sections})

# update engine configuration multiple section
@app.route('/rest/config/all/update', methods=['POST'])
def updateConfig():
    # if configuration not found
    if configLoader is None:
        abort(404)
    # if request is not json and has no section config then abort
    if not request.json or not 'config' in request.json:
        abort(400)
    # get section and params
    params = request.json.get('config', {})
    try:
        configLoader.updateMultiple(params)
        actionEngine.restart()
    except Exception as e:
        return jsonify({'status': 'fail', "error": str(e)})
    # return status OK
    return jsonify({'status': 'OK','config': configLoader.config._sections})

# action engine process
@app.route('/rest/debug/trace', methods=['GET'])
def trace():
    # if classifier not found
    if actionEngine is None:
        abort(404)
    # default result unknown
    result = "UNKNOWN"
    # process get
    if request.method == 'GET':
        # get text of input
        text = request.args.get('text')
        if text is None or len(text) == 0:
            abort(400)
        try:
            params = {};
            params['Text1'] = text
            params['robot'] = "proactive"
            params['serviceweight'] = configLoader.getServiceWeight()
            reporter = actionEngine.handleRequest(params)
            # traverse all to collect all report result
            result = []
            actions = {}
            for event in reporter.events:
                actionName = event.actionName
                # if action exists
                if actionName in actions:
                    actionReport = actions[actionName]
                else:
                    # create new action report
                    actionReport = {}
                    actionReport['name'] = actionName
                    actions[actionName] = actionReport
                # set event value
                if event.eventType == EventType.START:
                    actionReport['start'] = event.eventContent
                elif event.eventType == EventType.END:
                    actionReport['end'] = event.eventContent
                else:
                    actionReport['result'] = event.eventContent
                if 'start' in actionReport and 'end' in actionReport and 'result' in actionReport:
                    #actionReport['time'] = int(actionReport['end']) - int(actionReport['start'])
                    result.append(actionReport)
        except Exception as e:
            print('Error occurs when tracing result: {ex}'.format(ex=e))
            return jsonify({'status': 'fail', "error": str(e)})
    # return result
    return jsonify({'result': result})

if __name__ == '__main__':
    initFile = None
    debugMode = True
    # get parameters
    size = len(sys.argv)
    # python scriptFileName initFile debugMode
    if size == 3:
        initFile = sys.argv[1]
        debugMode = sys.argv[2]
    ## init APP
    if initFile is not None:
        initApp(initFile=initFile)
    else:
        ## init app
        initApp()
    ## start action engine
    with ActionEngine(configLoader, createFlowFunc=flowConfig.initAction) as engine:
        actionEngine = engine
        # run app
        flaskrun(app,default_debug=debugMode)
