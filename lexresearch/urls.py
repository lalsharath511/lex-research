# lexresearch/urls.py
from django.urls import path
from . import views 

urlpatterns = [
    path('', views.index, name='index'),
    path('signup/', views.signup, name='signup'),
    path('signin/', views.signin, name='signin'),
    path('chat/', views.chat, name='chat'),

]