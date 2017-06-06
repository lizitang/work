# -*- coding: utf-8 -*-
from enum import Enum
import time

class Reporter(object):
    """Reporter to collect action process status and result."""
    ### event array for actions in execution sequence
    events = None
    def __init__(self):
        super(Reporter, self).__init__()
        self.events = []

    def collect(self, event):
        self.events.append(event)

class EventType(Enum):
    """ report event type """
    START = 1
    END = 2
    RESULT = 3

class ReportEvent(object):
    """ReportEvent for start action, finish action and action result."""
    ### event type
    eventType = None
    ### event content, for START and END event is timestamp, while action result for RESULT
    eventContent = None
    ### report event for related action name
    actionName = None

    def __init__(self, actionName, eventType, content="timestamp"):
        super(ReportEvent, self).__init__()
        self.eventType = eventType
        self.actionName = actionName
        if content == "timestamp":
            ## get current timestamp for event
            self.eventContent = int(round(time.time() * 1000))
        else:
            self.eventContent = content
