// external-nodes.js

// To define a new node, add an entry to this object.
// The key should be the unique node type (e.g., 'MyCustomNode').
// The value is an object with these properties:
// 1. definition: The main node object used by the UI.
//    - title, inputs, outputs, renderContent, update, compute/getOutput, etc.
// 2. jsLogic: A string containing the JavaScript function for getOutput or compute.
// 3. pyLogic: A string containing the Python function definition (e.g., `def my_func(node): ...`).
// 4. pyImports: (Optional) An array of strings for any python imports needed for this node.

window.AGGM_CUSTOM_NODES = {
  // --- Text and Content Nodes ---
  TextAreaNode: {
    definition: {
      title: "Text Area",
      inputs: [],
      outputs: ["text"],
      renderContent(node) {
        if (node.value === undefined) node.value = "";
        return `<div class="node-content"><textarea class="node-input text-input" rows="4" placeholder="Enter multiline text...">${node.value}</textarea></div>`;
      },
      update(node) {
        const textarea = node.dom.querySelector("textarea.text-input");
        if (textarea) node.value = textarea.value;
      },
      getOutput() {
        return this.value;
      },
    },
    jsLogic: `function() { return this.value; }`,
    pyLogic: `def get_output_text_area(node):\n    return node.get("value", "")`,
    pyImports: [],
  },

  ButtonNode: {
    definition: {
      title: "Button",
      inputs: [],
      outputs: ["html"],
      defaultValue: { content: "Click Me", id: "my-button" },
      renderContent(node) {
        if (node.value === undefined) node.value = this.defaultValue;
        return `
            <div class="node-content" style="padding: 10px 0;">
                <label style="padding: 0 10px; font-size: 0.8em">Button Text:</label>
                <input class="node-input" type="text" value="${node.value.content}" placeholder="Button Content" />
                <label style="padding: 0 10px; font-size: 0.8em; margin-top: 5px;">Button ID:</label>
                <input class="node-input" type="text" value="${node.value.id}" placeholder="unique-button-id" />
            </div>
            `;
      },
      update(node) {
        const inputs = node.dom.querySelectorAll(".node-input");
        node.value = {
          content: inputs[0].value,
          id: inputs[1].value,
        };
      },
      getOutput() {
        return `<button id="${this.value.id}" style="padding: 10px 15px; font-size: 1em; background-color: #4CAF50; color: white; border: none; border-radius: 8px; cursor: pointer;">${this.value.content}</button>`;
      },
    },
    jsLogic: `function() { return \`<button id="\${this.value.id}" style="padding: 10px 15px; font-size: 1em; background-color: #4CAF50; color: white; border: none; border-radius: 8px; cursor: pointer;">\${this.value.content}</button>\`; }`,
    pyLogic: `def get_output_button(node):\n    val = node.get("value", {})\n    content = val.get("content", "Click Me")\n    btn_id = val.get("id", "my-button")\n    return f'<button id="{btn_id}" style="padding: 10px 15px; font-size: 1em; background-color: #4CAF50; color: white; border: none; border-radius: 8px; cursor: pointer;">{content}</button>'`,
    pyImports: [],
  },
  
  TitleNode: {
    definition: {
        title: "Title",
        inputs: [],
        outputs: ["html"],
        defaultValue: { content: "Title", fontSize: "2em", fontFamily: "Arial" },
        renderContent(node) {
            if (node.value === undefined) node.value = this.defaultValue;
            const fonts = ["Arial", "Verdana", "Georgia", "Times New Roman", "Courier New"];
            const sizes = ["1.5em", "2em", "2.5em", "3em"];
            return `
                <div class="node-content" style="padding: 10px 0;">
                    <input class="node-input" type="text" value="${node.value.content}" placeholder="Title content..." />
                    <select class="node-input" style="margin-top: 5px;">
                        ${sizes.map(s => `<option value="${s}" ${node.value.fontSize === s ? 'selected' : ''}>${s}</option>`).join('')}
                    </select>
                    <select class="node-input" style="margin-top: 5px;">
                        ${fonts.map(f => `<option value="${f}" ${node.value.fontFamily === f ? 'selected' : ''}>${f}</option>`).join('')}
                    </select>
                </div>
            `;
        },
        update(node) {
            const inputs = node.dom.querySelectorAll('.node-input');
            node.value = { content: inputs[0].value, fontSize: inputs[1].value, fontFamily: inputs[2].value };
        },
        getOutput() { return `<h1 style="font-size: ${this.value.fontSize}; font-family: '${this.value.fontFamily}', sans-serif;">${this.value.content}</h1>`; }
    },
    jsLogic: `function() { return \`<h1 style="font-size: \${this.value.fontSize}; font-family: '\${this.value.fontFamily}', sans-serif;">\${this.value.content}</h1>\`; }`,
    pyLogic: `def get_output_title(node):\n    val = node.get("value", {})\n    content = val.get("content", "Title")\n    font_size = val.get("fontSize", "2em")\n    font_family = val.get("fontFamily", "Arial")\n    return f'<h1 style="font-size: {font_size}; font-family: \\'{font_family}\\', sans-serif;">{content}</h1>'`,
    pyImports: [],
  },

  ParagraphNode: {
    definition: {
        title: "Paragraph",
        inputs: [],
        outputs: ["html"],
        defaultValue: "This is a paragraph.",
        renderContent(node) {
            if (node.value === undefined) node.value = this.defaultValue;
            return `<div class="node-content" style="padding: 5px 0;"><textarea class="node-input" rows="3" style="min-height: 50px;">${node.value}</textarea></div>`;
        },
        update(node) { node.value = node.dom.querySelector('textarea').value; },
        getOutput() { return `<p style="margin: 0; padding: 0;">${this.value}</p>`; }
    },
    jsLogic: `function() { return \`<p style="margin: 0; padding: 0;">\${this.value}</p>\`; }`,
    pyLogic: `def get_output_paragraph(node):\n    content = node.get("value", "This is a paragraph.")\n    return f'<p style="margin: 0; padding: 0;">{content}</p>'`,
    pyImports: [],
  },

  MergeTextNode: {
    definition: {
      title: "Merge Text",
      inputs: ["text1", "text2"],
      outputs: ["mergedText"],
      renderContent() { return `<div class="node-content" style="padding:10px; font-size:0.9rem;">Merges two text strings.</div>`; },
      compute(inputs) {
        const text1 = inputs["text1"] !== null ? String(inputs["text1"]) : "";
        const text2 = inputs["text2"] !== null ? String(inputs["text2"]) : "";
        return text1 + text2;
      }
    },
    jsLogic: `async function(inputs) { const text1 = inputs["text1"] !== null ? String(inputs["text1"]) : ""; const text2 = inputs["text2"] !== null ? String(inputs["text2"]) : ""; return text1 + text2; }`,
    pyLogic: `def compute_merge_text(inputs):\n    text1 = str(inputs.get("text1", ""))\n    text2 = str(inputs.get("text2", ""))\n    return text1 + text2`,
    pyImports: [],
  },

  UppercaseNode: {
    definition: {
        title: "To Uppercase",
        inputs: ["string"],
        outputs: ["text"],
        renderContent() { return `<div class="node-content" style="padding:10px; font-size:0.9rem;">Converts text to UPPERCASE.</div>`; },
        compute(inputs) { const str = inputs["string"]; if (typeof str !== 'string') return null; return str.toUpperCase(); }
    },
    jsLogic: `async function(inputs) { const str = inputs["string"]; if (typeof str !== 'string') return null; return str.toUpperCase(); }`,
    pyLogic: `def compute_uppercase(inputs):\n    s = inputs.get("string")\n    if isinstance(s, str):\n        return s.upper()\n    return None`,
    pyImports: [],
  },

  LowercaseNode: {
    definition: {
        title: "To Lowercase",
        inputs: ["string"],
        outputs: ["text"],
        renderContent() { return `<div class="node-content" style="padding:10px; font-size:0.9rem;">Converts text to lowercase.</div>`; },
        compute(inputs) { const str = inputs["string"]; if (typeof str !== 'string') return null; return str.toLowerCase(); }
    },
    jsLogic: `async function(inputs) { const str = inputs["string"]; if (typeof str !== 'string') return null; return str.toLowerCase(); }`,
    pyLogic: `def compute_lowercase(inputs):\n    s = inputs.get("string")\n    if isinstance(s, str):\n        return s.lower()\n    return None`,
    pyImports: [],
  },

  StringLengthNode: {
    definition: {
        title: "String Length",
        inputs: ["text"],
        outputs: ["length"],
        renderContent() { return `<div class="node-content" style="padding:10px; font-size:0.9rem;">Outputs string length.</div>`; },
        compute(inputs) { const str = inputs["text"]; if (typeof str !== 'string') return null; return str.length; }
    },
    jsLogic: `async function(inputs) { const str = inputs["text"]; if (typeof str !== 'string') return null; return str.length; }`,
    pyLogic: `def compute_string_length(inputs):\n    s = inputs.get("text")\n    if isinstance(s, str):\n        return len(s)\n    return None`,
    pyImports: [],
  },

  PowerNode: {
    definition: {
        title: "Power",
        inputs: ["a", "b"],
        outputs: ["result"],
        renderContent() { return `<div class="node-content" style="padding:10px; font-size:0.9rem;">Raises a to power of b.</div>`; },
        compute(inputs) { const a = inputs["a"]; const b = inputs["b"]; if (typeof a !== 'number' || typeof b !== 'number') return null; return Math.pow(a, b); }
    },
    jsLogic: `async function(inputs) { const a = inputs["a"]; const b = inputs["b"]; if (typeof a !== 'number' || typeof b !== 'number') return null; return Math.pow(a, b); }`,
    pyLogic: `def compute_power(inputs):\n    a = inputs.get("a")\n    b = inputs.get("b")\n    if isinstance(a, (int, float)) and isinstance(b, (int, float)):\n        return math.pow(a, b)\n    return None`,
    pyImports: ["math"],
  },

  SqrtNode: {
    definition: {
        title: "Square Root",
        inputs: ["number"],
        outputs: ["result"],
        renderContent() { return `<div class="node-content" style="padding:10px; font-size:0.9rem;">Calculates √ of a number.</div>`; },
        compute(inputs) { const num = inputs["number"]; if (typeof num !== 'number' || num < 0) return null; return Math.sqrt(num); }
    },
    jsLogic: `async function(inputs) { const num = inputs["number"]; if (typeof num !== 'number' || num < 0) return null; return Math.sqrt(num); }`,
    pyLogic: `def compute_sqrt(inputs):\n    n = inputs.get("number")\n    if isinstance(n, (int, float)) and n >= 0:\n        return math.sqrt(n)\n    return None`,
    pyImports: ["math"],
  },

  RandomNumberNode: {
    definition: {
        title: "Random Number",
        inputs: ["min", "max"],
        outputs: ["number"],
        renderContent() { return `<div class="node-content" style="padding:10px; font-size:0.9rem;">Outputs a random number.</div>`; },
        compute(inputs) {
            const min = typeof inputs["min"] === 'number' ? inputs["min"] : 0;
            const max = typeof inputs["max"] === 'number' ? inputs["max"] : 1;
            if (min > max) return min;
            return Math.random() * (max - min) + min;
        }
    },
    jsLogic: `async function(inputs) { const min = typeof inputs["min"] === 'number' ? inputs["min"] : 0; const max = typeof inputs["max"] === 'number' ? inputs["max"] : 1; if (min > max) return min; return Math.random() * (max - min) + min; }`,
    pyLogic: `def compute_random_number(inputs):\n    min_val = inputs.get("min")\n    max_val = inputs.get("max")\n    min_n = min_val if isinstance(min_val, (int, float)) else 0\n    max_n = max_val if isinstance(max_val, (int, float)) else 1\n    if min_n > max_n:\n        return min_n\n    return random.uniform(min_n, max_n)`,
    pyImports: ["random"],
  },

  CurrentDateNode: {
    definition: {
        title: "Current Date",
        inputs: [],
        outputs: ["dateString"],
        renderContent() { return `<div class="node-content" style="padding:10px; font-size:0.9rem;">Outputs current date.</div>`; },
        getOutput() { const date = new Date(); return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0'); }
    },
    jsLogic: `function() { const date = new Date(); return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0'); }`,
    pyLogic: `def get_output_date(node):\n    return datetime.now().strftime('%Y-%m-%d')`,
    pyImports: ['from datetime import datetime'],
  },

  CurrentTimeNode: {
    definition: {
        title: "Current Time",
        inputs: [],
        outputs: ["timeString"],
        renderContent() { return `<div class="node-content" style="padding:10px; font-size:0.9rem;">Outputs current time.</div>`; },
        getOutput() { const date = new Date(); return String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0') + ':' + String(date.getSeconds()).padStart(2, '0'); }
    },
    jsLogic: `function() { const date = new Date(); return String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0') + ':' + String(date.getSeconds()).padStart(2, '0'); }`,
    pyLogic: `def get_output_time(node):\n    return datetime.now().strftime('%H:%M:%S')`,
    pyImports: ['from datetime import datetime'],
  },

  SplitterNode: {
    definition: {
        title: "Splitter",
        inputs: ["input"],
        outputs(node) {
            if (node.outputCount === undefined) node.outputCount = 2;
            return Array.from({ length: node.outputCount }, (_, i) => `out ${i + 1}`);
        },
        renderContent(node) {
            const count = node.outputCount || 2;
            return `<div class="node-content" style="padding:10px;"><label style="font-size:0.9rem;">Outputs: <span id="splitter-label-${node.id}">${count}</span></label><input type="range" class="splitter-range" min="2" max="6" value="${count}" style="width:100%; margin-top: 5px;"></div>`;
        },
        setupEventListeners(node) {
            const context = window.AGGM_APP_CONTEXT;
            if (!context) {
                console.error("App context not found for SplitterNode event listener.");
                return;
            }

            const slider = node.dom.querySelector('.splitter-range');
            const label = node.dom.querySelector(`#splitter-label-${node.id}`);
            const outputsContainer = node.dom.querySelector('.outputs');

            slider.addEventListener('input', () => {
                const newCount = parseInt(slider.value, 10);
                node.outputCount = newCount;
                if(label) label.textContent = newCount;
                
                const outputsArray = this.outputs(node);

                context.app.connections = context.app.connections.filter(conn => {
                    if (conn.fromNodeId === node.id) {
                        const outputIndex = parseInt(conn.fromOutput.split(' ')[1], 10);
                        return outputIndex <= newCount;
                    }
                    return true;
                });

                outputsContainer.innerHTML = outputsArray.map(name => `
                    <div class="io-item" style="justify-content:flex-end;">
                      <span style="margin-right:8px;">${name}</span>
                      <div class="io-connector output" data-nodeid="${node.id}" data-type="output" data-name="${name}" title="Output: ${name}"></div>
                    </div>`).join('');

                outputsContainer.querySelectorAll('.io-connector').forEach(connector => {
                    connector.addEventListener('mousedown', context.onConnectorClick);
                });
                
                context.redrawAllConnections();
                context.saveStateToLocalStorage();
            });
        },
        compute(inputs) { return inputs["input"]; }
    },
    jsLogic: `async function(inputs) { return inputs["input"]; }`,
    pyLogic: `def compute_splitter(inputs):\n    return inputs.get("input")`,
    pyImports: [],
  },

  AskPollinationsNode: {
    definition: {
        title: "Ask Pollinations",
        inputs: ["prompt"],
        outputs: ["response"],
        defaultValue: "",
        renderContent(node) {
            if (node.value === undefined) node.value = this.defaultValue;
            return `
            <div class="node-content">
              <textarea class="node-input text-input" placeholder="Enter prompt or connect..." rows="3">${node.value}</textarea>
              <div style="padding:5px 10px; font-size:0.8rem; color:#aaa;">Result: <span class="pollinations-result">...</span></div>
              <div style="font-size: 0.7rem; color: #888; padding: 0 10px 8px; text-align: center; font-style: italic;">Uses pollinations.ai</div>
            </div>`;
        },
        update(node) {
            const textarea = node.dom.querySelector('textarea.text-input');
            if (textarea) node.value = textarea.value;
        },
        async compute(inputs) {
            const promptText = inputs["prompt"] !== null ? String(inputs["prompt"]) : (this.value || "");
            const resultSpan = this.dom.querySelector('.pollinations-result');
            
            if (resultSpan) resultSpan.textContent = 'Loading...';
            if (!promptText) {
                if (resultSpan) resultSpan.textContent = 'No prompt provided.';
                return null;
            }

            try {
                const encodedPrompt = encodeURIComponent(promptText);
                const url = `https://text.pollinations.ai/${encodedPrompt}`;
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const textResponse = await response.text();
                if (resultSpan) resultSpan.textContent = textResponse.substring(0, 50) + (textResponse.length > 50 ? '...' : '');
                return textResponse;
            } catch (error) {
                console.error("Error fetching from Pollinations:", error);
                if (resultSpan) resultSpan.textContent = `Error: ${error.message}`;
                return null;
            }
        }
    },
    jsLogic: `async function(inputs) { const promptText = inputs["prompt"] !== null ? String(inputs["prompt"]) : (this.value || ""); if (!promptText) return null; try { const encodedPrompt = encodeURIComponent(promptText); const url = \`https://text.pollinations.ai/\${encodedPrompt}\`; const response = await fetch(url); if (!response.ok) throw new Error(\`HTTP error! status: \${response.status}\`); return await response.text(); } catch (error) { console.error("Error fetching from Pollinations:", error); return null; } }`,
    pyLogic: `def compute_ask_pollinations(inputs, node):\n    prompt = inputs.get("prompt") or node.get("value", "")\n    if not prompt:\n        return None\n    try:\n        import requests\n        from urllib.parse import quote\n        encoded_prompt = quote(prompt)\n        url = f"https://text.pollinations.ai/{encoded_prompt}"\n        response = requests.get(url)\n        response.raise_for_status()\n        return response.text\n    except Exception as e:\n        print(f"PollinationsError: {e}")\n        return None`,
    pyImports: ['requests', 'from urllib.parse import quote'],
  },
MarkDownRendererNode: {
  definition: {
    title: "Markdown Renderer",
    inputs: ["markdown"],
    outputs: ["html"],
    defaultValue: "# Hello\nThis is **bold**, *italic*, and a list:\n- Item 1\n- Item 2",
    
    renderContent(node) {
      if (node.value === undefined) node.value = this.defaultValue;
      return `
        <div class="node-content" style="padding:10px;">
          <textarea class="node-input text-input" rows="6" style="width:100%; background:#111; color:white;">${node.value}</textarea>
          <div style="margin-top: 10px; font-size:0.9rem; color:#aaa;">Preview:</div>
          <div class="markdown-preview" style="padding:8px; background:#000; color:#fff; border:1px solid #555; max-height:150px; overflow:auto;"></div>
        </div>`;
    },

    update(node) {
      const textarea = node.dom.querySelector('textarea.text-input');
      const preview = node.dom.querySelector('.markdown-preview');
      if (textarea) {
        node.value = textarea.value;
        if (preview) preview.innerHTML = this.renderMarkdown(node.value);
      }
    },

    getOutput() {
      return this.renderMarkdown(this.value || "");
    },

    renderMarkdown(text) {
      if (typeof text !== 'string') return '';

      let html = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

      // Headers
      html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
      html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
      html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
      html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
      html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
      html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

      // Bold and Italic
      html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
      html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

      // Lists
      html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
      if (html.includes('<li>')) {
        html = html.replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>');
      }

      // Line breaks
      html = html.replace(/\n/g, '<br>');

      return html.trim();
    },
  },

  jsLogic: `function() {
    const renderMarkdown = (text) => {
      if (typeof text !== 'string') return '';
      let html = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
      html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
      html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
      html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
      html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
      html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
      html = html.replace(/\\*\\*(.*?)\\*\\*/gim, '<strong>$1</strong>');
      html = html.replace(/\\*(.*?)\\*/gim, '<em>$1</em>');
      html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
      if (html.includes('<li>')) {
        html = html.replace(/(<li>.*<\\/li>)/gims, '<ul>$1</ul>');
      }
      html = html.replace(/\\n/g, '<br>');
      return html.trim();
    };
    return renderMarkdown(this.value || "");
  }`,

  pyLogic: `def compute_markdown_renderer(inputs):
    md = inputs.get("markdown", "")
    if not isinstance(md, str): return ""
    import re
    def esc(s): return s.replace("<", "&lt;").replace(">", "&gt;")
    html = esc(md)
    html = re.sub(r'^###### (.*)', r'<h6>\\1</h6>', html, flags=re.MULTILINE)
    html = re.sub(r'^##### (.*)', r'<h5>\\1</h5>', html, flags=re.MULTILINE)
    html = re.sub(r'^#### (.*)', r'<h4>\\1</h4>', html, flags=re.MULTILINE)
    html = re.sub(r'^### (.*)', r'<h3>\\1</h3>', html, flags=re.MULTILINE)
    html = re.sub(r'^## (.*)', r'<h2>\\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^# (.*)', r'<h1>\\1</h1>', html, flags=re.MULTILINE)
    html = re.sub(r'\\*\\*(.*?)\\*\\*', r'<strong>\\1</strong>', html)
    html = re.sub(r'\\*(.*?)\\*', r'<em>\\1</em>', html)
    html = re.sub(r'^- (.*)', r'<li>\\1</li>', html, flags=re.MULTILINE)
    html = re.sub(r'(</li>\\n<li>)', '</li><li>', html)
    if '<li>' in html: html = '<ul>' + html + '</ul>'
    html = html.replace('\\n', '<br>')
    return html`,

  pyImports: ['import re'],
}

};
