from django.urls import path
from .views import (
    DocumentUploadView,
    MerchantNotificationsView,
    MerchantSubmissionView,
    MerchantSubmitView,
    ReviewerAllSubmissionsView,
    ReviewerMetricsView,
    ReviewerQueueView,
    ReviewerSubmissionDetailView,
)

urlpatterns = [
    # Merchant
    path('kyc/submission/',                MerchantSubmissionView.as_view(),   name='kyc-submission'),
    path('kyc/submission/submit/',         MerchantSubmitView.as_view(),       name='kyc-submit'),
    path('kyc/documents/',                 DocumentUploadView.as_view(),       name='kyc-documents'),
    path('kyc/notifications/',             MerchantNotificationsView.as_view(),name='kyc-notifications'),

    # Reviewer
    path('reviewer/queue/',                         ReviewerQueueView.as_view(),            name='reviewer-queue'),
    path('reviewer/metrics/',                       ReviewerMetricsView.as_view(),          name='reviewer-metrics'),
    path('reviewer/submissions/',                   ReviewerAllSubmissionsView.as_view(),   name='reviewer-all'),
    path('reviewer/submissions/<uuid:pk>/',         ReviewerSubmissionDetailView.as_view(), name='reviewer-detail'),
    path('reviewer/submissions/<uuid:pk>/transition/', ReviewerSubmissionDetailView.as_view(), name='reviewer-transition'),
]
