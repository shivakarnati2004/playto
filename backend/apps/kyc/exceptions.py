from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Returns a consistent error envelope:
    {
        "error": true,
        "message": "Human-readable summary",
        "detail": <original DRF detail>
    }
    """
    response = exception_handler(exc, context)

    if response is not None:
        data = response.data

        # Flatten list-of-strings to a single message
        if isinstance(data, list):
            message = ' '.join(str(e) for e in data)
        elif isinstance(data, dict):
            if 'detail' in data:
                message = str(data['detail'])
            else:
                parts = []
                for key, val in data.items():
                    if isinstance(val, list):
                        parts.append(f"{key}: {' '.join(str(v) for v in val)}")
                    else:
                        parts.append(f"{key}: {val}")
                message = '; '.join(parts)
        else:
            message = str(data)

        response.data = {
            'error': True,
            'message': message,
            'detail': data,
        }

    return response
