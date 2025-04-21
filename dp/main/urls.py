from django.urls import path, include

from . import views
from .views import *

urlpatterns = [
    path('', views.index, name='info_main'),

    path('proxy/curriculum/<int:day_num>/<int:hour_num>/', proxy_to_curriculum, name='proxy_curriculum'),
    path('proxy/params/', proxy_to_params, name='proxy_params'),
    path('proxy/timeline/', proxy_to_timeline, name='proxy_timeline'),
    ]
