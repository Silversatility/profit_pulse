from collections import OrderedDict

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class DispenseHistoryPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'

    def get_paginated_response(self, data):
        current_page = self.request.query_params.get(self.page_query_param, 1)
        return Response(OrderedDict([
            ('count', self.page.paginator.count),
            ('current_page', int(current_page)),
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('results', data),
        ]))


class FeeStructurePagination(PageNumberPagination):
    page_size = 20
