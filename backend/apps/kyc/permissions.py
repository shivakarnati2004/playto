from rest_framework.permissions import BasePermission


class IsMerchant(BasePermission):
    message = "Only merchant accounts can perform this action."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_merchant)


class IsReviewer(BasePermission):
    message = "Only reviewer accounts can perform this action."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_reviewer)
