# backend/api/views.py
import os
import time
from django.http import JsonResponse, FileResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings

@csrf_exempt
def submit(request):
    """
    Accepts POST with two files: 'input1' and 'input2'.
    Simulates 5 seconds processing, writes outputs/ output.txt,
    and returns a download URL.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'POST method required'}, status=405)

    f1 = request.FILES.get('input1')
    f2 = request.FILES.get('input2')

    if not f1 or not f2:
        return JsonResponse({'error': 'Both files required: input1 and input2'}, status=400)

    uploads_dir = os.path.join(settings.MEDIA_ROOT, 'uploads')
    outputs_dir = os.path.join(settings.MEDIA_ROOT, 'outputs')
    os.makedirs(uploads_dir, exist_ok=True)
    os.makedirs(outputs_dir, exist_ok=True)

    # Save uploaded files with fixed names
    path1 = os.path.join(uploads_dir, 'input1.txt')
    path2 = os.path.join(uploads_dir, 'input2.txt')

    with open(path1, 'wb') as dest1:
        for chunk in f1.chunks():
            dest1.write(chunk)
    with open(path2, 'wb') as dest2:
        for chunk in f2.chunks():
            dest2.write(chunk)

    # Simulate processing (5 seconds)
    time.sleep(5)

    # Create output.txt (here we just concatenate inputs; tweak as required)
    output_path = os.path.join(outputs_dir, 'output.txt')
    try:
        with open(path1, 'r', encoding='utf-8', errors='ignore') as a, \
             open(path2, 'r', encoding='utf-8', errors='ignore') as b, \
             open(output_path, 'w', encoding='utf-8') as out:
            out.write('=== Content from input1.txt ===\n\n')
            out.write(a.read())
            out.write('\n\n=== Content from input2.txt ===\n\n')
            out.write(b.read())
    except Exception:
        # fallback content if reading fails
        with open(output_path, 'w', encoding='utf-8') as out:
            out.write('Processed output (could not read input files).')

    # build download URL (served at /media/outputs/output.txt in debug)
    download_url = request.build_absolute_uri(settings.MEDIA_URL + 'outputs/output.txt')
    return JsonResponse({'download_url': download_url})

def download_file(request, filename):
    outputs_dir = os.path.join(settings.MEDIA_ROOT, 'outputs')
    file_path = os.path.join(outputs_dir, filename)
    if not os.path.exists(file_path):
        raise Http404("File not found")
    return FileResponse(open(file_path, 'rb'), as_attachment=True, filename=filename)
