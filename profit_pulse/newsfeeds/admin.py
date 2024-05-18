from django.contrib import admin

from .models import NewsFeed


class NewsFeedAdmin(admin.ModelAdmin):
    model = NewsFeed
    list_display = ['author', 'subject', 'link', 'date_published']


admin.site.register(NewsFeed, NewsFeedAdmin)
