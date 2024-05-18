import mimetypes
import os

from django.http import HttpResponse, Http404


def download_view(request, file_path):
    if file_path[-1] == '/':
        file_path = file_path[:-1]
    content_type = mimetypes.guess_type(file_path)[0]
    if os.path.exists(file_path):
        with open(file_path, 'rb') as fh:
            response = HttpResponse(fh.read(), content_type=content_type)
            response['Content-Disposition'] = 'attachment; filename=' + file_path
            return response
    raise Http404
