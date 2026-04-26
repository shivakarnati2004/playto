from django.contrib import admin
from .models import Document, KYCSubmission, NotificationEvent


class DocumentInline(admin.TabularInline):
    model   = Document
    extra   = 0
    readonly_fields = ('doc_type', 'file', 'file_name', 'file_size', 'uploaded_at')


@admin.register(KYCSubmission)
class KYCSubmissionAdmin(admin.ModelAdmin):
    list_display  = ('merchant', 'full_name', 'business_name', 'status', 'submitted_at', 'is_at_risk')
    list_filter   = ('status',)
    search_fields = ('merchant__username', 'full_name', 'business_name')
    inlines       = [DocumentInline]
    readonly_fields = ('id', 'created_at', 'updated_at', 'submitted_at', 'is_at_risk')


@admin.register(NotificationEvent)
class NotificationEventAdmin(admin.ModelAdmin):
    list_display = ('merchant', 'event_type', 'timestamp')
    list_filter  = ('event_type',)
    readonly_fields = ('id', 'timestamp')
