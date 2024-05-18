# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models


class NewsFeed(models.Model):
    author = models.ForeignKey('users.User', related_name='newsfeeds', on_delete=models.CASCADE)
    subject = models.CharField(max_length=155)
    body = models.TextField()
    thumbnail = models.ImageField(
        upload_to='mobile_media',
        blank=True,
        null=True,
    )
    link = models.CharField(max_length=120, blank=True)
    date_published = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.subject

    def get_author_display(self):
        return self.author.get_full_name()
