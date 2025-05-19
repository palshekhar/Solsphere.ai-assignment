import requests

def send_report(config, state):
    headers = {
        "Authorization": f"Bearer {config['auth_token']}",
        "Content-Type": "application/json"
    }
    print(headers)
    print(config["api_url"])

    response = requests.post(config["api_url"], headers=headers, json=state)
    return response.status_code == 200
