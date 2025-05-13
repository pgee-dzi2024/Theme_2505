from django.shortcuts import render
import requests
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt


def index(request):
    return render(request, 'info/info_main.html')


# прокси за GET заявка към  api/Curriculum
@csrf_exempt  # Ако ще се използва и за POST от външен front-end!
def proxy_to_curriculum(request, day_num, hour_num):
    external_url = f'https://pgeebansko.org/info/api/Curriculum/{day_num}/{hour_num}/'

    # За GET заявка:
    if request.method == 'GET':
        external_response = requests.get(external_url, params=request.GET)

        # Препращаш status кода и съдържанието
        return HttpResponse(
            external_response.content,
            status=external_response.status_code,,
            content_type=external_response.headers.get('Content-Type', 'application/json')
        )
    else:
        return JsonResponse({'error': 'Методът не е позволен.'}, status=405)


# прокси за GET заявка към  api/Params
@csrf_exempt  # Ако ще се използва и за POST от външен front-end!
def proxy_to_params(request):
    external_url = f'https://pgeebansko.org/info/api/Params/'

    # За GET заявка:
    if request.method == 'GET':
        external_response = requests.get(external_url, params=request.GET)

        # Препращаш status кода и съдържанието
        return HttpResponse(
            external_response.content,
            status=external_response.status_code,
            content_type=external_response.headers.get('Content-Type', 'application/json')
        )
    else:
        return JsonResponse({'error': 'Методът не е позволен.'}, status=405)


# прокси за GET заявка към  api/TimeLine
@csrf_exempt  # Ако ще се използва и за POST от външен front-end!
def proxy_to_timeline(request):
    external_url = f'https://pgeebansko.org/info/api/TimeLine/'

    # За GET заявка:
    if request.method == 'GET':
        external_response = requests.get(external_url, params=request.GET)

        # Препращаш status кода и съдържанието
        return HttpResponse(
            external_response.content,
            status=external_response.status_code,
            content_type=external_response.headers.get('Content-Type', 'application/json')
        )
    else:
        return JsonResponse({'error': 'Методът не е позволен.'}, status=405)
