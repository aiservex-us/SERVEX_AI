import os

app_dir = '/Users/glynne/Desktop/SERVEX_AI/app'

for root, dirs, files in os.walk(app_dir):
    for file in files:
        if file == 'delete_data.jsx':
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()

            target = "if (onDeleted) onDeleted();"
            replacement = "if (onDeleted) onDeleted();\n      window.location.href = '/' + currentTenant;"

            if target in content and "window.location.href" not in content:
                new_content = content.replace(target, replacement)
                with open(filepath, 'w') as f:
                    f.write(new_content)
                print(f"Patched: {filepath}")

