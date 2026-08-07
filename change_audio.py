import os

files = [
    "app/components/ModuleDelegationGatekeeper.jsx",
    "app/components/LesroGatekeeper.jsx",
    "app/panel/components/GlobalOnboarding.jsx"
]

old_audio = "/universfield-welcome-notification-131917.mp3"
new_audio = "/universfield-new-notification-030-480567.mp3"

for f_path in files:
    full_path = os.path.join("/Users/glynne/Desktop/SERVEX_AI", f_path)
    if os.path.exists(full_path):
        with open(full_path, "r") as f:
            content = f.read()
        
        if old_audio in content:
            content = content.replace(old_audio, new_audio)
            with open(full_path, "w") as f:
                f.write(content)
            print(f"Updated {f_path}")
        else:
            print(f"Skipped {f_path} (audio not found)")
