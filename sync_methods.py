import os

workspace_dir = r"c:\Users\Angel A Rodriguez\.gemini\antigravity\scratch\tradicion-ai-os"
js_path = os.path.join(workspace_dir, "JavaScript.html")
preview_path = os.path.join(workspace_dir, "local_preview.html")

print(f"Reading files...")
with open(js_path, "r", encoding="utf-8") as f:
    js_content = f.read()

with open(preview_path, "r", encoding="utf-8") as f:
    preview_content = f.read()

def extract_function(content, func_name):
    func_def = f"function {func_name}("
    start_idx = content.find(func_def)
    if start_idx == -1:
        raise ValueError(f"Could not find {func_name} definition")
    
    # Find the opening brace of the function
    brace_start = content.find("{", start_idx)
    if brace_start == -1:
        raise ValueError(f"Could not find opening brace for {func_name}")
    
    brace_count = 1
    i = brace_start + 1
    while brace_count > 0 and i < len(content):
        if content[i] == '{':
            brace_count += 1
        elif content[i] == '}':
            brace_count -= 1
        i += 1
    
    return content[start_idx:i]

# Extract updated functions from JavaScript.html
init_app_js = extract_function(js_content, "initApp")
load_all_settings_js = extract_function(js_content, "loadAllSettings")
save_dev_settings_js = extract_function(js_content, "saveDevSettings")
get_network_setting_js = extract_function(js_content, "getNetworkSetting")
append_chat_message_js = extract_function(js_content, "appendChatMessage")
select_voice_js = extract_function(js_content, "selectVoice")
speak_message_js = extract_function(js_content, "speakMessage")
reset_tts_buttons_js = extract_function(js_content, "resetTtsButtons")

print("Extracted function snippets from JavaScript.html successfully!")

# Replace or insert in local_preview.html cleanly
# 1. Locate initApp and the boundary of duplicates in local_preview.html
preview_init_idx = preview_content.find("function initApp(")
if preview_init_idx == -1:
    raise ValueError("Could not find initApp in local_preview.html")

preview_auth_idx = preview_content.find("Double-Lock Security Authentication gateway.")
if preview_auth_idx == -1:
    raise ValueError("Could not find Double-Lock Security boundary in local_preview.html")

comment_start = preview_content.rfind("/**", 0, preview_auth_idx)
if comment_start == -1:
    raise ValueError("Could not find start of handleAuth comment block")

preview_content_new = (
    preview_content[:preview_init_idx] +
    init_app_js + "\n\n  " +
    load_all_settings_js + "\n\n  " +
    preview_content[comment_start:]
)
print("Spliced clean initApp and singular loadAllSettings, removing any duplicates!")

# 2. Replace saveDevSettings in local_preview.html
func_def_save = "function saveDevSettings("
preview_save_idx = preview_content_new.find(func_def_save)
if preview_save_idx == -1:
    raise ValueError("Could not find saveDevSettings in local_preview.html")

brace_start_save = preview_content_new.find("{", preview_save_idx)
brace_count = 1
k = brace_start_save + 1
while brace_count > 0 and k < len(preview_content_new):
    if preview_content_new[k] == '{':
        brace_count += 1
    elif preview_content_new[k] == '}':
        brace_count -= 1
    k += 1

preview_content_new2 = preview_content_new[:preview_save_idx] + save_dev_settings_js + preview_content_new[k:]
print("Spliced saveDevSettings in local_preview.html")

# 3. Replace getNetworkSetting in local_preview.html
func_def_get = "function getNetworkSetting("
preview_get_idx = preview_content_new2.find(func_def_get)
if preview_get_idx == -1:
    raise ValueError("Could not find getNetworkSetting in local_preview.html")

brace_start_get = preview_content_new2.find("{", preview_get_idx)
brace_count = 1
m = brace_start_get + 1
while brace_count > 0 and m < len(preview_content_new2):
    if preview_content_new2[m] == '{':
        brace_count += 1
    elif preview_content_new2[m] == '}':
        brace_count -= 1
    m += 1

preview_content_new3 = preview_content_new2[:preview_get_idx] + get_network_setting_js + preview_content_new2[m:]
print("Spliced getNetworkSetting in local_preview.html")

# 4. Replace appendChatMessage block (everything from function appendChatMessage up to function scrollToBottom)
preview_append_idx = preview_content_new3.find("function appendChatMessage(")
if preview_append_idx == -1:
    raise ValueError("Could not find appendChatMessage in local_preview.html")

preview_scroll_idx = preview_content_new3.find("function scrollToBottom(")
if preview_scroll_idx == -1:
    raise ValueError("Could not find scrollToBottom in local_preview.html")

# Replace the entire block from appendChatMessage up to scrollToBottom with clean versions
preview_content_final = (
    preview_content_new3[:preview_append_idx] +
    append_chat_message_js + "\n\n  " +
    select_voice_js + "\n\n  " +
    speak_message_js + "\n\n  " +
    reset_tts_buttons_js + "\n\n  " +
    preview_content_new3[preview_scroll_idx:]
)
print("Spliced appendChatMessage, selectVoice, speakMessage, and resetTtsButtons cleanly!")

# Write out clean, synchronized file
with open(preview_path, "w", encoding="utf-8") as f:
    f.write(preview_content_final)

print("SUCCESS: local_preview.html has been fully updated and cleaned with all premium high-fidelity TTS controls!")
