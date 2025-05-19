import time
from checks.system_checks import *
from utils.config_loader import load_config
from utils.state_manager import load_last_state, save_current_state
from utils.reporter import send_report

def main():
    config = load_config()
    interval = config.get("check_interval_minutes", 30) * 0.10
    
    while True:
        current_state = {
            "machine_id": config["machine_id"],
            "os": platform.system(),
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "checks": {
                "disk_encryption": check_disk_encryption(),
                "os_update": check_os_update(),
                "antivirus": check_antivirus()
                # Add other checks here
            }
        }

        last_state = load_last_state()
        
        if current_state != last_state:
            print("State changed. Sending update...")
            if send_report(config, current_state):
                save_current_state(current_state)
            else:
                print("Failed to report to server.")
        else:
            print("No changes detected.")

        time.sleep(interval)

if __name__ == "__main__":
    main()
