export function mountPanel(html: string) {
  let panel = document.getElementById("panel");
  if (!panel) {
    // Create panel container dynamically to be resilient when HTML base lacks it
    panel = document.createElement('div');
    panel.id = 'panel';
    // Basic style to ensure it's on top; app-level CSS may override
    panel.style.position = 'fixed';
    panel.style.top = '0';
    panel.style.left = '0';
    panel.style.width = '100%';
    panel.style.height = '100%';
    panel.style.display = 'none';
    panel.className = 'app-panel-root';
    document.body.appendChild(panel);
    console.info('mountPanel: created #panel dynamically');
  }
  panel.innerHTML = html;
  panel.style.display = "flex";

  // Foco accesible al primer elemento interactivo
  const first = panel.querySelector<HTMLElement>(
    "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
  );
  first?.focus();
}

export function unmountPanel() {
  const panel = document.getElementById("panel");
  if (!panel) {
    console.warn("unmountPanel: #panel element not found");
    return;
  }
  panel.innerHTML = "";
  panel.style.display = "none";
}
