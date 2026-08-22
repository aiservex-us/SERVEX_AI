import os

base_path = '/Users/glynne/Desktop/SERVEX_AI/app'
files = []
for root, dirs, filenames in os.walk(base_path):
    for f in filenames:
        if f == 'ViewportGraphics.jsx' and 'aiReporting' in root:
            files.append(os.path.join(root, f))

variants_code = """
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60, damping: 15 } }
  };
"""

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # 1. Remove the incorrectly placed variants from CustomTooltip
    bad_code = """    
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60, damping: 15 } }
  };

  return ("""
    
    # We might have different whitespace, so let's do a more robust regex or just split and join.
    # The simplest is to remove the definition where it is, and add it below `const ViewportGraphics = () => {`
    
    # Remove containerVariants block
    import re
    content = re.sub(
        r'\s*const containerVariants = \{.*?\};\s*const itemVariants = \{.*?\};\s*', 
        '\n    ', 
        content, 
        flags=re.DOTALL
    )
    
    # Insert properly inside ViewportGraphics
    # Find `const ViewportGraphics = () => {`
    target = "const ViewportGraphics = () => {\n"
    if target in content:
        content = content.replace(target, target + variants_code)
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
        
    print(f"Fixed {f}")
