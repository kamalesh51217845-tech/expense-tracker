
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Category, Transaction


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]


class TransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        source="category.name",
        read_only=True,
    )

    class Meta:
        model = Transaction
        fields = [
            "id",
            "category",
            "category_name",
            "transaction_type",
            "amount",
            "description",
            "date",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "category_name"]

    def validate_category(self, category):
        request = self.context.get("request")

        if request and category.user_id != request.user.id:
            raise serializers.ValidationError(
                "You can only use your own categories."
            )

        return category

    def validate_amount(self, amount):
        if amount <= 0:
            raise serializers.ValidationError(
                "Amount must be greater than zero."
            )

        return amount

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
