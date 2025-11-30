from rest_framework import serializers
from .models import Trip, TripItem
from django.contrib.auth.models import User

class TripItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TripItem
        fields = ['id', 'day_key', 'name', 'time', 'lat', 'lng', 'weather_text', 'weather_icon']

class TripSerializer(serializers.ModelSerializer):
    items = TripItemSerializer(many=True)

    class Meta:
        model = Trip
        fields = ['id', 'title', 'created_at', 'items']

    # Função mágica para salvar a Viagem E os Itens ao mesmo tempo
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        trip = Trip.objects.create(**validated_data)
        
        for item_data in items_data:
            TripItem.objects.create(trip=trip, **item_data)
        
        return trip