
  const nodeTypes = {
    NumberNode: {
      title: "Number",
      inputs: [],
      outputs: ["value"],
      renderContent(node) {
        if (node.value === undefined) node.value = 0;
        return `<div class="node-content"><input class="node-input number-input" type="number" value="${node.value}" /></div>`;
      },
      update(node) {
        const input = node.dom.querySelector('input.number-input');
        if (input) node.value = Number(input.value);
      },
      getOutput() {
        return this.value;
      }
    },
    TextNode: {
      title: "Text",
      inputs: [],
      outputs: ["text"],
      renderContent(node) {
        if (node.value === undefined) node.value = "";
        return `<div class="node-content"><input class="node-input text-input" type="text" value="${node.value}" placeholder="Enter text..." /></div>`;
      },
      update(node) {
        const input = node.dom.querySelector('input.text-input');
        if (input) node.value = input.value;
      },
      getOutput() {
        return this.value;
      }
    },
    CurrentDateNode: {
        title: "Current Date",
        inputs: [],
        outputs: ["dateString"],
        renderContent() {
            return `<div class="node-content" style="padding:10px; font-size:0.9rem; text-align:center;"></div>`;
        },
        getOutput() {
            const date = new Date();
            return date.getFullYear() + '-' + 
                   String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                   String(date.getDate()).padStart(2, '0');
        }
    },
    CurrentTimeNode: {
        title: "Current Time",
        inputs: [],
        outputs: ["timeString"],
        renderContent() {
            return `<div class="node-content" style="padding:10px; font-size:0.9rem; text-align:center;"></div>`;
        },
        getOutput() {
            const date = new Date();
            return String(date.getHours()).padStart(2, '0') + ':' + 
                   String(date.getMinutes()).padStart(2, '0') + ':' + 
                   String(date.getSeconds()).padStart(2, '0');
        }
    },
    SplitterNode: {
        title: "Splitter",
        inputs: ["input"],
        outputs(node) {
            if (node.outputCount === undefined) node.outputCount = 2;
            return Array.from({ length: node.outputCount }, (_, i) => `out ${i + 1}`);
        },
        renderContent(node) {
            const count = node.outputCount || 2;
            return `
                <div class="node-content" style="padding:10px;">
                    <label for="splitter-count-${node.id}" style="font-size:0.9rem;">Outputs: <span id="splitter-label-${node.id}">${count}</span></label>
                    <input type="range" id="splitter-count-${node.id}" class="splitter-range" min="2" max="6" value="${count}" style="width: calc(100% - 20px); margin: 10px 10px 0 10px; box-sizing: border-box;">
                </div>
            `;
        },
        setupEventListeners(node) {
            const slider = node.dom.querySelector('.splitter-range');
            const label = node.dom.querySelector(`#splitter-label-${node.id}`);
            const outputsContainer = node.dom.querySelector('.outputs');

            slider.addEventListener('input', () => {
                const newCount = parseInt(slider.value, 10);
                node.outputCount = newCount;
                label.textContent = newCount;

                const type = nodeTypes[node.type];
                const outputsArray = type.outputs(node);

                app.connections = app.connections.filter(conn => {
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
                    connector.addEventListener('mousedown', onConnectorClick);
                });

                redrawAllConnections();
                saveStateToLocalStorage();
            });
        },
        compute(inputs) {
            return inputs["input"];
        }
    },
    AddNode: {
      title: "Add",
      inputs: ["a", "b"],
      outputs: ["sum"],
      renderContent() {
        return `<div class="node-content" style="padding:10px; font-size:0.9rem;">Adds two numbers.</div>`;
      },
      compute(inputs) {
        const a = inputs["a"];
        const b = inputs["b"];
        if (typeof a !== 'number' || typeof b !== 'number') return null;
        return a + b;
      }
    },
    SubtractNode: {
      title: "Subtract",
      inputs: ["a", "b"],
      outputs: ["difference"],
      renderContent() {
        return `<div class="node-content" style="padding:10px; font-size:0.9rem;">Subtracts b from a.</div>`;
      },
      compute(inputs) {
        const a = inputs["a"];
        const b = inputs["b"];
        if (typeof a !== 'number' || typeof b !== 'number') return null;
        return a - b;
      }
    },
    MultiplyNode: {
      title: "Multiply",
      inputs: ["x", "y"],
      outputs: ["product"],
      renderContent() {
        return `<div class="node-content" style="padding:10px; font-size:0.9rem;">Multiplies two numbers.</div>`;
      },
      compute(inputs) {
        const x = inputs["x"];
        const y = inputs["y"];
        if (typeof x !== 'number' || typeof y !== 'number') return null;
        return x * y;
      }
    },
    DivideNode: {
      title: "Divide",
      inputs: ["a", "b"],
      outputs: ["quotient"],
      renderContent() {
        return `<div class="node-content" style="padding:10px; font-size:0.9rem;">Divides a by b.</div>`;
      },
      compute(inputs) {
        const a = inputs["a"];
        const b = inputs["b"];
        if (typeof a !== 'number' || typeof b !== 'number' || b === 0) return null;
        return a / b;
      }
    },
    SqrtNode: {
        title: "Square Root",
        inputs: ["number"],
        outputs: ["result"],
        renderContent() {
            return `<div class="node-content" style="padding:10px; font-size:0.9rem; text-align:center;">Calculates √ of a number.</div>`;
        },
        compute(inputs) {
            const num = inputs["number"];
            if (typeof num !== 'number' || num < 0) return null;
            return Math.sqrt(num);
        }
    },
    RandomNumberNode: {
        title: "Random Number",
        inputs: ["min", "max"],
        outputs: ["number"],
        renderContent() {
            return `<div class="node-content" style="padding:10px; font-size:0.9rem; text-align:center;">Outputs a random number.</div>`;
        },
        compute(inputs) {
            const min = typeof inputs["min"] === 'number' ? inputs["min"] : 0;
            const max = typeof inputs["max"] === 'number' ? inputs["max"] : 1;
            if (min > max) return min;
            return Math.random() * (max - min) + min;
        }
    },
    MergeTextNode: {
      title: "Merge Text",
      inputs: ["text1", "text2"],
      outputs: ["mergedText"],
      renderContent() {
        return `<div class="node-content" style="padding:10px; font-size:0.9rem;">Merges two text strings.</div>`;
      },
      compute(inputs) {
        const text1 = inputs["text1"] !== null ? String(inputs["text1"]) : "";
        const text2 = inputs["text2"] !== null ? String(inputs["text2"]) : "";
        return text1 + text2;
      }
    },
    UppercaseNode: {
        title: "To Uppercase",
        inputs: ["string"],
        outputs: ["text"],
        renderContent() {
            return `<div class="node-content" style="padding:10px; font-size:0.9rem; text-align:center;">Converts text to UPPERCASE.</div>`;
        },
        compute(inputs) {
            const str = inputs["string"];
            if (typeof str !== 'string') return null;
            return str.toUpperCase();
        }
    },
    LowercaseNode: {
        title: "To Lowercase",
        inputs: ["string"],
        outputs: ["text"],
        renderContent() {
            return `<div class="node-content" style="padding:10px; font-size:0.9rem; text-align:center;">Converts text to lowercase.</div>`;
        },
        compute(inputs) {
            const str = inputs["string"];
            if (typeof str !== 'string') return null;
            return str.toLowerCase();
        }
    },
    AskPollinationsNode: {
      title: "Ask Pollinations",
      inputs: ["prompt"],
      outputs: ["response"],
      renderContent(node) {
        if (node.value === undefined) node.value = "";
        return `
          <div class="node-content">
            <textarea class="node-input text-input" placeholder="Enter prompt or connect..." rows="3">${node.value}</textarea>
            <div style="padding:5px 10px; font-size:0.8rem; color:#aaa;">Result: <span class="pollinations-result">...</span></div>
            <div style="font-size: 0.7rem; color: #888; padding: 0 10px 8px; text-align: center; font-style: italic;">Uses an external service (pollinations.ai)</div>
          </div>
        `;
      },
      update(node) {
        const textarea = node.dom.querySelector('textarea.text-input');
        if (textarea) node.value = textarea.value;
      },
      async compute(inputs) {
        const promptText = inputs["prompt"] !== null ? String(inputs["prompt"]) : (this.value || "");
        if (this.dom) {
            const resultSpan = this.dom.querySelector('.pollinations-result');
            if (resultSpan) resultSpan.textContent = 'Loading...';
        }

        if (!promptText) {
          if (this.dom) {
            const resultSpan = this.dom.querySelector('.pollinations-result');
            if (resultSpan) resultSpan.textContent = 'No prompt provided.';
          }
          return null;
        }

        try {
          const encodedPrompt = encodeURIComponent(promptText);
          const url = `https://text.pollinations.ai/${encodedPrompt}`;
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const textResponse = await response.text();
          if (this.dom) {
            const resultSpan = this.dom.querySelector('.pollinations-result');
            if(resultSpan) resultSpan.textContent = textResponse.substring(0, 50) + (textResponse.length > 50 ? '...' : '');
          }
          return textResponse;
        } catch (error) {
          console.error("Error fetching from Pollinations:", error);
           if (this.dom) {
            const resultSpan = this.dom.querySelector('.pollinations-result');
            if(resultSpan) resultSpan.textContent = `Error: ${error.message}`;
           }
          return null;
        }
      }
    },
    PrintNode: {
      title: "Print to Console",
      inputs: ["input"],
      outputs: [],
      renderContent(node) {
        return `<div class="node-content" style="padding:10px; font-size:0.9rem; text-align:center; min-height: 20px; color: #8a8;">(Logs to console)</div>`;
      }
    },
    OutputNode: {
      title: "Output",
      inputs: ["input"],
      outputs: [],
      renderContent(node) {
        return `<div class="node-content" style="padding:10px; font-size:0.9rem; text-align:center; min-height: 20px;"></div>`;
      }
    }
  };

  const app = {
    nodes: [],
    connections: [],
    nextNodeId: 1,
    draggedNode: null,
    dragOffsetX: 0,
    dragOffsetY: 0,
    connecting: null,
    contextMenuNodeId: null,
    canvasScale: 1,
    canvasTranslateX: 0,
    canvasTranslateY: 0,
    isPanning: false,
    lastPanX: 0,
    lastPanY: 0,
  };

  const canvas = document.getElementById('canvas');
  const canvasContentWrapper = document.getElementById('canvas-content-wrapper');
  const nodeList = document.getElementById('node-list');
  const connectionsSvg = document.getElementById('connections');
  const runBtn = document.getElementById('run-btn');
  const exportProjectBtn = document.getElementById('export-project-btn');
  const importNodesBtn = document.getElementById('import-nodes-btn');
  const importNodesFile = document.getElementById('import-nodes-file');
  const contextMenu = document.getElementById('context-menu');
  const searchNodesInput = document.getElementById('search-nodes');
  const projectNameInput = document.getElementById('project-name-input');
  const clearWorkspaceBtn = document.getElementById('clear-workspace-btn');
  const nodeCounter = document.getElementById('node-counter');

  function updateNodeCounter() {
    const count = app.nodes.length;
    nodeCounter.textContent = `Nodes: ${count}`;
  }

  function saveStateToLocalStorage() {
      const state = {
        projectName: projectNameInput.value,
        graph: exportGraphData(),
        transform: {
            scale: app.canvasScale,
            translateX: app.canvasTranslateX,
            translateY: app.canvasTranslateY
        },
        nextNodeId: app.nextNodeId
      };
      localStorage.setItem('aggmNodesProject', JSON.stringify(state));
  }

  function loadStateFromLocalStorage() {
    const savedStateJSON = localStorage.getItem('aggmNodesProject');
    if (!savedStateJSON) return;

    try {
        const savedState = JSON.parse(savedStateJSON);

        clearWorkbench(false); 

        projectNameInput.value = savedState.projectName || 'My Project';
        app.nodes = savedState.graph.nodes || [];
        app.connections = savedState.graph.connections || [];
        app.nextNodeId = savedState.nextNodeId || Math.max(0, ...app.nodes.map(n => n.id)) + 1;
        
        if (savedState.transform) {
            app.canvasScale = savedState.transform.scale || 1;
            app.canvasTranslateX = savedState.transform.translateX || 0;
            app.canvasTranslateY = savedState.transform.translateY || 0;
        }

        app.nodes.forEach(node => renderNode(node));
        updateCanvasTransform();
        updateNodeCounter();
        
    } catch (error) {
        console.error("Failed to load saved state:", error);
        localStorage.removeItem('aggmNodesProject'); 
    }
  }

  function createNode(typeKey, x, y, id) {
    const type = nodeTypes[typeKey];
    if (!type) return;
    
    let initialX, initialY;
    if (x === undefined || y === undefined) {
        const canvasRect = canvas.getBoundingClientRect();
        const viewCenterX = canvasRect.width / 2;
        const viewCenterY = canvasRect.height / 2;
        initialX = (viewCenterX - app.canvasTranslateX) / app.canvasScale;
        initialY = (viewCenterY - app.canvasTranslateY) / app.canvasScale;
    } else {
        initialX = x;
        initialY = y;
    }

    const node = {
      id: id || app.nextNodeId++,
      type: typeKey,
      x: initialX,
      y: initialY,
      dom: null,
      value: undefined
    };
    if (!id) {
        app.nodes.push(node);
    }
    renderNode(node);
    updateNodeCounter();
    if (!id) {
        saveStateToLocalStorage();
    }
  }

  function renderNode(node) {
    const type = nodeTypes[node.type];
    const nodeEl = document.createElement('div');
    nodeEl.classList.add('node');
    nodeEl.style.left = node.x + 'px';
    nodeEl.style.top = node.y + 'px';
    nodeEl.dataset.id = node.id;

    const outputsArray = typeof type.outputs === 'function' ? type.outputs(node) : type.outputs;

    nodeEl.innerHTML = `
      <div class="node-header">${type.title}</div>
      <div class="node-io">
        <div class="inputs">
          ${type.inputs.map(name => `
            <div class="io-item">
              <div class="io-connector input" data-nodeid="${node.id}" data-type="input" data-name="${name}" title="Input: ${name}"></div>
              <span style="margin-left:8px;">${name}</span>
            </div>`).join('')}
        </div>
        <div class="outputs">
          ${outputsArray.map(name => `
            <div class="io-item" style="justify-content:flex-end;">
              <span style="margin-right:8px;">${name}</span>
              <div class="io-connector output" data-nodeid="${node.id}" data-type="output" data-name="${name}" title="Output: ${name}"></div>
            </div>`).join('')}
        </div>
      </div>
      ${type.renderContent ? type.renderContent(node) : ''}
    `;
    
    canvasContentWrapper.appendChild(nodeEl);
    node.dom = nodeEl;

    if (type.setupEventListeners) {
        type.setupEventListeners(node);
    }

    nodeEl.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', () => {
            if (type.update) type.update(node);
            saveStateToLocalStorage();
        });
    });

    nodeEl.querySelector('.node-header').addEventListener('mousedown', onNodeDragStart);
    nodeEl.querySelectorAll('.io-connector').forEach(connector => {
      connector.addEventListener('mousedown', onConnectorClick);
    });
  }
  
  function updateCanvasTransform() {
      const transform = `translate(${app.canvasTranslateX}px, ${app.canvasTranslateY}px) scale(${app.canvasScale})`;
      canvasContentWrapper.style.transform = transform;
      connectionsSvg.style.transform = transform;
      redrawAllConnections();
  }

  function updateNodePosition(node, x, y) {
    node.x = x;
    node.y = y;
    node.dom.style.left = x + 'px';
    node.dom.style.top = y + 'px';
    updateConnectionsForNode(node.id);
  }

  function getConnectorPosition(nodeId, ioType, ioName) {
    const node = app.nodes.find(n => n.id === nodeId);
    if (!node || !node.dom) return null;
    const el = node.dom.querySelector(`.io-connector.${ioType}[data-name="${ioName}"]`);
    if (!el) return null;
    
    const x = node.x + (el.offsetLeft + el.offsetWidth / 2);
    const y = node.y + (el.offsetTop + el.offsetHeight / 2);

    return { x, y };
  }

  function updateConnectionsForNode(nodeId) {
    connectionsSvg.querySelectorAll(`[data-from-nodeid="${nodeId}"], [data-to-nodeid="${nodeId}"]`).forEach(line => {
        const fromNodeId = Number(line.dataset.fromNodeid);
        const fromOutput = line.dataset.fromoutput;
        const toNodeId = Number(line.dataset.toNodeid);
        const toInput = line.dataset.toinput;

        const fromPos = getConnectorPosition(fromNodeId, 'output', fromOutput);
        const toPos = getConnectorPosition(toNodeId, 'input', toInput);
        if (fromPos && toPos) {
            line.setAttribute('x1', fromPos.x);
            line.setAttribute('y1', fromPos.y);
            line.setAttribute('x2', toPos.x);
            line.setAttribute('y2', toPos.y);
        }
    });
  }
  
  function redrawAllConnections() {
    connectionsSvg.innerHTML = '';
    
    for (const conn of app.connections) {
      const fromPos = getConnectorPosition(conn.fromNodeId, 'output', conn.fromOutput);
      const toPos = getConnectorPosition(conn.toNodeId, 'input', conn.toInput);
      if (fromPos && toPos) {
        const line = createSVGLine(fromPos.x, fromPos.y, toPos.x, toPos.y);
        line.dataset.fromNodeid = conn.fromNodeId;
        line.dataset.fromoutput = conn.fromOutput;
        line.dataset.toNodeid = conn.toNodeId;
        line.dataset.toinput = conn.toInput;
      }
    }
  }

  function startConnecting(startNodeId, startIoName, startIoType) {
    const startPos = getConnectorPosition(startNodeId, startIoType, startIoName);
    if (!startPos) return;

    const tempLine = createSVGLine(startPos.x, startPos.y, startPos.x, startPos.y);
    tempLine.style.pointerEvents = 'none';

    app.connecting = { startNodeId, startIoName, startIoType, tempLine };
    
    window.addEventListener('mousemove', onConnectionDrag);
    window.addEventListener('mouseup', onConnectionEnd, { once: true });
  }

  function cancelConnecting() {
    if (!app.connecting) return;
    if (app.connecting.tempLine.parentNode) {
        app.connecting.tempLine.parentNode.removeChild(app.connecting.tempLine);
    }
    app.connecting = null;
    window.removeEventListener('mousemove', onConnectionDrag);
  }

  function deleteNode(nodeId) {
    app.nodes = app.nodes.filter(node => node.id !== nodeId);
    app.connections = app.connections.filter(conn => 
      conn.fromNodeId !== nodeId && conn.toNodeId !== nodeId
    );
    const nodeEl = canvasContentWrapper.querySelector(`.node[data-id="${nodeId}"]`);
    if (nodeEl) {
      nodeEl.remove();
    }
    redrawAllConnections();
    updateNodeCounter();
    saveStateToLocalStorage();
  }

  function duplicateNode(nodeId) {
    const originalNode = app.nodes.find(n => n.id === nodeId);
    if (!originalNode) return;

    const type = nodeTypes[originalNode.type];
    if (type && type.update) {
        type.update(originalNode);
    }

    const newNodeX = originalNode.x + 30;
    const newNodeY = originalNode.y + 30;

    const newNode = {
      id: app.nextNodeId++,
      type: originalNode.type,
      x: newNodeX,
      y: newNodeY,
      dom: null,
      value: originalNode.value !== undefined ? JSON.parse(JSON.stringify(originalNode.value)) : undefined,
      outputCount: originalNode.outputCount
    };

    app.nodes.push(newNode);
    renderNode(newNode);
    updateNodeCounter();
    saveStateToLocalStorage();
  }

  function clearWorkbench(confirmFirst = true) {
    if (confirmFirst) {
        if (!confirm("Are you sure you want to clear the entire workspace? This cannot be undone.")) {
            return;
        }
    }
    app.nodes = [];
    app.connections = [];
    app.nextNodeId = 1;
    projectNameInput.value = "My Project";
    canvasContentWrapper.innerHTML = '';
    connectionsSvg.innerHTML = '';
    app.canvasScale = 1;
    app.canvasTranslateX = 0;
    app.canvasTranslateY = 0;
    updateCanvasTransform();
    updateNodeCounter();
    if (confirmFirst) {
        localStorage.removeItem('aggmNodesProject');
    }
  }

  function onNodeDragStart(e) {
    if (e.button !== 0) return;
    if (e.target.closest('.io-connector, .node-input, .splitter-range, input, textarea')) return;
    e.preventDefault();
    const nodeId = parseInt(e.target.closest('.node').dataset.id);
    const node = app.nodes.find(n => n.id === nodeId);
    if (!node) return;

    app.draggedNode = node;
    
    const nodeScreenX = node.x * app.canvasScale + app.canvasTranslateX;
    const nodeScreenY = node.y * app.canvasScale + app.canvasTranslateY;

    app.dragOffsetX = e.clientX - nodeScreenX;
    app.dragOffsetY = e.clientY - nodeScreenY;

    node.dom.classList.add('dragging');
    window.addEventListener('mousemove', onNodeDrag);
    window.addEventListener('mouseup', onNodeDragEnd, { once: true });
  }

  function onNodeDrag(e) {
    if (!app.draggedNode) return;
    e.preventDefault();

    const newX = (e.clientX - app.dragOffsetX - app.canvasTranslateX) / app.canvasScale;
    const newY = (e.clientY - app.dragOffsetY - app.canvasTranslateY) / app.canvasScale;

    updateNodePosition(app.draggedNode, newX, newY);
  }

  function onNodeDragEnd() {
    if (app.draggedNode) {
      app.draggedNode.dom.classList.remove('dragging');
      saveStateToLocalStorage();
    }
    app.draggedNode = null;
    window.removeEventListener('mousemove', onNodeDrag);
  }
  
  function onConnectorClick(e) {
    e.stopPropagation();
    const { nodeid, type, name } = e.target.dataset;
    const clickedNodeId = parseInt(nodeid);

    if (app.connecting) {
        const { startNodeId, startIoType } = app.connecting;

        if (clickedNodeId === startNodeId || type === startIoType) {
            cancelConnecting();
            return;
        }

        const from = startIoType === 'output'
            ? { nodeId: startNodeId, ioName: app.connecting.startIoName }
            : { nodeId: clickedNodeId, ioName: name };
        const to = startIoType === 'input'
            ? { nodeId: startNodeId, ioName: app.connecting.startIoName }
            : { nodeId: clickedNodeId, ioName: name };

        if (app.connections.some(c => c.toNodeId === to.nodeId && c.toInput === to.ioName)) {
            cancelConnecting();
            return;
        }

        app.connections.push({
            fromNodeId: from.nodeId,
            fromOutput: from.ioName,
            toNodeId: to.nodeId,
            toInput: to.ioName
        });

        cancelConnecting();
        redrawAllConnections();
        saveStateToLocalStorage();

    } else {
        startConnecting(clickedNodeId, name, type);
    }
}

  function onConnectionDrag(e) {
    if (!app.connecting) return;
    e.preventDefault();
    
    const svgRect = connectionsSvg.getBoundingClientRect();

    const x = (e.clientX - svgRect.left) / app.canvasScale;
    const y = (e.clientY - svgRect.top) / app.canvasScale;

    app.connecting.tempLine.setAttribute('x2', x);
    app.connecting.tempLine.setAttribute('y2', y);
  }
  
  function onConnectionEnd(e) {
    if (app.connecting && !e.target.closest('.io-connector')) {
        cancelConnecting();
    }
  }

  function onContextMenuClick(e) {
    const action = e.target.dataset.action;
    if (app.contextMenuNodeId && action) {
      if (action === 'delete') {
        deleteNode(app.contextMenuNodeId);
      } else if (action === 'duplicate') {
        duplicateNode(app.contextMenuNodeId);
      }
    }
    hideContextMenu();
  }

  function hideContextMenu() {
    contextMenu.style.display = 'none';
    app.contextMenuNodeId = null;
  }
  
  function onCanvasMouseDown(e) {
    const clickedNodeEl = e.target.closest('.node');

    if (e.button === 2 || e.ctrlKey) { 
        e.preventDefault();
        if (clickedNodeEl) {
            app.contextMenuNodeId = parseInt(clickedNodeEl.dataset.id);
            contextMenu.style.left = `${e.clientX}px`;
            contextMenu.style.top = `${e.clientY}px`;
            contextMenu.style.display = 'block';
        } else {
            app.isPanning = true;
            app.lastPanX = e.clientX;
            app.lastPanY = e.clientY;
            canvas.style.cursor = 'grabbing';
            window.addEventListener('mousemove', onCanvasPan);
            window.addEventListener('mouseup', onCanvasPanEnd, { once: true });
        }
    } else if (e.button === 0) { 
        if (!clickedNodeEl && !contextMenu.contains(e.target)) {
            hideContextMenu();
        }
    }
  }

  function onCanvasPan(e) {
      if (!app.isPanning) return;
      e.preventDefault();
      const dx = e.clientX - app.lastPanX;
      const dy = e.clientY - app.lastPanY;

      app.canvasTranslateX += dx;
      app.canvasTranslateY += dy;
      
      app.lastPanX = e.clientX;
      app.lastPanY = e.clientY;
      
      updateCanvasTransform();
  }
  
  function onCanvasPanEnd() {
      app.isPanning = false;
      canvas.style.cursor = 'default';
      window.removeEventListener('mousemove', onCanvasPan);
      saveStateToLocalStorage();
  }

  function onCanvasWheel(e) {
      e.preventDefault();
      const zoomIntensity = 0.05; 
      const minScale = 0.2;
      const maxScale = 2.5;
      
      const delta = e.deltaY > 0 ? -1 : 1;
      
      const oldScale = app.canvasScale;
      const newScale = Math.max(minScale, Math.min(maxScale, oldScale + delta * zoomIntensity));

      const canvasRect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;

      app.canvasTranslateX = mouseX - (mouseX - app.canvasTranslateX) * (newScale / oldScale);
      app.canvasTranslateY = mouseY - (mouseY - app.canvasTranslateY) * (newScale / oldScale);
      app.canvasScale = newScale;
      
      updateCanvasTransform();
      saveStateToLocalStorage();
  }

  async function evaluateNodeOutput(nodeId, outputName, visited = new Set()) {
    const visitedKey = `${nodeId}-${outputName}`;
    if (visited.has(visitedKey)) {
        console.warn("Circular dependency detected at node", nodeId);
        return null;
    }
    visited.add(visitedKey);
    const node = app.nodes.find(n => n.id === nodeId);
    if (!node) return null;
    const type = nodeTypes[node.type];
    
    if (type.update) {
      type.update(node);
    }

    if (type.getOutput) {
      return type.getOutput.call(node, outputName);
    }
    if (type.compute) {
      const inputs = {};
      const requiredInputs = typeof type.inputs === 'function' ? type.inputs(node) : type.inputs;
      
      for (const inputName of requiredInputs) {
        const conn = app.connections.find(c => c.toNodeId === nodeId && c.toInput === inputName);
        if (!conn) {
          if (node.type === 'AskPollinationsNode' && inputName === 'prompt') {
            inputs[inputName] = node.value; 
          } else {
            inputs[inputName] = null;
          }
          continue;
        }
        inputs[inputName] = await evaluateNodeOutput(conn.fromNodeId, conn.fromOutput, new Set(visited));
      }
      return await type.compute.call(node, inputs);
    }
    return null;
  }

  async function runGraph() {
    const terminalNodes = app.nodes.filter(n => n.type === 'OutputNode' || n.type === 'PrintNode');
    if (terminalNodes.length === 0) {
      const prevMessage = document.getElementById('user-message');
      if(prevMessage) prevMessage.remove();
      
      const message = document.createElement('div');
      message.id = 'user-message';
      message.textContent = "No Output or Print Node found! Add one to see results.";
      message.style.position = 'fixed';
      message.style.top = '20px';
      message.style.left = '50%';
      message.style.transform = 'translateX(-50%)';
      message.style.backgroundColor = 'var(--node-header-bg)';
      message.style.color = 'white';
      message.style.padding = '10px 20px';
      message.style.borderRadius = '8px';
      message.style.zIndex = '1000';
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 3000);
      return;
    }
    
    app.nodes.forEach(node => {
        if (node.type === 'OutputNode' || node.type === 'PrintNode') {
            const contentDiv = node.dom.querySelector('.node-content');
            if(contentDiv) contentDiv.textContent = 'Calculating...';
        } else if (node.type === 'AskPollinationsNode') {
            const resultSpan = node.dom.querySelector('.pollinations-result');
            if (resultSpan) resultSpan.textContent = '...';
        }
    });

    for (const termNode of terminalNodes) {
      const conn = app.connections.find(c => c.toNodeId === termNode.id && c.toInput === "input");
      let result = null;
      if (conn) {
        result = await evaluateNodeOutput(conn.fromNodeId, conn.fromOutput);
      }
      
      if (termNode.type === 'PrintNode') {
          console.log(`Print Node ${termNode.id}:`, result);
          const contentDiv = termNode.dom.querySelector('.node-content');
          if(contentDiv) {
            contentDiv.textContent = `(Logged to console)`;
          }
      } else { // OutputNode
          const contentDiv = termNode.dom.querySelector('.node-content');
          if(contentDiv) {
            const resultString = result !== null ? JSON.stringify(result, null, 2) : 'null';
            contentDiv.textContent = resultString;
          }
      }
    }
  }

  function exportGraphData() {
    app.nodes.forEach(node => {
        const type = nodeTypes[node.type];
        if (type && type.update) {
            type.update(node);
        }
    });

    return {
      nodes: app.nodes.map(node => {
        const { dom, ...rest } = node;
        const exportedNode = { ...rest };
        
        if (node.value !== undefined) {
          exportedNode.value = node.value;
        }
        if (node.type === 'SplitterNode' && node.outputCount !== undefined) {
            exportedNode.outputCount = node.outputCount;
        }
        return exportedNode;
      }),
      connections: app.connections
    };
  }
  
  function generateJsCode(graphData, projectName) {
    return `
// Project: ${projectName}
// Created using Adolfo GM's Node Graph Editor
// This is a self-contained, runnable client-side script.

(async () => {
    const nodeGraph = ${JSON.stringify(graphData, null, 2)};

    const runtimeNodeTypes = {
        NumberNode: {
            inputs: [],
            getOutput: function() { return this.value; }
        },
        TextNode: {
            inputs: [],
            getOutput: function() { return this.value; }
        },
        CurrentDateNode: {
            inputs: [],
            getOutput: function() {
                const date = new Date();
                return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
            }
        },
        CurrentTimeNode: {
            inputs: [],
            getOutput: function() {
                const date = new Date();
                return String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0') + ':' + String(date.getSeconds()).padStart(2, '0');
            }
        },
        SplitterNode: {
            inputs: ["input"],
            compute: function(inputs) { return inputs["input"]; }
        },
        AddNode: {
            inputs: ["a", "b"],
            compute: function(inputs) {
                const a = inputs["a"]; const b = inputs["b"];
                if (typeof a !== 'number' || typeof b !== 'number') return null;
                return a + b;
            }
        },
        SubtractNode: {
            inputs: ["a", "b"],
            compute: function(inputs) {
                const a = inputs["a"]; const b = inputs["b"];
                if (typeof a !== 'number' || typeof b !== 'number') return null;
                return a - b;
            }
        },
        MultiplyNode: {
            inputs: ["x", "y"],
            compute: function(inputs) {
                const x = inputs["x"]; const y = inputs["y"];
                if (typeof x !== 'number' || typeof y !== 'number') return null;
                return x * y;
            }
        },
        DivideNode: {
            inputs: ["a", "b"],
            compute: function(inputs) {
                const a = inputs["a"]; const b = inputs["b"];
                if (typeof a !== 'number' || typeof b !== 'number' || b === 0) return null;
                return a / b;
            }
        },
        SqrtNode: {
            inputs: ["number"],
            compute: function(inputs) {
                const num = inputs["number"];
                if (typeof num !== 'number' || num < 0) return null;
                return Math.sqrt(num);
            }
        },
        RandomNumberNode: {
            inputs: ["min", "max"],
            compute: function(inputs) {
                const min = typeof inputs["min"] === 'number' ? inputs["min"] : 0;
                const max = typeof inputs["max"] === 'number' ? inputs["max"] : 1;
                if (min > max) return min;
                return Math.random() * (max - min) + min;
            }
        },
        MergeTextNode: {
            inputs: ["text1", "text2"],
            compute: function(inputs) {
                const text1 = inputs["text1"] !== null ? String(inputs["text1"]) : "";
                const text2 = inputs["text2"] !== null ? String(inputs["text2"]) : "";
                return text1 + text2;
            }
        },
        UppercaseNode: {
            inputs: ["string"],
            compute: function(inputs) {
                const str = inputs["string"];
                if (typeof str !== 'string') return null;
                return str.toUpperCase();
            }
        },
        LowercaseNode: {
            inputs: ["string"],
            compute: function(inputs) {
                const str = inputs["string"];
                if (typeof str !== 'string') return null;
                return str.toLowerCase();
            }
        },
        AskPollinationsNode: {
            inputs: ["prompt"],
            compute: async function(inputs) {
                const promptText = inputs["prompt"] !== null ? String(inputs["prompt"]) : (this.value || "");
                if (!promptText) { return null; }
                try {
                    const encodedPrompt = encodeURIComponent(promptText);
                    const url = \`https://text.pollinations.ai/\${encodedPrompt}\`;
                    const response = await fetch(url);
                    if (!response.ok) { throw new Error(\`HTTP error! status: \${response.status}\`); }
                    return await response.text();
                } catch (error) {
                    console.error("Error fetching from Pollinations:", error);
                    return null;
                }
            }
        },
        PrintNode: {
            inputs: ["input"]
        },
        OutputNode: {
            inputs: ["input"]
        }
    };

    const evaluatedOutputs = new Map();

    async function evaluateNodeOutput(nodeId, outputName, visited = new Set()) {
        const visitedKey = \`\${nodeId}-\${outputName}\`;
        if (evaluatedOutputs.has(visitedKey)) {
            return evaluatedOutputs.get(visitedKey);
        }
        if (visited.has(visitedKey)) {
            console.warn("Circular dependency detected at node", nodeId);
            return null;
        }
        visited.add(visitedKey);

        const node = nodeGraph.nodes.find(n => n.id === nodeId);
        if (!node) return null;

        const type = runtimeNodeTypes[node.type];
        if (!type) {
            console.error(\`Unknown node type: \${node.type}\`);
            return null;
        }
        
        let result = null;
        if (type.getOutput) {
            result = type.getOutput.call(node, outputName);
        } else if (type.compute) {
            const inputs = {};
            const requiredInputs = type.inputs;

            for (const inputName of requiredInputs) {
                const conn = nodeGraph.connections.find(c => c.toNodeId === nodeId && c.toInput === inputName);
                if (!conn) {
                    if (node.type === 'AskPollinationsNode' && inputName === 'prompt') {
                        inputs[inputName] = node.value;
                    } else {
                        inputs[inputName] = null;
                    }
                    continue;
                }
                inputs[inputName] = await evaluateNodeOutput(conn.fromNodeId, conn.fromOutput, new Set(visited));
            }
            result = await type.compute.call(node, inputs);
        }
        
        evaluatedOutputs.set(visitedKey, result);
        return result;
    }

    async function run() {
        console.log("Running graph: ${projectName}");
        const terminalNodes = nodeGraph.nodes.filter(n => n.type === 'OutputNode' || n.type === 'PrintNode');

        if (terminalNodes.length === 0) {
            console.log("No Output or Print Nodes found in the graph.");
            return;
        }

        for (const termNode of terminalNodes) {
            const conn = nodeGraph.connections.find(c => c.toNodeId === termNode.id && c.toInput === "input");
            let result = null;
            if (conn) {
                result = await evaluateNodeOutput(conn.fromNodeId, conn.fromOutput);
            }
            
            if (termNode.type === 'PrintNode') {
                console.log(\`▶ Print Node \${termNode.id}:\`, result);
            } else {
                console.log(\`▶ Result for Output Node \${termNode.id}:\`, result);
            }
        }
    }

    await run();

})();
`;
  }

  function generatePythonCode(graphData, projectName) {
    return `
# Project: ${projectName}
# Created using Adolfo GM's Node Graph Editor
# This is a self-contained, runnable Python script.
# NOTE: Please install the 'requests' library using 'pip install requests' before running this script.

import json
import requests
import math
import random
from datetime import datetime

# --- Project and Graph Data ---
projectName = "${projectName}"
node_graph = ${JSON.stringify(graphData, null, 2)}

# --- Node Logic Definitions ---
def get_output_number(node):
    return node.get("value", 0)

def get_output_text(node):
    return node.get("value", "")

def get_output_date(node):
    return datetime.now().strftime('%Y-%m-%d')

def get_output_time(node):
    return datetime.now().strftime('%H:%M:%S')

def compute_splitter(inputs):
    return inputs.get("input")

def compute_add(inputs):
    a = inputs.get("a")
    b = inputs.get("b")
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return a + b
    return None

def compute_subtract(inputs):
    a = inputs.get("a")
    b = inputs.get("b")
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return a - b
    return None

def compute_multiply(inputs):
    x = inputs.get("x")
    y = inputs.get("y")
    if isinstance(x, (int, float)) and isinstance(y, (int, float)):
        return x * y
    return None

def compute_divide(inputs):
    a = inputs.get("a")
    b = inputs.get("b")
    if isinstance(a, (int, float)) and isinstance(b, (int, float)) and b != 0:
        return a / b
    return None

def compute_sqrt(inputs):
    n = inputs.get("number")
    if isinstance(n, (int, float)) and n >= 0:
        return math.sqrt(n)
    return None

def compute_random_number(inputs):
    min_val = inputs.get("min")
    max_val = inputs.get("max")
    min_n = min_val if isinstance(min_val, (int, float)) else 0
    max_n = max_val if isinstance(max_val, (int, float)) else 1
    if min_n > max_n:
        return min_n
    return random.uniform(min_n, max_n)

def compute_merge_text(inputs):
    text1 = str(inputs.get("text1", ""))
    text2 = str(inputs.get("text2", ""))
    return text1 + text2

def compute_uppercase(inputs):
    s = inputs.get("string")
    if isinstance(s, str):
        return s.upper()
    return None

def compute_lowercase(inputs):
    s = inputs.get("string")
    if isinstance(s, str):
        return s.lower()
    return None

def compute_ask_pollinations(inputs, node):
    prompt = inputs.get("prompt") or node.get("value", "")
    if not prompt:
        print("PollinationsError: No prompt provided.")
        return None
    try:
        encoded_prompt = requests.utils.quote(prompt)
        url = f"https://text.pollinations.ai/{encoded_prompt}"
        response = requests.get(url)
        response.raise_for_status()
        return response.text
    except requests.exceptions.RequestException as e:
        print(f"PollinationsError: {e}")
        return None

node_logic = {
    "NumberNode": {"get_output": get_output_number, "inputs": []},
    "TextNode": {"get_output": get_output_text, "inputs": []},
    "CurrentDateNode": {"get_output": get_output_date, "inputs": []},
    "CurrentTimeNode": {"get_output": get_output_time, "inputs": []},
    "SplitterNode": {"compute": compute_splitter, "inputs": ["input"]},
    "AddNode": {"compute": compute_add, "inputs": ["a", "b"]},
    "SubtractNode": {"compute": compute_subtract, "inputs": ["a", "b"]},
    "MultiplyNode": {"compute": compute_multiply, "inputs": ["x", "y"]},
    "DivideNode": {"compute": compute_divide, "inputs": ["a", "b"]},
    "SqrtNode": {"compute": compute_sqrt, "inputs": ["number"]},
    "RandomNumberNode": {"compute": compute_random_number, "inputs": ["min", "max"]},
    "MergeTextNode": {"compute": compute_merge_text, "inputs": ["text1", "text2"]},
    "UppercaseNode": {"compute": compute_uppercase, "inputs": ["string"]},
    "LowercaseNode": {"compute": compute_lowercase, "inputs": ["string"]},
    "AskPollinationsNode": {"compute": compute_ask_pollinations, "inputs": ["prompt"]},
    "PrintNode": {"inputs": ["input"]},
    "OutputNode": {"inputs": ["input"]}
}

# --- Execution Engine ---
evaluated_outputs = {}

def find_node_by_id(node_id):
    for node in node_graph["nodes"]:
        if node["id"] == node_id:
            return node
    return None

def evaluate_node_output(node_id, output_name, visited=None):
    if visited is None:
        visited = set()
    
    visited_key = f"{node_id}-{output_name}"
    if visited_key in evaluated_outputs:
        return evaluated_outputs[visited_key]
    
    if visited_key in visited:
        print(f"Warning: Circular dependency detected at node {node_id}")
        return None
    
    visited.add(visited_key)

    node = find_node_by_id(node_id)
    if not node:
        return None

    node_type = node["type"]
    logic = node_logic.get(node_type)
    if not logic:
        print(f"Error: Unknown node type '{node_type}'")
        return None

    result = None
    if "get_output" in logic:
        result = logic["get_output"](node)
    elif "compute" in logic:
        inputs = {}
        required_inputs = logic["inputs"]
        
        for input_name in required_inputs:
            conn = next((c for c in node_graph["connections"] if c["toNodeId"] == node_id and c["toInput"] == input_name), None)
            
            if not conn:
                if node_type == "AskPollinationsNode" and input_name == "prompt":
                    inputs[input_name] = node.get("value")
                else:
                    inputs[input_name] = None
                continue

            inputs[input_name] = evaluate_node_output(conn["fromNodeId"], conn["fromOutput"], visited.copy())
        
        if node_type == 'AskPollinationsNode':
             result = logic["compute"](inputs, node)
        else:
             result = logic["compute"](inputs)

    evaluated_outputs[visited_key] = result
    return result

def main():
    print(f"Running graph: {projectName}")
    terminal_nodes = [n for n in node_graph["nodes"] if n["type"] in ("OutputNode", "PrintNode")]

    if not terminal_nodes:
        print("No Output or Print Nodes found in the graph.")
        return

    for term_node in terminal_nodes:
        conn = next((c for c in node_graph["connections"] if c["toNodeId"] == term_node["id"] and c["toInput"] == "input"), None)
        result = None
        if conn:
            result = evaluate_node_output(conn["fromNodeId"], conn["fromOutput"])
        
        if term_node["type"] == "PrintNode":
            print(f"▶ Print Node {term_node['id']}:")
            print(result)
        else:
            print(f"▶ Result for Output Node {term_node['id']}:")
            try:
                print(json.dumps(result, indent=2))
            except TypeError:
                print(result)

if __name__ == "__main__":
    main()
`;
  }
  
  function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function exportProjectToZip() {
    if (typeof JSZip === 'undefined') {
        alert('JSZip library not loaded. Cannot create zip file.');
        return;
    }
    
    const projectName = projectNameInput.value.trim().replace(/\s+/g, '_') || 'UntitledProject';
    const dateStr = new Date().toISOString().slice(0, 10);
    const zipFilename = `${projectName}_${dateStr}.zip`;

    const graphData = exportGraphData();
    const jsCode = generateJsCode(graphData, projectName);
    const pythonCode = generatePythonCode(graphData, projectName);

    const zip = new JSZip();
    const folder = zip.folder(projectName);
    folder.file(`${projectName}.js`, jsCode);
    folder.file(`${projectName}.py`, pythonCode);

    try {
        const blob = await zip.generateAsync({ type: "blob" });
        downloadFile(blob, zipFilename, 'application/zip');
    } catch(error) {
        console.error("Failed to generate zip file:", error);
        alert("An error occurred while creating the zip file.");
    }
  }

  function importNodes() {
    importNodesFile.click();
  }

  function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const fileContent = e.target.result;
        let importedGraph;

        const jsonMatch = fileContent.match(/=\s*(\{[\s\S]*?\});?\s*(\n|$)/);

        if (jsonMatch && jsonMatch[1]) {
            try {
               importedGraph = JSON.parse(jsonMatch[1]);
            } catch(e) {
               throw new Error("Could not parse the JSON object from the script file.");
            }
        } else {
             try {
                importedGraph = JSON.parse(fileContent);
             } catch(jsonError) {
                 throw new Error("File is not a valid graph JSON or a runnable JS/Python export.");
             }
        }
        
        if (!importedGraph.nodes || !importedGraph.connections) {
            throw new Error("Parsed object is not a valid graph structure.");
        }

        clearWorkbench(false); 

        app.nodes = importedGraph.nodes || [];
        app.connections = importedGraph.connections || [];
        app.nextNodeId = Math.max(0, ...app.nodes.map(n => n.id)) + 1;

        app.nodes.forEach(node => {
            const type = nodeTypes[node.type];
            if(type.update) type.update(node);
        });

        app.nodes.forEach(node => renderNode(node));
        redrawAllConnections();
        updateCanvasTransform();
        updateNodeCounter();
        saveStateToLocalStorage();
        console.log("Nodes imported successfully!");

      } catch (error) {
        console.error("Error importing nodes:", error);
        alert("Failed to import nodes: " + error.message);
      }
    };
    reader.readAsText(file);
    importNodesFile.value = '';
  }

  function createSVGLine(x1, y1, x2, y2) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("stroke", "var(--connector-color)");
    line.setAttribute("stroke-width", `${2 / app.canvasScale}`);
    line.setAttribute("stroke-linecap", "round");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    connectionsSvg.appendChild(line);
    return line;
  }

  function renderSidebar(filter = '') {
    nodeList.innerHTML = '';
    const lowerCaseFilter = filter.toLowerCase();
    Object.entries(nodeTypes).forEach(([key, type]) => {
      if (type.title.toLowerCase().includes(lowerCaseFilter)) {
        const el = document.createElement('div');
        el.classList.add('node-type');
        el.textContent = type.title;
        el.title = `Add ${type.title}`;
        el.onclick = () => createNode(key);
        nodeList.appendChild(el);
      }
    });
  }
  
  function initialize() {
    renderSidebar();
    runBtn.onclick = runGraph;
    exportProjectBtn.onclick = exportProjectToZip;
    importNodesBtn.onclick = importNodes;
    importNodesFile.addEventListener('change', handleFileImport);
    clearWorkspaceBtn.onclick = () => clearWorkbench(true);
    projectNameInput.addEventListener('input', saveStateToLocalStorage);

    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('mousedown', onCanvasMouseDown);
    canvas.addEventListener('wheel', onCanvasWheel, { passive: false });

    contextMenu.addEventListener('click', onContextMenuClick);
    window.addEventListener('mousedown', (e) => {
      if (!contextMenu.contains(e.target) && !e.target.closest('.node')) {
        hideContextMenu();
      }
    });

    searchNodesInput.addEventListener('input', (e) => {
      renderSidebar(e.target.value);
    });

    loadStateFromLocalStorage();
    updateNodeCounter(); // Initial count on load
  }

  initialize();