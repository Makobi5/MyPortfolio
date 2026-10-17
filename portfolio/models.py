from django.db import models


class Project(models.Model):
	title = models.CharField(max_length=100)
	description = models.TextField()
	technologies = models.CharField(max_length=200, blank=True)
	project_url = models.URLField(blank=True)
	cover_image_url = models.URLField(blank=True)
	featured = models.BooleanField(default=False)
	order = models.PositiveSmallIntegerField(default=0)

	class Meta:
		ordering = ['order', 'title']

	def __str__(self):
		return self.title
