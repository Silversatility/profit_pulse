from django_filters import rest_framework as filters
from drf_haystack.viewsets import HaystackViewSet

from rest_framework import viewsets
from ..models import NewsFeed
from .serializers import NewsFeedSerializer, NewsFeedSearchSerializer

from profit_pulse.core.permissions import AdminOrUserOwner
from profit_pulse.core.api.filters import RelatedOrderingFilter


class NewsFeedViewSet(viewsets.ModelViewSet):
    queryset = NewsFeed.objects.all()
    serializer_class = NewsFeedSerializer
    permission_classes = (AdminOrUserOwner,)
    filter_backends = (filters.DjangoFilterBackend, RelatedOrderingFilter)
    filter_fields = ('author', 'subject')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class NewsFeedSearchViewSet(HaystackViewSet):
    """
    Handles search feature for newsfeeds.
    """
    index_models = [NewsFeed]
    permission_classes = (AdminOrUserOwner, )
    serializer_class = NewsFeedSearchSerializer

