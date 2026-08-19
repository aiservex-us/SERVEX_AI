import os
import glob
import re

search_dir = "/Users/glynne/Desktop/SERVEX_AI/app"
pattern = r"""(const\s+apiURL\s*=\s*process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*['"]https?:?/?/?servex-ai-back\.onrender\.com['"];\s*
\s*const\s+res\s*=\s*await\s+fetch\([^;]+;\s*
\s*const\s+responseData\s*=\s*await\s+res\.json\(\);\s*)
(\s*if\s*\(\!responseData\.locked\s*\|\|\s*\(responseData\.data\s*&&\s*responseData\.data\.user_id\s*!==\s*user\.id\)\)\s*\{)"""

replacement = r"""\1
        if (responseData.status === 'error' || !res.ok) {
          console.warn('Delegation check returned an error, bypassing redirect:', responseData);
          return;
        }
\2"""

# Find all page.jsx files in the specified paths
files = glob.glob(os.path.join(search_dir, "**/page.jsx"), recursive=True)

modified_files = []

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content, count = re.subn(pattern, replacement, content, flags=re.MULTILINE)
    
    # Check for the https typo and fix it too
    new_content = re.sub(r'https:servex-ai-back\.onrender\.com', r'https://servex-ai-back.onrender.com', new_content)
    
    # Fix the .replace('apiURL', apiURL) typo
    new_content = re.sub(r"fetch\(`apiURL/api/v1/module_delegation/(\w+)`\.replace\('apiURL',\s*apiURL\)\)", r"fetch(`${apiURL}/api/v1/module_delegation/\1`)", new_content)

    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        modified_files.append(file)

print("Modified files:")
for m in modified_files:
    print(m)

