from django.apps import AppConfig
from .webhook import register_web_hook_events


class DispenseConfig(AppConfig):
    name = 'profit_pulse.dispense'

    def ready(self):
        register_web_hook_events()