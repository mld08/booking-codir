from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from .models import User

User = get_user_model()


class LoginSerializer(serializers.Serializer):
    """Serializer pour la connexion standard (email/password)."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(username=email, password=password)
            
            if not user:
                msg = 'Email ou mot de passe incorrect.'
                raise serializers.ValidationError(msg, code='authorization')
        else:
            msg = 'L\'email et le mot de passe sont requis.'
            raise serializers.ValidationError(msg, code='authorization')

        if not user.is_active:
            msg = 'Ce compte a été désactivé.'
            raise serializers.ValidationError(msg, code='authorization')

        attrs['user'] = user
        return attrs


class UserSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle User. Lecture seule pour les champs sensibles."""
    
    class Meta:
        model = User
        fields = ['id', 'email', 'is_active', 'is_admin', 'date_joined']
        read_only_fields = ['id', 'is_admin', 'date_joined']


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création de DG par l'administrateur."""
    password = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'password', 'is_active', 'is_admin']
        read_only_fields = ['id']
        extra_kwargs = {
            'email': {'required': True},
            'password': {'style': {'input_type': 'password'}}
        }
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        email = validated_data.pop('email')
        # Par défaut, non-admin si non spécifié (mais l'admin peut le mettre)
        validated_data.setdefault('is_admin', False)
        
        user = User.objects.create_user(
            email=email,
            password=password,
            **validated_data
        )
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        
        if password:
            user.set_password(password)
            user.save()
            
        return user

