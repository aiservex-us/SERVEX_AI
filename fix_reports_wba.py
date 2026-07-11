import glob

search_pattern = '/Users/glynne/Desktop/SERVEX_AI/app/**/Report.jsx'
files = glob.glob(search_pattern, recursive=True)

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # For WBA and WBG where activeTab is NOT used for wrapping
    target_wba = "              </tbody>\n            </table>\n          </div>\n\n          {/* Footer"
    replacement_wba = "              </tbody>\n            </table>\n          </div>\n          </div>\n\n          {/* Footer"
    
    if target_wba in content and "</div>\n          </div>\n\n          {/* Footer" not in content:
        content = content.replace(target_wba, replacement_wba)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed WBA/WBG style: {file}")

