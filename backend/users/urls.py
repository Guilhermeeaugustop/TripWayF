from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TripViewSet, login_view, register_view

router = DefaultRouter()
router.register(r'trips', TripViewSet, basename='trip')

urlpatterns = [
    path('login/', login_view, name='login'),
    path('register/', register_view, name='register'), # <--- Adicionado
    path('', include(router.urls)),
]