import os
import re

file_path = "/Users/glynne/Desktop/SERVEX_AI/app/WBO/Actualizer_Excel_Workstations/page.jsx"

with open(file_path, "r") as f:
    content = f.read()

# Remove TeamsAgentChat import
content = re.sub(r"import TeamsAgentChat.*?\n", "", content)

# Remove Sparkles icon import
content = content.replace("import { X, AlertCircle , Sparkles} from 'lucide-react';", "import { X, AlertCircle } from 'lucide-react';")

# Remove AiMenu states
content = re.sub(r"const \[isAiMenuExpanded.*?;\n", "", content)
content = re.sub(r"const showAiMenu.*?;\n", "", content)

# Remove AiMenu condition from main container width
content = content.replace("${showAiMenu && isAiMenuExpanded ? 'w-[65%]' : 'w-full'}", "w-full")

# Remove Toolbar Superior
toolbar_regex = r"\{\/\* Toolbar Superior.*?\}\)\}"
content = re.sub(toolbar_regex, "", content, flags=re.DOTALL)

# Remove Lado Derecho
right_side_regex = r"\{\/\* Lado Derecho:.*?\}\)\}"
content = re.sub(right_side_regex, "", content, flags=re.DOTALL)

with open(file_path, "w") as f:
    f.write(content)

print("Removed Alysa chat from Actualizer_Excel_Workstations/page.jsx")
