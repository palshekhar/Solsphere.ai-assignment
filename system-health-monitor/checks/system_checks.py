import platform
import subprocess

def check_disk_encryption():
    system = platform.system()
    
    if system == "Windows":
        # BitLocker status
        output = subprocess.getoutput('manage-bde -status')
        return "Percentage Encrypted: 100%" in output
    
    elif system == "Darwin":
        # FileVault status
        output = subprocess.getoutput('fdesetup status')
        return "FileVault is On" in output
    
    elif system == "Linux":
        # Check LUKS or dm-crypt
        output = subprocess.getoutput('lsblk -o NAME,TYPE | grep crypt')
        return bool(output)
    
    return False

def check_os_update():
    system = platform.system()
    if system == "Windows":
        output = subprocess.getoutput('powershell Get-WindowsUpdateLog')
        # Simplified: you might need better parsing or use Windows Update API
        # Here, assume presence of log means up to date (for demo)
        return "Error" not in output
    elif system == "Darwin":
        output = subprocess.getoutput('softwareupdate -l')
        return "No new software available" in output
    elif system == "Linux":
        # Example for Ubuntu/Debian using apt
        output = subprocess.getoutput('apt-get -s upgrade')
        return "0 upgraded, 0 newly installed" in output
    return False

def check_antivirus():
    system = platform.system()
    if system == "Windows":
        output = subprocess.getoutput('powershell "Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntivirusProduct | Select displayName,productState"')
        # Check if output has any antivirus product listed
        return bool(output.strip())
    elif system == "Darwin":
        # No built-in AV; check for popular AV apps running as example
        output = subprocess.getoutput('pgrep -x "Sophos" || pgrep -x "Norton" || pgrep -x "Avast"')
        return bool(output.strip())
    elif system == "Linux":
        # Check if ClamAV is installed and running
        output = subprocess.getoutput('systemctl is-active clamav-daemon')
        return "active" in output
    return False
