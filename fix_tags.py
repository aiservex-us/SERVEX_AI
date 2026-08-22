import os
import glob

base_path = '/Users/glynne/Desktop/SERVEX_AI/app'
files = []
for root, dirs, filenames in os.walk(base_path):
    for f in filenames:
        if f == 'ViewportGraphics.jsx' and 'aiReporting' in root:
            files.append(os.path.join(root, f))

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # We have floating `</div>`s left over from removing `<div className="flex flex-col gap-6 mb-6">`
    # Let's target the exact string:
    #             </CardContainer>
    # 
    #           </div>
    # 
    #           
    #             
    #             {/* 3. Diverging Volatility */}
    
    content = content.replace('            </CardContainer>\n\n          </div>', '            </CardContainer>')
    content = content.replace('            </CardContainer>\n\n          \n            \n            {/* 3.', '            </CardContainer>\n\n            {/* 3.')
    
    content = content.replace('            </CardContainer>\n\n          </div>\n\n          \n            \n            {/* 5.', '            </CardContainer>\n\n            {/* 5.')
    
    content = content.replace('            </CardContainer>\n\n          </div>\n          </motion.div>', '            </CardContainer>\n          </motion.div>')

    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
        
    print(f"Fixed tags in {f}")
