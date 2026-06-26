import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

# Read Index.html
with open('Index.html', 'r', encoding='utf-8') as f:
    index_content = f.read()

# Read local_preview.html
with open('local_preview.html', 'r', encoding='utf-8') as f:
    preview_content = f.read()

# Define the new English sections (Welcome + Dialog + 4,5,6,7)
new_en_sections = """            <div class="guide-section">
              <h4>2. The Command Workspace (Welcome Screen)</h4>
              <p>Once authorized, you enter the workspace empty state. Every dashboard control has a dedicated, premium administrative utility.</p>

              <!-- Guide View Selector Pill -->
              <div class="guide-view-selector font-outfit">
                <button class="view-sel-btn active" onclick="setGuideView(this, 'pins')">Interactive Pins</button>
                <button class="view-sel-btn" onclick="setGuideView(this, 'whiteboard')">Whiteboard Pointers</button>
              </div>

              <div class="guide-img-container">
                <!-- Interactive Pins View -->
                <div class="pins-container">
                  <div class="annotated-container" style="position: relative; max-width: 480px; margin: 0 auto;">
                    <!-- Vector CSS Mockup of Dashboard (Welcome Screen) -->
                    <div class="guide-mockup-wrapper" style="height: 380px;">
                      <div class="mockup-dash">
                        <div class="mockup-dash-header">
                          <div class="mockup-dash-branding">
                            <span class="material-icons-round" style="font-size: 10px; color: var(--text-muted);">menu</span>
                            <img src="https://drive.google.com/thumbnail?id=1bY49c_N03rFlBLGgb_4bzsB_tdK-HNDa&amp;sz=w250" style="width: 14px; height: 14px; border-radius: 50%; object-fit: cover;" alt="Logo">
                            <span class="mockup-dash-title">El Patr&oacute;n</span>
                            <span class="mockup-dash-pill" style="font-size: 6px; padding: 1px 4px; margin-left: 6px; background: rgba(0, 168, 204, 0.2); border: 1px solid rgba(0, 168, 204, 0.4); color: #00e5ff; border-radius: 3px;">DIRECTOR / LEVEL 3</span>
                          </div>
                          <div class="mockup-dash-controls">
                            <span class="mockup-dash-pill">Native <span style="display:inline-block; width:12px; height:6px; background:rgba(255,255,255,0.2); border-radius:3px; position:relative; vertical-align:middle; margin: 0 2px;"><span style="position:absolute; width:4px; height:4px; background:white; border-radius:50%; top:1px; left:1px;"></span></span> Hybrid</span>
                            <span class="material-icons-round" style="font-size: 10px; vertical-align: middle;">translate</span><span style="font-size: 6px; font-weight: 700; margin-left: 1px; margin-right: 4px; font-family: var(--font-family-body); vertical-align: middle; color: var(--text-muted);">EN</span>
                            <span class="material-icons-round" style="font-size: 10px; vertical-align: middle;">palette</span>
                            <span class="material-icons-round" style="font-size: 10px;">brightness_4</span>
                            <span class="material-icons-round" style="font-size: 10px; color: hsl(var(--accent-base));">menu_book</span>
                          </div>
                        </div>
                        <div class="mockup-dash-grid">
                          <div class="mockup-dash-sidebar">
                            <div class="mockup-sidebar-profile">
                              <div class="mockup-sidebar-avatar"></div>
                              <div>
                                <div class="mockup-sidebar-name">Angel Rodriguez</div>
                                <div class="mockup-sidebar-role">rodriguez2113@gmail.com</div>
                              </div>
                            </div>
                            <div style="font-size: 7px; color: var(--text-muted); margin-bottom: 2px;">Network &amp; API Properties <span class="material-icons-round" style="font-size:8px; float:right;">expand_more</span></div>
                            <div class="mockup-sidebar-section" style="display: flex; justify-content: space-between; align-items: center;">
                              <span>WORKSPACE HISTORY</span>
                              <span class="material-icons-round" style="font-size: 8px; cursor: pointer;">add_box</span>
                            </div>
                            <div class="mockup-sidebar-list">
                              <div class="mockup-sidebar-item active" style="border: 1px solid rgba(0, 168, 204, 0.3); background: rgba(0, 168, 204, 0.05); color: #00e5ff;">
                                <span class="material-icons-round" style="font-size: 8px; margin-right: 2px;">chat_bubble_outline</span> Nueva Conversación
                              </div>
                            </div>
                            <div class="mockup-sidebar-footer" style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px;">Manage Feedback</div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px; position:relative;">Submit Feedback<span style="font-size:4px; display:block; color:#00e5ff;">RP / 31C</span></div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px;">Update My Information</div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px;">Record Cash Payment</div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px; grid-column: span 2;">New Session</div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px; grid-column: span 2;">End Handshake</div>
                            </div>
                          </div>
                          <div class="mockup-dash-viewport">
                            <div class="mockup-dash-feed" style="justify-content: center; align-items: center; text-align: center; gap: 8px;">
                              <span class="material-icons-round" style="font-size: 28px; color: #00e5ff;">spatial_audio_off</span>
                              <div style="font-size: 14px; font-weight: 700; color: white;">Welcome, Director</div>
                              <div style="font-size: 8px; color: var(--text-muted); max-width: 220px; line-height: 1.3;">How can I be of service? Want to try Quick Actions &amp; Suggested Queries from the dropdown?</div>
                              <div class="mockup-suggestions-select" style="border: 1px solid var(--border-glass); border-radius: 4px; padding: 4px 8px; font-size: 8px; background: rgba(0,0,0,0.25); color: var(--text-muted); display: flex; justify-content: space-between; align-items: center; width: 180px; margin-top: 10px; font-family: var(--font-family-body);">
                                <span>--- Select a query or quick link ---</span>
                                <span class="material-icons-round" style="font-size: 8px;">expand_more</span>
                              </div>
                            </div>
                            <div class="mockup-dash-inputbar">
                              <span class="material-icons-round" style="font-size: 10px;">mic</span>
                              <div class="mockup-dash-input-text" style="color: white;">Correct the screen show the home screen and then this dialog screen</div>
                              <span class="material-icons-round" style="font-size: 12px; color: #00e5ff; background: rgba(0, 168, 204, 0.2); border-radius: 4px; padding: 2px;">arrow_upward</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Absolute Overlay Pins -->
                    <div class="annotated-pin" style="top: 18%; left: 12%;" title="Workspace Badge">1</div>
                    <div class="annotated-pin" style="top: 48%; left: 12%;" title="Sidebar Conversations">2</div>
                    <div class="annotated-pin" style="top: 86%; left: 12%;" title="Action Panel Buttons">3</div>
                    <div class="annotated-pin" style="top: 5%; left: 74%;" title="Style Palette Selector">4</div>
                    <div class="annotated-pin" style="top: 5%; left: 79%;" title="OLED Dark Mode Toggle">5</div>
                    <div class="annotated-pin" style="top: 5%; left: 69%;" title="Bilingual Toggle">6</div>
                    <div class="annotated-pin" style="top: 5%; left: 84%;" title="Manual Selector">7</div>
                    <div class="annotated-pin" style="top: 32%; left: 62%;" title="Welcome Banner Empty State">8</div>
                    <div class="annotated-pin" style="top: 50%; left: 62%;" title="Suggestions Dropdown Selector">9</div>
                    <div class="annotated-pin" style="top: 86%; left: 39%;" title="Neon Voice Microphone">10</div>
                  </div>
                </div>

                <!-- Whiteboard Pointers View -->
                <div class="whiteboard-container">
                  <div class="annotated-container" style="position: relative; max-width: 480px; margin: 0 auto;">
                    <div class="guide-mockup-wrapper" style="height: 380px;">
                      <!-- Same mockup as above -->
                      <div class="mockup-dash">
                        <div class="mockup-dash-header">
                          <div class="mockup-dash-branding">
                            <span class="material-icons-round" style="font-size: 10px; color: var(--text-muted);">menu</span>
                            <img src="https://drive.google.com/thumbnail?id=1bY49c_N03rFlBLGgb_4bzsB_tdK-HNDa&amp;sz=w250" style="width: 14px; height: 14px; border-radius: 50%; object-fit: cover;" alt="Logo">
                            <span class="mockup-dash-title">El Patr&oacute;n</span>
                            <span class="mockup-dash-pill" style="font-size: 6px; padding: 1px 4px; margin-left: 6px; background: rgba(0, 168, 204, 0.2); border: 1px solid rgba(0, 168, 204, 0.4); color: #00e5ff; border-radius: 3px;">DIRECTOR / LEVEL 3</span>
                          </div>
                          <div class="mockup-dash-controls">
                            <span class="mockup-dash-pill">Native <span style="display:inline-block; width:12px; height:6px; background:rgba(255,255,255,0.2); border-radius:3px; position:relative; vertical-align:middle; margin: 0 2px;"><span style="position:absolute; width:4px; height:4px; background:white; border-radius:50%; top:1px; left:1px;"></span></span> Hybrid</span>
                            <span class="material-icons-round" style="font-size: 10px; vertical-align: middle;">translate</span><span style="font-size: 6px; font-weight: 700; margin-left: 1px; margin-right: 4px; font-family: var(--font-family-body); vertical-align: middle; color: var(--text-muted);">EN</span>
                            <span class="material-icons-round" style="font-size: 10px; vertical-align: middle;">palette</span>
                            <span class="material-icons-round" style="font-size: 10px;">brightness_4</span>
                            <span class="material-icons-round" style="font-size: 10px; color: hsl(var(--accent-base));">menu_book</span>
                          </div>
                        </div>
                        <div class="mockup-dash-grid">
                          <div class="mockup-dash-sidebar">
                            <div class="mockup-sidebar-profile">
                              <div class="mockup-sidebar-avatar"></div>
                              <div>
                                <div class="mockup-sidebar-name">Angel Rodriguez</div>
                                <div class="mockup-sidebar-role">rodriguez2113@gmail.com</div>
                              </div>
                            </div>
                            <div style="font-size: 7px; color: var(--text-muted); margin-bottom: 2px;">Network &amp; API Properties <span class="material-icons-round" style="font-size:8px; float:right;">expand_more</span></div>
                            <div class="mockup-sidebar-section" style="display: flex; justify-content: space-between; align-items: center;">
                              <span>WORKSPACE HISTORY</span>
                              <span class="material-icons-round" style="font-size: 8px; cursor: pointer;">add_box</span>
                            </div>
                            <div class="mockup-sidebar-list">
                              <div class="mockup-sidebar-item active" style="border: 1px solid rgba(0, 168, 204, 0.3); background: rgba(0, 168, 204, 0.05); color: #00e5ff;">
                                <span class="material-icons-round" style="font-size: 8px; margin-right: 2px;">chat_bubble_outline</span> Nueva Conversación
                              </div>
                            </div>
                            <div class="mockup-sidebar-footer" style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px;">Manage Feedback</div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px; position:relative;">Submit Feedback<span style="font-size:4px; display:block; color:#00e5ff;">RP / 31C</span></div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px;">Update My Information</div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px;">Record Cash Payment</div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px; grid-column: span 2;">New Session</div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px; grid-column: span 2;">End Handshake</div>
                            </div>
                          </div>
                          <div class="mockup-dash-viewport">
                            <div class="mockup-dash-feed" style="justify-content: center; align-items: center; text-align: center; gap: 8px;">
                              <span class="material-icons-round" style="font-size: 28px; color: #00e5ff;">spatial_audio_off</span>
                              <div style="font-size: 14px; font-weight: 700; color: white;">Welcome, Director</div>
                              <div style="font-size: 8px; color: var(--text-muted); max-width: 220px; line-height: 1.3;">How can I be of service? Want to try Quick Actions &amp; Suggested Queries from the dropdown?</div>
                              <div class="mockup-suggestions-select" style="border: 1px solid var(--border-glass); border-radius: 4px; padding: 4px 8px; font-size: 8px; background: rgba(0,0,0,0.25); color: var(--text-muted); display: flex; justify-content: space-between; align-items: center; width: 180px; margin-top: 10px; font-family: var(--font-family-body);">
                                <span>--- Select a query or quick link ---</span>
                                <span class="material-icons-round" style="font-size: 8px;">expand_more</span>
                              </div>
                            </div>
                            <div class="mockup-dash-inputbar">
                              <span class="material-icons-round" style="font-size: 10px;">mic</span>
                              <div class="mockup-dash-input-text" style="color: white;">Correct the screen show the home screen and then this dialog screen</div>
                              <span class="material-icons-round" style="font-size: 12px; color: #00e5ff; background: rgba(0, 168, 204, 0.2); border-radius: 4px; padding: 2px;">arrow_upward</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <svg viewBox="0 0 500 380" class="whiteboard-svg-overlay">
                      <defs>
                        <marker id="whiteboard-arrow-welcome" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6"
                          markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
                        </marker>
                      </defs>

                      <!-- 1. Workspace Badge Identity -->
                      <path d="M 120,72 L 50,72" stroke="#ef4444" stroke-width="2"
                        marker-end="url(#whiteboard-arrow-welcome)" />
                      <rect x="125" y="61" width="90" height="22" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444"
                        stroke-width="1" />
                      <text x="170" y="75" fill="#f87171" font-size="9" font-weight="700" text-anchor="middle"
                        font-family="'Outfit', sans-serif">1. Profile Badge</text>

                      <!-- 2. Sidebar History list -->
                      <path d="M 120,185 L 50,185" stroke="#ef4444" stroke-width="2"
                        marker-end="url(#whiteboard-arrow-welcome)" />
                      <rect x="125" y="174" width="90" height="22" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444"
                        stroke-width="1" />
                      <text x="170" y="188" fill="#f87171" font-size="9" font-weight="700" text-anchor="middle"
                        font-family="'Outfit', sans-serif">2. Chat Sessions</text>

                      <!-- 3. Sidebar Actions -->
                      <path d="M 120,315 L 50,315" stroke="#ef4444" stroke-width="2"
                        marker-end="url(#whiteboard-arrow-welcome)" />
                      <rect x="125" y="304" width="90" height="22" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444"
                        stroke-width="1" />
                      <text x="170" y="318" fill="#f87171" font-size="9" font-weight="700" text-anchor="middle"
                        font-family="'Outfit', sans-serif">3. Sidebar Actions</text>

                      <!-- 4. Style Palette Selector -->
                      <path d="M 320,55 L 370,18" stroke="#ef4444" stroke-width="2"
                        marker-end="url(#whiteboard-arrow-welcome)" />
                      <rect x="250" y="44" width="95" height="22" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444"
                        stroke-width="1" />
                      <text x="297" y="58" fill="#f87171" font-size="9" font-weight="700" text-anchor="middle"
                        font-family="'Outfit', sans-serif">4. Style Palette</text>

                      <!-- 5. OLED Dark Mode Toggle -->
                      <path d="M 350,75 L 395,18" stroke="#ef4444" stroke-width="2"
                        marker-end="url(#whiteboard-arrow-welcome)" />
                      <rect x="280" y="64" width="95" height="22" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444"
                        stroke-width="1" />
                      <text x="327" y="78" fill="#f87171" font-size="9" font-weight="700" text-anchor="middle"
                        font-family="'Outfit', sans-serif">5. OLED Mode</text>

                      <!-- 6. Language Toggle -->
                      <path d="M 290,35 L 345,18" stroke="#ef4444" stroke-width="2"
                        marker-end="url(#whiteboard-arrow-welcome)" />
                      <rect x="220" y="24" width="90" height="22" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444"
                        stroke-width="1" />
                      <text x="265" y="38" fill="#f87171" font-size="9" font-weight="700" text-anchor="middle"
                        font-family="'Outfit', sans-serif">6. Lang Toggle</text>

                      <!-- 7. Manual Trigger -->
                      <path d="M 380,95 L 420,18" stroke="#ef4444" stroke-width="2"
                        marker-end="url(#whiteboard-arrow-welcome)" />
                      <rect x="310" y="84" width="80" height="22" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444"
                        stroke-width="1" />
                      <text x="350" y="98" fill="#f87171" font-size="9" font-weight="700" text-anchor="middle"
                        font-family="'Outfit', sans-serif">7. 📖 Manual</text>

                      <!-- 8. Welcome Banner -->
                      <path d="M 240,135 L 290,135" stroke="#ef4444" stroke-width="2"
                        marker-end="url(#whiteboard-arrow-welcome)" />
                      <rect x="155" y="124" width="80" height="22" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444"
                        stroke-width="1" />
                      <text x="195" y="138" fill="#f87171" font-size="9" font-weight="700" text-anchor="middle"
                        font-family="'Outfit', sans-serif">8. Welcome Box</text>

                      <!-- 9. Suggestions Selector -->
                      <path d="M 240,195 L 300,195" stroke="#ef4444" stroke-width="2"
                        marker-end="url(#whiteboard-arrow-welcome)" />
                      <rect x="155" y="184" width="80" height="22" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444"
                        stroke-width="1" />
                      <text x="195" y="198" fill="#f87171" font-size="9" font-weight="700" text-anchor="middle"
                        font-family="'Outfit', sans-serif">9. Dropdown Select</text>

                      <!-- 10. Voice Mic -->
                      <path d="M 280,325 L 195,325" stroke="#ef4444" stroke-width="2"
                        marker-end="url(#whiteboard-arrow-welcome)" />
                      <rect x="285" y="314" width="80" height="22" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444"
                        stroke-width="1" />
                      <text x="325" y="328" fill="#f87171" font-size="9" font-weight="700" text-anchor="middle"
                        font-family="'Outfit', sans-serif">10. Voice Mic</text>
                    </svg>
                  </div>
                </div>

                <div class="guide-img-caption">Figure 1.2: Interactive Vector CSS Illustration of the Command Workspace (Welcome Screen)</div>
              </div>

              <table class="guide-table">
                <thead>
                  <tr>
                    <th>Pointer ID</th>
                    <th>Control / Element</th>
                    <th>Exact Function &amp; Interactive Triggers</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span class="badge-role-director" style="padding: 2px 8px; border-radius: 10px; font-weight: bold; color: white;">1</span></td>
                    <td><strong>Workspace Badge Identity</strong></td>
                    <td>Displays Director/Performer profile cards showing names, clearance level, and registered email address.</td>
                  </tr>
                  <tr>
                    <td><span class="badge-role-director" style="padding: 2px 8px; border-radius: 10px; font-weight: bold; color: white;">2</span></td>
                    <td><strong>Sidebar Workspace History</strong></td>
                    <td>Tracks active and saved sessions for instant context restoring.</td>
                  </tr>
                  <tr>
                    <td><span class="badge-role-director" style="padding: 2px 8px; border-radius: 10px; font-weight: bold; color: white;">3</span></td>
                    <td><strong>Sidebar Actions panel</strong></td>
                    <td>Quick links for submitting feedback, updating residential information, and logging optional cash payments.</td>
                  </tr>
                  <tr>
                    <td><span class="badge-role-director" style="padding: 2px 8px; border-radius: 10px; font-weight: bold; color: white;">4</span></td>
                    <td><strong>Style Palette Selector (🎨)</strong></td>
                    <td>Cycles the ambient design theme (HQ Blue, Tropical Green, Salsa Red).</td>
                  </tr>
                  <tr>
                    <td><span class="badge-role-director" style="padding: 2px 8px; border-radius: 10px; font-weight: bold; color: white;">5</span></td>
                    <td><strong>OLED Dark Mode Toggle (🌙)</strong></td>
                    <td>Enables true black high-contrast OLED mode.</td>
                  </tr>
                  <tr>
                    <td><span class="badge-role-director" style="padding: 2px 8px; border-radius: 10px; font-weight: bold; color: white;">6</span></td>
                    <td><strong>Language / Voice Toggle (🇺🇸/🇵🇷)</strong></td>
                    <td>Switches translation strings and Web Speech recognition registers (en-US / es-PR).</td>
                  </tr>
                  <tr>
                    <td><span class="badge-role-director" style="padding: 2px 8px; border-radius: 10px; font-weight: bold; color: white;">7</span></td>
                    <td><strong>Technical Manual Trigger (📖)</strong></td>
                    <td>Opens this bilingual slide-out operational guide overlay modal.</td>
                  </tr>
                  <tr>
                    <td><span class="badge-role-director" style="padding: 2px 8px; border-radius: 10px; font-weight: bold; color: white;">8</span></td>
                    <td><strong>Welcome Banner Empty State</strong></td>
                    <td>Central greeting card that instructs users on available features before a session starts.</td>
                  </tr>
                  <tr>
                    <td><span class="badge-role-director" style="padding: 2px 8px; border-radius: 10px; font-weight: bold; color: white;">9</span></td>
                    <td><strong>Suggestions Dropdown Selector</strong></td>
                    <td>Menu list containing quick query presets for fast audits of attendance, inventory, or payment stipends.</td>
                  </tr>
                  <tr>
                    <td><span class="badge-role-director" style="padding: 2px 8px; border-radius: 10px; font-weight: bold; color: white;">10</span></td>
                    <td><strong>Neon Voice Microphone (🎙️)</strong></td>
                    <td>Triggers local Web Speech API voice capture for hands-free queries.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="guide-section">
              <h4>3. The Command Workspace (Dialog Screen)</h4>
              <p>Once a query has been submitted, the workspace feed updates to show active dialogue exchanges with the AI persona.</p>

              <!-- Guide View Selector Pill -->
              <div class="guide-view-selector font-outfit">
                <button class="view-sel-btn active" onclick="setGuideView(this, 'pins')">Interactive Pins</button>
                <button class="view-sel-btn" onclick="setGuideView(this, 'whiteboard')">Whiteboard Pointers</button>
              </div>

              <div class="guide-img-container">
                <!-- Interactive Pins View -->
                <div class="pins-container">
                  <div class="annotated-container" style="position: relative; max-width: 480px; margin: 0 auto;">
                    <!-- Vector CSS Mockup of Dashboard (Dialog Screen) -->
                    <div class="guide-mockup-wrapper" style="height: 380px;">
                      <div class="mockup-dash">
                        <div class="mockup-dash-header">
                          <div class="mockup-dash-branding">
                            <span class="material-icons-round" style="font-size: 10px; color: var(--text-muted);">menu</span>
                            <img src="https://drive.google.com/thumbnail?id=1bY49c_N03rFlBLGgb_4bzsB_tdK-HNDa&amp;sz=w250" style="width: 14px; height: 14px; border-radius: 50%; object-fit: cover;" alt="Logo">
                            <span class="mockup-dash-title">El Patr&oacute;n</span>
                            <span class="mockup-dash-pill" style="font-size: 6px; padding: 1px 4px; margin-left: 6px; background: rgba(0, 168, 204, 0.2); border: 1px solid rgba(0, 168, 204, 0.4); color: #00e5ff; border-radius: 3px;">DIRECTOR / LEVEL 3</span>
                          </div>
                          <div class="mockup-dash-controls">
                            <span class="mockup-dash-pill">Native <span style="display:inline-block; width:12px; height:6px; background:rgba(255,255,255,0.2); border-radius:3px; position:relative; vertical-align:middle; margin: 0 2px;"><span style="position:absolute; width:4px; height:4px; background:white; border-radius:50%; top:1px; left:1px;"></span></span> Hybrid</span>
                            <span class="material-icons-round" style="font-size: 10px; vertical-align: middle;">translate</span><span style="font-size: 6px; font-weight: 700; margin-left: 1px; margin-right: 4px; font-family: var(--font-family-body); vertical-align: middle; color: var(--text-muted);">EN</span>
                            <span class="material-icons-round" style="font-size: 10px; vertical-align: middle;">palette</span>
                            <span class="material-icons-round" style="font-size: 10px;">brightness_4</span>
                            <span class="material-icons-round" style="font-size: 10px; color: hsl(var(--accent-base));">menu_book</span>
                          </div>
                        </div>
                        <div class="mockup-dash-grid">
                          <div class="mockup-dash-sidebar">
                            <div class="mockup-sidebar-profile">
                              <div class="mockup-sidebar-avatar"></div>
                              <div>
                                <div class="mockup-sidebar-name">Angel Rodriguez</div>
                                <div class="mockup-sidebar-role">rodriguez2113@gmail.com</div>
                              </div>
                            </div>
                            <div style="font-size: 7px; color: var(--text-muted); margin-bottom: 2px;">Network &amp; API Properties <span class="material-icons-round" style="font-size:8px; float:right;">expand_more</span></div>
                            <div class="mockup-sidebar-section" style="display: flex; justify-content: space-between; align-items: center;">
                              <span>WORKSPACE HISTORY</span>
                              <span class="material-icons-round" style="font-size: 8px; cursor: pointer;">add_box</span>
                            </div>
                            <div class="mockup-sidebar-list">
                              <div class="mockup-sidebar-item active" style="border: 1px solid rgba(0, 168, 204, 0.3); background: rgba(0, 168, 204, 0.05); color: #00e5ff;">
                                <span class="material-icons-round" style="font-size: 8px; margin-right: 2px;">chat_bubble_outline</span> Correct the screen s...
                              </div>
                            </div>
                            <div class="mockup-sidebar-footer" style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px;">Manage Feedback</div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px; position:relative;">Submit Feedback<span style="font-size:4px; display:block; color:#00e5ff;">RP / 31C</span></div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px;">Update My Information</div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px;">Record Cash Payment</div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px; grid-column: span 2;">New Session</div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px; grid-column: span 2;">End Handshake</div>
                            </div>
                          </div>
                          <div class="mockup-dash-viewport">
                            <div class="mockup-dash-feed" style="gap: 8px;">
                              <div class="mockup-msg user" style="align-self: flex-end; background: #00a8cc;">YO: Correct the screen show the home screen and then this dialog screen</div>
                              <div style="display: flex; align-items: center; gap: 6px; margin-top: auto; font-family: var(--font-family-body);">
                                <div style="display: flex; gap: 3px;">
                                  <span style="width: 4px; height: 4px; background: #00e5ff; border-radius: 50%;"></span>
                                  <span style="width: 4px; height: 4px; background: #00e5ff; border-radius: 50%; opacity: 0.6;"></span>
                                  <span style="width: 4px; height: 4px; background: #00e5ff; border-radius: 50%; opacity: 0.3;"></span>
                                </div>
                                <span style="font-size: 6px; color: #00e5ff; font-weight: bold; text-transform: uppercase;">EL PATRÓN IS AUDITING DATABASES...</span>
                              </div>
                            </div>
                            <div class="mockup-dash-inputbar">
                              <span class="material-icons-round" style="font-size: 10px; margin-right: 4px; color: var(--text-muted);">content_copy</span>
                              <span class="material-icons-round" style="font-size: 10px; margin-right: 4px; color: var(--text-muted);">file_download</span>
                              <span class="material-icons-round" style="font-size: 10px;">mic</span>
                              <div class="mockup-dash-input-text" style="color: var(--text-muted);">Ask El Patrón about attendance logs, inventory, or stipends...</div>
                              <span class="material-icons-round" style="font-size: 12px; color: #00e5ff; background: rgba(0, 168, 204, 0.2); border-radius: 4px; padding: 2px;">cached</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Absolute Overlay Pins -->
                    <div class="annotated-pin" style="top: 48%; left: 12%;" title="Sidebar Selected Conversation">1</div>
                    <div class="annotated-pin" style="top: 55%; left: 24%;" title="Context Menu Popup overlay">2</div>
                    <div class="annotated-pin" style="top: 25%; left: 74%;" title="User Message Bubble">3</div>
                    <div class="annotated-pin" style="top: 60%; left: 45%;" title="AI Response / Auditing Status">4</div>
                    <div class="annotated-pin" style="top: 86%; left: 32%;" title="Log Utilities (Copy/Download)">5</div>
                    <div class="annotated-pin" style="top: 86%; left: 92%;" title="Submit / Cancel Action Button">6</div>
                  </div>
                </div>

                <!-- Whiteboard Pointers View -->
                <div class="whiteboard-container">
                  <div class="annotated-container" style="position: relative; max-width: 480px; margin: 0 auto;">
                    <div class="guide-mockup-wrapper" style="height: 380px;">
                      <!-- Same mockup as above -->
                      <div class="mockup-dash">
                        <div class="mockup-dash-header">
                          <div class="mockup-dash-branding">
                            <span class="material-icons-round" style="font-size: 10px; color: var(--text-muted);">menu</span>
                            <img src="https://drive.google.com/thumbnail?id=1bY49c_N03rFlBLGgb_4bzsB_tdK-HNDa&amp;sz=w250" style="width: 14px; height: 14px; border-radius: 50%; object-fit: cover;" alt="Logo">
                            <span class="mockup-dash-title">El Patr&oacute;n</span>
                            <span class="mockup-dash-pill" style="font-size: 6px; padding: 1px 4px; margin-left: 6px; background: rgba(0, 168, 204, 0.2); border: 1px solid rgba(0, 168, 204, 0.4); color: #00e5ff; border-radius: 3px;">DIRECTOR / LEVEL 3</span>
                          </div>
                          <div class="mockup-dash-controls">
                            <span class="mockup-dash-pill">Native <span style="display:inline-block; width:12px; height:6px; background:rgba(255,255,255,0.2); border-radius:3px; position:relative; vertical-align:middle; margin: 0 2px;"><span style="position:absolute; width:4px; height:4px; background:white; border-radius:50%; top:1px; left:1px;"></span></span> Hybrid</span>
                            <span class="material-icons-round" style="font-size: 10px; vertical-align: middle;">translate</span><span style="font-size: 6px; font-weight: 700; margin-left: 1px; margin-right: 4px; font-family: var(--font-family-body); vertical-align: middle; color: var(--text-muted);">EN</span>
                            <span class="material-icons-round" style="font-size: 10px; vertical-align: middle;">palette</span>
                            <span class="material-icons-round" style="font-size: 10px;">brightness_4</span>
                            <span class="material-icons-round" style="font-size: 10px; color: hsl(var(--accent-base));">menu_book</span>
                          </div>
                        </div>
                        <div class="mockup-dash-grid">
                          <div class="mockup-dash-sidebar">
                            <div class="mockup-sidebar-profile">
                              <div class="mockup-sidebar-avatar"></div>
                              <div>
                                <div class="mockup-sidebar-name">Angel Rodriguez</div>
                                <div class="mockup-sidebar-role">rodriguez2113@gmail.com</div>
                              </div>
                            </div>
                            <div style="font-size: 7px; color: var(--text-muted); margin-bottom: 2px;">Network &amp; API Properties <span class="material-icons-round" style="font-size:8px; float:right;">expand_more</span></div>
                            <div class="mockup-sidebar-section" style="display: flex; justify-content: space-between; align-items: center;">
                              <span>WORKSPACE HISTORY</span>
                              <span class="material-icons-round" style="font-size: 8px; cursor: pointer;">add_box</span>
                            </div>
                            <div class="mockup-sidebar-list">
                              <div class="mockup-sidebar-item active" style="border: 1px solid rgba(0, 168, 204, 0.3); background: rgba(0, 168, 204, 0.05); color: #00e5ff;">
                                <span class="material-icons-round" style="font-size: 8px; margin-right: 2px;">chat_bubble_outline</span> Correct the screen s...
                              </div>
                            </div>
                            <div class="mockup-sidebar-footer" style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px;">Manage Feedback</div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px; position:relative;">Submit Feedback<span style="font-size:4px; display:block; color:#00e5ff;">RP / 31C</span></div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px;">Update My Information</div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px;">Record Cash Payment</div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px; grid-column: span 2;">New Session</div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px; grid-column: span 2;">End Handshake</div>
                            </div>
                          </div>
                          <div class="mockup-dash-viewport">
                            <div class="mockup-dash-feed" style="gap: 8px;">
                              <div class="mockup-msg user" style="align-self: flex-end; background: #00a8cc;">YO: Correct the screen show the home screen and then this dialog screen</div>
                              <div style="display: flex; align-items: center; gap: 6px; margin-top: auto; font-family: var(--font-family-body);">
                                <div style="display: flex; gap: 3px;">
                                  <span style="width: 4px; height: 4px; background: #00e5ff; border-radius: 50%;"></span>
                                  <span style="width: 4px; height: 4px; background: #00e5ff; border-radius: 50%; opacity: 0.6;"></span>
                                  <span style="width: 4px; height: 4px; background: #00e5ff; border-radius: 50%; opacity: 0.3;"></span>
                                </div>
                                <span style="font-size: 6px; color: #00e5ff; font-weight: bold; text-transform: uppercase;">EL PATRÓN IS AUDITING DATABASES...</span>
                              </div>
                            </div>
                            <div class="mockup-dash-inputbar">
                              <span class="material-icons-round" style="font-size: 10px; margin-right: 4px; color: var(--text-muted);">content_copy</span>
                              <span class="material-icons-round" style="font-size: 10px; margin-right: 4px; color: var(--text-muted);">file_download</span>
                              <span class="material-icons-round" style="font-size: 10px;">mic</span>
                              <div class="mockup-dash-input-text" style="color: var(--text-muted);">Ask El Patrón about attendance logs, inventory, or stipends...</div>
                              <span class="material-icons-round" style="font-size: 12px; color: #00e5ff; background: rgba(0, 168, 204, 0.2); border-radius: 4px; padding: 2px;">cached</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <svg viewBox="0 0 500 380" class="whiteboard-svg-overlay">
                      <defs>
                        <marker id="whiteboard-arrow-dialog" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6"
                          markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
                        </marker>
                      </defs>

                      <!-- 1. Active Chat Item -->
                      <path d="M 120,185 L 50,185" stroke="#ef4444" stroke-width="2"
                        marker-end="url(#whiteboard-arrow-dialog)" />
                      <rect x="125" y="174" width="90" height="22" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444"
                        stroke-width="1" />
                      <text x="170" y="188" fill="#f87171" font-size="9" font-weight="700" text-anchor="middle"
                        font-family="'Outfit', sans-serif">1. Active Session</text>

                      <!-- 2. Context Menu -->
                      <path d="M 120,215 L 80,215" stroke="#ef4444" stroke-width="2"
                        marker-end="url(#whiteboard-arrow-dialog)" />
                      <rect x="125" y="204" width="90" height="22" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444"
                        stroke-width="1" />
                      <text x="170" y="218" fill="#f87171" font-size="9" font-weight="700" text-anchor="middle"
                        font-family="'Outfit', sans-serif">2. Context Menu</text>

                      <!-- 3. User Message Bubble -->
                      <path d="M 240,110 L 320,110" stroke="#ef4444" stroke-width="2"
                        marker-end="url(#whiteboard-arrow-dialog)" />
                      <rect x="155" y="99" width="80" height="22" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444"
                        stroke-width="1" />
                      <text x="195" y="113" fill="#f87171" font-size="9" font-weight="700" text-anchor="middle"
                        font-family="'Outfit', sans-serif">3. User Bubble</text>

                      <!-- 4. AI Response / Auditing Status -->
                      <path d="M 220,280 L 150,280" stroke="#ef4444" stroke-width="2"
                        marker-end="url(#whiteboard-arrow-dialog)" />
                      <rect x="225" y="269" width="90" height="22" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444"
                        stroke-width="1" />
                      <text x="270" y="283" fill="#f87171" font-size="9" font-weight="700" text-anchor="middle"
                        font-family="'Outfit', sans-serif">4. AI Audit Status</text>

                      <!-- 5. Log Utilities -->
                      <path d="M 220,325 L 140,325" stroke="#ef4444" stroke-width="2"
                        marker-end="url(#whiteboard-arrow-dialog)" />
                      <rect x="225" y="314" width="90" height="22" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444"
                        stroke-width="1" />
                      <text x="270" y="328" fill="#f87171" font-size="9" font-weight="700" text-anchor="middle"
                        font-family="'Outfit', sans-serif">5. Log Utilities</text>

                      <!-- 6. Submit/Cancel Action Button -->
                      <path d="M 380,325 L 435,325" stroke="#ef4444" stroke-width="2"
                        marker-end="url(#whiteboard-arrow-dialog)" />
                      <rect x="295" y="314" width="80" height="22" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444"
                        stroke-width="1" />
                      <text x="335" y="328" fill="#f87171" font-size="9" font-weight="700" text-anchor="middle"
                        font-family="'Outfit', sans-serif">6. Send/Cancel</text>
                    </svg>
                  </div>
                </div>

                <div class="guide-img-caption">Figure 1.3: Interactive Vector CSS Illustration of the Command Workspace (Dialog Screen)</div>
              </div>

              <table class="guide-table">
                <thead>
                  <tr>
                    <th>Pointer ID</th>
                    <th>Control / Element</th>
                    <th>Exact Function &amp; Interactive Triggers</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span class="badge-role-director" style="padding: 2px 8px; border-radius: 10px; font-weight: bold; color: white;">1</span></td>
                    <td><strong>Active Session Indicator</strong></td>
                    <td>Highlights the current active thread in the Workspace History list.</td>
                  </tr>
                  <tr>
                    <td><span class="badge-role-director" style="padding: 2px 8px; border-radius: 10px; font-weight: bold; color: white;">2</span></td>
                    <td><strong>Pin &amp; Edit Context Menu</strong></td>
                    <td>Provides options to Pin, Rename, or Delete conversations. Triggered by right-clicking or long-pressing a thread.</td>
                  </tr>
                  <tr>
                    <td><span class="badge-role-director" style="padding: 2px 8px; border-radius: 10px; font-weight: bold; color: white;">3</span></td>
                    <td><strong>User Message Bubble</strong></td>
                    <td>Shows the formatted text of your query aligned on the right.</td>
                  </tr>
                  <tr>
                    <td><span class="badge-role-director" style="padding: 2px 8px; border-radius: 10px; font-weight: bold; color: white;">4</span></td>
                    <td><strong>AI Auditing Status</strong></td>
                    <td>Blinking indicator with three moving dots showing that El Patrón is actively processing network queries.</td>
                  </tr>
                  <tr>
                    <td><span class="badge-role-director" style="padding: 2px 8px; border-radius: 10px; font-weight: bold; color: white;">5</span></td>
                    <td><strong>Log Utilities</strong></td>
                    <td>Contains copy (content_copy) and download (file_download) buttons to back up the current active thread.</td>
                  </tr>
                  <tr>
                    <td><span class="badge-role-director" style="padding: 2px 8px; border-radius: 10px; font-weight: bold; color: white;">6</span></td>
                    <td><strong>Submit / Cancel Button</strong></td>
                    <td>Dynamically morphs into a circular refresh arrow while a query is running. Clicking it halts active network requests.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="guide-section">
              <h4>4. Core Natural Language Intent Rules</h4>
              <p>The routing engine automatically parses performer inputs to fetch relevant database segments. These are the main routing rules:</p>
              <ul>
                <li><strong>Rule A (Payments &amp; Balances)</strong>: Triggered by keywords like <em>pay, money, check, stipend, paid, balance, pago, dinero</em>. Indexes the <code>Payments</code> ledger matching your Performer ID.</li>
                <li><strong>Rule B/F (Costumes &amp; Inventory)</strong>: Triggered by keywords like <em>gear, inventory, costume, conga, shoe, uniform, dress, vestuario, ropa</em>. Accesses <code>Inventory</code>, <code>Attendance</code>, and <code>Tradicion_Org</code>.</li>
                <li><strong>Rule G (Profiles &amp; Contacts)</strong>: Triggered by keywords like <em>birthday, birth, profile, contact, email, phone, active, buddy, manager</em>. Restores buddy and contact channels.</li>
              </ul>
            </div>

            <div class="guide-section">
              <h4>5. Suggested Actions &amp; Quick Queries Dropdown</h4>
              <p>For seamless administration and hand-free operations, the empty chat view displays a premium, glassmorphic dropdown list containing five quick queries. Selecting any option instantly populates the chat workspace and executes the lookup. Below is the operational detail for each available query:</p>
              
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin: 15px 0;">
                <div style="border: 1px solid var(--border-glass); padding: 12px; border-radius: 8px; background: rgba(255, 255, 255, 0.02);">
                  <h5 style="color: hsl(var(--accent-base)); margin-top: 0; margin-bottom: 5px;">👔 Assigned Inventory</h5>
                  <p style="font-size: 11px; margin: 0; color: var(--text-muted);"><strong>Dispatches:</strong> "What costumes are checked out to me?" / "¿Qué trajes tengo asignados?"</p>
                  <p style="font-size: 11px; margin: 5px 0 0 0; line-height: 1.3;">Indexes the <code>Inventory</code> database matching your Performer ID. Returns your checked-out dance costumes, instruments (such as congas), checkout dates, and physical condition.</p>
                </div>
                <div style="border: 1px solid var(--border-glass); padding: 12px; border-radius: 8px; background: rgba(255, 255, 255, 0.02);">
                  <h5 style="color: hsl(var(--accent-base)); margin-top: 0; margin-bottom: 5px;">📅 Attendance Status</h5>
                  <p style="font-size: 11px; margin: 0; color: var(--text-muted);"><strong>Dispatches:</strong> "What is my rehearsal attendance history?" / "Cual es mi asistencia en los ensayos?"</p>
                  <p style="font-size: 11px; margin: 5px 0 0 0; line-height: 1.3;">Deep-scans the <code>Attendance</code> sheet. Summarizes your rehearsal logs, calculating total attended rehearsals, excused absences, unexcused absences, and your overall attendance percentage.</p>
                </div>
                <div style="border: 1px solid var(--border-glass); padding: 12px; border-radius: 8px; background: rgba(255, 255, 255, 0.02);">
                  <h5 style="color: hsl(var(--accent-base)); margin-top: 0; margin-bottom: 5px;">📖 Organizational Manual</h5>
                  <p style="font-size: 11px; margin: 0; color: var(--text-muted);"><strong>Dispatches:</strong> "Who is my buddy and direct manager?" / "¿Quién es mi buddy y asignado?"</p>
                  <p style="font-size: 11px; margin: 5px 0 0 0; line-height: 1.3;">Queries the <code>Tradicion_Org</code> curriculum level and hierarchy records. Returns your assigned administrative coordinator and choreography buddy pairing details.</p>
                </div>
                <div style="border: 1px solid var(--border-glass); padding: 12px; border-radius: 8px; background: rgba(255, 255, 255, 0.02);">
                  <h5 style="color: hsl(var(--accent-base)); margin-top: 0; margin-bottom: 5px;">🎖️ Request Report Card</h5>
                  <p style="font-size: 11px; margin: 0; color: var(--text-muted);"><strong>Dispatches:</strong> "Please show my Performer Report Card." / "Por favor, muestra mi Reporte de Progreso de Performer."</p>
                  <p style="font-size: 11px; margin: 5px 0 0 0; line-height: 1.3;">Connects to the <code>Tradición Performer Report Cards</code> tab. Extracts real-time progress ratings, compliance, syllabus tasks completed, and direct feedback notes from the Director.</p>
                </div>
                <div style="border: 1px solid var(--border-glass); padding: 12px; border-radius: 8px; background: rgba(255, 255, 255, 0.02); grid-column: span 2;">
                  <h5 style="color: hsl(var(--accent-base)); margin-top: 0; margin-bottom: 5px;">📅 90 Day Event Summary</h5>
                  <p style="font-size: 11px; margin: 0; color: var(--text-muted);"><strong>Dispatches:</strong> "Please show my 90 Day Event Summary schedule." / "Por favor, muestra mi Resumen de Eventos de 90 Días."</p>
                  <p style="font-size: 11px; margin: 5px 0 0 0; line-height: 1.3;">Syncs with Live Performance Google Calendars. Compiles all upcoming performances, checking invitations, RSVP statuses, dates, and locations.</p>
                </div>
              </div>
            </div>

            <div class="guide-section">
              <h4>6. Input Actions Tray Details</h4>
              <p>At the bottom of the chat viewport, the following utility elements are available:</p>
              <ul>
                <li><strong>Copy Thread (<code>content_copy</code>)</strong>: Formats the entire session into a clean markdown document and copies it to your clipboard.</li>
                <li><strong>Download Log (<code>file_download</code>)</strong>: Exporter to download the active conversation history as a <code>.txt</code> file.</li>
                <li><strong>Neon Microphone (<code>mic</code>)</strong>: Audio voice capture shortcut to dictate queries hands-free.</li>
              </ul>
            </div>

            <div class="guide-section">
              <h4>7. Profile Updates &amp; Cash Payment Logging</h4>
              <p>Performer details can be modified securely from the platform, and cash contributions can be logged directly into the external ledger:</p>
              <ul>
                <li><strong>Update Modal</strong>: Access from the bottom of the left sidebar. dispatches double-lock authentication tokens before writing.</li>
                <li><strong>Medical Uploads</strong>: Decodes Base64 medical document blobs, uploads them securely to Google Drive under a dedicated <code>Health Certificates</code> folder, makes the link viewable, and registers the entry in the <code>Health_certificates</code> ledger.</li>
                <li><strong>Cash Payment Entry (Optional)</strong>: If a Date and Amount are entered, logs the cash contribution directly in the external <code>Performer Payments</code> spreadsheet (ID: <code>1eaEttUh8JZPyoY61HLHpf5UxhgEltK9oU5bwUNyDwwU</code>) under subject <code>"Cash Payment Entered via El Patron AI"</code> with Source set to <code>"Cash"</code>.</li>
              </ul>
            </div>"""

# Define the new Spanish sections (Bienvenida + Diálogo + 4,5,6,7)
new_es_sections = """            <div class="guide-section">
              <h4>2. El Espacio de Trabajo de Comando (Pantalla de Bienvenida)</h4>
              <p>Una vez autorizado, ingresa al espacio de trabajo en su estado vacío. Cada control tiene una utilidad administrativa dedicada.</p>

              <!-- Guide View Selector Pill -->
              <div class="guide-view-selector font-outfit">
                <button class="view-sel-btn active" onclick="setGuideView(this, 'pins')">Pines Interactivos</button>
                <button class="view-sel-btn" onclick="setGuideView(this, 'whiteboard')">Punteros de Pizarra</button>
              </div>

              <div class="guide-img-container">
                <!-- Interactive Pins View -->
                <div class="pins-container">
                  <div class="annotated-container" style="position: relative; max-width: 480px; margin: 0 auto;">
                    <!-- Vector CSS Mockup of Dashboard (Welcome Screen) -->
                    <div class="guide-mockup-wrapper" style="height: 380px;">
                      <div class="mockup-dash">
                        <div class="mockup-dash-header">
                          <div class="mockup-dash-branding">
                            <span class="material-icons-round" style="font-size: 10px; color: var(--text-muted);">menu</span>
                            <img src="https://drive.google.com/thumbnail?id=1bY49c_N03rFlBLGgb_4bzsB_tdK-HNDa&amp;sz=w250" style="width: 14px; height: 14px; border-radius: 50%; object-fit: cover;" alt="Logo">
                            <span class="mockup-dash-title">El Patr&oacute;n</span>
                            <span class="mockup-dash-pill" style="font-size: 6px; padding: 1px 4px; margin-left: 6px; background: rgba(0, 168, 204, 0.2); border: 1px solid rgba(0, 168, 204, 0.4); color: #00e5ff; border-radius: 3px;">DIRECTOR / LEVEL 3</span>
                          </div>
                          <div class="mockup-dash-controls">
                            <span class="mockup-dash-pill">Native <span style="display:inline-block; width:12px; height:6px; background:rgba(255,255,255,0.2); border-radius:3px; position:relative; vertical-align:middle; margin: 0 2px;"><span style="position:absolute; width:4px; height:4px; background:white; border-radius:50%; top:1px; left:1px;"></span></span> Hybrid</span>
                            <span class="material-icons-round" style="font-size: 10px; vertical-align: middle;">translate</span><span style="font-size: 6px; font-weight: 700; margin-left: 1px; margin-right: 4px; font-family: var(--font-family-body); vertical-align: middle; color: var(--text-muted);">ES</span>
                            <span class="material-icons-round" style="font-size: 10px; vertical-align: middle;">palette</span>
                            <span class="material-icons-round" style="font-size: 10px;">brightness_4</span>
                            <span class="material-icons-round" style="font-size: 10px; color: hsl(var(--accent-base));">menu_book</span>
                          </div>
                        </div>
                        <div class="mockup-dash-grid">
                          <div class="mockup-dash-sidebar">
                            <div class="mockup-sidebar-profile">
                              <div class="mockup-sidebar-avatar"></div>
                              <div>
                                <div class="mockup-sidebar-name">Angel Rodriguez</div>
                                <div class="mockup-sidebar-role">rodriguez2113@gmail.com</div>
                              </div>
                            </div>
                            <div style="font-size: 7px; color: var(--text-muted); margin-bottom: 2px;">Network &amp; API Properties <span class="material-icons-round" style="font-size:8px; float:right;">expand_more</span></div>
                            <div class="mockup-sidebar-section" style="display: flex; justify-content: space-between; align-items: center;">
                              <span>HISTORIAL DE TRABAJO</span>
                              <span class="material-icons-round" style="font-size: 8px; cursor: pointer;">add_box</span>
                            </div>
                            <div class="mockup-sidebar-list">
                              <div class="mockup-sidebar-item active" style="border: 1px solid rgba(0, 168, 204, 0.3); background: rgba(0, 168, 204, 0.05); color: #00e5ff;">
                                <span class="material-icons-round" style="font-size: 8px; margin-right: 2px;">chat_bubble_outline</span> Nueva Conversación
                              </div>
                            </div>
                            <div class="mockup-sidebar-footer" style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px;">Administrar Feedback</div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px; position:relative;">Enviar Feedback<span style="font-size:4px; display:block; color:#00e5ff;">BP / 31C</span></div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px;">Actualizar Información</div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px;">Registrar Pago</div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px; grid-column: span 2;">Nueva Sesión</div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px; grid-column: span 2;">Terminar Conexión</div>
                            </div>
                          </div>
                          <div class="mockup-dash-viewport">
                            <div class="mockup-dash-feed" style="justify-content: center; align-items: center; text-align: center; gap: 8px;">
                              <span class="material-icons-round" style="font-size: 28px; color: #00e5ff;">spatial_audio_off</span>
                              <div style="font-size: 14px; font-weight: 700; color: white;">¡Saludos, Patr&oacute;n!</div>
                              <div style="font-size: 8px; color: var(--text-muted); max-width: 220px; line-height: 1.3;">¿Cómo puedo servirle, patrón? ¿Quiere probar las Acciones Rápidas y Consultas en el menú desplegable?</div>
                              <div class="mockup-suggestions-select" style="border: 1px solid var(--border-glass); border-radius: 4px; padding: 4px 8px; font-size: 8px; background: rgba(0,0,0,0.25); color: var(--text-muted); display: flex; justify-content: space-between; align-items: center; width: 180px; margin-top: 10px; font-family: var(--font-family-body);">
                                <span>--- Seleccione una consulta o enlace rápido ---</span>
                                <span class="material-icons-round" style="font-size: 8px;">expand_more</span>
                              </div>
                            </div>
                            <div class="mockup-dash-inputbar">
                              <span class="material-icons-round" style="font-size: 10px;">mic</span>
                              <div class="mockup-dash-input-text" style="color: white;">Correct the screen show the home screen and then this dialog screen</div>
                              <span class="material-icons-round" style="font-size: 12px; color: #00e5ff; background: rgba(0, 168, 204, 0.2); border-radius: 4px; padding: 2px;">arrow_upward</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Absolute Overlay Pins -->
                    <div class="annotated-pin" style="top: 18%; left: 12%;" title="Identidad del Espacio de Trabajo">1</div>
                    <div class="annotated-pin" style="top: 48%; left: 12%;" title="Conversaciones de la Barra Lateral">2</div>
                    <div class="annotated-pin" style="top: 86%; left: 12%;" title="Botones de Utilidades">3</div>
                    <div class="annotated-pin" style="top: 5%; left: 74%;" title="Selector de Paleta">4</div>
                    <div class="annotated-pin" style="top: 5%; left: 79%;" title="Modo OLED">5</div>
                    <div class="annotated-pin" style="top: 5%; left: 69%;" title="Cambio de Idioma">6</div>
                    <div class="annotated-pin" style="top: 5%; left: 84%;" title="Selector de Manual">7</div>
                    <div class="annotated-pin" style="top: 32%; left: 62%;" title="Mensaje de Bienvenida">8</div>
                    <div class="annotated-pin" style="top: 50%; left: 62%;" title="Menú Desplegable">9</div>
                    <div class="annotated-pin" style="top: 86%; left: 39%;" title="Micrófono de Voz">10</div>
                  </div>
                </div>

                <!-- Whiteboard Pointers View -->
                <div class="whiteboard-container">
                  <div class="annotated-container" style="position: relative; max-width: 480px; margin: 0 auto;">
                    <div class="guide-mockup-wrapper" style="height: 380px;">
                      <!-- Same mockup as above -->
                      <div class="mockup-dash">
                        <div class="mockup-dash-header">
                          <div class="mockup-dash-branding">
                            <span class="material-icons-round" style="font-size: 10px; color: var(--text-muted);">menu</span>
                            <img src="https://drive.google.com/thumbnail?id=1bY49c_N03rFlBLGgb_4bzsB_tdK-HNDa&amp;sz=w250" style="width: 14px; height: 14px; border-radius: 50%; object-fit: cover;" alt="Logo">
                            <span class="mockup-dash-title">El Patr&oacute;n</span>
                            <span class="mockup-dash-pill" style="font-size: 6px; padding: 1px 4px; margin-left: 6px; background: rgba(0, 168, 204, 0.2); border: 1px solid rgba(0, 168, 204, 0.4); color: #00e5ff; border-radius: 3px;">DIRECTOR / LEVEL 3</span>
                          </div>
                          <div class="mockup-dash-controls">
                            <span class="mockup-dash-pill">Native <span style="display:inline-block; width:12px; height:6px; background:rgba(255,255,255,0.2); border-radius:3px; position:relative; vertical-align:middle; margin: 0 2px;"><span style="position:absolute; width:4px; height:4px; background:white; border-radius:50%; top:1px; left:1px;"></span></span> Hybrid</span>
                            <span class="material-icons-round" style="font-size: 10px; vertical-align: middle;">translate</span><span style="font-size: 6px; font-weight: 700; margin-left: 1px; margin-right: 4px; font-family: var(--font-family-body); vertical-align: middle; color: var(--text-muted);">ES</span>
                            <span class="material-icons-round" style="font-size: 10px; vertical-align: middle;">palette</span>
                            <span class="material-icons-round" style="font-size: 10px;">brightness_4</span>
                            <span class="material-icons-round" style="font-size: 10px; color: hsl(var(--accent-base));">menu_book</span>
                          </div>
                        </div>
                        <div class="mockup-dash-grid">
                          <div class="mockup-dash-sidebar">
                            <div class="mockup-sidebar-profile">
                              <div class="mockup-sidebar-avatar"></div>
                              <div>
                                <div class="mockup-sidebar-name">Angel Rodriguez</div>
                                <div class="mockup-sidebar-role">rodriguez2113@gmail.com</div>
                              </div>
                            </div>
                            <div style="font-size: 7px; color: var(--text-muted); margin-bottom: 2px;">Network &amp; API Properties <span class="material-icons-round" style="font-size:8px; float:right;">expand_more</span></div>
                            <div class="mockup-sidebar-section" style="display: flex; justify-content: space-between; align-items: center;">
                              <span>HISTORIAL DE TRABAJO</span>
                              <span class="material-icons-round" style="font-size: 8px; cursor: pointer;">add_box</span>
                            </div>
                            <div class="mockup-sidebar-list">
                              <div class="mockup-sidebar-item active" style="border: 1px solid rgba(0, 168, 204, 0.3); background: rgba(0, 168, 204, 0.05); color: #00e5ff;">
                                <span class="material-icons-round" style="font-size: 8px; margin-right: 2px;">chat_bubble_outline</span> Nueva Conversación
                              </div>
                            </div>
                            <div class="mockup-sidebar-footer" style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px;">Administrar Feedback</div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px; position:relative;">Enviar Feedback<span style="font-size:4px; display:block; color:#00e5ff;">BP / 31C</span></div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px;">Actualizar Información</div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px;">Registrar Pago</div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px; grid-column: span 2;">Nueva Sesión</div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px; grid-column: span 2;">Terminar Conexión</div>
                            </div>
                          </div>
                          <div class="mockup-dash-viewport">
                            <div class="mockup-dash-feed" style="justify-content: center; align-items: center; text-align: center; gap: 8px;">
                              <span class="material-icons-round" style="font-size: 28px; color: #00e5ff;">spatial_audio_off</span>
                              <div style="font-size: 14px; font-weight: 700; color: white;">¡Saludos, Patr&oacute;n!</div>
                              <div style="font-size: 8px; color: var(--text-muted); max-width: 220px; line-height: 1.3;">¿Cómo puedo servirle, patrón? ¿Quiere probar las Acciones Rápidas y Consultas en el menú desplegable?</div>
                              <div class="mockup-suggestions-select" style="border: 1px solid var(--border-glass); border-radius: 4px; padding: 4px 8px; font-size: 8px; background: rgba(0,0,0,0.25); color: var(--text-muted); display: flex; justify-content: space-between; align-items: center; width: 180px; margin-top: 10px; font-family: var(--font-family-body);">
                                <span>--- Seleccione una consulta o enlace rápido ---</span>
                                <span class="material-icons-round" style="font-size: 8px;">expand_more</span>
                              </div>
                            </div>
                            <div class="mockup-dash-inputbar">
                              <span class="material-icons-round" style="font-size: 10px;">mic</span>
                              <div class="mockup-dash-input-text" style="color: white;">Correct the screen show the home screen and then this dialog screen</div>
                              <span class="material-icons-round" style="font-size: 12px; color: #00e5ff; background: rgba(0, 168, 204, 0.2); border-radius: 4px; padding: 2px;">arrow_upward</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <svg viewBox="0 0 500 380" class="whiteboard-svg-overlay">
                      <defs>
                        <marker id="whiteboard-arrow-welcome" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6"
                          markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
                        </marker>
                      </defs>

                      <!-- 1. Identidad de Perfil -->
                      <path d="M 120,72 L 50,72" stroke="#ef4444" stroke-width="2"
                        marker-end="url(#whiteboard-arrow-welcome)" />
                      <rect x="125" y="61" width="90" height="22" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444"
                        stroke-width="1" />
                      <text x="170" y="75" fill="#f87171" font-size="9" font-weight="700" text-anchor="middle"
                        font-family="'Outfit', sans-serif">1. Perfil e Info</text>

                      <!-- 2. Historial de conversaciones -->
                      <path d="M 120,185 L 50,185" stroke="#ef4444" stroke-width="2"
                        marker-end="url(#whiteboard-arrow-welcome)" />
                      <rect x="125" y="174" width="90" height="22" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444"
                        stroke-width="1" />
                      <text x="170" y="188" fill="#f87171" font-size="9" font-weight="700" text-anchor="middle"
                        font-family="'Outfit', sans-serif">2. Conversaciones</text>

                      <!-- 3. Botones de Utilidades -->
                      <path d="M 120,315 L 50,315" stroke="#ef4444" stroke-width="2"
                        marker-end="url(#whiteboard-arrow-welcome)" />
                      <rect x="125" y="304" width="90" height="22" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444"
                        stroke-width="1" />
                      <text x="170" y="318" fill="#f87171" font-size="9" font-weight="700" text-anchor="middle"
                        font-family="'Outfit', sans-serif">3. Utilidades Sidebar</text>

                      <!-- 4. Paleta de Temas -->
                      <path d="M 320,55 L 370,18" stroke="#ef4444" stroke-width="2"
                        marker-end="url(#whiteboard-arrow-welcome)" />
                      <rect x="250" y="44" width="95" height="22" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444"
                        stroke-width="1" />
                      <text x="297" y="58" fill="#f87171" font-size="9" font-weight="700" text-anchor="middle"
                        font-family="'Outfit', sans-serif">4. Paleta de Estilos</text>

                      <!-- 5. Modo OLED -->
                      <path d="M 350,75 L 395,18" stroke="#ef4444" stroke-width="2"
                        marker-end="url(#whiteboard-arrow-welcome)" />
                      <rect x="280" y="64" width="95" height="22" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444"
                        stroke-width="1" />
                      <text x="327" y="78" fill="#f87171" font-size="9" font-weight="700" text-anchor="middle"
                        font-family="'Outfit', sans-serif">5. Modo OLED</text>

                      <!-- 6. Selector de Idioma -->
                      <path d="M 290,35 L 345,18" stroke="#ef4444" stroke-width="2"
                        marker-end="url(#whiteboard-arrow-welcome)" />
                      <rect x="220" y="24" width="90" height="22" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444"
                        stroke-width="1" />
                      <text x="265" y="38" fill="#f87171" font-size="9" font-weight="700" text-anchor="middle"
                        font-family="'Outfit', sans-serif">6. Traducir</text>

                      <!-- 7. Abrir Manual -->
                      <path d="M 380,95 L 420,18" stroke="#ef4444" stroke-width="2"
                        marker-end="url(#whiteboard-arrow-welcome)" />
                      <rect x="310" y="84" width="80" height="22" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444"
                        stroke-width="1" />
                      <text x="350" y="98" fill="#f87171" font-size="9" font-weight="700" text-anchor="middle"
                        font-family="'Outfit', sans-serif">7. 📖 Manual</text>

                      <!-- 8. Tarjeta de Bienvenida -->
                      <path d="M 240,135 L 290,135" stroke="#ef4444" stroke-width="2"
                        marker-end="url(#whiteboard-arrow-welcome)" />
                      <rect x="155" y="124" width="80" height="22" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444"
                        stroke-width="1" />
                      <text x="195" y="138" fill="#f87171" font-size="9" font-weight="700" text-anchor="middle"
                        font-family="'Outfit', sans-serif">8. Bienvenida</text>

                      <!-- 9. Menú Desplegable -->
                      <path d="M 240,195 L 300,195" stroke="#ef4444" stroke-width="2"
                        marker-end="url(#whiteboard-arrow-welcome)" />
                      <rect x="155" y="184" width="80" height="22" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444"
                        stroke-width="1" />
                      <text x="195" y="198" fill="#f87171" font-size="9" font-weight="700" text-anchor="middle"
                        font-family="'Outfit', sans-serif">9. Menú Desplegable</text>

                      <!-- 10. Micrófono -->
                      <path d="M 280,325 L 195,325" stroke="#ef4444" stroke-width="2"
                        marker-end="url(#whiteboard-arrow-welcome)" />
                      <rect x="285" y="314" width="80" height="22" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444"
                        stroke-width="1" />
                      <text x="325" y="328" fill="#f87171" font-size="9" font-weight="700" text-anchor="middle"
                        font-family="'Outfit', sans-serif">10. Micrófono</text>
                    </svg>
                  </div>
                </div>

                <div class="guide-img-caption">Figura 1.2: Ilustración Vectorial CSS del Espacio de Trabajo de Comando (Pantalla de Bienvenida)</div>
              </div>

              <table class="guide-table">
                <thead>
                  <tr>
                    <th>ID Puntero</th>
                    <th>Control / Elemento</th>
                    <th>Función Exacta y Acciones Interactivas</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span class="badge-role-director" style="padding: 2px 8px; border-radius: 10px; font-weight: bold; color: white;">1</span></td>
                    <td><strong>Identidad del Espacio de Trabajo</strong></td>
                    <td>Fichas de perfil de usuario en la barra lateral superior que indican clearance, correo e identidad de Director o Performer.</td>
                  </tr>
                  <tr>
                    <td><span class="badge-role-director" style="padding: 2px 8px; border-radius: 10px; font-weight: bold; color: white;">2</span></td>
                    <td><strong>Historial de Conversaciones</strong></td>
                    <td>Permite gestionar y reabrir de manera ágil los hilos de chat previos.</td>
                  </tr>
                  <tr>
                    <td><span class="badge-role-director" style="padding: 2px 8px; border-radius: 10px; font-weight: bold; color: white;">3</span></td>
                    <td><strong>Botones de Utilidades Sidebar</strong></td>
                    <td>Accesos rápidos a la bitácora de actualización de datos, registro de contribuciones de efectivo y feedback.</td>
                  </tr>
                  <tr>
                    <td><span class="badge-role-director" style="padding: 2px 8px; border-radius: 10px; font-weight: bold; color: white;">4</span></td>
                    <td><strong>Selector de Paleta (🎨)</strong></td>
                    <td>Intercambia los tres esquemas visuales ambientales: HQ Blue, Tropical Green y Salsa Red.</td>
                  </tr>
                  <tr>
                    <td><span class="badge-role-director" style="padding: 2px 8px; border-radius: 10px; font-weight: bold; color: white;">5</span></td>
                    <td><strong>Modo OLED (🌙)</strong></td>
                    <td>Control de activación de color negro puro para optimización y confort visual nocturno.</td>
                  </tr>
                  <tr>
                    <td><span class="badge-role-director" style="padding: 2px 8px; border-radius: 10px; font-weight: bold; color: white;">6</span></td>
                    <td><strong>Selector de Idioma (🇺🇸/🇵🇷)</strong></td>
                    <td>Alterna la interfaz entre inglés de alta precisión y español culturalmente adaptado, reconfigurando los parámetros de Web Speech.</td>
                  </tr>
                  <tr>
                    <td><span class="badge-role-director" style="padding: 2px 8px; border-radius: 10px; font-weight: bold; color: white;">7</span></td>
                    <td><strong>Manual Técnico de Operaciones (📖)</strong></td>
                    <td>Disparador que despliega este manual lateral interactivo.</td>
                  </tr>
                  <tr>
                    <td><span class="badge-role-director" style="padding: 2px 8px; border-radius: 10px; font-weight: bold; color: white;">8</span></td>
                    <td><strong>Mensaje de Bienvenida</strong></td>
                    <td>Tarjeta de presentación inicial que detalla capacidades y guías antes de iniciar interacciones.</td>
                  </tr>
                  <tr>
                    <td><span class="badge-role-director" style="padding: 2px 8px; border-radius: 10px; font-weight: bold; color: white;">9</span></td>
                    <td><strong>Menú Desplegable</strong></td>
                    <td>Selección rápida de consultas sobre estipendios de pagos, asistencias a ensayos o control de vestuarios.</td>
                  </tr>
                  <tr>
                    <td><span class="badge-role-director" style="padding: 2px 8px; border-radius: 10px; font-weight: bold; color: white;">10</span></td>
                    <td><strong>Micrófono de Voz (🎙️)</strong></td>
                    <td>Control de captura por voz manos libres.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="guide-section">
              <h4>3. El Espacio de Trabajo de Comando (Pantalla de Diálogo)</h4>
              <p>Al procesar o completar consultas de datos, el flujo del espacio de trabajo visualiza burbujas de diálogo del usuario y respuestas directas del asistente de IA.</p>

              <!-- Guide View Selector Pill -->
              <div class="guide-view-selector font-outfit">
                <button class="view-sel-btn active" onclick="setGuideView(this, 'pins')">Pines Interactivos</button>
                <button class="view-sel-btn" onclick="setGuideView(this, 'whiteboard')">Punteros de Pizarra</button>
              </div>

              <div class="guide-img-container">
                <!-- Interactive Pins View -->
                <div class="pins-container">
                  <div class="annotated-container" style="position: relative; max-width: 480px; margin: 0 auto;">
                    <!-- Vector CSS Mockup of Dashboard (Dialog Screen) -->
                    <div class="guide-mockup-wrapper" style="height: 380px;">
                      <div class="mockup-dash">
                        <div class="mockup-dash-header">
                          <div class="mockup-dash-branding">
                            <span class="material-icons-round" style="font-size: 10px; color: var(--text-muted);">menu</span>
                            <img src="https://drive.google.com/thumbnail?id=1bY49c_N03rFlBLGgb_4bzsB_tdK-HNDa&amp;sz=w250" style="width: 14px; height: 14px; border-radius: 50%; object-fit: cover;" alt="Logo">
                            <span class="mockup-dash-title">El Patr&oacute;n</span>
                            <span class="mockup-dash-pill" style="font-size: 6px; padding: 1px 4px; margin-left: 6px; background: rgba(0, 168, 204, 0.2); border: 1px solid rgba(0, 168, 204, 0.4); color: #00e5ff; border-radius: 3px;">DIRECTOR / LEVEL 3</span>
                          </div>
                          <div class="mockup-dash-controls">
                            <span class="mockup-dash-pill">Native <span style="display:inline-block; width:12px; height:6px; background:rgba(255,255,255,0.2); border-radius:3px; position:relative; vertical-align:middle; margin: 0 2px;"><span style="position:absolute; width:4px; height:4px; background:white; border-radius:50%; top:1px; left:1px;"></span></span> Hybrid</span>
                            <span class="material-icons-round" style="font-size: 10px; vertical-align: middle;">translate</span><span style="font-size: 6px; font-weight: 700; margin-left: 1px; margin-right: 4px; font-family: var(--font-family-body); vertical-align: middle; color: var(--text-muted);">ES</span>
                            <span class="material-icons-round" style="font-size: 10px; vertical-align: middle;">palette</span>
                            <span class="material-icons-round" style="font-size: 10px;">brightness_4</span>
                            <span class="material-icons-round" style="font-size: 10px; color: hsl(var(--accent-base));">menu_book</span>
                          </div>
                        </div>
                        <div class="mockup-dash-grid">
                          <div class="mockup-dash-sidebar">
                            <div class="mockup-sidebar-profile">
                              <div class="mockup-sidebar-avatar"></div>
                              <div>
                                <div class="mockup-sidebar-name">Angel Rodriguez</div>
                                <div class="mockup-sidebar-role">rodriguez2113@gmail.com</div>
                              </div>
                            </div>
                            <div style="font-size: 7px; color: var(--text-muted); margin-bottom: 2px;">Network &amp; API Properties <span class="material-icons-round" style="font-size:8px; float:right;">expand_more</span></div>
                            <div class="mockup-sidebar-section" style="display: flex; justify-content: space-between; align-items: center;">
                              <span>HISTORIAL DE TRABAJO</span>
                              <span class="material-icons-round" style="font-size: 8px; cursor: pointer;">add_box</span>
                            </div>
                            <div class="mockup-sidebar-list">
                              <div class="mockup-sidebar-item active" style="border: 1px solid rgba(0, 168, 204, 0.3); background: rgba(0, 168, 204, 0.05); color: #00e5ff;">
                                <span class="material-icons-round" style="font-size: 8px; margin-right: 2px;">chat_bubble_outline</span> Correct the screen s...
                              </div>
                            </div>
                            <div class="mockup-sidebar-footer" style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px;">Administrar Feedback</div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px; position:relative;">Enviar Feedback<span style="font-size:4px; display:block; color:#00e5ff;">BP / 31C</span></div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px;">Actualizar Información</div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px;">Registrar Pago</div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px; grid-column: span 2;">Nueva Sesión</div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px; grid-column: span 2;">Terminar Conexión</div>
                            </div>
                          </div>
                          <div class="mockup-dash-viewport">
                            <div class="mockup-dash-feed" style="gap: 8px;">
                              <div class="mockup-msg user" style="align-self: flex-end; background: #00a8cc;">YO: Correct the screen show the home screen and then this dialog screen</div>
                              <div style="display: flex; align-items: center; gap: 6px; margin-top: auto; font-family: var(--font-family-body);">
                                <div style="display: flex; gap: 3px;">
                                  <span style="width: 4px; height: 4px; background: #00e5ff; border-radius: 50%;"></span>
                                  <span style="width: 4px; height: 4px; background: #00e5ff; border-radius: 50%; opacity: 0.6;"></span>
                                  <span style="width: 4px; height: 4px; background: #00e5ff; border-radius: 50%; opacity: 0.3;"></span>
                                </div>
                                <span style="font-size: 6px; color: #00e5ff; font-weight: bold; text-transform: uppercase;">EL PATRÓN ESTÁ ANALIZANDO LAS TABLAS...</span>
                              </div>
                            </div>
                            <div class="mockup-dash-inputbar">
                              <span class="material-icons-round" style="font-size: 10px; margin-right: 4px; color: var(--text-muted);">content_copy</span>
                              <span class="material-icons-round" style="font-size: 10px; margin-right: 4px; color: var(--text-muted);">file_download</span>
                              <span class="material-icons-round" style="font-size: 10px;">mic</span>
                              <div class="mockup-dash-input-text" style="color: var(--text-muted);">Pregúntale a El Patrón sobre asistencia, inventario o stipends...</div>
                              <span class="material-icons-round" style="font-size: 12px; color: #00e5ff; background: rgba(0, 168, 204, 0.2); border-radius: 4px; padding: 2px;">cached</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Absolute Overlay Pins -->
                    <div class="annotated-pin" style="top: 48%; left: 12%;" title="Sesión Seleccionada">1</div>
                    <div class="annotated-pin" style="top: 55%; left: 24%;" title="Menú Contextual">2</div>
                    <div class="annotated-pin" style="top: 25%; left: 74%;" title="Burbuja de Diálogo de Performer">3</div>
                    <div class="annotated-pin" style="top: 60%; left: 45%;" title="Estado de Auditoría de IA">4</div>
                    <div class="annotated-pin" style="top: 86%; left: 32%;" title="Acciones de Bitácora">5</div>
                    <div class="annotated-pin" style="top: 86%; left: 92%;" title="Botón de Cancelación">6</div>
                  </div>
                </div>

                <!-- Whiteboard Pointers View -->
                <div class="whiteboard-container">
                  <div class="annotated-container" style="position: relative; max-width: 480px; margin: 0 auto;">
                    <div class="guide-mockup-wrapper" style="height: 380px;">
                      <!-- Same mockup as above -->
                      <div class="mockup-dash">
                        <div class="mockup-dash-header">
                          <div class="mockup-dash-branding">
                            <span class="material-icons-round" style="font-size: 10px; color: var(--text-muted);">menu</span>
                            <img src="https://drive.google.com/thumbnail?id=1bY49c_N03rFlBLGgb_4bzsB_tdK-HNDa&amp;sz=w250" style="width: 14px; height: 14px; border-radius: 50%; object-fit: cover;" alt="Logo">
                            <span class="mockup-dash-title">El Patr&oacute;n</span>
                            <span class="mockup-dash-pill" style="font-size: 6px; padding: 1px 4px; margin-left: 6px; background: rgba(0, 168, 204, 0.2); border: 1px solid rgba(0, 168, 204, 0.4); color: #00e5ff; border-radius: 3px;">DIRECTOR / LEVEL 3</span>
                          </div>
                          <div class="mockup-dash-controls">
                            <span class="mockup-dash-pill">Native <span style="display:inline-block; width:12px; height:6px; background:rgba(255,255,255,0.2); border-radius:3px; position:relative; vertical-align:middle; margin: 0 2px;"><span style="position:absolute; width:4px; height:4px; background:white; border-radius:50%; top:1px; left:1px;"></span></span> Hybrid</span>
                            <span class="material-icons-round" style="font-size: 10px; vertical-align: middle;">translate</span><span style="font-size: 6px; font-weight: 700; margin-left: 1px; margin-right: 4px; font-family: var(--font-family-body); vertical-align: middle; color: var(--text-muted);">ES</span>
                            <span class="material-icons-round" style="font-size: 10px; vertical-align: middle;">palette</span>
                            <span class="material-icons-round" style="font-size: 10px;">brightness_4</span>
                            <span class="material-icons-round" style="font-size: 10px; color: hsl(var(--accent-base));">menu_book</span>
                          </div>
                        </div>
                        <div class="mockup-dash-grid">
                          <div class="mockup-dash-sidebar">
                            <div class="mockup-sidebar-profile">
                              <div class="mockup-sidebar-avatar"></div>
                              <div>
                                <div class="mockup-sidebar-name">Angel Rodriguez</div>
                                <div class="mockup-sidebar-role">rodriguez2113@gmail.com</div>
                              </div>
                            </div>
                            <div style="font-size: 7px; color: var(--text-muted); margin-bottom: 2px;">Network &amp; API Properties <span class="material-icons-round" style="font-size:8px; float:right;">expand_more</span></div>
                            <div class="mockup-sidebar-section" style="display: flex; justify-content: space-between; align-items: center;">
                              <span>HISTORIAL DE TRABAJO</span>
                              <span class="material-icons-round" style="font-size: 8px; cursor: pointer;">add_box</span>
                            </div>
                            <div class="mockup-sidebar-list">
                              <div class="mockup-sidebar-item active" style="border: 1px solid rgba(0, 168, 204, 0.3); background: rgba(0, 168, 204, 0.05); color: #00e5ff;">
                                <span class="material-icons-round" style="font-size: 8px; margin-right: 2px;">chat_bubble_outline</span> Correct the screen s...
                              </div>
                            </div>
                            <div class="mockup-sidebar-footer" style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px;">Administrar Feedback</div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px; position:relative;">Enviar Feedback<span style="font-size:4px; display:block; color:#00e5ff;">BP / 31C</span></div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px;">Actualizar Información</div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px;">Registrar Pago</div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px; grid-column: span 2;">Nueva Sesión</div>
                              <div class="mockup-sidebar-btn" style="font-size: 5px; padding: 4px 2px; grid-column: span 2;">Terminar Conexión</div>
                            </div>
                          </div>
                          <div class="mockup-dash-viewport">
                            <div class="mockup-dash-feed" style="gap: 8px;">
                              <div class="mockup-msg user" style="align-self: flex-end; background: #00a8cc;">YO: Correct the screen show the home screen and then this dialog screen</div>
                              <div style="display: flex; align-items: center; gap: 6px; margin-top: auto; font-family: var(--font-family-body);">
                                <div style="display: flex; gap: 3px;">
                                  <span style="width: 4px; height: 4px; background: #00e5ff; border-radius: 50%;"></span>
                                  <span style="width: 4px; height: 4px; background: #00e5ff; border-radius: 50%; opacity: 0.6;"></span>
                                  <span style="width: 4px; height: 4px; background: #00e5ff; border-radius: 50%; opacity: 0.3;"></span>
                                </div>
                                <span style="font-size: 6px; color: #00e5ff; font-weight: bold; text-transform: uppercase;">EL PATRÓN ESTÁ ANALIZANDO LAS TABLAS...</span>
                              </div>
                            </div>
                            <div class="mockup-dash-inputbar">
                              <span class="material-icons-round" style="font-size: 10px; margin-right: 4px; color: var(--text-muted);">content_copy</span>
                              <span class="material-icons-round" style="font-size: 10px; margin-right: 4px; color: var(--text-muted);">file_download</span>
                              <span class="material-icons-round" style="font-size: 10px;">mic</span>
                              <div class="mockup-dash-input-text" style="color: var(--text-muted);">Pregúntale a El Patrón sobre asistencia, inventario o stipends...</div>
                              <span class="material-icons-round" style="font-size: 12px; color: #00e5ff; background: rgba(0, 168, 204, 0.2); border-radius: 4px; padding: 2px;">cached</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <svg viewBox="0 0 500 380" class="whiteboard-svg-overlay">
                      <defs>
                        <marker id="whiteboard-arrow-dialog" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6"
                          markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
                        </marker>
                      </defs>

                      <!-- 1. Sesión Activa -->
                      <path d="M 120,185 L 50,185" stroke="#ef4444" stroke-width="2"
                        marker-end="url(#whiteboard-arrow-dialog)" />
                      <rect x="125" y="174" width="90" height="22" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444"
                        stroke-width="1" />
                      <text x="170" y="188" fill="#f87171" font-size="9" font-weight="700" text-anchor="middle"
                        font-family="'Outfit', sans-serif">1. Sesión Activa</text>

                      <!-- 2. Menú Contextual -->
                      <path d="M 120,215 L 80,215" stroke="#ef4444" stroke-width="2"
                        marker-end="url(#whiteboard-arrow-dialog)" />
                      <rect x="125" y="204" width="90" height="22" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444"
                        stroke-width="1" />
                      <text x="170" y="218" fill="#f87171" font-size="9" font-weight="700" text-anchor="middle"
                        font-family="'Outfit', sans-serif">2. Menú Contexto</text>

                      <!-- 3. Burbuja de Diálogo -->
                      <path d="M 240,110 L 320,110" stroke="#ef4444" stroke-width="2"
                        marker-end="url(#whiteboard-arrow-dialog)" />
                      <rect x="155" y="99" width="80" height="22" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444"
                        stroke-width="1" />
                      <text x="195" y="113" fill="#f87171" font-size="9" font-weight="700" text-anchor="middle"
                        font-family="'Outfit', sans-serif">3. Burbuja Performer</text>

                      <!-- 4. Estado de Auditoría de IA -->
                      <path d="M 220,280 L 150,280" stroke="#ef4444" stroke-width="2"
                        marker-end="url(#whiteboard-arrow-dialog)" />
                      <rect x="225" y="269" width="90" height="22" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444"
                        stroke-width="1" />
                      <text x="270" y="283" fill="#f87171" font-size="9" font-weight="700" text-anchor="middle"
                        font-family="'Outfit', sans-serif">4. Estado Auditoría</text>

                      <!-- 5. Acciones de Bitácora -->
                      <path d="M 220,325 L 140,325" stroke="#ef4444" stroke-width="2"
                        marker-end="url(#whiteboard-arrow-dialog)" />
                      <rect x="225" y="314" width="90" height="22" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444"
                        stroke-width="1" />
                      <text x="270" y="328" fill="#f87171" font-size="9" font-weight="700" text-anchor="middle"
                        font-family="'Outfit', sans-serif">5. Copiar/Descargar</text>

                      <!-- 6. Botón de Cancelación -->
                      <path d="M 380,325 L 435,325" stroke="#ef4444" stroke-width="2"
                        marker-end="url(#whiteboard-arrow-dialog)" />
                      <rect x="295" y="314" width="80" height="22" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444"
                        stroke-width="1" />
                      <text x="335" y="328" fill="#f87171" font-size="9" font-weight="700" text-anchor="middle"
                        font-family="'Outfit', sans-serif">6. Enviar/Cancelar</text>
                    </svg>
                  </div>
                </div>

                <div class="guide-img-caption">Figura 1.3: Ilustración Vectorial CSS del Espacio de Trabajo de Comando (Pantalla de Diálogo)</div>
              </div>

              <table class="guide-table">
                <thead>
                  <tr>
                    <th>ID Puntero</th>
                    <th>Control / Elemento</th>
                    <th>Función Exacta y Acciones Interactivas</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span class="badge-role-director" style="padding: 2px 8px; border-radius: 10px; font-weight: bold; color: white;">1</span></td>
                    <td><strong>Sesión Activa de Chat</strong></td>
                    <td>Destaca el hilo de chat actual en la lista del historial.</td>
                  </tr>
                  <tr>
                    <td><span class="badge-role-director" style="padding: 2px 8px; border-radius: 10px; font-weight: bold; color: white;">2</span></td>
                    <td><strong>Menú Contextual de Sesiones</strong></td>
                    <td>Habilitado al presionar botón derecho o mantener pulsado en dispositivos móviles. Habilita Fijar, Cambiar Nombre o Eliminar Permanentemente.</td>
                  </tr>
                  <tr>
                    <td><span class="badge-role-director" style="padding: 2px 8px; border-radius: 10px; font-weight: bold; color: white;">3</span></td>
                    <td><strong>Burbuja de Diálogo de Performer</strong></td>
                    <td>Muestra el texto formateado de la consulta alineada hacia el margen derecho.</td>
                  </tr>
                  <tr>
                    <td><span class="badge-role-director" style="padding: 2px 8px; border-radius: 10px; font-weight: bold; color: white;">4</span></td>
                    <td><strong>Estado de Auditoría de IA</strong></td>
                    <td>Burbuja con animación de tres puntos en movimiento continuo que indica que la IA está procesando la base de datos externa.</td>
                  </tr>
                  <tr>
                    <td><span class="badge-role-director" style="padding: 2px 8px; border-radius: 10px; font-weight: bold; color: white;">5</span></td>
                    <td><strong>Acciones de Bitácora</strong></td>
                    <td>Facilita copiar el hilo completo en formato Markdown (content_copy) o descargar el registro en formato de texto puro (file_download).</td>
                  </tr>
                  <tr>
                    <td><span class="badge-role-director" style="padding: 2px 8px; border-radius: 10px; font-weight: bold; color: white;">6</span></td>
                    <td><strong>Botón de Enviar/Cancelar</strong></td>
                    <td>Se transforma de manera dinámica en una flecha de rotación mientras se efectúa la solicitud, sirviendo como botón de cancelación de la auditoría.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="guide-section">
              <h4>4. Reglas Principales de Intenci&oacute;n de Lenguaje Natural</h4>
              <p>El motor de enrutamiento analiza autom&aacute;ticamente las entradas para recuperar segmentos de la base de datos:</p>
              <ul>
                <li><strong>Regla A (Pagos y Saldos)</strong>: Activada por palabras clave como <em>pay, money, check, stipend, paid, balance, pago, dinero</em>. Busca en la pesta&ntilde;a de <code>Payments</code> seg&uacute;n su ID de Performer.</li>
                <li><strong>Regla B/F (Vestuarios e Inventario)</strong>: Activada por palabras clave como <em>gear, inventory, costume, conga, shoe, uniform, dress, vestuario, ropa</em>. Accede a <code>Inventory</code>, <code>Attendance</code> y <code>Tradicion_Org</code>.</li>
                <li><strong>Regla G (Perfiles y Contactos)</strong>: Activada por palabras clave como <em>birthday, birth, profile, contact, email, phone, active, buddy, manager</em>. Restaura los canales de buddies y contactos.</li>
              </ul>
            </div>

            <div class="guide-section">
              <h4>5. Menú Desplegable de Consultas Sugeridas y Acciones Rápidas</h4>
              <p>Para una administración fluida y operaciones manos libres, la vista de chat vacía muestra una lista desplegable premium que contiene cinco consultas rápidas. Seleccionar cualquier opción completa instantáneamente el campo de chat y ejecuta la consulta. A continuación se detallan las operaciones para cada consulta disponible:</p>
              
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin: 15px 0;">
                <div style="border: 1px solid var(--border-glass); padding: 12px; border-radius: 8px; background: rgba(255, 255, 255, 0.02);">
                  <h5 style="color: hsl(var(--accent-base)); margin-top: 0; margin-bottom: 5px;">👔 Inventario Asignado</h5>
                  <p style="font-size: 11px; margin: 0; color: var(--text-muted);"><strong>Ejecuta:</strong> "¿Qué vestuario se me ha asignado?" / "What costumes are checked out to me?"</p>
                  <p style="font-size: 11px; margin: 5px 0 0 0; line-height: 1.3;">Busca en la base de datos de <code>Inventory</code> según su ID de Performer. Devuelve vestuarios oficiales de baile, instrumentos (como congas), fechas de préstamo y estado físico actual.</p>
                </div>
                <div style="border: 1px solid var(--border-glass); padding: 12px; border-radius: 8px; background: rgba(255, 255, 255, 0.02);">
                  <h5 style="color: hsl(var(--accent-base)); margin-top: 0; margin-bottom: 5px;">📅 Asistencia de Ensayos</h5>
                  <p style="font-size: 11px; margin: 0; color: var(--text-muted);"><strong>Ejecuta:</strong> "Cual es mi asistencia en los ensayos?" / "What is my rehearsal attendance history?"</p>
                  <p style="font-size: 11px; margin: 5px 0 0 0; line-height: 1.3;">Escanea la pestaña <code>Attendance</code> en tiempo real. Resume sus registros de ensayos, calculando los ensayos asistidos, ausencias justificadas/injustificadas y su porcentaje de asistencia final.</p>
                </div>
                <div style="border: 1px solid var(--border-glass); padding: 12px; border-radius: 8px; background: rgba(255, 255, 255, 0.02);">
                  <h5 style="color: hsl(var(--accent-base)); margin-top: 0; margin-bottom: 5px;">📖 Manual Organizacional</h5>
                  <p style="font-size: 11px; margin: 0; color: var(--text-muted);"><strong>Ejecuta:</strong> "¿Quién es mi buddy y asignado?" / "Who is my buddy?"</p>
                  <p style="font-size: 11px; margin: 5px 0 0 0; line-height: 1.3;">Busca en los registros de jerarquía de la pestaña <code>Tradicion_Org</code>. Devuelve la información de sus coordinadores administrativos asignados y su pareja de baile (buddy).</p>
                </div>
                <div style="border: 1px solid var(--border-glass); padding: 12px; border-radius: 8px; background: rgba(255, 255, 255, 0.02);">
                  <h5 style="color: hsl(var(--accent-base)); margin-top: 0; margin-bottom: 5px;">🎖️ Solicitar Tarjeta de Reporte</h5>
                  <p style="font-size: 11px; margin: 0; color: var(--text-muted);"><strong>Ejecuta:</strong> "Por favor, muestra mi Reporte de Progreso de Performer." / "Please show my Performer Report Card."</p>
                  <p style="font-size: 11px; margin: 5px 0 0 0; line-height: 1.3;">Se conecta a la pestaña <code>Tradición Performer Report Cards</code>. Extrae calificaciones de progreso en tiempo real, cumplimiento, tareas de currículo pendientes y comentarios directos del Director.</p>
                </div>
                <div style="border: 1px solid var(--border-glass); padding: 12px; border-radius: 8px; background: rgba(255, 255, 255, 0.02); grid-column: span 2;">
                  <h5 style="color: hsl(var(--accent-base)); margin-top: 0; margin-bottom: 5px;">📅 Resumen de Eventos de 90 Días</h5>
                  <p style="font-size: 11px; margin: 0; color: var(--text-muted);"><strong>Ejecuta:</strong> "Por favor, muestra mi Resumen de Eventos de 90 Días." / "Please show my 90 Day Event Summary schedule."</p>
                  <p style="font-size: 11px; margin: 5px 0 0 0; line-height: 1.3;">Se conecta en tiempo real a las API del calendario de Presentaciones oficial. Resume todas las próximas presentaciones de los siguientes 90 días, verificando sus invitaciones de correo, estado de RSVP, fechas y ubicaciones.</p>
                </div>
              </div>
            </div>

            <div class="guide-section">
              <h4>6. Detalles de la Bandeja de Acciones de Entrada</h4>
              <p>En la parte inferior de la entrada del chat, hay tres acciones de utilidad disponibles:</p>
              <ul>
                <li><strong>Copiar Hilo (<code>content_copy</code>)</strong>: Copia todo el hilo de chat activo, formateado limpiamente, para informes externos.</li>
                <li><strong>Descargar Registro (<code>file_download</code>)</strong>: Genera y descarga un archivo <code>.txt</code> con todo el historial del chat.</li>
                <li><strong>Enviar Consulta (<code>arrow_upward</code>)</strong>: Env&iacute;a su consulta al motor de IA de El Patr&oacute;n.</li>
              </ul>
            </div>

            <div class="guide-section">
              <h4>7. Actualización de Perfil y Registro de Pagos en Efectivo</h4>
              <p>Los perfiles de los performers ahora pueden actualizarse de forma segura y en tiempo real, permitiendo además el registro opcional de contribuciones en efectivo directamente desde la interfaz:</p>
              <ul>
                <li><strong>Modal de Actualización</strong>: Disponible en la parte inferior de la barra lateral izquierda. Ejecuta escrituras de doble bloqueo autenticadas directamente en el registro.</li>
                <li><strong>Actualizaciones Dinámicas</strong>: Modifica su Dirección Residencial, Teléfono y Contacto de Emergencia de forma inmediata en la pestaña <code>Profiles</code>.</li>
                <li><strong>Certificado Médico</strong>: Decodifica archivos en formato Base64, los sube de manera segura a Google Drive bajo la carpeta <code>Health Certificates</code>, los hace públicos para los directores y registra el enlace en la bitácora de <code>Health_certificates</code>.</li>
                <li><strong>Pago en Efectivo Opcional</strong>: Si se especifican Fecha y Monto, registra el pago en efectivo directamente en la hoja de cálculo externa <code>Performer Payments</code> (ID: <code>1eaEttUh8JZPyoY61HLHpf5UxhgEltK9oU5bwUNyDwwU</code>) con el asunto <code>"Cash Payment Entered via El Patron AI"</code> y origen <code>"Cash"</code>.</li>
              </ul>
            </div>"""

# Load full contents
# Define helper function to replace sections
def replace_manual_sections(content, start_marker, end_marker, replacement):
    start_pos = content.find(start_marker)
    if start_pos == -1:
        print(f"Error: Start marker '{start_marker}' not found.")
        return None
    
    # Find the opening <div class="guide-section"> right before the start marker
    start_sec = content.rfind('<div class="guide-section">', 0, start_pos)
    if start_sec == -1:
        print("Error: Opening <div class='guide-section'> not found.")
        return None
        
    end_pos = content.find(end_marker, start_pos)
    if end_pos == -1:
        print(f"Error: End marker '{end_marker}' not found.")
        return None
        
    # Find the closing </div> of Section 6
    # This is the </div> right before the wrapper closing tag and end marker
    # The hierarchy is:
    # ...
    # </div> (closes section 6)
    # </div> (closes lang wrapper)
    # end_marker (e.g. <!-- Spanish Content --> or <!-- SOP TAB -->)
    last_div = content.rfind('</div>', 0, end_pos)
    second_last_div = content.rfind('</div>', 0, last_div)
    
    end_sec = second_last_div + len('</div>')
    
    print(f"Replacing section from index {start_sec} to {end_sec}")
    print(f"Start content snippet:\n{content[start_sec:start_sec+100]}")
    print(f"End content snippet:\n{content[end_sec-100:end_sec]}")
    
    return content[:start_sec] + replacement + content[end_sec:]

# Perform replacements on Index.html
print("=== Index.html ===")
print("Replacing English guide section...")
index_content = replace_manual_sections(index_content, '<h4>2. The Command Workspace (Welcome Screen)</h4>', '<!-- Spanish Content -->', new_en_sections)

if index_content:
    print("Replacing Spanish guide section...")
    index_content = replace_manual_sections(index_content, '<h4>2. El Espacio de Trabajo de Comando (Pantalla de Bienvenida)</h4>', '<!-- SOP TAB -->', new_es_sections)

if index_content:
    with open('Index.html', 'w', encoding='utf-8') as f:
        f.write(index_content)
    print("Saved Index.html successfully!")

# Perform replacements on local_preview.html
print("\n=== local_preview.html ===")
print("Replacing English guide section...")
preview_content = replace_manual_sections(preview_content, '<h4>2. The Command Workspace (Welcome Screen)</h4>', '<!-- Spanish Content -->', new_en_sections)

if preview_content:
    print("Replacing Spanish guide section...")
    preview_content = replace_manual_sections(preview_content, '<h4>2. El Espacio de Trabajo de Comando (Pantalla de Bienvenida)</h4>', '<!-- SOP TAB -->', new_es_sections)

if preview_content:
    with open('local_preview.html', 'w', encoding='utf-8') as f:
        f.write(preview_content)
    print("Saved local_preview.html successfully!")

