# backend/api/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('submit/', views.submit, name='submit'),                  # upload + simulate processing
    path('download/<str:filename>/', views.download_file, name='download'),
]
