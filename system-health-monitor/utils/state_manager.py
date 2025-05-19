import json
import os

STATE_FILE = "config/last_state.json"

def load_last_state():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_current_state(state):
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f, indent=4)
