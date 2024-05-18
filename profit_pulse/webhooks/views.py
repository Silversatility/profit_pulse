from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from .hook import WebHookEvent, WebHookManager
from profit_pulse.core.logger import logger


class WebHookView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        """
        :param request:
        :param args:
        :param kwargs:
        :return:

        - event_name is required
        - key/value pairs
        body {
            "event_name": str,
            "key": value
        }
        """

        try:
            event = WebHookEvent(request=request)
            result = WebHookManager().run(event=event)
            return Response(data=result, status=status.HTTP_200_OK)
        except Exception as ex:
            logger.error(str(ex))
            return Response(status=status.HTTP_400_BAD_REQUEST)
