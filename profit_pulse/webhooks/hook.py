from django.conf import settings
from .exceptions import *
from profit_pulse.core.utils import import_from_string


EVENT_NAME_KEY = 'event_name'


def register_hook_event(event_name, handler_class):
    """
    Register Event Handler for each event_name in ready() method of AppConfig

    :param event_name:
    :param handler_class: str Full Path of Class
    :return:
    """
    if event_name not in settings.WEB_HOOK_HANDLERS:
        settings.WEB_HOOK_HANDLERS.update({event_name: handler_class})


class WebHookEvent:
    """
    Abstraction data of WebHook

    body {
        "event_name": <Event Name>,
        "key": <Value"
    }

    """
    def __init__(self, request):
        self.request = request

    def get_event_name(self):
        if not self.request or not self.request.data:
            return None
        return self.request.data.get(EVENT_NAME_KEY)

    def get_event_data(self):
        data = self.request.data
        del data[EVENT_NAME_KEY]
        return data


class WebHookEventHandler:
    """
    Abstraction of WebHook Event handler.
    """
    def __init__(self):
        self.event = None

    def set_event(self, event):
        """
        :param event: WebHookEvent
        :return:
        """
        if not isinstance(event, WebHookEvent):
            raise InvalidWebHookEvent('Expected an instance of WebHookEvent')
        self.event = event

    def run(self):
        raise NotImplemented()


class WebHookManager:

    def run(self, event):
        handler = self.get_event_handler(event)
        if not handler:
            return

        handler.set_event(event)
        return handler.run()

    @classmethod
    def get_event_handler(cls, event):
        """
        :param event: WebHookEvent
        :return: WebHookEventHandler
        """
        event_name = event.get_event_name()
        handlers = settings.WEB_HOOK_HANDLERS
        event_handler_class = handlers[event_name] if event_name in handlers else None
        if not event_handler_class:
            return None
        handler_class = import_from_string(event_handler_class)
        return handler_class()
