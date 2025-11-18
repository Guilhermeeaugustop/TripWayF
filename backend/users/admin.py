from django.contrib import admin
from .models import User # Importa o seu modelo de usuário customizado

# Registra o seu modelo de usuário.
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'created_at')
    search_fields = ('email', 'name')

# O Admin do Django agora deve ter uma nova seção 'Users' ou 'Users (Custom)'