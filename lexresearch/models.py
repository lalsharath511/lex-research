from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone

# class UserProfile(models.Model):
#     id = models.BigAutoField(primary_key=True)
#     user = models.OneToOneField(User, on_delete=models.CASCADE ,default=None)
#     # Add any additional fields for user profile data here

  

#     def __str__(self):
#         return self.user.username

# class UserLogin(models.Model):
#     id = models.BigAutoField(primary_key=True)
#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     login_time = models.DateTimeField(default=timezone.now)

#     def __str__(self):
#         return f'{self.user.username} - {self.login_time}'

from django.contrib.auth.models import User
from djongo import models

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, default=None)
    # Add any additional fields for user profile data here

    def __str__(self):
        return self.user.username

class UserLogin(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    login_time = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f'{self.user.username} - {self.login_time}'
