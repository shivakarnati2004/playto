from rest_framework import serializers

from .file_validation import validate_upload
from .models import Document, KYCSubmission, NotificationEvent
from apps.accounts.serializers import UserSerializer


class DocumentSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = ('id', 'doc_type', 'file_name', 'file_size', 'uploaded_at', 'url')

    def get_url(self, obj):
        request = self.context.get('request')
        if request and obj.file:
            return request.build_absolute_uri(obj.file.url)
        return None


class DocumentUploadSerializer(serializers.ModelSerializer):
    file = serializers.FileField()

    class Meta:
        model = Document
        fields = ('doc_type', 'file')

    def validate_file(self, file):
        validate_upload(file)
        return file

    def create(self, validated_data):
        file = validated_data['file']
        submission = self.context['submission']

        # Upsert: replace existing document of the same type
        Document.objects.filter(
            submission=submission,
            doc_type=validated_data['doc_type']
        ).delete()

        doc = Document.objects.create(
            submission=submission,
            doc_type=validated_data['doc_type'],
            file=file,
            file_name=file.name,
            file_size=file.size,
        )
        return doc


class KYCSubmissionSerializer(serializers.ModelSerializer):
    documents = DocumentSerializer(many=True, read_only=True)
    merchant  = UserSerializer(read_only=True)
    is_at_risk = serializers.BooleanField(read_only=True)

    class Meta:
        model = KYCSubmission
        fields = (
            'id', 'merchant',
            'full_name', 'email', 'phone',
            'business_name', 'business_type', 'monthly_volume',
            'status', 'reviewer_notes',
            'created_at', 'updated_at', 'submitted_at',
            'documents', 'is_at_risk',
        )
        read_only_fields = ('id', 'merchant', 'status', 'reviewer_notes', 'submitted_at', 'is_at_risk')


class KYCSubmissionUpdateSerializer(serializers.ModelSerializer):
    """Used by merchants to save progress on personal + business details."""

    class Meta:
        model = KYCSubmission
        fields = (
            'full_name', 'email', 'phone',
            'business_name', 'business_type', 'monthly_volume',
        )


class ReviewerTransitionSerializer(serializers.Serializer):
    """Validates the payload for a reviewer performing a state transition."""
    target_state = serializers.ChoiceField(choices=[
        'under_review', 'approved', 'rejected', 'more_info_requested',
    ])
    reason = serializers.CharField(required=False, allow_blank=True, default='')


class ReviewerQueueSerializer(serializers.ModelSerializer):
    """Compact representation used in the reviewer queue list."""
    merchant_username = serializers.CharField(source='merchant.username')
    merchant_email    = serializers.CharField(source='merchant.email')
    is_at_risk        = serializers.BooleanField(read_only=True)
    documents_count   = serializers.SerializerMethodField()

    class Meta:
        model = KYCSubmission
        fields = (
            'id', 'merchant_username', 'merchant_email',
            'full_name', 'business_name', 'business_type', 'monthly_volume',
            'status', 'submitted_at', 'updated_at',
            'is_at_risk', 'documents_count',
        )

    def get_documents_count(self, obj):
        return obj.documents.count()


class NotificationEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationEvent
        fields = ('id', 'event_type', 'timestamp', 'payload')
