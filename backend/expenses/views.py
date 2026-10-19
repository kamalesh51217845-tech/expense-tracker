
from django.contrib.auth.models import User
from django.db.models import Sum
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


from .models import Category, Transaction
from .serializers import (
    RegisterSerializer,
    CategorySerializer,
    TransactionSerializer,
)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            default_categories = [
                "Food",
                "Transport",
                "Shopping",
                "Bills",
                "Salary",
                "Freelance",
                "Healthcare",
                "Education",
                "Entertainment",
            ]

            for name in default_categories:
                Category.objects.get_or_create(
                    name=name,
                    user=user,
                )

            return Response(
                {"message": "Account created successfully."},
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save()


class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(
            user=self.request.user
        ).select_related("category")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        transactions = Transaction.objects.filter(user=request.user)

        total_income = (
            transactions.filter(transaction_type="INCOME")
            .aggregate(total=Sum("amount"))["total"]
            or 0
        )

        total_expenses = (
            transactions.filter(transaction_type="EXPENSE")
            .aggregate(total=Sum("amount"))["total"]
            or 0
        )

        balance = total_income - total_expenses

        return Response({
            "total_income": total_income,
            "total_expenses": total_expenses,
            "balance": balance,
        })
