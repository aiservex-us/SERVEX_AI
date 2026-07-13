import os

app_dir = '/Users/glynne/Desktop/SERVEX_AI/app'

for root, dirs, files in os.walk(app_dir):
    for file in files:
        if file == 'AI_contact.jsx':
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()

            target = "} Download,\n} from 'lucide-react';"
            replacement = ", Download\n} from 'lucide-react';"

            if target in content:
                content = content.replace(target, replacement)
                with open(filepath, 'w') as f:
                    f.write(content)
                print(f"Fixed: {filepath}")

