import glob

search_pattern = '/Users/glynne/Desktop/SERVEX_AI/app/**/Report.jsx'
files = glob.glob(search_pattern, recursive=True)

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the end of the changes tab block:
    #                 </tbody>
    #               </table>
    #             </div>
    #           )}
    
    # We need to add one more </div> right before the )}
    target = "              </table>\n            </div>\n          )}"
    replacement = "              </table>\n            </div>\n            </div>\n          )}"
    
    if target in content and "</div>\n            </div>\n          )}" not in content:
        content = content.replace(target, replacement)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed: {file}")
    else:
        print(f"Target not found or already fixed in: {file}")

