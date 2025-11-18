# backend/users/views.py
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import IntegrityError
from .models import User
from django.contrib.auth.hashers import make_password, check_password, identify_hasher

@csrf_exempt
def register_user(request):
    if request.method != "POST":
        return JsonResponse({"error": "Método não permitido."}, status=405)

    try:
        data = json.loads(request.body or b"{}")
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "")

    if not name or not email or not password:
        return JsonResponse({"error": "Por favor, preencha todos os campos."}, status=400)

    if User.objects.filter(email__iexact=email).exists():
        return JsonResponse({"error": "Este e-mail já está cadastrado. Por favor, use outro."}, status=409)

    try:
        user = User.objects.create(
            name=name,
            email=email,
            password=make_password(password)
        )
        return JsonResponse(
            {"message": "Usuário cadastrado com sucesso!", "user": {"name": user.name, "email": user.email}},
            status=201
        )
    except IntegrityError:
        return JsonResponse({"error": "Ocorreu um erro inesperado no banco de dados."}, status=500)

@csrf_exempt
def login_user(request):
    if request.method != "POST":
        return JsonResponse({"error": "Método não permitido."}, status=405)

    try:
        data = json.loads(request.body or b"{}")
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    email = (data.get("email") or "").strip()
    password = (data.get("password") or "")

    if not email or not password:
        return JsonResponse({"error": "Email e senha são obrigatórios."}, status=400)

    # busca case-insensitive
    user = User.objects.filter(email__iexact=email).first()
    if not user:
        return JsonResponse({"error": "Usuário não encontrado."}, status=404)

    # tenta validar como hash do Django
    valid = False
    try:
        valid = check_password(password, user.password)
    except Exception:
        valid = False

    # se não for hash válido, pode estar em texto puro -> migra no primeiro login
    if not valid:
        try:
            identify_hasher(user.password)  # lança se não for hash
        except Exception:
            if password == user.password:   # era texto puro
                user.password = make_password(password)
                user.save(update_fields=["password"])
                valid = True

    if not valid:
        return JsonResponse({"error": "Senha inválida."}, status=400)

    return JsonResponse({
        "message": "Login successful",
        "user": {"name": user.name, "email": user.email}
    })
