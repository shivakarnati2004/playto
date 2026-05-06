"""
Serve the React frontend SPA from Django in production.
In development, Vite's dev server handles the frontend instead.
"""
import os
from django.http import FileResponse, HttpResponse
from django.conf import settings


def serve_react(request, path=''):
    """
    Serve files from the React build directory (frontend/dist/).
    - If the requested path matches a real file (e.g. /assets/index-abc.js), serve it.
    - Otherwise, serve index.html so React Router handles the route.
    """
    frontend_dir = os.path.join(settings.BASE_DIR.parent, 'frontend', 'dist')

    # Try to serve the exact file
    file_path = os.path.join(frontend_dir, path)
    if os.path.isfile(file_path):
        return FileResponse(open(file_path, 'rb'))

    # Fall back to index.html for SPA routing
    index_path = os.path.join(frontend_dir, 'index.html')
    if os.path.isfile(index_path):
        with open(index_path, 'r', encoding='utf-8') as f:
            return HttpResponse(f.read(), content_type='text/html')

    return HttpResponse('Frontend not built. Run: cd frontend && npm run build', status=404)
