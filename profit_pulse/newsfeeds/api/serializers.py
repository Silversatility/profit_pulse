from drf_haystack.serializers import HaystackSerializerMixin
from rest_framework import serializers

from ..models import NewsFeed
from ..search_indexes import NewsFeedIndex


class NewsFeedSerializer(serializers.ModelSerializer):
    author_display = serializers.CharField(source='get_author_display', read_only=True)
    thumbnail = serializers.FileField(required=False)

    class Meta:
        model = NewsFeed
        fields = ('__all__')


class NewsFeedSearchSerializer(HaystackSerializerMixin, NewsFeedSerializer):
    """
    Serializer to be used by the results returned by search
    for newsfeeds.
    """
    class Meta(NewsFeedSerializer.Meta):
        index_classes = [NewsFeedIndex]
        search_fields = ('text', )
