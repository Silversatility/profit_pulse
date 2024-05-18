from profit_pulse.webhooks.hook import register_hook_event

DATA_SCAN_EVENT = 'dispense.datascan'


def register_web_hook_events():
    register_hook_event(
        event_name=DATA_SCAN_EVENT,
        handler_class="profit_pulse.dispense.webhooks.handlers.WebHookDataScanHandler",
    )
