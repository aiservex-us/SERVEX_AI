import os

files = [
    "app/components/ModuleDelegationGatekeeper.jsx",
    "app/components/LesroGatekeeper.jsx",
    "app/panel/components/GlobalOnboarding.jsx"
]

effect_code = """
  const hasPlayedAudio = useRef(false);
  useEffect(() => {
    if (!loading && !hasPlayedAudio.current) {
      hasPlayedAudio.current = true;
      try {
        const audio = new Audio('/universfield-welcome-notification-131917.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Audio autoplay prevented', e));
      } catch (e) {}
    }
  }, [loading]);
"""

for f_path in files:
    full_path = os.path.join("/Users/glynne/Desktop/SERVEX_AI", f_path)
    if os.path.exists(full_path):
        with open(full_path, "r") as f:
            content = f.read()
        
        if "useRef" not in content:
            content = content.replace("import React, { useState, useEffect }", "import React, { useState, useEffect, useRef }")
        
        if "hasPlayedAudio" not in content and "const renderChatStep = () => {" in content:
            content = content.replace("  const renderChatStep = () => {", effect_code + "\n  const renderChatStep = () => {")
            with open(full_path, "w") as f:
                f.write(content)
            print(f"Updated {f_path}")
        else:
            print(f"Skipped {f_path}")
