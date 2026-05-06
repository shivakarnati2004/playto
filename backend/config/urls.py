from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from .spa import serve_react

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('apps.accounts.urls')),
    path('api/v1/', include('apps.kyc.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Catch-all: serve React SPA for any non-API route
# This MUST be last so /api/ and /admin/ routes take priority
urlpatterns += [
    re_path(r'^(?P<path>.*)$', serve_react),
]
