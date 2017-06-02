import configparser
from service.service import Service

class ConfigLoader(object):
    """ConfigLoader to load and save configuration."""
    ## configuration file
    configFile = None
    ## config dictionary
    config = None

    def __init__(self, configFile="config.ini"):
        super(ConfigLoader, self).__init__()
        self.configFile = configFile
        ## load configuration
        self.config = configparser.ConfigParser(interpolation=configparser.BasicInterpolation())
        ## set config case senstive
        self.config.optionxform = str
        self.config.read(self.configFile)

    ### load service by config sections
    def loadServices(self):
        services = {}
        ## each section is one service
        sections = self.config.sections()
        for section in sections:
            print('Load service: {name} configuration -- start.'.format(name=section))
            ## service has url
            if 'url' in self.config[section]:
                url = self.config[section]['url']
                ## if service has params configuration
                if 'params' in self.config[section]:
                    ## get all parameter name
                    sectionDic = self.config[section]
                    paramNames = sectionDic.get('params').split(',')
                    params = {}
                    ## assemble all params
                    for paramName in paramNames:
                        paramName = paramName.strip()
                        value = sectionDic.get(paramName)
                        print('Load parameter key value pair is {key} = {value}.'.format(key=paramName, value=value))
                        params[paramName] = value
                    service = Service(section, url, params)
                    services[section] = service
                else:
                    service = Service(section, url)
                    services[section] = service
            print('Load service: {name} configuration -- done.'.format(name=section))
        return services

    ### get all services dictionary with scoreWeight
    def getServiceWeight(self):
        services = {}
        ## each section is one service
        sections = self.config.sections()
        for section in sections:
            if 'scoreweight' in self.config[section]:
                weight = self.config[section]['scoreweight']
                services[section] = weight
        return services

    ### update one configuration section
    def update(self, sectionName, paramsDic):
        print(sectionName)
        print(paramsDic)
        ## content to be updated should not be empty
        if paramsDic and sectionName:
            ## update section
            if sectionName in self.config.sections():
                for key in paramsDic:
                    self.config[sectionName][key] = paramsDic[key]
            else:
                ## create new section
                self.config[sectionName] = paramsDic
            ## write file
            with open(self.configFile, 'w') as f:
                self.config.write(f)
            pass

    ### update multiple sections
    def updateMultiple(self, sections):
        ## section dictionary is not empty
        if sections:
            for section in sections:
                ## update section
                if section in self.config.sections():
                    paramsProvided = sections[section]
                    for key in paramsProvided:
                        self.config[section][key] = paramsProvided[key]
                else:
                    ## create new section
                    self.config[section] = sections[section]
        ## write file
        with open(self.configFile, 'w') as f:
            self.config.write(f)
        pass
